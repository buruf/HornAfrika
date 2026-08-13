import { unstable_cache } from "next/cache";

/**
 * Data caching.
 *
 * Every page is `force-dynamic`, and stays that way on purpose: the build must
 * never need a reachable database, which is what broke the first deploy. But
 * dynamic rendering with no data cache meant every single visitor triggered a
 * full round of Neon queries — the homepage alone runs a dozen — which is both
 * slow and, on a usage-billed database, expensive.
 *
 * So the pages stay dynamic and the *data* is cached. Nothing is read at build
 * time, and a burst of readers costs one set of queries rather than one per
 * reader.
 *
 * Invalidation is by tag, from the CMS. `revalidatePath` alone does not clear
 * these entries — they are keyed independently of the route — so anything that
 * changes content must call `revalidateTag`. See lib/revalidate.ts.
 */

export const TAGS = {
  /** Articles and anything derived from them: listings, trending, counts. */
  articles: "articles",
  /** Countries, regions, categories, topics, authors. */
  taxonomy: "taxonomy",
  /** Editor-chosen homepage slots. */
  homepage: "homepage",
  /** Aggregated wire items and sources. */
  wire: "wire",
  /** Advertising slots. */
  ads: "ads",
  /** Site settings, including which locales are live. */
  settings: "settings",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

/**
 * Wrap a query so its result is cached and tagged.
 *
 * Arguments are part of the cache key, so `getByCountry("somalia", …)` and
 * `getByCountry("ethiopia", …)` do not collide.
 */
export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyPrefix: string,
  opts: { tags: CacheTag[]; revalidate: number },
) {
  return (...args: A): Promise<R> =>
    unstable_cache(() => fn(...args), [keyPrefix, JSON.stringify(args)], {
      tags: opts.tags,
      revalidate: opts.revalidate,
    })();
}

/**
 * How long each kind of data may be stale.
 *
 * These are ceilings, not delays: the CMS invalidates by tag the moment
 * anything changes, so an editor never waits. They only matter for changes
 * made outside the CMS — the wire cron, and readership accumulating.
 */
export const TTL = {
  /** Taxonomy changes perhaps monthly. */
  taxonomy: 3600,
  /** Article listings; invalidated on publish anyway. */
  articles: 300,
  /** Trending drifts continuously and nothing invalidates it. */
  trending: 300,
  /** The wire cron runs every two hours. */
  wire: 600,
  /** Ads and settings change rarely and are invalidated on save. */
  config: 3600,
} as const;
