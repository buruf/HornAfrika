/**
 * Turn ISO date strings back into Date objects after a JSON round-trip.
 *
 * `unstable_cache` serialises to JSON, so every Date in a cached query result
 * comes back as a string on a cache hit and as a real Date on a cache miss.
 * Downstream code cannot tell the difference until it calls a Date method, at
 * which point it throws — and only for the readers who hit the cache, which is
 * almost all of them.
 *
 * That has now cost three separate bugs:
 *
 *   1. Maps did not survive the round-trip, so getHomepageSlots had to cache
 *      arrays and rebuild the Map per request.
 *   2. getBreaking's publishedAt arrived as a string, .getTime() threw, and
 *      the breaking-news strip silently vanished from every page for days
 *      because it sits inside a try/catch.
 *   3. The article page called publishedAt?.toISOString(). Optional chaining
 *      guards null, not "string", so every article 500'd on the second view.
 *
 * The pattern in each case was the same: a call site assumed the type the
 * database returns. Reviving here makes cached data behave exactly like
 * uncached data, so no call site has to know it was cached at all.
 *
 * Only strings matching a full ISO-8601 instant are converted. Prose, slugs
 * and URLs cannot match it. A field that genuinely holds an ISO string as text
 * would become a Date — no such field exists in this schema, and the trade is
 * worth it against a class of bug that has shipped three times.
 */

const ISO_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

export function reviveDates<T>(value: T): T {
  return revive(value) as T;
}

function revive(value: unknown): unknown {
  if (typeof value === "string") {
    return ISO_INSTANT.test(value) ? new Date(value) : value;
  }

  // Already a Date on a cache miss, so this has to be a no-op rather than a
  // re-parse: the function runs on both paths.
  if (value instanceof Date) return value;

  if (Array.isArray(value)) return value.map(revive);

  // Plain objects only. A Map, Buffer or Decimal would be flattened by
  // rebuilding it field by field, and none of them survive JSON anyway.
  if (value !== null && typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype) return value;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = revive(v);
    return out;
  }

  return value;
}
