/**
 * Group wire items that are covering the same story.
 *
 * This exists so "Trending" can mean something on an aggregator. The page
 * ranked our own articles by read count, and with no article filed since 12
 * August it showed the same three headlines for ten days under a heading that
 * claims to be measured and current.
 *
 * We do not track outbound clicks, so we cannot say what readers opened. What
 * we can say honestly is how many separate newsrooms thought a story was worth
 * covering — which for a wire is a better signal than a view counter anyway,
 * and it is available immediately rather than after weeks of accumulation.
 *
 * The matching is deliberately blunt: significant words shared between
 * headlines. It will merge two stories that happen to share vocabulary and it
 * will miss a story reported in two languages. Both failures are visible and
 * cheap — a cluster of one is just a headline — so the conservative settings
 * below matter more than cleverness.
 */

/**
 * Words that carry no subject matter. Country and place names are excluded
 * too: almost every headline we hold mentions Somalia or Ethiopia, so letting
 * them count would cluster the entire wire into one lump.
 */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "with", "from", "by", "as", "is", "are", "was", "were", "be", "been", "has",
  "have", "had", "will", "would", "can", "could", "may", "says", "said", "say",
  "after", "over", "into", "amid", "new", "more", "than", "that", "this",
  "these", "those", "its", "his", "her", "their", "not", "no", "up", "out",
  "about", "against", "between", "during", "under", "first", "two", "three",
  // Place names: near-universal here, so they carry no distinguishing signal.
  "somalia", "somali", "ethiopia", "ethiopian", "djibouti", "eritrea",
  "eritrean", "somaliland", "puntland", "mogadishu", "addis", "ababa",
  "horn", "africa", "african", "region", "regional",
]);

/** Significant, comparable words in a headline. */
export function keyTerms(title: string): Set<string> {
  const words = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return new Set(words);
}

const overlap = (a: Set<string>, b: Set<string>) => {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n;
};

export type Clusterable = {
  id: string;
  title: string;
  publishedAt: Date;
  source: { slug: string };
};

export type Cluster<T extends Clusterable> = {
  /** Freshest item, and the one shown. */
  lead: T;
  items: T[];
  /** Distinct newsrooms covering it — the ranking signal. */
  outlets: number;
};

/**
 * Cluster by shared significant words, then rank by how many separate outlets
 * carried the story, breaking ties on recency.
 *
 * `minShared` of 2 is the setting that stops "Somalia president meets X" and
 * "Somalia president visits Y" collapsing together on the word "president"
 * alone. Two items from the same outlet never count as two outlets, or a
 * newsroom running a follow-up would out-rank a story everyone covered.
 */
export function clusterStories<T extends Clusterable>(
  items: T[],
  { minShared = 2 }: { minShared?: number } = {},
): Cluster<T>[] {
  const byRecency = [...items].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
  const terms = new Map(byRecency.map((i) => [i.id, keyTerms(i.title)]));

  const clusters: Cluster<T>[] = [];

  for (const item of byRecency) {
    const mine = terms.get(item.id)!;
    const home = clusters.find((c) =>
      c.items.some((other) => overlap(mine, terms.get(other.id)!) >= minShared),
    );
    if (home) home.items.push(item);
    else clusters.push({ lead: item, items: [item], outlets: 0 });
  }

  for (const c of clusters) {
    c.outlets = new Set(c.items.map((i) => i.source.slug)).size;
  }

  return clusters.sort(
    (a, b) =>
      b.outlets - a.outlets ||
      b.lead.publishedAt.getTime() - a.lead.publishedAt.getTime(),
  );
}
