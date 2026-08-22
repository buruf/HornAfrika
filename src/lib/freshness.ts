/**
 * How a section decides between our own reporting and the wire.
 *
 * Every article-driven surface on the front page had frozen: the newest
 * Article was ten days old and nothing publishes on a schedule, so Politics,
 * Business, Security and the rest sat unchanged for a fortnight beside a wire
 * that refreshes hourly.
 *
 * The rule is a fallback, not a replacement. Our own writing takes the slots
 * whenever it is current; the wire only fills what is left. The moment an
 * editor publishes, that piece takes its slot back with no code change — which
 * is the property that makes this safe to apply to a design nobody wants
 * altered.
 */

/**
 * How recent an article has to be to hold a front-page slot on its own merit.
 *
 * A week is chosen to suit the newsroom this is built for: one that files in
 * bursts rather than daily. Tighter and a Friday feature drops off the page by
 * Tuesday; looser and a fortnight-old lead still calls itself the front page.
 */
export const ARTICLE_FRESH_DAYS = 7;

export function isFresh(
  publishedAt: Date | string | null | undefined,
  days = ARTICLE_FRESH_DAYS,
  now: Date = new Date(),
): boolean {
  if (publishedAt == null) return false;
  const t =
    publishedAt instanceof Date ? publishedAt.getTime() : new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return false;
  return t >= now.getTime() - days * 86_400_000;
}

export type Slot<A, W> =
  | { kind: "article"; item: A }
  | { kind: "wire"; item: W };

/**
 * Fill `count` slots: fresh articles first, then wire.
 *
 * Stale articles are dropped rather than pushed down the list. A section
 * showing two current pieces and two from a fortnight ago reads worse than one
 * showing two current pieces and two live headlines, and the stale pair are
 * still reachable from the archive.
 */
export function fillWithWire<A extends { publishedAt: Date | string | null }, W>(
  articles: A[],
  wire: W[],
  count: number,
  { days = ARTICLE_FRESH_DAYS, now = new Date() }: { days?: number; now?: Date } = {},
): Slot<A, W>[] {
  const slots: Slot<A, W>[] = [];

  for (const a of articles) {
    if (slots.length >= count) break;
    if (isFresh(a.publishedAt, days, now)) slots.push({ kind: "article", item: a });
  }

  for (const w of wire) {
    if (slots.length >= count) break;
    slots.push({ kind: "wire", item: w });
  }

  return slots;
}
