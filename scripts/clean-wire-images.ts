/**
 * Drop stored wire images that are not photographs.
 *
 * Feeds that embed the picture in the body hand us the first <img> they
 * contain, which is often furniture: Ethiopia Insight leads with a PayPal
 * donate button, others with a logo or a tracking pixel. The parser now
 * refuses those at ingest (see looksLikeAPhoto); this applies the same rule to
 * what is already stored.
 *
 *   npx tsx scripts/clean-wire-images.ts            # report
 *   npx tsx scripts/clean-wire-images.ts --apply    # clear them
 */

import { PrismaClient } from "@prisma/client";
import { looksLikeAPhoto } from "../src/lib/rss";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const rows = await db.wireItem.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true, source: { select: { name: true } } },
  });

  const bad = rows.filter((r) => !looksLikeAPhoto(r.imageUrl!));

  console.log(`${rows.length} stored images · ${bad.length} are not photographs`);
  for (const b of bad.slice(0, 12)) {
    console.log(`  ${b.source.name.padEnd(22)} ${b.imageUrl!.slice(0, 76)}`);
  }
  if (bad.length > 12) console.log(`  … and ${bad.length - 12} more`);

  if (!APPLY) {
    console.log("\nDry run — pass --apply to clear them.");
    await db.$disconnect();
    return;
  }

  if (bad.length > 0) {
    // Only the image is dropped. The headline and link stay; the card simply
    // renders text-only, which it is built to do.
    const { count } = await db.wireItem.updateMany({
      where: { id: { in: bad.map((b) => b.id) } },
      data: { imageUrl: null },
    });
    console.log(`\ncleared ${count}`);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
