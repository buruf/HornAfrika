import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { startOfUtcDay } from "@/lib/views";
import { TAGS, TTL, cached } from "@/lib/cache";

/**
 * Two layers of caching here, doing different jobs.
 *
 * `cache()` from React deduplicates within a single render — the homepage asks
 * for countries four times and gets one query.
 *
 * `cached()` from lib/cache is the Next data cache and persists across
 * requests, so a burst of readers costs one query rather than one each. Pages
 * stay `force-dynamic` so the build never needs a database; it is the data,
 * not the page, that is cached.
 */

/** Everything a card needs, and nothing more. */
export const cardSelect = {
  id: true,
  slug: true,
  headline: true,
  deck: true,
  imageSeed: true,
  imageUrl: true,
  imageCaption: true,
  isBreaking: true,
  isDeveloping: true,
  publishedAt: true,
  readMinutes: true,
  country: { select: { slug: true, name: true, flag: true } },
  category: { select: { slug: true, name: true, color: true } },
  author: { select: { slug: true, name: true } },
} satisfies Prisma.ArticleSelect;

export type CardArticle = Prisma.ArticleGetPayload<{ select: typeof cardSelect }>;

/** A story is "live" once it is published, and stays live after a revision. */
export const publishedWhere: Prisma.ArticleWhereInput = {
  status: { in: ["PUBLISHED", "UPDATED"] },
  publishedAt: { not: null },
};

// ---------------------------------------------------------------------------
// Navigation and site chrome
// ---------------------------------------------------------------------------

// Taxonomy is read on every page render and changes perhaps monthly.
export const getCountries = cache(
  cached(() => db.country.findMany({ orderBy: { order: "asc" } }), "countries", {
    tags: [TAGS.taxonomy],
    revalidate: TTL.taxonomy,
  }),
);

export const getNavCategories = cache(
  cached(
    () => db.category.findMany({ where: { inNav: true }, orderBy: { order: "asc" } }),
    "nav-categories",
    { tags: [TAGS.taxonomy], revalidate: TTL.taxonomy },
  ),
);

export const getAllCategories = cache(
  cached(
    () =>
      db.category.findMany({
        orderBy: { order: "asc" },
        include: { subcategories: { orderBy: { order: "asc" } } },
      }),
    "all-categories",
    { tags: [TAGS.taxonomy], revalidate: TTL.taxonomy },
  ),
);

export const getCountriesWithRegions = cache(
  cached(
    () =>
      db.country.findMany({
        orderBy: { order: "asc" },
        include: { regions: { orderBy: { order: "asc" } } },
      }),
    "countries-with-regions",
    { tags: [TAGS.taxonomy], revalidate: TTL.taxonomy },
  ),
);

// The ticker sits in the layout, so this runs on literally every page.
//
// It is flagged by an editor, so it only ever holds our own articles — which
// means a strip labelled "Breaking News" was showing a five-day-old headline,
// because nothing had been flagged since. See getTickerItems for what the
// layout actually renders.
export const getBreaking = cache(
  cached(
    () =>
      db.article.findMany({
        where: { ...publishedWhere, isBreaking: true },
        orderBy: { publishedAt: "desc" },
        take: 8,
        select: cardSelect,
      }),
    "breaking",
    { tags: [TAGS.articles], revalidate: TTL.articles },
  ),
);

// ---------------------------------------------------------------------------
// Homepage — editor-controlled slots (spec §20)
// ---------------------------------------------------------------------------

/**
 * Reads the editor's homepage assignments. Where a slot is empty we fall back
 * to the most recent qualifying story so the page is never broken, but the
 * editor's choice always wins.
 */
const loadHomepageSlots = cached(
  async () => {
    const slots = await db.homepageSlot.findMany({
      include: { article: { select: cardSelect } },
    });
    // The cache serialises to JSON, and a Map does not survive that, so the
    // cached shape is an array and the Map is rebuilt per request.
    return slots.map((s) => [s.slot, s.article] as [string, CardArticle | null]);
  },
  "homepage-slots",
  { tags: [TAGS.homepage, TAGS.articles], revalidate: TTL.articles },
);

export const getHomepageSlots = cache(async () => {
  return new Map<string, CardArticle | null>(await loadHomepageSlots());
});

