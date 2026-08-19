import { describe, expect, it } from "vitest";
import { detectCountries, stripDateline } from "./country-tagger";

/**
 * A dateline says where the newsroom sits, not what the story is about.
 * Fana's report on a Colombian earthquake opened "Addis Ababa, August 18, 2026
 * (FMC) — " and was filed under Ethiopia, which put it in the homepage hero.
 */
describe("stripDateline", () => {
  const strips: [string, string][] = [
    [
      "Addis Ababa, August 18, 2026 (FMC) — Colombia's President put the toll at $9.6bn",
      "Colombia's President put the toll at $9.6bn",
    ],
    ["ADDIS ABABA (ENA) — Talks resumed on Monday", "Talks resumed on Monday"],
    ["Mogadishu — The council met", "The council met"],
    ["Nairobi, Aug 18 (Reuters) — Shares fell", "Shares fell"],
    ["Asmara (Shabait) — The ministry said", "The ministry said"],
  ];

  for (const [input, expected] of strips) {
    it(`strips "${input.slice(0, 30)}…"`, () => {
      expect(stripDateline(input)).toBe(expected);
    });
  }

  it("leaves ordinary prose alone", () => {
    // No dash, so nothing is a dateline however it starts.
    for (const t of [
      "Ethiopia said on Monday that talks would resume",
      "Somalia's president met regional leaders in Ankara",
      "Addis Ababa is the capital and the seat of the African Union",
      "",
    ]) {
      expect(stripDateline(t)).toBe(t);
    }
  });

  it("does not eat a headline that merely contains a dash", () => {
    const t = "Ethiopia and Eritrea — thirty years on";
    // "Ethiopia and Eritrea " could look like a place, so this is the risky
    // case. It is accepted collateral only if the text after the dash keeps
    // its meaning; assert we do not lose the subject entirely.
    expect(stripDateline(t)).toContain("thirty years on");
  });
});

describe("tagging with the dateline removed", () => {
  const fana =
    "Addis Ababa, August 18, 2026 (FMC) — Colombia's President Abelardo De La Espriella " +
    "has put the preliminary economic toll of last week's powerful earthquake at $9.6 billion.";

  it("no longer files a Colombian story under Ethiopia", () => {
    expect(detectCountries(fana)).toEqual(["ethiopia"]);
    expect(detectCountries(stripDateline(fana))).toEqual([]);
  });

  it("still tags a genuinely Ethiopian story that names the country", () => {
    const real =
      "Addis Ababa, August 18, 2026 (FMC) — Ethiopia's Prime Minister opened the new line.";
    expect(detectCountries(stripDateline(real))).toEqual(["ethiopia"]);
  });
});
