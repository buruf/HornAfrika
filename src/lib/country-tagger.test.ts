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
});