export async function getLeadAndSecondaries() {
  const slots = await getHomepageSlots();
  const lead =
    slots.get("lead") ??
    (await db.article.findFirst({
      where: publishedWhere,
      orderBy: { publishedAt: "desc" },
      select: cardSelect,
    }));

  const secondaries: CardArticle[] = [];
  for (const key of ["secondary-1", "secondary-2", "secondary-3"]) {
    const a = slots.get(key);
    if (a && a.id !== lead?.id) secondaries.push(a);
  }
  if (secondaries.length < 3) {
    const fill = await db.article.findMany({
      where: {
        ...publishedWhere,
        id: { notIn: [lead?.id, ...secondaries.map((s) => s.id)].filter(Boolean) as string[] },
      },
      orderBy: { publishedAt: "desc" },
      take: 3 - secondaries.length,
      select: cardSelect,
    });
    secondaries.push(...fill);
  }
  return { lead, secondaries };
}

// ---------------------------------------------------------------------------
// Trending (spec §19) — views weighted by recency, not a date sort
// ---------------------------------------------------------------------------

export type TrendingWindow = "today" | "week" | "month";

const WINDOW_DAYS: Record<TrendingWindow, number> = {
  today: 1,
  week: 7,
  month: 30,
};

const loadTrending = cached(
  async (window: TrendingWindow, take: number): Promise<CardArticle[]> => {
    const since = new Date();
    since.setDate(since.getDate() - WINDOW_DAYS[window]);

    // Summing a daily rollup rather than counting individual view rows. The
    // old query grouped every page view in the window, so its cost grew with
    // traffic — on the most-requested page on the site.
    const grouped = await db.articleViewDaily.groupBy({
      by: ["articleId"],
      where: { day: { gte: startOfUtcDay(since) } },
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: take * 4,
    });
    if (grouped.length === 0) return [];

    const articles = await db.article.findMany({
      where: { id: { in: grouped.map((g) => g.articleId) }, ...publishedWhere },
      select: cardSelect,
    });
    const byId = new Map(articles.map((a) => [a.id, a]));

    // Views alone let a single big day dominate for a month. Decaying by age
    // keeps the list moving without letting raw recency take over entirely.
    const now = Date.now();
    const scored = grouped
      .map((g) => {
        const article = byId.get(g.articleId);
        if (!article?.publishedAt) return null;
        const ageDays = (now - article.publishedAt.getTime()) / 86400000;
        const decay = 1 / Math.pow(ageDays + 2, 0.45);
        return { article, score: (g._sum.count ?? 0) * decay };
      })
      .filter(Boolean) as { article: CardArticle; score: number }[];

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, take).map((s) => s.article);
  },
  "trending",
  { tags: [TAGS.articles], revalidate: TTL.trending },
);

/**
 * Trending is the only algorithmic block on the site and nothing invalidates
 * it — readership accumulates continuously — so it relies on its TTL rather
 * than on a tag being busted.
 */
export const getTrending = cache((window: TrendingWindow = "week", take = 5) =>
  loadTrending(window, take),
);

// ---------------------------------------------------------------------------
// Listing queries
// ---------------------------------------------------------------------------

export async function getLatest(take = 12, skip = 0) {
  return db.article.findMany({
    where: publishedWhere,
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: cardSelect,
  });
}

/**
 * Stories belonging to a country. Uses the ArticleCountry join rather than the
 * primary country, so an Ethiopia–Somalia story appears on both country pages
 * without being duplicated in the database.
 */
