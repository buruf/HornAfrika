import { mentionsElsewhere } from "./elsewhere";

/**
 * Country tagging for wire items.
 *
 * Separate from the aggregator because it is pure text logic with no
 * database or network dependency, and because it is the part most likely to
 * be quietly wrong. An earlier version inherited the publisher country and
 * filed a Colombian bombing under Somalia; the regression tests for that
 * live beside this file.
 */

// ---------------------------------------------------------------------------
// Country tagging
// ---------------------------------------------------------------------------

/**
 * Which countries a wire item is about.
 *
 * Decided by the item's own text — country names, capitals, demonyms, major
 * regions and well-known institutions — so a BBC story about Ethiopia reaches
 * the Ethiopia page even though the BBC is not an Ethiopian outlet, and a
 * Somali outlet's report on Colombia does not.
 *
 * Matching is word-boundary aware, case-insensitive and multilingual. It is
 * deliberately conservative: a false negative just means the item stays on the
 * main wire rather than appearing on the wrong country page.
 */
// Terms are multilingual on purpose. Several sources publish in Somali,
// French or Amharic, and an English-only list silently under-tags them.
//
// Deliberately NOT in this list, having been considered and rejected — they are
// real Horn place names, but each collides with something the international
// wires publish constantly, and a wrong country tag is worse than a missing one:
//
//   "bay"    Somali region, and an everyday English noun.
//   "bari"   Somali region, and a city in Italy.
//   "juba"   Somali river, and the capital of South Sudan. "jubba" and
//            "jubaland" are safe and cover most of the same copy.
//   "shire"  Ethiopian town, and an English word.
//   "bale"   Ethiopian zone, and an English word.
//   "adama"  Ethiopian city, and a common given name — including a footballer
//            the Guardian sports feed mentions regularly.
//   "gode"   Ethiopian town, and a surname.
//   "nisa"   Somali intelligence agency, and a name and a retail brand.
//   "psf"    Puntland security force, and far too short to be evidence.
const COUNTRY_TERMS: Record<string, string[]> = {
  somalia: [
    // English
    "somalia", "somali", "somalis", "mogadishu", "banadir", "puntland", "galmudug",
    "hirshabelle", "jubaland", "kismayo", "baidoa", "bosaso", "garowe", "dhusamareb",
    "somaliland", "hargeisa", "berbera", "al-shabaab", "al shabab", "shabelle",
    "villa somalia", "aussom", "atmis",
    // Regions and towns. Local and humanitarian reporting is written for
    // readers who already know where these places are, so the country is often
    // never named: "New road brings trade to small community in Badhan" was a
    // Somalia story the tagger missed entirely until this list existed.
    "awdal", "togdheer", "sanaag", "sool", "nugaal", "mudug", "galgaduud",
    "hiiraan", "hiraan", "bakool", "gedo", "jubba",
    "galkayo", "gaalkacyo", "galcayo", "galkacyo", "badhan", "beletweyne", "beledweyne",
    "belet weyne", "burao", "burco", "las anod", "laascaanood", "erigavo",
    "ceerigaabo", "qardho", "eyl", "afgooye", "baraawe", "merca", "luuq",
    "bardhere", "doolow", "ceelbuur", "cadaado", "adado", "balcad", "jalalaqsi",
    "buulo burde", "wanlaweyn", "laasqoray", "iskushuban", "galdogob",
    // Institutions and companies. Business copy often names only these — a
    // story about Hormuud never has to say the word "Somalia".
    "hormuud", "dahabshiil", "somtel", "golis telecom", "amtel", "somalia stock",
    "darawiish",
    // Somali
    "soomaaliya", "soomaali", "soomaaliyeed", "muqdisho", "puntlaand", "jubbaland",
    "hargeysa", "boosaaso", "kismaayo", "baydhabo", "dhuusamareeb", "garoowe",
    "hirshabeelle", "koonfur galbeed", "danab", "shabaab", "gorgor", "harti",
    // French
    "somalie", "somalien", "somalienne",
  ],
  ethiopia: [
    // English
    "ethiopia", "ethiopian", "ethiopians", "addis ababa", "addis abeba", "oromia", "oromo",
    "amhara", "tigray", "tigrayan", "afar", "sidama", "hawassa", "mekelle",
    "dire dawa", "jigjiga", "bahir dar", "gondar", "renaissance dam", "gerd",
    // Regions and towns.
    "benishangul", "gambella", "harari", "ogaden", "wollega", "gojjam", "wollo",
    "shewa", "metekel", "welkait", "humera", "axum", "aksum", "adigrat",
    "alamata", "kombolcha", "dessie", "woldia", "jimma", "nekemte", "assosa",
    "semera", "arba minch", "shashamane", "bishoftu", "debre birhan", "wolaita",
    "kebri dahar", "degehabur",
    // Parties and armed actors, which local copy names without the country.
    "tplf", "endf", "onlf", "prosperity party",
    // Institutions, banks and the currency. Addis business coverage routinely
    // runs a whole story on "Anbesa Bank" without naming the country once.
    "birr", "ethio telecom", "ethiopian airlines", "anbesa bank", "awash bank",
    "dashen bank", "abyssinia bank", "commercial bank of ethiopia",
    "national bank of ethiopia", "addis fortune", "hawassa industrial",
    "blue nile", "abiy ahmed", "fano",
    // Amharic / Somali / French
    "ኢትዮጵያ", "አዲስ አበባ", "ኦሮሚያ", "ትግራይ", "አማራ",
    "itoobiya", "itoobiyaanka", "ethiopie", "éthiopie", "éthiopien",
  ],
  djibouti: [
    "djibouti", "djiboutian", "djiboutien", "djiboutienne", "doraleh", "tadjourah",
    "obock", "ali sabieh", "dikhil", "arta", "bab el-mandeb", "bab al-mandab",
    "gulf of tadjoura", "jabuuti",
    "balbala", "damerjog", "loyada", "galafi", "holhol", "yoboki", "randa",
  ],
  eritrea: [
    "eritrea", "eritrean", "eritreans", "asmara", "asmera", "massawa", "assab",
    "keren", "mendefera", "gash-barka", "dahlak", "afwerki", "isaias",
    "nakfa", "eri-tv",
    // Towns, regions and institutions. Eritrea has the thinnest wire of the
    // four countries, so every term that rescues an item matters more here.
    "barentu", "agordat", "dekemhare", "senafe", "tesseney", "adi keih",
    "ghinda", "anseba", "zalambessa", "tsorona", "sawa", "pfdj", "bisha mine",
    "ኤርትራ", "ኣስመራ", "ereteriya", "erythree", "érythrée", "erythréen",
  ],
};

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Terms written in a non-Latin script — Ethiopic here, Arabic if we add it.
 *
 * These languages attach grammatical prefixes directly to the noun with no
 * space: Amharic "የኢትዮጵያ" is "of Ethiopia", and Tigrinya behaves the same way.
 * A Latin-style word boundary therefore rejects the most common form the word
 * appears in, and the tagger silently misses most Amharic and Tigrinya
 * headlines — which is the opposite of what a multilingual tagger is for.
 *
 * Substring matching is safe for these terms in a way it would not be for
 * Latin ones: the scripts are distinctive and the words are long, so accidental
 * collisions inside an unrelated token are not a realistic risk.
 */
