import { describe, expect, it } from "vitest";
import { balanceByCountry, spreadSources } from "./wire";

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

  /**
   * Reserving one slot per country was not enough: Somalia took every
   * unreserved slot and eight of eleven were still Somalia. Dealing in
   * rotation is what actually evens it out.
   */
  it("deals in rotation instead of letting one country take the remainder", () => {
    const pool = [
      ...Array.from({ length: 20 }, (_, i) => item(`som-${i}`, i, "somalia")),
      ...Array.from({ length: 6 }, (_, i) => item(`eth-${i}`, 30 + i, "ethiopia")),
      ...Array.from({ length: 6 }, (_, i) => item(`dji-${i}`, 40 + i, "djibouti")),
      ...Array.from({ length: 6 }, (_, i) => item(`eri-${i}`, 50 + i, "eritrea")),
    ];

    const band = balanceByCountry(pool, 12, COUNTRIES);
    const counts = COUNTRIES.map(
      (slug) => slugsOf(band).filter((s) => s === slug).length,
    );

    // Twelve slots, four countries with plenty each: three apiece.
    expect(counts).toEqual([3, 3, 3, 3]);
  });

  it("takes each country's freshest first", () => {
    const pool = [
      ...Array.from({ length: 20 }, (_, i) => item(`som-${i}`, i, "somalia")),
      ...Array.from({ length: 6 }, (_, i) => item(`eth-${i}`, 30 + i, "ethiopia")),
    ];
    const ids = balanceByCountry(pool, 4, COUNTRIES).map((b) => b.id);
    expect(ids).toContain("som-0");
    expect(ids).toContain("eth-0");
    expect(ids).not.toContain("som-5");
    expect(ids).not.toContain("eth-5");
  });

  it("gives spare slots to whoever still has items", () => {
    // Somalia is deep, the others have one each. Somalia should absorb the
    // remainder rather than the band rendering short.
    const pool = [
      ...Array.from({ length: 20 }, (_, i) => item(`som-${i}`, i, "somalia")),
      item("eth-1", 30, "ethiopia"),
      item("dji-1", 40, "djibouti"),
      item("eri-1", 50, "eritrea"),
    ];
    const band = balanceByCountry(pool, 11, COUNTRIES);
    expect(band).toHaveLength(11);
    expect(slugsOf(band).filter((s) => s === "somalia")).toHaveLength(8);
    for (const slug of COUNTRIES) expect(slugsOf(band)).toContain(slug);
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

describe("spreadSources", () => {
  const it_ = (id: string, slug: string) => ({ id, source: { slug } });
  const slugs = (r: { source: { slug: string } }[]) => r.map((x) => x.source.slug);
  const runs = (r: { source: { slug: string } }[]) =>
    slugs(r).filter((s, i, a) => i > 0 && s === a[i - 1]).length;

  /**
   * The case this exists for: Addis Fortune files a week of stories within
   * minutes, so time order put six of them at the top of the wire.
   */
  it("breaks up a batch from one outlet", () => {
    const items = [
      it_("a1", "addis-fortune"),
      it_("a2", "addis-fortune"),
      it_("a3", "addis-fortune"),
      it_("a4", "addis-fortune"),
      it_("b1", "jowhar"),
      it_("c1", "rtd-dj"),
      it_("d1", "awate"),
    ];
    const out = spreadSources(items);
    expect(runs(out)).toBeLessThan(runs(items));
    expect(out).toHaveLength(items.length);
  });

  it("keeps every item exactly once", () => {
    const items = [
      it_("a1", "x"), it_("a2", "x"), it_("b1", "y"), it_("b2", "y"), it_("c1", "z"),
    ];
    const out = spreadSources(items);
    expect(out.map((o) => o.id).sort()).toEqual(["a1", "a2", "b1", "b2", "c1"]);
  });

  it("leaves an already-varied list alone", () => {
    const items = [it_("1", "x"), it_("2", "y"), it_("3", "z")];
    expect(spreadSources(items)).toEqual(items);
  });

  it("gives up gracefully when everything is one outlet", () => {
    const items = [it_("1", "x"), it_("2", "x"), it_("3", "x")];
    expect(spreadSources(items).map((o) => o.id)).toEqual(["1", "2", "3"]);
  });

  it("handles empty and single-item lists", () => {
    expect(spreadSources([])).toEqual([]);
    expect(spreadSources([it_("1", "x")])).toHaveLength(1);
  });

  it("does not mutate its input", () => {
    const items = [it_("a1", "x"), it_("a2", "x"), it_("b1", "y")];
    const before = items.map((i) => i.id);
    spreadSources(items);
    expect(items.map((i) => i.id)).toEqual(before);
  });
});
