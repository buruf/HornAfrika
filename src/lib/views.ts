import { db } from "@/lib/db";

/**
 * Readership counting.
 *
 * One row per article per day, incremented in place, rather than one row per
 * page view. The old design grew without bound — 49,000 rows from seed data
 * alone — and made trending a groupBy over every view in a thirty-day window,
 * on the most-requested page on the site.
 */

/** Midnight UTC for a moment, so a day means the same thing everywhere. */
export function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Record one read.
 *
 * A read-then-write upsert would lose counts whenever two readers open the
 * same article in the same moment, which on a news site is precisely when the
 * numbers matter. `ON CONFLICT DO UPDATE` makes the increment atomic in one
 * round trip instead.
 */
export async function recordView(articleId: string): Promise<void> {
  const day = startOfUtcDay();
  await db.$executeRaw`
    INSERT INTO "ArticleViewDaily" ("articleId", "day", "count")
    VALUES (${articleId}, ${day}, 1)
    ON CONFLICT ("articleId", "day")
    DO UPDATE SET "count" = "ArticleViewDaily"."count" + 1
  `;
}

/**
 * Drop daily rows older than the longest window trending asks for, with room
 * to spare. Even at a year of history this table stays trivially small.
 */
export async function pruneViewDays(keepDays = 400): Promise<number> {
  const cutoff = startOfUtcDay(new Date(Date.now() - keepDays * 86_400_000));
  const { count } = await db.articleViewDaily.deleteMany({
    where: { day: { lt: cutoff } },
  });
  return count;
}