// The range is U+0000 to U+024F — Basic Latin through Latin Extended-B.
// Written as escapes: a literal NUL byte here made git treat this file as
// binary and silently broke grep over it.
const isNonLatinScript = (t: string) => /[^\u0000-ɏ]/u.test(t);

const buildPattern = (t: string) =>
  isNonLatinScript(t)
    ? new RegExp(escape(t), "iu")
    : new RegExp(`(^|[^\\p{L}])${escape(t)}([^\\p{L}]|$)`, "iu");

const TERM_PATTERNS: Record<string, RegExp[]> = Object.fromEntries(
  Object.entries(COUNTRY_TERMS).map(([slug, terms]) => [
    slug,
    terms.map(buildPattern),
  ]),
);

/**
 * Remove a wire dateline from the start of an excerpt.
 *
 * A dateline says where the newsroom is sitting, not what the story is about.
 * Fana opens every item with "Addis Ababa, August 18, 2026 (FMC) — ", so its
 * report on a Colombian earthquake was filed under Ethiopia and reached the
 * homepage hero. ENA, Reuters and AP copy carried by our sources all do the
 * same thing.
 *
 * Only a leading dateline is stripped, and only when it has the full shape —
 * a place, optionally a date, optionally an agency in brackets, closed by a
 * dash. Requiring the dash is what stops this eating ordinary prose: a
 * sentence that merely begins with a place name has no dash to end it.
 *
 * The cost is a genuinely local story whose only mention of the country is its
 * own dateline. That is the right way round: an untagged Ethiopian item stays
 * on the general wire, whereas a mistagged Colombian one claims the hero.
 */
export function stripDateline(text: string): string {
  return text.replace(
    // place [, date] [ (AGENCY) ] — rest.  The dash is required.
    /^\s*\p{Lu}[\p{L}.' -]{1,40}(?:,\s*[\p{L}\d.,' -]{1,40})?\s*(?:\([\p{L}\d.\- ]{1,20}\))?\s*[—–]\s+/u,
    "",
  );
}

/**
 * Is this excerpt a broadcast round-up rather than a single story?
 *
 * France 24's evening bulletin arrives as one feed item whose headline is the
 * first story and whose body runs through several unrelated ones: "In
 * tonight's edition: a deadly landslide at a gold mine in the Central African
 * Republic ... Meanwhile, Ethiopia is turning to Bordeaux expertise". Tagging
 * that from the body filed a Cameroon headline under Ethiopia and, because a
 * round-up name-checks half a continent, it then clustered with everything and
 * reached number two on the homepage.
 *
 * Only one item in a 2,300-item corpus matched when this was written, but the
 * bulletin runs daily and its whole nature is to mention many countries, so it
 * recurs. Matching the explicit opening phrase keeps the rule to the format it
 * was written for rather than guessing at "multi-topic" in general.
 */
