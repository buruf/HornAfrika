import { describe, expect, it } from "vitest";
import { resolveCountries } from "./country-tagger";
import { mentionsElsewhere } from "./elsewhere";

/**
 * Publisher inheritance is the one place the outlet's identity is allowed to
 * decide a country tag, and it is the change most likely to quietly re-break
 * the thing that was broken before: a Colombian bombing filed under Somalia.
 *
 * Every headline below is real, taken from the untagged pile on the live wire.
 */

const regional = (country: string) => ({
  publisherCountry: country,
  publisherLocalOnly: true,
  hasExcerpt: true,
});

describe("resolveCountries", () => {
  it("always prefers what the text says over who published it", () => {
    // A Somali outlet reporting on Ethiopia is an Ethiopia story.
    const r = resolveCountries(
      "Fighting breaks out in Tigray as talks stall",
      regional("somalia"),
    );
    expect(r.slugs).toEqual(["ethiopia"]);
    expect(r.inherited).toBe(false);
  });

  describe("inherits the outlet's beat when the text names nowhere", () => {
    // Local business copy written for readers who already know where they are.
    const cases: [string, string][] = [
      ["Central Bank Buys Gold High, Sells It Lower", "ethiopia"],
      ["Minister Threatens to Blacklist Traders Who Break Export Deals", "ethiopia"],
      ["Supreme Court Widens Shield for Lawyers Fighting the VAT", "ethiopia"],
      ["Nine Universities Near Autonomy Have a Ministry Freezing Their Assets", "ethiopia"],
    ];

    for (const [headline, country] of cases) {
      it(`"${headline.slice(0, 40)}…" → ${country}`, () => {
        const r = resolveCountries(headline, regional(country));
        expect(r.slugs).toEqual([country]);
        expect(r.inherited).toBe(true);
      });
    }
  });

  describe("refuses to inherit when the text points somewhere else", () => {
    // All three were published by Somali outlets and are world copy. This is
    // the exact failure the first version of this feature shipped.
    const cases = [
      "South Korea Offers Negotiations With North Korea to Formally End War",
      "A year later, did Alaska shift anything for Ukraine's future?",
      "Deadly 7.7-Magnitude Earthquake in Indonesia Leaves 47 People Dead",
      "7.4-magnitude earthquake destroys Manizales Cathedral in Colombia",
      "Arsenal complete signing from Real Madrid",
    ];

    for (const headline of cases) {
      it(`"${headline.slice(0, 40)}…" stays untagged`, () => {
        const r = resolveCountries(headline, regional("somalia"));
        expect(r.slugs).toEqual([]);
        expect(r.inherited).toBe(false);
      });
    }
  });

  it("refuses to inherit from an outlet not marked local-only", () => {
    // Jowhar is a single-country outlet that also runs a world desk. Being
    // regional is not evidence; being read and marked is.
    const r = resolveCountries("Central Bank Buys Gold High", {
      publisherCountry: "ethiopia",
      publisherLocalOnly: false,
      hasExcerpt: true,
    });
    expect(r.slugs).toEqual([]);
  });

  it("refuses to inherit for a bare title with no body", () => {
    // Capital Ethiopia emits a few of these; "a shoe shine and repair shop"
    // is not a story and must not become an Ethiopia headline.
    const r = resolveCountries("a shoe shine and repair shop", {
      publisherCountry: "ethiopia",
      publisherLocalOnly: true,
      hasExcerpt: false,
    });
    expect(r.slugs).toEqual([]);
  });

  it("refuses to inherit when the outlet has no country beat", () => {
    const r = resolveCountries("Central Bank Buys Gold High", {
      publisherCountry: null,
      publisherLocalOnly: true,
      hasExcerpt: true,
    });
    expect(r.slugs).toEqual([]);
  });

  it("still returns nothing for an item with no signal at all", () => {
    expect(resolveCountries("").slugs).toEqual([]);
    expect(resolveCountries("A quiet morning").slugs).toEqual([]);
  });
});

describe("mentionsElsewhere", () => {
  it("catches countries, cities and peoples outside the Horn", () => {
    for (const t of [
      "talks in Nairobi",
      "the Kenyan delegation",
      "a summit in Ankara",
      "Chinese investment",
      "flooding in Indonesia",
      "the White House said",
    ]) {
      expect(mentionsElsewhere(t)).toBe(true);
    }
  });

  it("does not fire on Horn-only text", () => {
    for (const t of [
      "Central Bank Buys Gold High, Sells It Lower",
      "Drought deepens across the region",
      "The port expansion begins next month",
      "",
    ]) {
      expect(mentionsElsewhere(t)).toBe(false);
    }
  });

  it("matches whole words, so substrings do not trip it", () => {
    // "chad" inside "chadic", "oman" inside "romantic", "mali" inside "malign".
    expect(mentionsElsewhere("a romantic evening")).toBe(false);
    expect(mentionsElsewhere("malignant growth")).toBe(false);
    expect(mentionsElsewhere("Chadic languages")).toBe(false);
  });
});
