import type { TickerItem } from "@/components/BreakingTicker";

/**
 * What the "Breaking News" strip should carry.
 *
 * The strip is fed by an editor's `isBreaking` flag, which is right in
 * principle: a human decides what is breaking. In practice nothing had been
 * flagged for five days, so a strip labelled Breaking News sat at the top of
 * every page showing a headline from last Monday. A stale breaking banner is
 * worse than no banner — it tells the reader the site is not being watched.
 *
 * So the flag still wins, but only while it is plausibly still breaking. A
 * flagged article older than the cutoff steps aside for the newest thing on
 * the wire, which is usually an hour or two old.
 *
 * Wire headlines in the strip name their outlet and open at the publisher.
 * They are not dressed up as ours just because they are in our furniture.
 */

/** How long an editor's breaking flag keeps a story in the strip. */
export const BREAKING_TTL_HOURS = 24;

/**
 * Dates arrive as strings when they have been through the cache.
 *
 * `getBreaking` is wrapped in `unstable_cache`, which serialises to JSON, so
 * `publishedAt` comes back as an ISO string and `.getTime()` throws. The
 * ticker is inside a try/catch, so the only symptom was the strip silently
 * vanishing from every page. Anything reading a cached row has to allow for
 * this — the same reason getHomepageSlots rebuilds its Map per request.
 */
const asTime = (v: Date | string | null | undefined): number | null => {
  if (v == null) return null;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
};

type ArticleLike = {
  headline: string;
  publishedAt: Date | string | null;
  href: string;
};

type WireLike = {
  title: string;
  url: string;
  publishedAt: Date | string;
  source: { name: string };
};

export function buildTickerItems(
  breaking: ArticleLike[],
  wire: WireLike[],
  opts: { take?: number; now?: Date } = {},
): TickerItem[] {
  const { take = 8, now = new Date() } = opts;
  const cutoff = now.getTime() - BREAKING_TTL_HOURS * 3_600_000;

  const fresh = breaking.filter((a) => {
    const t = asTime(a.publishedAt);
    return t !== null && t >= cutoff;
  });

  const items: TickerItem[] = fresh.map((a) => ({
    href: a.href,
    headline: a.headline,
  }));

  // The wire fills whatever the editor has not claimed. When something is
  // genuinely breaking the strip is ours; the rest of the time it is current.
  for (const w of wire) {
    if (items.length >= take) break;
    items.push({
      href: w.url,
      headline: w.title,
      source: w.source.name,
      external: true,
    });
  }

  return items.slice(0, take);
}
