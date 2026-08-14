import { describe, expect, it } from "vitest";
import { detectCountries } from "@/lib/country-tagger";

describe("detectCountries() — tagging by text, never by publisher", () => {
  it("tags the obvious cases", () => {
    expect(detectCountries("Somalia holds talks in Mogadishu")).toEqual(["somalia"]);
    expect(detectCountries("Ethiopia's parliament meets in Addis Ababa")).toEqual([
      "ethiopia",
    ]);
    expect(detectCountries("Djibouti expands the Doraleh terminal")).toEqual([
      "djibouti",
    ]);
    expect(detectCountries("Eritrea marks independence in Asmara")).toEqual([
      "eritrea",
    ]);
  });

  it("tags both countries in a cross-border story", () => {
    const hits = detectCountries(
      "Ethiopia and Somalia agree a new framework for cooperation",
    );
    expect(hits).toContain("ethiopia");
    expect(hits).toContain("somalia");
    expect(hits).toHaveLength(2);
  });

  describe("the regressions that made us stop inheriting the publisher", () => {
    // Each of these was mis-filed under Somalia when the tagger fell back to
    // the outlet's country. They must now come back clean.
    const FOREIGN = [
      "Bomb attack in Bogota kills several, Colombian police say",
      "US launches new mosquito control programme in Florida",
      "Arsenal complete signing of midfielder on five-year deal",
      "Bank of Japan holds rates steady amid yen weakness",
      "Wildfires force evacuations across southern Europe",
    ];

    for (const headline of FOREIGN) {
      it(`leaves untagged: "${headline.slice(0, 44)}…"`, () => {
        expect(detectCountries(headline)).toEqual([]);
      });
    }
  });

  it("does not match a country name inside a longer word", () => {
    // Word-boundary aware: "Somaliland" is Somalia, but a substring collision
    // like "Eritrean" inside another token must not create phantom tags.
    expect(detectCountries("Meritorious service awards announced")).toEqual([]);
    expect(detectCountries("The company said it would deferrite the plan")).toEqual([]);
  });

  it("treats Somaliland as Somalia", () => {
    // Consistent with the editorial policy and with the map and logo.
    expect(detectCountries("Berbera port expansion in Hargeisa, Somaliland")).toEqual([
      "somalia",
    ]);
  });

  it("is case-insensitive", () => {
    expect(detectCountries("ETHIOPIA SIGNS DEAL")).toEqual(["ethiopia"]);
    expect(detectCountries("ethiopia signs deal")).toEqual(["ethiopia"]);
  });

  it("matches Somali-language text", () => {
    expect(detectCountries("Madaxweynaha Soomaaliya oo booqday Muqdisho")).toEqual([
      "somalia",
    ]);
  });

  it("matches Amharic script, including attached prefixes", () => {
    // Regression: Amharic and Tigrinya attach grammatical prefixes straight
    // onto the noun, so "የኢትዮጵያ" (of Ethiopia) failed a Latin-style word
    // boundary and the tagger missed most Ethiopic headlines.
    expect(detectCountries("ኢትዮጵያ ዜና")).toEqual(["ethiopia"]);
    expect(detectCountries("የኢትዮጵያ ንግድ ዜና")).toEqual(["ethiopia"]);
    expect(detectCountries("በአዲስ አበባ የተካሄደ ስብሰባ")).toEqual(["ethiopia"]);
  });

  it("matches French-language text", () => {
    expect(detectCountries("Le président djiboutien inaugure une route")).toEqual([
      "djibouti",
    ]);
    expect(detectCountries("La Somalie et l'Éthiopie signent un accord")).toEqual([
      "somalia",
      "ethiopia",
    ]);
  });

  it("matches Tigrinya script for Eritrea, including attached prefixes", () => {
    expect(detectCountries("ኤርትራ ናጽነት")).toEqual(["eritrea"]);
    expect(detectCountries("ናይ ኤርትራ ዜና")).toEqual(["eritrea"]);
  });

  it("tags business copy that names an institution but never the country", () => {
    // Regression from the first live pull: genuine Addis business reporting
    // was being hidden because the headline said "Anbesa Bank", not Ethiopia.
    expect(detectCountries("National Bank Forces Anbesa Bank Board Re-run")).toEqual([
      "ethiopia",
    ]);
    expect(detectCountries("Ethio Telecom reports subscriber growth")).toEqual([
      "ethiopia",
    ]);
    expect(detectCountries("Tariffs push costs up by 40 million birr")).toEqual([
      "ethiopia",
    ]);
    expect(detectCountries("Hormuud launches new data bundles")).toEqual(["somalia"]);
    expect(detectCountries("Dahabshiil expands remittance network")).toEqual([
      "somalia",
    ]);
  });

  it("still ignores world copy republished by a regional outlet", () => {
    // These all came from Somali and Ethiopian outlets on the live pull. A
    // masthead is not evidence of subject matter.
    for (const headline of [
      "Trump Calls for Iran to Pay Compensation as Deal Prospects Dim",
      "Syria's Bashar al-Assad Sentenced to Death in Absentia by Court",
      "7.4-magnitude earthquake destroys Manizales Cathedral",
      "Police probe Widdecombe suspect in arson attack linked to Nigel Farage",
    ]) {
      expect(detectCountries(headline)).toEqual([]);
    }
  });

  it("picks up institutions and landmarks, not just country names", () => {
    expect(detectCountries("Al-Shabaab attack repelled in Middle Shabelle")).toEqual([
      "somalia",
    ]);
    expect(detectCountries("Filling of the Renaissance Dam continues")).toEqual([
      "ethiopia",
    ]);
    expect(detectCountries("Shipping diverted from the Bab el-Mandeb")).toEqual([
      "djibouti",
    ]);
  });

  it("handles empty and junk input without throwing", () => {
    expect(detectCountries("")).toEqual([]);
    expect(detectCountries("   ")).toEqual([]);
    expect(detectCountries("!!! ??? ...")).toEqual([]);
  });

  it("returns each country at most once however many terms hit", () => {
    const hits = detectCountries(
      "Somalia, Somali forces and Mogadishu officials met in Baidoa and Kismayo",
    );
    expect(hits).toEqual(["somalia"]);
  });

  it("returns a stable country order", () => {
    // The order feeds UI lists; it should not depend on term order in the text.
    const a = detectCountries("Eritrea and Somalia");
    const b = detectCountries("Somalia and Eritrea");
    expect(a).toEqual(b);
  });

  /**
   * Real headlines from a live pull that the tagger dropped because it knew
   * country names but not the places inside them. Humanitarian and local
   * reporting is written for readers who already know where Badhan is, so the
   * country is simply never named.
   */
  describe("place names, country unnamed", () => {
    const cases: [string, string[]][] = [
      ["Community awareness jobs are cut across Galkayo IDP camps", ["somalia"]],
      ["New road brings trade and income to small community in Badhan", ["somalia"]],
      ["Clashes reported in Las Anod as talks stall", ["somalia"]],
      ["Water trucking reaches villages in Sanaag and Sool", ["somalia"]],
      ["Conscripts report to Sawa for the new intake", ["eritrea"]],
      ["Fuel shortages reported in Barentu and Tesseney", ["eritrea"]],
      ["Port upgrade works begin at Damerjog", ["djibouti"]],
      ["Fighting spreads across Wollega and Gojjam", ["ethiopia"]],
      ["Aid convoys reach Humera and Adigrat", ["ethiopia"]],
    ];

    for (const [headline, expected] of cases) {
      it(`tags "${headline.slice(0, 44)}…"`, () => {
        expect(detectCountries(headline)).toEqual(expected);
      });
    }
  });

  /**
   * The other half of the gazetteer decision. These are genuine Horn place
   * names left out on purpose because they collide with words the
   * international wires publish every day. A confidently wrong country page is
   * worse than an item that stays on the general wire.
   */
  describe("ambiguous place names stay out", () => {
    it("does not read an Italian city or an English noun as Somalia", () => {
      expect(detectCountries("Ferry services resume at the port of Bari")).toEqual([]);
      expect(detectCountries("The bay was closed to shipping")).toEqual([]);
    });

    it("does not read the capital of South Sudan as Somalia", () => {
      expect(detectCountries("Peace talks continue in Juba")).toEqual([]);
    });

    it("does not read a footballer or an English word as Ethiopia", () => {
      expect(detectCountries("Adama Traoré signs a new contract")).toEqual([]);
      expect(detectCountries("Another bale of cotton was seized")).toEqual([]);
      expect(detectCountries("A shire horse won the county show")).toEqual([]);
    });
  });
});
