import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { publishedWhere } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const [articles, countries, categories, videos, authors] = await Promise.all([
    db.article.findMany({
      where: publishedWhere,
      select: {
        slug: true,
        publishedAt: true,
        revisedAt: true,
        updatedAt: true,
        country: { select: { slug: true } },
        category: { select: { slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    db.country.findMany({ include: { regions: true } }),
    db.category.findMany(),
    db.video.findMany({ where: { published: true }, select: { slug: true, publishedAt: true } }),
    db.author.findMany({ select: { slug: true } }),
  ]);

  const staticPages = [
    "",
    "/horn",
    "/wire",
    "/wire/about",
    "/latest",
    "/trending",
    "/videos",
    "/categories",
    "/authors",
    "/about",
    "/contact",
    "/editorial-policy",
    "/corrections",
    "/languages",
    "/privacy",
    "/terms",
    "/careers",
    "/advertise",
    "/submit-a-story",
  ];

  const entries: MetadataRoute.Sitemap = [
    ...staticPages.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: (p === "" ? "hourly" : "weekly") as "hourly" | "weekly",
      priority: p === "" ? 1 : 0.6,
    })),
    ...countries.flatMap((c) => [
      {
        url: `${base}/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.9,
      },
      ...c.regions.map((r) => ({
        url: `${base}/${c.slug}/regions/${r.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...categories
        .filter((cat) => cat.kind === "DESK")
        .map((cat) => ({
          url: `${base}/${c.slug}/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.6,
        })),
    ]),
    ...categories.map((cat) => ({
      url: `${base}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${base}/${a.country?.slug ?? "horn"}/${a.category.slug}/${a.slug}`,
      lastModified: a.revisedAt ?? a.updatedAt ?? a.publishedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...videos.map((v) => ({
      url: `${base}/videos/${v.slug}`,
      lastModified: v.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...authors.map((a) => ({
      url: `${base}/authors/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];

  return entries;
}