export async function getByCountry(
  countrySlug: string,
  opts: { take?: number; skip?: number; category?: string; region?: string; exclude?: string[] } = {},
) {
  const { take = 12, skip = 0, category, region, exclude = [] } = opts;
  return db.article.findMany({
    where: {
      ...publishedWhere,
      countries: { some: { country: { slug: countrySlug } } },
      ...(category ? { category: { slug: category } } : {}),
      ...(region ? { region: { slug: region } } : {}),
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: cardSelect,
  });
}

export async function countByCountry(countrySlug: string, category?: string) {
  return db.article.count({
    where: {
      ...publishedWhere,
      countries: { some: { country: { slug: countrySlug } } },
      ...(category ? { category: { slug: category } } : {}),
    },
  });
}

export async function getByCategory(
  categorySlug: string,
  opts: { take?: number; skip?: number; exclude?: string[] } = {},
) {
  const { take = 12, skip = 0, exclude = [] } = opts;
  return db.article.findMany({
    where: {
      ...publishedWhere,
      category: { slug: categorySlug },
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: cardSelect,
  });
}

export async function countByCategory(categorySlug: string) {
  return db.article.count({
    where: { ...publishedWhere, category: { slug: categorySlug } },
  });
}

/**
 * The regional section (spec §10). A story qualifies if it is tagged to more
 * than one country, or if it was filed to the Horn desk. That is a structural
 * definition, not a tag someone has to remember to apply.
 */
export async function getHornRegional(take = 12, skip = 0, exclude: string[] = []) {
  const multi = await db.articleCountry.groupBy({
    by: ["articleId"],
    _count: { countryId: true },
    having: { countryId: { _count: { gt: 1 } } },
  });
  return db.article.findMany({
    where: {
      ...publishedWhere,
      OR: [
        { id: { in: multi.map((m) => m.articleId) } },
        { category: { slug: "regional" } },
      ],
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: cardSelect,
  });
}

/**
 * The four homepage country blocks. `exclude` keeps stories already shown in
 * the hero out of the blocks — a multi-country lead legitimately belongs to
 * two countries, but printing it three times on one screen reads as a bug.
 */
export async function getCountryBlocks(exclude: string[] = []) {
  const countries = await getCountries();
  const slots = await getHomepageSlots();
  const notIn = [...exclude];

  const blocks = [];
  for (const country of countries) {
    const slotted = slots.get(`${country.slug}-lead`);
    const lead =
      slotted && !notIn.includes(slotted.id)
        ? slotted
        : await db.article.findFirst({
            where: {
              ...publishedWhere,
              countries: { some: { countryId: country.id } },
              ...(notIn.length ? { id: { notIn } } : {}),
            },
            orderBy: { publishedAt: "desc" },
            select: cardSelect,
          });
    if (lead) notIn.push(lead.id);

    const rest = await db.article.findMany({
      where: {
        ...publishedWhere,
        countries: { some: { countryId: country.id } },
        ...(notIn.length ? { id: { notIn } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: cardSelect,
    });
    // A story shown under Somalia should not also fill the Ethiopia block.
    for (const r of rest) notIn.push(r.id);

    blocks.push({ country, lead, rest });
  }
  return blocks;
}

export async function getVideos(take = 8, kind?: string) {
  return db.video.findMany({
    where: { published: true, ...(kind ? { kind: kind as never } : {}) },
    orderBy: { publishedAt: "desc" },
    take,
    include: { country: { select: { slug: true, name: true, flag: true } } },
  });
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

export const getArticle = cache(
  cached(
    (slug: string) =>
      db.article.findFirst({
        where: { slug, ...publishedWhere },
        include: {
          country: true,
          region: true,
          category: true,
          subcategory: true,
          author: true,
          countries: { include: { country: true } },
          topics: { include: { topic: true } },
        },
      }),
    "article",
    { tags: [TAGS.articles], revalidate: TTL.articles },
  ),
);

export async function getRelated(articleId: string, categoryId: string, countryIds: string[]) {
  return db.article.findMany({
    where: {
      ...publishedWhere,
      id: { not: articleId },
      OR: [
        { categoryId },
        ...(countryIds.length
          ? [{ countries: { some: { countryId: { in: countryIds } } } }]
          : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: cardSelect,
  });
}

const loadCategoryCounts = cached(
  async () => {
    const rows = await db.article.groupBy({
      by: ["categoryId"],
      where: publishedWhere,
      _count: { categoryId: true },
    });
    // Array rather than Map, because the cache serialises to JSON.
    return rows.map((r) => [r.categoryId, r._count.categoryId] as [string, number]);
  },
  "category-counts",
  { tags: [TAGS.articles], revalidate: TTL.articles },
);

export const getCategoryCounts = cache(
  async () => new Map<string, number>(await loadCategoryCounts()),
);

// Ad slots are read on nearly every page and change almost never.
export const getActiveAd = cache(
  cached(
    (position: string) => db.adSlot.findFirst({ where: { position, active: true } }),
    "active-ad",
    { tags: [TAGS.ads], revalidate: TTL.config },
  ),
);
