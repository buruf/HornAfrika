import { describe, expect, it } from "vitest";
import { BREAKING_TTL_HOURS, buildTickerItems } from "./ticker";

const NOW = new Date("2026-08-16T04:00:00Z");
const hoursAgo = (n: number) => new Date(NOW.getTime() - n * 3_600_000);

const article = (headline: string, h: number) => ({
  headline,
  publishedAt: hoursAgo(h),
  href: `/x/${headline.toLowerCase().replace(/\s+/g, "-")}`,
});

const wire = (title: string, h: number, name = "Goobjoog") => ({
  title,
  url: `https://example.com/${title.toLowerCase().replace(/\s+/g, "-")}`,
  publishedAt: hoursAgo(h),
  source: { name },
});

const build = (b: ReturnType<typeof article>[], w: ReturnType<typeof wire>[]) =>
  buildTickerItems(b, w, { now: NOW });

describe("buildTickerItems", () => {
  it("keeps an editor's breaking story first while it is still fresh", () => {
    const items = build([article("Talks collapse", 2)], [wire("Port reopens", 1)]);
    expect(items[0].headline).toBe("Talks collapse");
    expect(items[0].external).toBeUndefined();
  });

  /**
   * The case this exists for: nothing had been flagged breaking for five days,
   * so the strip advertised last Monday's headline as breaking news.
   */
  it("drops a breaking flag that has gone stale", () => {
    const items = build(
      [article("Five days old", 120)],
      [wire("Filed this morning", 2)],
    );
    expect(items.map((i) => i.headline)).not.toContain("Five days old");
    expect(items[0].headline).toBe("Filed this morning");
  });

  it("holds the flag right up to the cutoff and drops it after", () => {
    const justInside = build([article("Edge", BREAKING_TTL_HOURS - 0.1)], []);
    expect(justInside).toHaveLength(1);
    const justOutside = build([article("Edge", BREAKING_TTL_HOURS + 0.1)], []);
    expect(justOutside).toHaveLength(0);
  });

  it("marks wire headlines as links out and names the outlet", () => {
    const items = build([], [wire("Port reopens", 1, "Radio Ergo")]);
    expect(items[0]).toMatchObject({
      headline: "Port reopens",
      source: "Radio Ergo",
      external: true,
      href: "https://example.com/port-reopens",
    });
  });

  it("lets the wire fill the slots the editor has not claimed", () => {
    const items = build(
      [article("Ours", 1)],
      [wire("A", 1), wire("B", 2), wire("C", 3)],
    );
    expect(items.map((i) => i.headline)).toEqual(["Ours", "A", "B", "C"]);
  });

  it("respects the cap", () => {
    const items = buildTickerItems(
      [],
      Array.from({ length: 20 }, (_, i) => wire(`w${i}`, i)),
      { take: 8, now: NOW },
    );
    expect(items).toHaveLength(8);
  });

  it("survives an unpublished article and an empty wire", () => {
    const items = buildTickerItems(
      [{ headline: "No date", publishedAt: null, href: "/x" }],
      [],
      { now: NOW },
    );
    expect(items).toEqual([]);
  });

  it("returns nothing when there is nothing at all", () => {
    expect(build([], [])).toEqual([]);
  });

  /**
   * getBreaking goes through unstable_cache, which serialises to JSON, so
   * publishedAt arrives as an ISO string and .getTime() throws. The ticker is
   * inside a try/catch, so the only symptom was the strip silently vanishing
   * from every page — and the first version of these tests missed it entirely
   * by passing real Date objects.
   */
  it("accepts dates that have been through the cache as strings", () => {
    const items = buildTickerItems(
      [
        {
          headline: "Cached and fresh",
          publishedAt: hoursAgo(2).toISOString() as unknown as Date,
          href: "/x",
        },
      ],
      [{ ...wire("Wire item", 1), publishedAt: hoursAgo(1).toISOString() as unknown as Date }],
      { now: NOW },
    );
    expect(items.map((i) => i.headline)).toEqual(["Cached and fresh", "Wire item"]);
  });

  it("ignores a date string it cannot parse", () => {
    const items = buildTickerItems(
      [{ headline: "Junk date", publishedAt: "not a date" as unknown as Date, href: "/x" }],
      [],
      { now: NOW },
    );
    expect(items).toEqual([]);
  });
});

describe("wire age cap", () => {
  it("keeps day-old headlines out from under a Breaking News label", () => {
    const items = buildTickerItems(
      [],
      [wire("Now", 1), wire("Yesterday", 26), wire("Also now", 2), wire("Recent", 4)],
      { now: NOW },
    );
    expect(items.map((i) => i.headline)).toEqual(["Now", "Also now", "Recent"]);
  });

  it("relaxes the cap rather than showing an almost-empty strip", () => {
    // Overnight the Horn newsrooms stop filing and the window can empty out.
    const items = buildTickerItems([], [wire("Old A", 30), wire("Old B", 40)], {
      now: NOW,
    });
    expect(items.map((i) => i.headline)).toEqual(["Old A", "Old B"]);
  });

  it("counts a live breaking flag toward the minimum", () => {
    // One editor story plus two recent wire items clears the bar, so the cap
    // stays on and the day-old item is still excluded.
    const items = buildTickerItems(
      [article("Ours", 1)],
      [wire("Now", 1), wire("Also now", 2), wire("Yesterday", 30)],
      { now: NOW },
    );
    expect(items.map((i) => i.headline)).toEqual(["Ours", "Now", "Also now"]);
  });
});
