import { describe, expect, it } from "vitest";
import { detectTopic } from "./topic-tagger";

describe("detectTopic", () => {
  /** Real headlines from the live wire. */
  const cases: [string, string][] = [
    ["NISA Targets Senior Al-Shabaab Leaders in Overnight Operation in Hiiraan", "security"],
    ["Puntland Forces launch Major Security Operation Against PSF in Galkayo", "security"],
    ["Somalia Graduates Fifth Darawiish Cohort to Boost National Security Capacity", "security"],
    ["Somalia Targets $35 Million Investment to Boost Sesame and Fisheries Exports", "business"],
    ["Electricity Theft Costs Ethiopia 2.89 Billion Birr in a Single Year", "economy"],
    ["Djibouti Unveils Major Port Expansion Plan", "business"],
    ["Foreign Minister Abdi Ali Defends Diplomatic Postings After Audit", "politics"],
    ["Ethiopia and Somalia Agree on New Framework for Cooperation", "politics"],
    ["Acute watery diarrhoea claims lives among drought-hit rural families", "society"],
    ["IDP families face repeated evictions as Beletweyne city grows", "society"],
    ["Eritrean Music Shines on Global Stage Again", "culture"],
  ];

  for (const [headline, topic] of cases) {
    it(`files "${headline.slice(0, 42)}…" under ${topic}`, () => {
      expect(detectTopic(headline)).toBe(topic);
    });
  }

  it("weighs the balance of evidence, not the first word it recognises", () => {
    // "President" alone would say politics; the rest of the sentence is a
    // security story and that is the desk a reader wants it on.
    expect(
      detectTopic(
        "President visits troops after attack that killed soldiers, army says militants ambushed the convoy",
      ),
    ).toBe("security");

    // And the reverse: one stray security word does not drag a treaty story
    // off the politics desk.
    expect(
      detectTopic(
        "Parliament ratifies the treaty after the prime minister and cabinet backed the diplomatic accord in a vote",
      ),
    ).toBe("politics");
  });

  it("returns null rather than guessing", () => {
    expect(detectTopic("")).toBeNull();
    expect(detectTopic("A quiet morning in the hills")).toBeNull();
    expect(detectTopic("!!! ??? ...")).toBeNull();
  });

  it("matches whole words only", () => {
    // "warehouse" contains "war"; "goalkeeper" contains "goal".
    expect(detectTopic("A new warehouse opened")).not.toBe("security");
    expect(detectTopic("Scarborough council meets")).not.toBe("security");
  });

  it("is stable for the same input", () => {
    const h = "Central bank raises interest rate as inflation climbs";
    expect(detectTopic(h)).toBe(detectTopic(h));
    expect(detectTopic(h)).toBe("economy");
  });
});
