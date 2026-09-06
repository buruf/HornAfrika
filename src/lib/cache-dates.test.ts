import { describe, expect, it } from "vitest";
import { reviveDates } from "./revive-dates";
import { toIso } from "./format";

/**
 * The contract that keeps the article page alive.
 *
 * unstable_cache serialises to JSON, so a cached query returns strings where
 * an uncached one returns Dates. Every consumer that called a Date method
 * directly has eventually thrown — three times now, most recently 500ing every
 * article on its second view while the first view looked fine.
 *
 * These tests fix the boundary behaviour rather than any one call site: a
 * value that has been through the cache must be indistinguishable from one
 * that has not.
 */
describe("the cache boundary", () => {
  const fresh = {
    headline: "Ethiopia and Somalia agree a framework",
    publishedAt: new Date("2026-08-12T09:00:00Z"),
    revisedAt: null as Date | null,
    updatedAt: new Date("2026-08-13T10:30:00Z"),
    author: { name: "Hornafrika Desk" },
    countries: [{ country: { slug: "somalia" } }],
  };

  /** Exactly what unstable_cache does to a value on the way in and out. */
  const throughCache = <T,>(v: T): T => reviveDates(JSON.parse(JSON.stringify(v)));

  it("returns dates as Dates, cached or not", () => {
    const cachedCopy = throughCache(fresh);
    expect(cachedCopy.publishedAt).toBeInstanceOf(Date);
    expect(cachedCopy.updatedAt).toBeInstanceOf(Date);
    expect(cachedCopy.publishedAt.valueOf()).toBe(fresh.publishedAt.valueOf());
  });

  it("survives the call that used to crash the article page", () => {
    const a = throughCache(fresh);
    expect(() => a.publishedAt.toISOString()).not.toThrow();
    expect(toIso(a.revisedAt ?? a.updatedAt)).toBe("2026-08-13T10:30:00.000Z");
  });

  it("keeps everything else the shape it was", () => {
    const a = throughCache(fresh);
    expect(a.headline).toBe(fresh.headline);
    expect(a.author.name).toBe("Hornafrika Desk");
    expect(a.countries[0].country.slug).toBe("somalia");
    expect(a.revisedAt).toBeNull();
  });
});

describe("toIso", () => {
  it("accepts a Date, a string, or neither", () => {
    expect(toIso(new Date("2026-08-12T09:00:00Z"))).toBe("2026-08-12T09:00:00.000Z");
    expect(toIso("2026-08-12T09:00:00.000Z")).toBe("2026-08-12T09:00:00.000Z");
    expect(toIso(null)).toBeUndefined();
    expect(toIso(undefined)).toBeUndefined();
  });

  /**
   * These values feed og: tags and JSON-LD. A missing property costs a little
   * SEO; a thrown one costs the whole page.
   */
  it("drops a bad date rather than throwing", () => {
    expect(() => toIso("not a date")).not.toThrow();
    expect(toIso("not a date")).toBeUndefined();
  });
});
