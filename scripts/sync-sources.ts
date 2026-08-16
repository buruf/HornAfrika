/**
 * Bring the Source table in line with prisma/seed-sources.ts, without touching
 * anything else.
 *
 * The seed uses `create` and only ever runs against an empty database, so once
 * a deployment is live there is no way to add a feed or retire a dead one
 * except by hand. This is that path: it upserts every source in the list, and
 * reports — but never deletes — rows in the database that the list no longer
 * mentions. Wire items are left alone; retiring a source keeps its archive.
 *
 *   npx tsx scripts/sync-sources.ts            # show what would change
 *   npx tsx scripts/sync-sources.ts --apply    # write it
 */

import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { SOURCES } from "../prisma/seed-sources";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

type Change = { slug: string; kind: "new" | "changed"; detail: string };

async function main() {
  const countries = await db.country.findMany({ select: { id: true, slug: true } });
  const countryId = new Map(countries.map((c) => [c.slug, c.id]));

  const existing = await db.source.findMany();
  const bySlug = new Map(existing.map((s) => [s.slug, s]));

  const changes: Change[] = [];

  for (const [i, s] of SOURCES.entries()) {
    const want = {
      name: s.name,
      homepageUrl: s.homepageUrl,
      feedUrl: s.feedUrl,
      kind: s.kind as Prisma.SourceCreateInput["kind"],
      language: s.language ?? "en",
      countryId: s.country ? (countryId.get(s.country) ?? null) : null,
      active: s.active,
      stateAffiliated: s.stateAffiliated ?? false,
      localOnly: s.localOnly ?? false,
      note: s.note ?? null,
      order: i,
    };

    const have = bySlug.get(s.slug);

    if (!have) {
      changes.push({ slug: s.slug, kind: "new", detail: `${s.name} — ${s.feedUrl}` });
      if (APPLY) await db.source.create({ data: { slug: s.slug, ...want } });
      continue;
    }

    // Only report the fields this script owns. Health columns are written by
    // the aggregator and must not be clobbered by a config sync.
    const diffs = (Object.keys(want) as (keyof typeof want)[])
      .filter((k) => have[k] !== want[k])
      .map((k) => `${k}: ${JSON.stringify(have[k])} -> ${JSON.stringify(want[k])}`);

    if (diffs.length) {
      changes.push({ slug: s.slug, kind: "changed", detail: diffs.join("; ") });
      if (APPLY) await db.source.update({ where: { slug: s.slug }, data: want });
    }
  }

  const listed = new Set(SOURCES.map((s) => s.slug));
  const orphans = existing.filter((s) => !listed.has(s.slug));

  for (const c of changes) {
    console.log(`${c.kind === "new" ? "NEW    " : "CHANGE "} ${c.slug.padEnd(24)} ${c.detail}`);
  }
  if (orphans.length) {
    console.log(
      `\nIn the database but not in seed-sources.ts (left untouched):\n  ${orphans
        .map((o) => o.slug)
        .join(", ")}`,
    );
  }

  console.log(
    `\n${changes.length} change(s)${APPLY ? " applied" : " — dry run, pass --apply to write"}.`,
  );

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
