import { revalidateTag } from "next/cache";
import { TAGS, type CacheTag } from "@/lib/cache";

/**
 * Cache invalidation for the CMS.
 *
 * `revalidatePath` clears rendered routes; it does not touch `unstable_cache`
 * entries, which are keyed separately. Anything that changes content has to
 * clear the tags too, or an editor publishes a story and does not see it.
 *
 * These helpers exist so a caller says what changed rather than remembering
 * which tags that implies.
 */

function bust(...tags: CacheTag[]) {
  for (const t of tags) revalidateTag(t);
}

/** An article was created, edited, published or moved through the workflow. */
export function articleChanged() {
  // Listings, trending inputs, counts and the homepage all read articles.
  bust(TAGS.articles, TAGS.homepage);
}

/** A homepage slot assignment changed. */
export function homepageChanged() {
  bust(TAGS.homepage, TAGS.articles);
}

/** A country, region, category, topic or author changed. */
export function taxonomyChanged() {
  bust(TAGS.taxonomy, TAGS.articles);
}

/** Wire items were fetched, pruned, or an item was hidden. */
export function wireChanged() {
  bust(TAGS.wire);
}

/** An advertising slot was activated or edited. */
export function adsChanged() {
  bust(TAGS.ads);
}

/** A site setting changed — enabled locales, for instance. */
export function settingsChanged() {
  bust(TAGS.settings, TAGS.articles);
}

/** Belt and braces for anything that does not fit the cases above. */
export function everythingChanged() {
  bust(...Object.values(TAGS));
}
