/**
 * Retire the launch articles.
 *
 * The 46 seed pieces were scaffolding written before the site had reporters.
 * They were never updated and never would be, so they aged a day for every day
 * the site stayed up: by the time this ran, the newest was three days old and
 * the oldest thirteen, sitting above a wire that refreshes hourly.
 *
 * They are unpublished, not deleted. Setting status back to DRAFT takes them
 * off every reader-facing surface while keeping the rows, their slugs and
 * their editorial history intact, so the decision is reversible from the CMS
 * and a future article can reuse a slug. Only seed articles are touched —
 * anything a real contributor files is left alone, whatever its state.
 *
 *   npx tsx scripts/retire-seed-articles.ts            # report
 *   npx tsx scripts/retire-seed-articles.ts --apply    # write
 *   npx tsx scripts/retire-seed-articles.ts --restore  # put them back
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const RESTORE = process.argv.includes("--restore");

async function main() {
  const from = RESTORE ? "DRAFT" : "PUBLISHED";
  const to = RESTORE ? "PUBLISHED" : "DRAFT";

  const targets = await db.article.findMany({
    where: { isSeed: true, status: from },
    select: { id: true, slug: true, headline: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const live = await db.article.count({ where: { status: "PUBLISHED" } });
  const real = await db.article.count({ where: { isSeed: false } });

  console.log(
    `${targets.length} seed article(s) currently ${from}. ` +
      `${live} published in total, ${real} written by a real contributor.`,
  );
  for (const a of targets.slice(0, 5)) {
    const age = a.publishedAt
      ? Math.round((Date.now() - a.publishedAt.getTime()) / 86_400_000)
      : null;
    console.log(`  ${age === null ? "—" : `${age}d`}\t${a.headline.slice(0, 66)}`);
  }
  if (targets.length > 5) console.log(`  … and ${targets.length - 5} more`);

  if (!APPLY && !RESTORE) {
    console.log("\nDry run — pass --apply to unpublish, --restore to put them back.");
    await db.$disconnect();
    return;
  }

  const { count } = await db.article.updateMany({
    where: { isSeed: true, status: from },
    data: { status: to },
  });

  // Homepage slots point at articles by id, and a slot holding a retired
  // article renders a hole rather than falling back.
  //
  // The article is detached from the slot rather than the slot being deleted.
  // An earlier version deleted the rows, which made --restore a lie: the
  // articles came back and the front page still had no lead, no country
  // features and no People panel, because the slots themselves were gone.
  // Emptying the slot is reversible; deleting it is not.
  const slots = await db.homepageSlot.updateMany({
    where: { article: { isSeed: true, status: "DRAFT" } },
    data: { articleId: null },
  });

  console.log(
    `\n${count} article(s) moved to ${to}. ${slots.count} homepage slot(s) emptied.`,
  );
  if (RESTORE) {
    console.log(
      "Slots are not refilled automatically — run scripts/restore-homepage-slots.ts --apply.",
    );
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
