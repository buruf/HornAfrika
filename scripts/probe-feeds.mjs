/**
 * Probe candidate feed URLs with the same honest User-Agent the aggregator
 * uses, and report what each one actually returns.
 *
 * This exists because guessing feed paths from a browser is misleading: a feed
 * that loads fine for you may 403 a declared bot, and a URL that 200s may
 * return HTML or an empty channel. The only trustworthy answer is the one the
 * crawler itself gets.
 *
 *   node scripts/probe-feeds.mjs                  # probe the candidate list
 *   node scripts/probe-feeds.mjs --db             # also re-probe every source in the DB
 *   node scripts/probe-feeds.mjs <url> [<url>...] # probe specific URLs
 *
 * Nothing is written. Deciding what to enable is a separate, deliberate step.
 */

import { XMLParser } from "fast-xml-parser";

const USER_AGENT =
  "Mozilla/5.0 (compatible; HornafrikaBot/1.0; +https://hornafrika.com/about)";
const TIMEOUT_MS = 15_000;

/**
 * Candidates, grouped by the gap they are meant to close. Eritrea and Djibouti
 * lead because that is where the wire is thinnest.
 */
const CANDIDATES = [
  // --- currently broken in the DB: is the failure permanent or a stale URL? --
  ["retry", "Garowe Online", "https://www.garoweonline.com/en/feed"],
  ["retry", "Garowe Online (rss)", "https://www.garoweonline.com/en/rss"],
  ["retry", "Hiiraan (rss/)", "https://www.hiiraan.com/rss/"],
  ["retry", "Hiiraan (news feed)", "https://www.hiiraan.com/rss/news.xml"],
  ["retry", "Eritrea Hub", "https://eritreahub.org/feed"],
  ["retry", "Eritrea Hub (feed/)", "https://eritreahub.org/feed/"],
  ["retry", "Somaliland Sun", "https://somalilandsun.com/feed/"],
  ["retry", "Halbeeg", "https://en.halbeeg.com/feed/"],
  ["retry", "VOA Africa", "https://www.voanews.com/api/zq$omekvi_"],

  // --- Eritrea -------------------------------------------------------------
  ["eritrea", "Madote", "http://www.madote.com/feeds/posts/default?alt=rss"],
  ["eritrea", "Assenna", "https://assenna.com/feed/"],
  ["eritrea", "Eritrea Focus", "https://eritrea-focus.org/feed/"],
  ["eritrea", "Eritrean Press (Blogspot)", "https://eritreanpress.com/feed/"],
  ["eritrea", "ReliefWeb — Eritrea", "https://reliefweb.int/country/eri/rss.xml"],

  // --- Djibouti ------------------------------------------------------------
  ["djibouti", "ReliefWeb — Djibouti", "https://reliefweb.int/country/dji/rss.xml"],
  ["djibouti", "Djibouti Nation (alt)", "https://www.lanation.dj/feed/"],
  ["djibouti", "HCH24", "https://www.hch24.com/feed/"],

  // --- humanitarian / official, strong Horn coverage -----------------------
  ["agency", "ReliefWeb — Somalia", "https://reliefweb.int/country/som/rss.xml"],
  ["agency", "ReliefWeb — Ethiopia", "https://reliefweb.int/country/eth/rss.xml"],
  ["agency", "Radio Ergo", "https://radioergo.org/en/feed/"],
  ["agency", "ENA (Ethiopian News Agency)", "https://www.ena.et/en/rss"],
  ["agency", "ENA (alt)", "https://www.ena.et/rss"],
  ["agency", "SONNA", "https://sonna.so/en/feed/"],
  ["agency", "Walta", "https://waltainfo.com/feed/"],
  ["agency", "FAO/FEWS NET", "https://fews.net/rss.xml"],

  // --- Somalia -------------------------------------------------------------
  ["somalia", "Goobjoog English", "https://goobjoog.com/english/feed/"],
  ["somalia", "Shabelle Media", "https://shabellemedia.com/feed/"],
  ["somalia", "Somali Dispatch", "https://www.somalidispatch.com/feed/"],
  ["somalia", "Horn Observer", "https://hornobserver.com/rss"],
  ["somalia", "Idman Times", "https://idmantimes.com/feed/"],

  // --- Ethiopia ------------------------------------------------------------
  ["ethiopia", "Addis Zeybe", "https://addiszeybe.com/feed"],
  ["ethiopia", "Ethiopian Reporter (alt)", "https://www.thereporterethiopia.com/rss"],
  ["ethiopia", "Shega Media", "https://shega.co/feed/"],
  ["ethiopia", "Tigrai Online", "https://www.tigraionline.com/rss.xml"],

  // --- regional / wire -----------------------------------------------------
  ["regional", "The East African", "https://www.theeastafrican.co.ke/rss"],
  ["regional", "ISS Africa", "https://issafrica.org/rss/feed"],
  ["regional", "Crisis Group — Africa", "https://www.crisisgroup.org/rss/africa"],
  ["regional", "UN OCHA", "https://www.unocha.org/rss.xml"],
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!res.ok) return { ok: false, status: `http ${res.status}`, items: 0 };

    const body = await res.text();
    const ctype = (res.headers.get("content-type") ?? "").split(";")[0];

    let doc;
    try {
      doc = parser.parse(body);
    } catch {
      return { ok: false, status: "unparseable xml", items: 0, ctype };
    }

    const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
    const items = [
      ...asArray(doc?.rss?.channel?.item),
      ...asArray(doc?.feed?.entry),
      ...asArray(doc?.["rdf:RDF"]?.item),
    ];

    if (items.length === 0) {
      const looksHtml = /^\s*<(!doctype html|html)/i.test(body);
      return {
        ok: false,
        status: looksHtml ? "html, not a feed" : "0 items",
        items: 0,
        ctype,
      };
    }

    const first = items[0];
    const titleOf = (t) =>
      typeof t === "string" ? t : (t?.["#text"] ?? "").toString();
    const sample = titleOf(first.title).slice(0, 68);

    // A feed full of 2019 posts is technically alive and practically dead.
    const dateRaw =
      first.pubDate ?? first.published ?? first.updated ?? first["dc:date"];
    const d = dateRaw ? new Date(dateRaw) : null;
    const ageDays =
      d && !Number.isNaN(d.valueOf())
        ? Math.round((Date.now() - d.valueOf()) / 86_400_000)
        : null;

    return { ok: true, status: "ok", items: items.length, sample, ageDays, ctype };
  } catch (e) {
    return {
      ok: false,
      status: e.name === "AbortError" ? "timeout" : `error: ${e.message}`,
      items: 0,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const urls = argv.filter((a) => a.startsWith("http"));

  let list;
  if (urls.length > 0) {
    list = urls.map((u) => ["arg", u, u]);
  } else {
    list = [...CANDIDATES];
    if (argv.includes("--db")) {
      const { PrismaClient } = await import("@prisma/client");
      const db = new PrismaClient();
      const rows = await db.source.findMany({
        select: { name: true, feedUrl: true, active: true },
        orderBy: { name: "asc" },
      });
      await db.$disconnect();
      list.push(
        ...rows.map((r) => [r.active ? "db:on" : "db:off", r.name, r.feedUrl]),
      );
    }
  }

  console.log(`Probing ${list.length} feeds as:\n  ${USER_AGENT}\n`);

  const live = [];
  const CONCURRENCY = 6;
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY);
    const out = await Promise.all(batch.map(([, , url]) => probe(url)));
    batch.forEach(([group, name, url], j) => {
      const r = out[j];
      const mark = r.ok ? "OK " : "   ";
      const age =
        r.ageDays == null ? "" : r.ageDays <= 3 ? ` fresh` : ` newest ${r.ageDays}d old`;
      console.log(
        `${mark}${group.padEnd(9)} ${name.padEnd(30)} ${String(r.items).padStart(3)} ${r.status}${age}`,
      );
      if (r.ok) {
        console.log(`${" ".repeat(13)}${url}`);
        if (r.sample) console.log(`${" ".repeat(13)}“${r.sample}”`);
        live.push({ group, name, url, ...r });
      }
    });
  }

  console.log(`\n${live.length}/${list.length} usable.`);
  const stale = live.filter((r) => r.ageDays != null && r.ageDays > 14);
  if (stale.length) {
    console.log(`Alive but stale (>14d): ${stale.map((s) => s.name).join(", ")}`);
  }
}

main();
