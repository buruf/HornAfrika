import { describe, expect, it } from "vitest";
import { balanceByCountry } from "./wire";

const COUNTRIES = ["somalia", "ethiopia", "djibouti", "eritrea"];

type Item = {
  id: string;
  publishedAt: Date;
  countries: { country: { slug: string } }[];
};

/** `item("a", 1, "somalia")` — id, hours ago, country tags. */
const item = (id: string, hoursAgo: number, ...slugs: string[]): Item => ({
  id,
  publishedAt: new Date(Date.UTC(2026, 7, 13, 12, 0, 0) - hoursAgo * 3_600_000),
  countries: slugs.map((slug) => ({ country: { slug } })),
});

const slugsOf = (items: Item[]) =>
  items.flatMap((i) => i.countries.map((c) => c.country.slug));

describe("balanceByCountry", () => {
  /**
   * The case this exists for. On a straight recency sort the newest eleven
   * items were all Somalia, and a site claiming four countries showed one.
   */
  it("gives every country a slot even when one outlet dominates recency", () => {
    const pool = [
      ...Array.from({ length: 20 }, (_, i) => item(`som-${i}`, i, "somalia")),
      item("eth-1", 30, "ethiopia"),
      item("dji-1", 40, "djibouti"),
      item("eri-1", 50, "eritrea"),
    ];

    const band = balanceByCountry(pool, 11, COUNTRIES);

    expect(band).toHaveLength(11);
    for (const slug of COUNTRIES) {
      expect(slugsOf(band)).toContain(slug);
    }
  });

  it("still fills the rest of the band with the freshest items", () => {
    const pool = [
      ...Array.from({ length: 20 }, (_, i) => item(`som-${i}`, i, "somalia")),
      item("eth-1", 30, "ethiopia"),
      item("dji-1", 40, "djibouti"),
      item("eri-1", 50, "eritrea"),
    ];

    const band = balanceByCountry(pool, 11, COUNTRIES);
    const ids = band.map((b) => b.id);

    // Seven slots remain after the four reserved ones, and they go to the
    // newest Somalia items rather than to anything older.
    expect(ids).toContain("som-0");
    expect(ids).toContain("som-6");
    expect(ids).not.toContain("som-19");
  });

  it("returns the band in time order", () => {
    const pool = [
      item("a", 1, "somalia"),
      item("b", 9, "ethiopia"),
      item("c", 5, "djibouti"),
      item("d", 3, "eritrea"),
    ];
    const band = balanceByCountry(pool, 4, COUNTRIES);
    expect(band.map((b) => b.id)).toEqual(["a", "d", "c", "b"]);
  });

  it("never repeats an item that carries two country tags", () => {
    const pool = [
      item("shared", 1, "ethiopia", "eritrea"),
      item("som", 2, "somalia"),
      item("dji", 3, "djibouti"),
    ];
    const band = balanceByCountry(pool, 5, COUNTRIES);
    expect(band.map((b) => b.id)).toEqual(["shared", "som", "dji"]);
  });

  it("forfeits the slot rather than surfacing nothing for an absent country", () => {
    // Eritrea genuinely has the thinnest wire; an empty slot is honest, and
    // padding the band with a three-week-old item would not be.
    const pool = [item("a", 1, "somalia"), item("b", 2, "ethiopia")];
    const band = balanceByCountry(pool, 6, COUNTRIES);
    expect(band).toHaveLength(2);
    expect(slugsOf(band)).not.toContain("eritrea");
  });

  it("keeps untagged items available as filler but never reserved", () => {
    const pool = [
      item("untagged", 0),
      item("som", 1, "somalia"),
      item("eth", 2, "ethiopia"),
    ];
    // Two slots: both reserved slots are claimed before the newer untagged item.
    expect(balanceByCountry(pool, 2, COUNTRIES).map((b) => b.id)).toEqual([
      "som",
      "eth",
    ]);
    // A third slot lets the untagged item in.
    expect(balanceByCountry(pool, 3, COUNTRIES).map((b) => b.id)).toEqual([
      "untagged",
      "som",
      "eth",
    ]);
  });

  it("handles an empty pool and a zero-size band", () => {
    expect(balanceByCountry([], 11, COUNTRIES)).toEqual([]);
    expect(balanceByCountry([item("a", 1, "somalia")], 0, COUNTRIES)).toEqual([]);
  });

  it("does not mutate the pool it was given", () => {
    const pool = [item("b", 5, "ethiopia"), item("a", 1, "somalia")];
    const order = pool.map((p) => p.id);
    balanceByCountry(pool, 2, COUNTRIES);
    expect(pool.map((p) => p.id)).toEqual(order);
  });
});
