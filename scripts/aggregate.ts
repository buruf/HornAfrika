/**
 * Run the wire aggregator from the command line.
 *
 *   npm run wire            fetch every active source (respects the 20-min window)
 *   npm run wire -- --force ignore the window
 *   npm run wire -- --source=bbc-africa
 *
 * In production this is the job a cron service would call, either through this
 * script or by hitting /api/cron/aggregate with the CRON_SECRET.
 */
import { runAggregation, pruneWire } from "../src/lib/aggregator";
import { db } from "../src/lib/db";

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.find((a) => a.startsWith("--source="))?.split("=")[1];

  console.log(`Fetching${only ? ` ${only}` : " all active sources"}${force ? " (forced)" : ""}…\n`);

  const { results, added, durationMs } = await runAggregation({ force, only });

  const sorted = [...results].sort((a, b) => b.added - a.added);
  for (const r of sorted) {
    const flag = r.skipped ? "SKIP" : r.ok ? "OK  " : "FAIL";
    const counts = r.skipped ? "  (inside refetch window)" : `${String(r.added).padStart(3)} new / ${String(r.seen).padStart(3)} in feed`;
    console.log(`${flag} ${counts}  ${r.sourceName}${r.error ? `  :: ${r.error.slice(0, 70)}` : ""}`);
  }

  const pruned = await pruneWire();

  const [total, tagged] = await Promise.all([
    db.wireItem.count(),
    db.wireItemCountry.count(),
  ]);

  console.log(
    `\n${added} added in ${Math.round(durationMs / 1000)}s · ${total} items held · ${tagged} country tags · ${pruned} pruned`,
  );

  const countries = await db.country.findMany({ orderBy: { order: "asc" } });
  for (const c of countries) {
    const n = await db.wireItem.count({
      where: { countries: { some: { countryId: c.id } } },
    });
    console.log(`  ${c.name.padEnd(10)} ${n}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
