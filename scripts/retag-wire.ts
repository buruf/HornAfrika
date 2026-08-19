/**
 * Re-run country tagging over every wire item already stored.
 *
 * Items are tagged once, at ingest. That means every improvement to the tagger
 * only ever helps items that arrive afterwards, and the archive keeps whatever
 * the tagger believed on the day it was fetched — which is why untagged items
 * are stored rather than discarded. This script closes that gap.
 *
 *   npx tsx scripts/retag-wire.ts            # report what would change
 *   npx tsx scripts/retag-wire.ts --apply    # write it
 *
 * Tags are recomputed from scratch rather than added to, so a term removed
 * from the tagger correctly un-tags the items it used to catch.
 */

import { PrismaClient } from "@prisma/client";
import { resolveItemCountries, stripDateline } from "../src/lib/country-tagger";
import { detectTopic } from "../src/lib/topic-tagger";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const VERBOSE = process.argv.includes("--verbose");

async function main() {
  const countries = await db.country.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(countries.map((c) => [c.slug, c.id]));

  const items = await db.wireItem.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      topic: true,
      source: { select: { localOnly: true, country: { select: { slug: true } } } },
      countries: { select: { countryId: true, country: { select: { slug: true } } } },
    },
  });

  let inheritedCount = 0;
  const topicTally: Record<string, number> = {};
  let topicChanged = 0;
  let gained = 0;
  let lost = 0;
  let unchanged = 0;
  const perCountryGain: Record<string, number> = {};

  for (const item of items) {
    const before = new Set(item.countries.map((c) => c.country.slug));
    const body = stripDateline(item.excerpt);
    const { slugs, inherited } = resolveItemCountries(item.title, item.excerpt, {
      publisherCountry: item.source.country?.slug ?? null,
      publisherLocalOnly: item.source.localOnly,
    });
    if (inherited) inheritedCount++;
    const after = new Set(slugs.filter((s) => idBySlug.has(s)));

    const added = [...after].filter((s) => !before.has(s));
    const removed = [...before].filter((s) => !after.has(s));

    const topic = detectTopic(`${item.title} ${body}`);
    topicTally[topic ?? "(none)"] = (topicTally[topic ?? "(none)"] ?? 0) + 1;
    if (topic !== item.topic) {
      topicChanged++;
      if (APPLY) await db.wireItem.update({ where: { id: item.id }, data: { topic } });
    }

    if (added.length === 0 && removed.length === 0) {
      unchanged++;
      continue;
    }

    if (added.length) {
      gained++;
      for (const s of added) perCountryGain[s] = (perCountryGain[s] ?? 0) + 1;
    }
    if (removed.length) lost++;

    if (VERBOSE || !APPLY) {
      const marks = [
        ...added.map((s) => `+${s}`),
        ...removed.map((s) => `-${s}`),
      ].join(" ");
      console.log(`${marks.padEnd(22)} ${item.title.slice(0, 76)}`);
    }

    if (APPLY) {
      await db.wireItemCountry.deleteMany({ where: { wireItemId: item.id } });
      if (after.size > 0) {
        await db.wireItemCountry.createMany({
          data: [...after].map((slug) => ({
            wireItemId: item.id,
            countryId: idBySlug.get(slug)!,
          })),
        });
      }
    }
  }

  console.log(`\ndesk assignment across ${items.length} items:`);
  for (const [topic, n] of Object.entries(topicTally).sort((a, b) => b[1] - a[1])) {
    const pct = Math.round((n / items.length) * 100);
    console.log(`  ${String(n).padStart(4)} ${String(pct).padStart(3)}%  ${topic}`);
  }
  console.log(`${topicChanged} items had their desk set or changed`);
  console.log(`${inheritedCount} items took their country from the outlet beat`);

  console.log(
    `\n${items.length} items · ${gained} gained a tag · ${lost} lost one · ${unchanged} unchanged`,
  );
  for (const [slug, n] of Object.entries(perCountryGain).sort((a, b) => b[1] - a[1])) {
    console.log(`  +${String(n).padStart(4)} ${slug}`);
  }
  if (!APPLY) console.log("\nDry run — pass --apply to write.");

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
