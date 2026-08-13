/**
 * Attaches real, properly licensed photography to the seed articles.
 *
 * Every image comes from Wikimedia Commons under a free licence, and the
 * photographer, licence and source page are all stored so the credit line can
 * be shown next to the picture. Nothing is hotlinked from a publisher and no
 * stock photo of "Africa" is used as a stand-in for a specific place.
 *
 * The search term for each article is written by hand rather than derived from
 * the headline. An automatic keyword grab would eventually put a photograph of
 * the wrong country, or the wrong event, on a news story — which is worse than
 * no photograph at all.
 *
 * Images are illustrative, not documentary: they show the place a story is
 * about, not the event it reports. The caption says so.
 *
 * Run: node scripts/fetch-article-images.mjs
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const UA = "HornafrikaBot/1.0 (+https://hornafrika.com/about)";

/** article slug → what the photograph should show. */
const QUERIES = {
  // Regional / Horn-wide
  "ethiopia-somalia-framework-for-cooperation": "Addis Ababa African Union headquarters",
  "why-the-red-sea-is-vital-to-the-horn-of-africa": "Bab-el-Mandeb strait",
  "landlocked-ethiopia-search-for-sea-access": "Port of Djibouti container terminal",
  "new-trade-corridor-regional-economy": "Addis Ababa Djibouti Railway",
  "ethiopia-eritrea-war-then-peace-timeline": "Eritrea Ethiopia border landscape",
  "drought-and-displacement-across-the-horn": "Somalia drought landscape",
  "igad-and-the-limits-of-regional-mediation": "Djibouti city skyline",
  "red-sea-shipping-disruption-reaches-horn-ports": "Gulf of Aden container ship",
  "why-ports-matter-horn-of-africa": "Port of Berbera",
  "horn-of-africa-strategic-importance": "Horn of Africa satellite",
  "profile-horn-diaspora-engineers": "Addis Ababa technology",
  "profile-women-in-horn-business": "Somalia market traders",

  // Somalia
  "president-meets-regional-leaders-ankara": "Villa Somalia Mogadishu",
  "mogadishu-port-operations-increase": "Port of Mogadishu",
  "galmudug-launches-new-development-plan": "Galmudug Somalia",
  "somali-startups-attract-record-investment": "Mogadishu city",
  "somalia-border-security-operations-galmudug": "Somali National Army",
  "al-shabaab-attacks-repelled-middle-shabelle": "Shabelle river Somalia",
  "puntland-fisheries-sector-development": "Bosaso Puntland",
  "somali-football-league-grows": "Mogadishu Stadium",
  "somali-poetry-oral-tradition": "Somali culture",
  "somaliland-berbera-corridor": "Berbera Somaliland",
  "how-the-somali-federal-system-works": "Mogadishu parliament",

  // Ethiopia
  "parliament-passes-new-investment-law": "Ethiopian Parliament building",
  "ethiopia-economy-grows-official-data": "Addis Ababa skyline",
  "addis-ababa-light-rail-expansion": "Addis Ababa Light Rail",
  "tigray-peace-agreement-progress": "Mekelle Tigray",
  "ethiopia-nationwide-tree-planting": "Ethiopian highlands forest",
  "gerd-and-the-nile-question": "Grand Ethiopian Renaissance Dam",
  "ethiopian-athletics-distance-running": "Ethiopian runners",
  "ethiopian-coffee-origin-and-trade": "Ethiopian coffee beans",

  // Djibouti
  "djibouti-port-expansion-plan": "Doraleh Container Terminal",
  "new-port-expansion-boost-trade": "Port of Djibouti",
  "djibouti-regional-digital-hub": "Djibouti City",
  "djibouti-airlines-new-aircraft": "Djibouti Ambouli International Airport",
  "djibouti-free-zone-attracts-companies": "Djibouti free zone",
  "djibouti-geothermal-energy-potential": "Lake Assal Djibouti",
  "djibouti-migration-route-obock": "Obock Djibouti",
  "djibouti-president-inaugurates-road": "Djibouti landscape road",

  // Eritrea
  "independence-day-celebrated-nationwide": "Asmara Eritrea",
  "eritrea-renewable-energy-investment": "Eritrea landscape",
  "eritrea-mining-projects-economy": "Eritrea mining",
  "eritrea-tourism-strategy-heritage": "Fiat Tagliero Building Asmara",
  "eritrea-cultural-festival": "Eritrean culture",
  "eritrea-cycling-tradition": "Cycling Eritrea",
  "eritrean-music-global-stage": "Eritrean music",
};

/** Licences we will publish under. Anything else is skipped. */
const ALLOWED = [
  /^CC BY(-SA)?[- ]?\d/i,
  /^CC0/i,
  /^public domain/i,
  /^GODL/i,
  /^Attribution/i,
];

const strip = (s) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function search(term) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=8` +
    `&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1600&format=json&origin=*`;

  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const pages = Object.values(json.query?.pages ?? {});

  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    // Photographs only. Diagrams and flags are not illustrations of a place.
    if (!/^image\/(jpeg|png)$/.test(ii.mime ?? "")) continue;
    if ((ii.width ?? 0) < 900) continue;

    const meta = ii.extmetadata ?? {};
    const licence = strip(meta.LicenseShortName?.value);
    if (!ALLOWED.some((re) => re.test(licence))) continue;

    const author = strip(meta.Artist?.value) || "Unknown photographer";
    return {
      url: ii.thumburl ?? ii.url,
      credit: author.slice(0, 120),
      license: licence,
      sourceUrl: ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      title: p.title,
    };
  }
  return null;
}

async function main() {
  const articles = await db.article.findMany({ select: { id: true, slug: true, headline: true } });
  let attached = 0;
  let missed = 0;

  for (const a of articles) {
    const term = QUERIES[a.slug];
    if (!term) {
      console.log(`  no query mapped: ${a.slug}`);
      missed++;
      continue;
    }
    try {
      const hit = await search(term);
      if (!hit) {
        console.log(`  no free-licensed photo: ${a.slug} ("${term}")`);
        missed++;
        continue;
      }
      await db.article.update({
        where: { id: a.id },
        data: {
          imageUrl: hit.url,
          imageCredit: hit.credit,
          imageLicense: hit.license,
          imageSourceUrl: hit.sourceUrl,
          // Illustrative, and the caption has to say so.
          imageCaption: `${term}. File photograph, illustrating the subject of this report.`,
        },
      });
      console.log(`  ✓ ${a.slug.padEnd(48)} ${hit.license}`);
      attached++;
    } catch (e) {
      console.log(`  failed ${a.slug}: ${e.message}`);
      missed++;
    }
    // Be polite to the API.
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nattached ${attached}, no image for ${missed}`);
  await db.$disconnect();
}

main();
