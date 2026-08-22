import { describe, expect, it } from "vitest";
import { ARTICLE_FRESH_DAYS, fillWithWire, isFresh } from "./freshness";

const NOW = new Date("2026-08-22T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

const article = (id: string, days: number) => ({ id, publishedAt: daysAgo(days) });
const wire = (id: string) => ({ id });

describe("isFresh", () => {
  it("accepts recent articles and rejects old ones", () => {
    expect(isFresh(daysAgo(1), ARTICLE_FRESH_DAYS, NOW)).toBe(true);
    expect(isFresh(daysAgo(10), ARTICLE_FRESH_DAYS, NOW)).toBe(false);
  });

  it("treats the boundary as inclusive", () => {
    expect(isFresh(daysAgo(ARTICLE_FRESH_DAYS), ARTICLE_FRESH_DAYS, NOW)).toBe(true);
    expect(isFresh(daysAgo(ARTICLE_FRESH_DAYS + 0.01), ARTICLE_FRESH_DAYS, NOW)).toBe(false);
  });

  /** Cached rows arrive as ISO strings, not Dates. */
  it("accepts a date that has been through the cache", () => {
    expect(isFresh(daysAgo(1).toISOString(), ARTICLE_FRESH_DAYS, NOW)).toBe(true);
  });

  it("rejects null and unparseable dates rather than throwing", () => {
    expect(isFresh(null, ARTICLE_FRESH_DAYS, NOW)).toBe(false);
    expect(isFresh(undefined, ARTICLE_FRESH_DAYS, NOW)).toBe(false);
    expect(isFresh("not a date", ARTICLE_FRESH_DAYS, NOW)).toBe(false);
  });
});

describe("fillWithWire", () => {
  /** The state the front page was actually in: nothing published for 10 days. */
  it("fills entirely from the wire when every article is stale", () => {
    const slots = fillWithWire(
      [article("a1", 10), article("a2", 14)],
      [wire("w1"), wire("w2"), wire("w3")],
      3,
      { now: NOW },
    );
    expect(slots.map((s) => s.kind)).toEqual(["wire", "wire", "wire"]);
  });

  /** The property that makes this safe: publishing reclaims the slot. */
  it("gives the slots back the moment something is published", () => {
    const slots = fillWithWire(
      [article("new", 0), article("old", 14)],
      [wire("w1"), wire("w2")],
      3,
      { now: NOW },
    );
    expect(slots.map((s) => s.kind)).toEqual(["article", "wire", "wire"]);
    expect(slots[0]).toMatchObject({ item: { id: "new" } });
  });

  it("keeps every fresh article ahead of the wire", () => {
    const slots = fillWithWire(
      [article("a1", 1), article("a2", 2), article("a3", 3)],
      [wire("w1")],
      3,
      { now: NOW },
    );
    expect(slots.map((s) => s.kind)).toEqual(["article", "article", "article"]);
  });

  it("drops a stale article rather than ranking it below a fresh one", () => {
    // Two current pieces plus two live headlines beats two current pieces
    // plus a fortnight-old pair.
    const slots = fillWithWire(
      [article("fresh", 1), article("stale", 20)],
      [wire("w1"), wire("w2")],
      3,
      { now: NOW },
    );
    expect(slots.map((s) => (s.kind === "article" ? s.item.id : s.item.id))).toEqual([
      "fresh",
      "w1",
      "w2",
    ]);
  });

  it("returns short rather than padding when nothing is available", () => {
    expect(fillWithWire([], [], 4, { now: NOW })).toEqual([]);
    expect(fillWithWire([article("old", 30)], [wire("w1")], 4, { now: NOW })).toHaveLength(1);
  });

  it("never exceeds the requested count", () => {
    const slots = fillWithWire(
      [article("a", 1)],
      [wire("w1"), wire("w2"), wire("w3")],
      2,
      { now: NOW },
    );
    expect(slots).toHaveLength(2);
  });
});
