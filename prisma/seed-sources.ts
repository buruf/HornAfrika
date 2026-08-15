/**
 * Wire sources.
 *
 * Every feed marked `active: true` was probed and returned parseable items on
 * 2026-08-09. The inactive ones are recorded rather than deleted: knowing that
 * a publisher blocks automated requests is useful, and the note says what would
 * need to happen to turn each one on.
 *
 * `country` is the outlet's primary beat, not a claim about where it is
 * registered. Items are additionally country-tagged from their own text, so an
 * international wire still reaches the right country page.
 */

export type SeedSource = {
  slug: string;
  name: string;
  homepageUrl: string;
  feedUrl: string;
  kind: "REGIONAL" | "HORN" | "PANAFRICAN" | "INTERNATIONAL";
  country?: string | null;
  language?: string;
  active: boolean;
  stateAffiliated?: boolean;
  note?: string;
};

export const SOURCES: SeedSource[] = [
  // ---------------------------------------------------------------- Somalia
  { slug: "somali-guardian", name: "Somali Guardian", homepageUrl: "https://somaliguardian.com", feedUrl: "https://somaliguardian.com/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "radio-dalsan", name: "Radio Dalsan", homepageUrl: "https://radiodalsan.com", feedUrl: "https://radiodalsan.com/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "goobjoog", name: "Goobjoog English", homepageUrl: "https://goobjoog.com/english/", feedUrl: "https://goobjoog.com/english/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "somali-dispatch", name: "Somali Dispatch", homepageUrl: "https://www.somalidispatch.com", feedUrl: "https://www.somalidispatch.com/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "halbeeg", name: "Halbeeg News", homepageUrl: "https://en.halbeeg.com", feedUrl: "https://en.halbeeg.com/feed/", kind: "REGIONAL", country: "somalia", active: false, note: "Feed answers 200 with well-formed items, but the newest is from Jan 2025 — the outlet appears to have stopped publishing. Re-enable if it resumes." },
  { slug: "caasimada", name: "Caasimada Online", homepageUrl: "https://caasimada.net", feedUrl: "https://caasimada.net/feed/", kind: "REGIONAL", country: "somalia", language: "so", active: true },
  { slug: "jowhar", name: "Jowhar", homepageUrl: "https://jowhar.com", feedUrl: "https://jowhar.com/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "puntland-post", name: "Puntland Post", homepageUrl: "https://puntlandpost.net", feedUrl: "https://puntlandpost.net/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "somali-public-agenda", name: "Somali Public Agenda", homepageUrl: "https://somalipublicagenda.org", feedUrl: "https://somalipublicagenda.org/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "somaliland-standard", name: "Somaliland Standard", homepageUrl: "https://somalilandstandard.com", feedUrl: "https://somalilandstandard.com/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "somaliland-sun", name: "Somaliland Sun", homepageUrl: "https://somalilandsun.com", feedUrl: "https://somalilandsun.com/feed/", kind: "REGIONAL", country: "somalia", active: true },
  { slug: "garowe-online", name: "Garowe Online", homepageUrl: "https://www.garoweonline.com", feedUrl: "https://www.garoweonline.com/en/feed", kind: "REGIONAL", country: "somalia", active: false, note: "Feed returned HTTP 500 on 9 Aug 2026. Recheck, or ask the publisher for a working feed URL." },
  { slug: "hiiraan", name: "Hiiraan Online", homepageUrl: "https://www.hiiraan.com", feedUrl: "https://www.hiiraan.com/rss/", kind: "REGIONAL", country: "somalia", active: false, note: "No feed found at the expected path (HTTP 404). Contact the publisher for a feed URL." },
  { slug: "mareeg", name: "Mareeg Media", homepageUrl: "https://mareeg.com", feedUrl: "https://mareeg.com/feed/", kind: "REGIONAL", country: "somalia", active: false, note: "Blocks automated requests (HTTP 403). Enable only with the publisher's permission." },

  // --------------------------------------------------------------- Ethiopia
  { slug: "ethiopian-monitor", name: "Ethiopian Monitor", homepageUrl: "https://ethiopianmonitor.com", feedUrl: "https://ethiopianmonitor.com/feed/", kind: "REGIONAL", country: "ethiopia", active: true },
  { slug: "addis-fortune", name: "Addis Fortune", homepageUrl: "https://addisfortune.news", feedUrl: "https://addisfortune.news/feed/", kind: "REGIONAL", country: "ethiopia", active: true },
  { slug: "capital-ethiopia", name: "Capital Ethiopia", homepageUrl: "https://www.capitalethiopia.com", feedUrl: "https://www.capitalethiopia.com/feed/", kind: "REGIONAL", country: "ethiopia", active: true },
  { slug: "ethiopia-insight", name: "Ethiopia Insight", homepageUrl: "https://www.ethiopia-insight.com", feedUrl: "https://www.ethiopia-insight.com/feed/", kind: "REGIONAL", country: "ethiopia", active: true },
  { slug: "fana", name: "Fana Broadcasting", homepageUrl: "https://www.fanabc.com", feedUrl: "https://www.fanabc.com/english/feed/", kind: "REGIONAL", country: "ethiopia", active: true, stateAffiliated: true },
  // Fana's Amharic desk carries different stories from its English one, not
  // translations of them, and it is where domestic coverage actually lands.
  // It also exercises the Amharic side of the country tagger.
  { slug: "fana-amharic", name: "Fana Broadcasting (Amharic)", homepageUrl: "https://www.fanabc.com", feedUrl: "https://www.fanabc.com/feed/", kind: "REGIONAL", country: "ethiopia", language: "am", active: true, stateAffiliated: true },
  { slug: "ethiopian-business-review", name: "Ethiopian Business Review", homepageUrl: "https://ethiopianbusinessreview.net", feedUrl: "https://ethiopianbusinessreview.net/feed/", kind: "REGIONAL", country: "ethiopia", active: true, note: "Monthly business title — expect it to read as quiet between issues." },
  { slug: "new-business-ethiopia", name: "New Business Ethiopia", homepageUrl: "https://newbusinessethiopia.com", feedUrl: "https://newbusinessethiopia.com/feed/", kind: "REGIONAL", country: "ethiopia", active: true },
  { slug: "addis-standard", name: "Addis Standard", homepageUrl: "https://addisstandard.com", feedUrl: "https://addisstandard.com/feed/", kind: "REGIONAL", country: "ethiopia", active: false, note: "Blocks automated requests (HTTP 403). Enable only with the publisher's permission." },
  { slug: "reporter-ethiopia", name: "The Reporter Ethiopia", homepageUrl: "https://www.thereporterethiopia.com", feedUrl: "https://www.thereporterethiopia.com/feed/", kind: "REGIONAL", country: "ethiopia", active: false, note: "Blocks automated requests (HTTP 403). Enable only with the publisher's permission." },
  { slug: "borkena", name: "Borkena", homepageUrl: "https://borkena.com", feedUrl: "https://borkena.com/feed/", kind: "REGIONAL", country: "ethiopia", active: false, note: "Blocks automated requests (HTTP 403). Enable only with the publisher's permission." },

  // --------------------------------------------------------------- Djibouti
  { slug: "la-nation-dj", name: "La Nation", homepageUrl: "https://www.lanation.dj", feedUrl: "https://www.lanation.dj/feed/", kind: "REGIONAL", country: "djibouti", language: "fr", active: true, stateAffiliated: true },
  { slug: "adds-dj", name: "ADDS Djibouti", homepageUrl: "https://www.adds.dj", feedUrl: "https://www.adds.dj/feed/", kind: "REGIONAL", country: "djibouti", language: "fr", active: true, stateAffiliated: true },
  { slug: "rtd-dj", name: "RTD Djibouti", homepageUrl: "https://www.rtd.dj", feedUrl: "https://www.rtd.dj/feed/", kind: "REGIONAL", country: "djibouti", language: "fr", active: true, stateAffiliated: true, note: "National broadcaster. All three working Djiboutian feeds are state-run — there is no independent press to balance them with, and readers are told so." },

  // ---------------------------------------------------------------- Eritrea
  // Eritrea is by far the hardest of the four to source. The state outlet
  // blocks bots, there is no independent press inside the country, and the
  // diaspora sites are intermittent. Eritrea Focus was the only feed found on
  // 13 Aug 2026 that is both reachable and currently publishing — and it is an
  // advocacy group, not a newsroom, so it is noted as such rather than passed
  // off as neutral. Most Eritrea coverage still arrives through the
  // international wires, country-tagged from the text of each item.
  { slug: "eritrea-focus", name: "Eritrea Focus", homepageUrl: "https://eritrea-focus.org", feedUrl: "https://eritrea-focus.org/feed/", kind: "REGIONAL", country: "eritrea", active: true, note: "UK-based advocacy and monitoring group campaigning on human rights in Eritrea, not a neutral newsroom." },
  { slug: "awate", name: "Awate", homepageUrl: "https://awate.com", feedUrl: "https://www.awate.com/feed/", kind: "REGIONAL", country: "eritrea", active: true, note: "Long-running Eritrean diaspora opposition site. Openly partisan against the government, and the only other reachable Eritrea feed publishing regularly. Both Eritrean sources we can reach are opposition-aligned; the state outlet blocks us. Readers should know the coverage leans one way because the other side is unreachable, not because we chose it." },
  { slug: "shabait", name: "Shabait (Eritrea Ministry of Information)", homepageUrl: "https://shabait.com", feedUrl: "https://shabait.com/feed/", kind: "REGIONAL", country: "eritrea", active: false, stateAffiliated: true, note: "Blocks automated requests (HTTP 403), reconfirmed 13 Aug 2026. State outlet — if enabled, label it as such for readers." },
  { slug: "tesfanews", name: "TesfaNews", homepageUrl: "https://tesfanews.net", feedUrl: "https://tesfanews.net/feed/", kind: "REGIONAL", country: "eritrea", active: false, note: "Blocks automated requests (HTTP 403)." },
  { slug: "eritrea-hub", name: "Eritrea Hub", homepageUrl: "https://eritreahub.org", feedUrl: "https://eritreahub.org/feed", kind: "REGIONAL", country: "eritrea", active: false, note: "Serves an HTML page at the feed path, reconfirmed 13 Aug 2026. Needs a working feed URL from the publisher." },

  // ------------------------------------------------------------ Horn / pan-African
  { slug: "horn-diplomat", name: "Horn Diplomat", homepageUrl: "https://www.horndiplomat.com", feedUrl: "https://www.horndiplomat.com/feed/", kind: "HORN", country: null, active: true },
  { slug: "radio-ergo", name: "Radio Ergo", homepageUrl: "https://radioergo.org", feedUrl: "https://radioergo.org/en/feed/", kind: "HORN", country: null, active: true, note: "Humanitarian broadcaster covering drought, displacement and rural livelihoods across the Horn — reporting the commercial press largely does not carry." },
  { slug: "african-arguments", name: "African Arguments", homepageUrl: "https://africanarguments.org", feedUrl: "https://africanarguments.org/feed/", kind: "PANAFRICAN", country: null, active: true },
  { slug: "africanews", name: "Africanews", homepageUrl: "https://www.africanews.com", feedUrl: "https://www.africanews.com/feed/rss", kind: "PANAFRICAN", country: null, active: true },

  // --------------------------------------------------------- International
  { slug: "bbc-africa", name: "BBC News — Africa", homepageUrl: "https://www.bbc.com/news/world/africa", feedUrl: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "bbc-world", name: "BBC News — World", homepageUrl: "https://www.bbc.com/news/world", feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "al-jazeera", name: "Al Jazeera", homepageUrl: "https://www.aljazeera.com", feedUrl: "https://www.aljazeera.com/xml/rss/all.xml", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "guardian-africa", name: "The Guardian — Africa", homepageUrl: "https://www.theguardian.com/world/africa", feedUrl: "https://www.theguardian.com/world/africa/rss", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "guardian-world", name: "The Guardian — World", homepageUrl: "https://www.theguardian.com/world", feedUrl: "https://www.theguardian.com/world/rss", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "france24-africa", name: "France 24 — Africa", homepageUrl: "https://www.france24.com/en/africa/", feedUrl: "https://www.france24.com/en/africa/rss", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "dw-africa", name: "DW — Africa", homepageUrl: "https://www.dw.com/en/africa/s-12756", feedUrl: "https://rss.dw.com/rdf/rss-en-africa", kind: "INTERNATIONAL", country: null, active: true },
  { slug: "voa-africa", name: "VOA — Africa", homepageUrl: "https://www.voanews.com/africa", feedUrl: "https://www.voanews.com/api/zq$omekvi_", kind: "INTERNATIONAL", country: null, active: false, stateAffiliated: true, note: "US government-funded broadcaster. Feed answers 200 but its newest item is from Mar 2025; VOA's output was cut back sharply that year. Needs a current feed URL before re-enabling." },
  { slug: "un-news-africa", name: "UN News — Africa", homepageUrl: "https://news.un.org/en/news/region/africa", feedUrl: "https://news.un.org/feed/subscribe/en/news/region/africa/feed/rss.xml", kind: "INTERNATIONAL", country: null, active: true, note: "United Nations news service." },
];
