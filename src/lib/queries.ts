import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { cache } from "react";

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

export const getCountries = cache(async () =>
  db.country.findMany({ orderBy: { order: "asc" } }),
);

export const getNavCategories = cache(async () =>
  db.category.findMany({ where: { inNav: true }, orderBy: { order: "asc" } }),
);

export const getAllCategories = cache(async () =>
  db.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: { orderBy: { order: "asc" } } },
  }),
);

export const getCountriesWithRegions = cache(async () =>
  db.country.findMany({
    orderBy: { order: "asc" },
    include: { regions: { orderBy: { order: "asc" } } },
  }),
);

export const getBreaking = cache(async () =>
  db.article.findMany({
    where: { ...publishedWhere, isBreaking: true },
    orderBy: { publishedAt: "desc" },
    take: 8,
    select: cardSelect,
  }),
);

// ---------------------------------------------------------------------------
// Homepage — editor-controlled slots (spec §20)
// ---------------------------------------------------------------------------

/**
 * Reads the editor's homepage assignments. Where a slot is empty we fall back
 * to the most recent qualifying story so the page is never broken, but the
 * editor's choice always wins.
 */
export const getHomepageSlots = cache(async () => {
  const slots = await db.homepageSlot.findMany({
    include: { article: { select: cardSelect } },
  });
  const map = new Map<string, CardArticle | null>();
  for (const s of slots) map.set(s.slot, s.article);
  return map;
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

export const getTrending = cache(
  async (window: TrendingWindow = "week", take = 5): Promise<CardArticle[]> => {
    const since = new Date();
    since.setDate(since.getDate() - WINDOW_DAYS[window]);

    const grouped = await db.articleView.groupBy({
      by: ["articleId"],
      where: { viewedAt: { gte: since } },
      _count: { articleId: true },
      orderBy: { _count: { articleId: "desc" } },
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
        return { article, score: g._count.articleId * decay };
      })
      .filter(Boolean) as { article: CardArticle; score: number }[];

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, take).map((s) => s.article);
  },
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

export const getArticle = cache(async (slug: string) =>
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

export const getCategoryCounts = cache(async () => {
  const rows = await db.article.groupBy({
    by: ["categoryId"],
    where: publishedWhere,
    _count: { categoryId: true },
  });
  return new Map(rows.map((r) => [r.categoryId, r._count.categoryId]));
});

export const getActiveAd = cache(async (position: string) =>
  db.adSlot.findFirst({ where: { position, active: true } }),
);
