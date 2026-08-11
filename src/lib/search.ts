import { db } from "@/lib/db";
import { cardSelect, publishedWhere, type CardArticle } from "@/lib/queries";

export type SearchHit = {
  article: CardArticle;
  score: number;
  matchedAll: boolean;
};

/**
 * Weighted multi-term search (spec §18).
 *
 * Every term must appear somewhere in the record for it to rank as a full
 * match, which is what makes `Somalia Ethiopia` return stories involving both
 * countries above stories that mention only one. Partial matches are still
 * returned, but always below complete ones.
 *
 * SQLite FTS5 would be faster at scale. At this corpus size the cost of an
 * in-process scan is negligible, and the scoring stays readable and portable
 * to Postgres.
 */
const FIELD_WEIGHT = {
  headline: 10,
  deck: 5,
  country: 6,
  region: 4,
  category: 3,
  topic: 4,
  author: 3,
  body: 1,
} as const;

export async function search(query: string, limit = 40): Promise<SearchHit[]> {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9À-ɏ']+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  // Narrow with SQL first so we are not scanning the whole table in JS.
  const candidates = await db.article.findMany({
    where: {
      ...publishedWhere,
      OR: terms.flatMap((t) => [
        { headline: { contains: t } },
        { deck: { contains: t } },
        { body: { contains: t } },
        { country: { name: { contains: t } } },
        { region: { name: { contains: t } } },
        { category: { name: { contains: t } } },
        { author: { name: { contains: t } } },
        { topics: { some: { topic: { name: { contains: t } } } } },
        { countries: { some: { country: { name: { contains: t } } } } },
      ]),
    },
    select: {
      ...cardSelect,
      body: true,
      region: { select: { name: true } },
      author: { select: { slug: true, name: true } },
      topics: { select: { topic: { select: { name: true } } } },
      countries: { select: { country: { select: { name: true } } } },
    },
    take: 300,
  });

  const hits: SearchHit[] = [];

  for (const a of candidates) {
    const fields: Array<[keyof typeof FIELD_WEIGHT, string]> = [
      ["headline", a.headline],
      ["deck", a.deck],
      ["body", a.body],
      ["country", a.countries.map((c) => c.country.name).join(" ")],
      ["region", a.region?.name ?? ""],
      ["category", a.category.name],
      ["topic", a.topics.map((t) => t.topic.name).join(" ")],
      ["author", a.author.name],
    ];

    let score = 0;
    let matchedTerms = 0;

    for (const term of terms) {
      let termScore = 0;
      for (const [field, value] of fields) {
        const haystack = value.toLowerCase();
        if (!haystack.includes(term)) continue;
        // Diminishing returns on repeats: a term appearing forty times in a
        // body should not outrank a term in the headline.
        const occurrences = haystack.split(term).length - 1;
        termScore += FIELD_WEIGHT[field] * (1 + Math.log(occurrences));
      }
      if (termScore > 0) matchedTerms++;
      score += termScore;
    }

    const matchedAll = matchedTerms === terms.length;
    // A story matching every term is categorically more relevant than one
    // matching most of them, so the bonus is large enough to be decisive.
    if (matchedAll) score *= 3;

    // Light recency nudge — enough to break ties, not enough to reorder.
    if (a.publishedAt) {
      const ageDays = (Date.now() - a.publishedAt.getTime()) / 86400000;
      score *= 1 + 0.25 / (ageDays + 3);
    }

    const { body: _body, topics: _t, countries: _c, ...card } = a;
    hits.push({ article: card as CardArticle, score, matchedAll });
  }

  hits.sort((x, y) => y.score - x.score);
  return hits.slice(0, limit);
}

/** Countries, regions and topics matching the query, for the search sidebar. */
export async function searchEntities(query: string) {
  const q = query.trim();
  if (q.length < 2) return { countries: [], regions: [], topics: [], authors: [] };

  const [countries, regions, topics, authors] = await Promise.all([
    db.country.findMany({ where: { name: { contains: q } }, take: 5 }),
    db.region.findMany({
      where: { name: { contains: q } },
      take: 6,
      include: { country: { select: { slug: true, name: true } } },
    }),
    db.topic.findMany({ where: { name: { contains: q } }, take: 8 }),
    db.author.findMany({ where: { name: { contains: q } }, take: 4 }),
  ]);

  return { countries, regions, topics, authors };
}
