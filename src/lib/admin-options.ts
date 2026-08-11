import { db } from "@/lib/db";
import type { FormOptions } from "@/components/admin/ArticleForm";

export async function getFormOptions(): Promise<FormOptions> {
  const [countries, regions, categories, subcategories, authors, topics] = await Promise.all([
    db.country.findMany({
      orderBy: { order: "asc" },
      select: { id: true, slug: true, name: true, flag: true },
    }),
    db.region.findMany({
      orderBy: { order: "asc" },
      select: { id: true, slug: true, name: true, countryId: true },
    }),
    db.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, slug: true, name: true },
    }),
    db.subcategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, categoryId: true },
    }),
    db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.topic.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return { countries, regions, categories, subcategories, authors, topics };
}
