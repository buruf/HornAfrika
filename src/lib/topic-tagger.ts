/**
 * Desk tagging for wire items.
 *
 * Once our own articles are retired the desk pages — Politics, Business,
 * Security and the rest — have nothing to show unless the wire can be sorted
 * into them. A publisher's own section is not available in an RSS item and
 * would not match our desks anyway, so the desk is inferred from the text, the
 * same way the country is.
 *
 * Deliberately different from the country tagger in one respect: an item gets
 * exactly one desk. A story can genuinely be about two countries and belongs
 * on both country pages, but a headline filed under four desks makes every
 * desk page a copy of the wire. So the strongest signal wins and ties are
 * broken by the priority order below.
 *
 * The honest limitation: this is keyword matching, not comprehension. It gets
 * the obvious cases right and will misfile the subtle ones. That is why
 * `null` is a normal outcome — an item with no clear desk stays on the wire
 * and on its country page rather than being forced somewhere it does not
 * belong.
 */

/**
 * Order matters: it breaks ties when a headline scores equally on two desks.
 *
 * Security outranks politics because "president visits troops after attack" is
 * more useful on the security desk, and both are more specific than society,
 * which is the catch-all of the set and therefore last.
 */
export const TOPICS = [
  "security",
  "economy",
  "business",
  "politics",
  "sports",
  "culture",
  "society",
] as const;

export type Topic = (typeof TOPICS)[number];

const TOPIC_TERMS: Record<Topic, string[]> = {
  security: [
    "al-shabaab", "al shabab", "shabaab", "isis", "islamic state", "daesh",
    "attack", "attacked", "bombing", "bomb", "explosion", "blast", "grenade",
    "killed", "wounded", "casualties", "gunmen", "militants", "insurgents",
    "offensive", "airstrike", "air strike", "drone strike", "clashes", "fighting",
    "troops", "soldiers", "army", "military", "navy", "peacekeepers", "aussom",
    "atmis", "danab", "darawiish", "police", "arrested", "detained", "kidnap",
    "abducted", "piracy", "pirates", "ceasefire", "disarmament", "militia",
    "security forces", "counter-terrorism", "endf", "tplf", "fano", "olf", "ola",
    "conflict", "war", "violence", "assassination", "ambush", "curfew",
    "forces", "security operation", "military operation", "raid", "raids",
    "checkpoint", "weapons", "arms", "battalion", "brigade", "commander",
  ],
  economy: [
    "inflation", "gdp", "budget", "deficit", "debt relief", "imf",
    "world bank", "monetary", "central bank", "interest rate", "devaluation",
    "currency", "exchange rate", "birr", "shilling", "nakfa", "remittance",
    "remittances", "economic growth", "recession", "austerity", "subsidy",
    "taxation", "tax revenue", "fiscal", "gdp growth", "cost of living",
    "unemployment", "poverty rate", "aid package", "donor funding",
  ],
  business: [
    "company", "firm", "investment", "investor", "trade deal", "export",
    "exports", "import", "imports", "port", "terminal", "logistics", "shipping",
    "airline", "airlines", "telecom", "hormuud", "ethio telecom", "dahabshiil",
    "bank", "banking", "fintech", "mobile money", "startup", "entrepreneur",
    "oil", "gas", "mining", "energy", "electricity", "power plant", "dam",
    "construction", "infrastructure", "contract", "tender", "market",
    "agriculture", "livestock", "fisheries", "sesame", "coffee export",
    "manufacturing", "industrial park", "tourism",
  ],
  politics: [
    "president", "prime minister", "minister", "government", "cabinet",
    "parliament", "mp", "senate", "election", "elections", "vote", "voters",
    "ballot", "campaign", "opposition", "coalition", "constitution",
    "referendum", "diplomatic", "diplomacy", "ambassador", "embassy", "talks",
    "summit", "agreement", "accord", "memorandum", "treaty", "sanctions",
    "african union", "united nations", "igad", "recognition", "sovereignty",
    "federal", "regional state", "governor", "mayor", "party", "impeachment",
    "protest", "protests", "demonstration", "resign", "sworn in", "inaugurated",
    "agree", "agrees", "agreed", "cooperation", "framework", "bilateral",
    "delegation", "communique", "statehood", "envoy", "premier", "presidency",
  ],
  sports: [
    "football", "soccer", "match", "goal", "striker", "midfielder", "coach",
    "league", "cup", "tournament", "qualifier", "world cup", "afcon", "caf",
    "fifa", "olympic", "olympics", "athletics", "marathon", "runner", "sprinter",
    "medal", "championship", "stadium", "squad", "friendly", "derby",
    "athlete", "10,000m", "5,000m",
  ],
  culture: [
    "music", "musician", "singer", "song", "album", "artist", "film", "movie",
    "cinema", "festival", "poetry", "poet", "novel", "author", "literature",
    "heritage", "museum", "exhibition", "art", "theatre", "dance", "fashion",
    "cuisine", "ramadan", "eid", "christmas", "timkat", "meskel", "wedding",
    "language", "tradition", "traditional",
  ],
  society: [
    "school", "schools", "university", "students", "education", "teacher",
    "hospital", "clinic", "health", "disease", "cholera", "measles", "malaria",
    "vaccination", "outbreak", "doctors", "nurses", "malnutrition", "famine",
    "drought", "flood", "floods", "rains", "displaced", "displacement", "idp",
    "refugee", "refugees", "humanitarian", "aid", "water", "sanitation",
    "migration", "migrants", "women", "children", "youth", "disability",
    "climate", "environment", "locust", "livelihood", "eviction", "housing",
  ],
};

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PATTERNS: Record<Topic, RegExp[]> = Object.fromEntries(
  TOPICS.map((topic) => [
    topic,
    TOPIC_TERMS[topic].map(
      (t) => new RegExp(`(^|[^\\p{L}])${escape(t)}([^\\p{L}]|$)`, "iu"),
    ),
  ]),
) as Record<Topic, RegExp[]>;

/**
 * The desk an item belongs on, or null when nothing scores.
 *
 * Scores by how many distinct terms match rather than by first hit, so a
 * headline that mentions one minister but eight security words lands on
 * security instead of politics.
 */
export function detectTopic(text: string): Topic | null {
  const hay = text.toLowerCase();

  let best: Topic | null = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    let score = 0;
    for (const pattern of PATTERNS[topic]) {
      if (pattern.test(hay)) score++;
    }
    // Strictly greater, so the TOPICS order breaks ties.
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  return best;
}
