/**
 * Re-create the homepage slots from the seed's slot map.
 *
 * `retire-seed-articles.ts --apply` deletes slots pointing at a retired
 * article, because a slot holding an unpublished piece renders a hole rather
 * than falling back. That delete is not reversed by `--restore`: the rows are
 * gone, not flagged, which was a gap in the retirement script.
 *
 * This rebuilds them by slug from prisma/seed.ts, so a restore puts the front
 * page back the way it was rather than leaving the People and Explained
 * features blank.
 *
 *   npx tsx scripts/restore-homepage-slots.ts            # report
 *   npx tsx scripts/restore-homepage-slots.ts --apply    # write
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

/** Must stay in step with the `slots` list in prisma/seed.ts. */
const SLOTS: [slot: string, articleSlug: string][] = [
  ["lead", "ethiopia-somalia-framework-for-cooperation"],
  ["secondary-1", "djibouti-port-expansion-plan"],
  ["secondary-2", "somalia-border-security-operations-galmudug"],
  ["secondary-3", "eritrean-music-global-stage"],
  ["somalia-lead", "president-meets-regional-leaders-ankara"],
  ["ethiopia-lead", "parliament-passes-new-investment-law"],
  ["djibouti-lead", "new-port-expansion-boost-trade"],
  ["eritrea-lead", "independence-day-celebrated-nationwide"],
  ["horn-feature", "why-the-red-sea-is-vital-to-the-horn-of-africa"],
  ["explained-feature", "horn-of-africa-strategic-importance"],
  ["people-feature", "profile-horn-diaspora-engineers"],
];

async function main() {
  const articles = await db.article.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(articles.map((a) => [a.slug, a.id]));

  const existing = new Set(
    (await db.homepageSlot.findMany({ select: { slot: true } })).map((s) => s.slot),
  );

  let created = 0;
  let missing = 0;

  for (const [slot, slug] of SLOTS) {
    if (existing.has(slot)) continue;

    const articleId = idBySlug.get(slug) ?? null;
    if (!articleId) {
      console.log(`  ${slot.padEnd(18)} article "${slug}" not found — slot left empty`);
      missing++;
    } else {
      console.log(`  ${slot.padEnd(18)} → ${slug}`);
    }

    created++;
    if (APPLY) await db.homepageSlot.create({ data: { slot, articleId } });
  }

  console.log(
    `\n${created} slot(s) ${APPLY ? "created" : "would be created"}` +
      (missing ? `, ${missing} without an article` : ""),
  );
  if (!APPLY) console.log("Dry run — pass --apply to write.");

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