export function isRoundUp(excerpt: string): boolean {
  return /\bin (?:tonight|today|this morning|this evening)(?:'|’)?s? edition\b/i.test(
    excerpt,
  );
}

export function detectCountries(text: string): string[] {
  const hay = text.toLowerCase();
  const hits: string[] = [];
  for (const [slug, patterns] of Object.entries(TERM_PATTERNS)) {
    if (patterns.some((p) => p.test(hay))) hits.push(slug);
  }
  return hits;
}

/**
 * The tag decision actually used at ingest: what the text says, and only if it
 * says nothing, what the outlet covers.
 *
 * The text always wins. Publisher inheritance is a last resort with three
 * conditions on it, because inheriting unconditionally was measured on live
 * data and filed a Colombian bombing under Somalia:
 *
 *   1. the outlet must have a single-country beat (REGIONAL) — a pan-African
 *      or international wire covers everywhere, so its masthead says nothing;
 *   2. the text must name nowhere else on earth (see elsewhere.ts) — this is
 *      what separates "Central Bank Buys Gold High" from "earthquake in
 *      Indonesia", both of which name no Horn country;
 *   3. there must be an excerpt. A bare title with no body is usually a stray
 *      feed entry rather than a story — Capital Ethiopia emits a handful, with
 *      titles like "a shoe shine and repair shop" — and inheritance is exactly
 *      where the weakest evidence should be refused.
 *
 * Returns `inherited` so callers can record how a tag was arrived at.
 */
export function resolveCountries(
  text: string,
  opts: {
    publisherCountry?: string | null;
    publisherLocalOnly?: boolean;
    hasExcerpt?: boolean;
  } = {},
): { slugs: string[]; inherited: boolean } {
  const detected = detectCountries(text);
  if (detected.length > 0) return { slugs: detected, inherited: false };

  const { publisherCountry, publisherLocalOnly, hasExcerpt } = opts;
  if (!publisherCountry || !publisherLocalOnly || !hasExcerpt) {
    return { slugs: [], inherited: false };
  }
  if (mentionsElsewhere(text)) return { slugs: [], inherited: false };

  return { slugs: [publisherCountry], inherited: true };
}

/**
 * Country tags for a stored item, given its headline and excerpt separately.
 *
 * The dateline is the awkward case. "Addis Ababa, August 18, 2026 (FMC) — "
 * says where the newsroom sits, and Fana's report on a Colombian earthquake
 * was filed under Ethiopia because of it, reaching the homepage hero.
 *
 * Simply deleting the dateline before tagging was tried and was worse. For
 * Somali-language outlets the dateline is frequently the *only* thing in the
 * item that names a place a Latin tagger recognises, so stripping it untagged
 * fifteen genuine Horn stories — a released detainee, a speaker's first move
 * after election, fighting in Tigray — to fix six wrong ones.
 *
 * So the dateline is discounted rather than removed:
 *
 *   - if the body names a Horn country on its own, the body decides;
 *   - if it does not, but the body clearly places the story elsewhere on
 *     earth, the dateline is ignored and the item is untagged;
 *   - otherwise the dateline is the best evidence available and stands.
 */
export function resolveItemCountries(
  title: string,
  excerpt: string,
  opts: {
    publisherCountry?: string | null;
    publisherLocalOnly?: boolean;
  } = {},
): { slugs: string[]; inherited: boolean } {
  // A broadcast round-up is several unrelated stories in one item: its
  // headline is the first and its body runs through the others. Judging it on
  // the body filed a Cameroon headline under Ethiopia, and because a round-up
  // name-checks half a continent it then clustered with everything and reached
  // number two on the homepage Trending card. For these, the headline is the
  // only honest evidence about what the item is.
  const body = isRoundUp(excerpt) ? "" : stripDateline(excerpt);
  const hasExcerpt = !isRoundUp(excerpt) && excerpt.trim().length > 0;

  const fromBody = detectCountries(`${title} ${body}`);
  if (fromBody.length > 0) return { slugs: fromBody, inherited: false };

  // Nothing in the body. Does it place itself abroad?
  if (mentionsElsewhere(`${title} ${body}`)) {
    return { slugs: [], inherited: false };
  }

  // The dateline is now the only signal worth having — but not for a
  // round-up, whose body we have deliberately discarded.
  const fromDateline = isRoundUp(excerpt)
    ? []
    : detectCountries(`${title} ${excerpt}`);
  if (fromDateline.length > 0) return { slugs: fromDateline, inherited: false };

  return resolveCountries(`${title} ${body}`, { ...opts, hasExcerpt });
}
