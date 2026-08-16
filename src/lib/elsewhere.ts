/**
 * Does this text place itself somewhere outside the Horn?
 *
 * This exists to make one narrow thing safe: letting a single-country outlet's
 * own beat stand in for a country tag when the item names no country at all.
 *
 * Addis Fortune runs "Central Bank Buys Gold High, Sells It Lower" and never
 * writes the word Ethiopia, because its readers are in Addis and do not need
 * telling. The country tagger correctly found no country, so the story was
 * hidden — and dozens like it, disproportionately Ethiopian and Djiboutian,
 * which is part of why the site looked Somali.
 *
 * Inheriting the publisher's country unconditionally was tried early on and
 * was a disaster: it filed a Colombian bombing and an Arsenal transfer under
 * Somalia, because Somali outlets republish world copy like everyone else. The
 * difference now is the guard — inherit only when the text points nowhere
 * else. "Deadly earthquake in Indonesia" names Indonesia, so Jowhar's beat
 * does not apply to it. "Central Bank Buys Gold High" names nowhere, so Addis
 * Fortune's does.
 *
 * The list is deliberately over-inclusive. A false positive here costs one
 * inherited tag; a false negative files Ukraine under Somalia. When in doubt,
 * add the term.
 */

/** Countries, demonyms and cities outside the Horn of Africa. */
const ELSEWHERE = [
  // --- Africa, excluding the four -----------------------------------------
  "algeria", "algerian", "angola", "benin", "botswana", "burkina faso",
  "burundi", "cameroon", "cape verde", "central african republic", "chad",
  "comoros", "congo", "congolese", "drc", "ivory coast", "côte d'ivoire",
  "egypt", "egyptian", "cairo", "equatorial guinea", "gabon", "gambia",
  "ghana", "ghanaian", "accra", "guinea", "guinea-bissau", "kenya", "kenyan",
  "nairobi", "mombasa", "lesotho", "liberia", "libya", "libyan", "tripoli",
  "madagascar", "malawi", "mali", "mauritania", "mauritius", "morocco",
  "moroccan", "rabat", "mozambique", "namibia", "niger", "nigeria",
  "nigerian", "lagos", "abuja", "rwanda", "rwandan", "kigali", "senegal",
  "seychelles", "sierra leone", "south africa", "south african",
  "johannesburg", "cape town", "pretoria", "south sudan", "juba", "sudan",
  "sudanese", "khartoum", "darfur", "tanzania", "tanzanian", "dar es salaam",
  "togo", "tunisia", "tunisian", "uganda", "ugandan", "kampala", "zambia",
  "zimbabwe", "harare", "sahel", "maghreb",

  // --- Middle East and Gulf ------------------------------------------------
  // Kept even though the Horn's diplomacy runs through the Gulf: a story that
  // genuinely involves both will name the Horn country too, and be tagged that
  // way. Inheritance is only ever the fallback.
  "saudi arabia", "saudi", "riyadh", "jeddah", "uae", "emirates", "emirati",
  "dubai", "abu dhabi", "qatar", "qatari", "doha", "kuwait", "bahrain",
  "oman", "omani", "muscat", "yemen", "yemeni", "sanaa", "aden", "houthi",
  "houthis", "iran", "iranian", "tehran", "iraq", "iraqi", "baghdad",
  "israel", "israeli", "gaza", "palestine", "palestinian", "west bank",
  "jordan", "lebanon", "lebanese", "beirut", "syria", "syrian", "damascus",
  "turkey", "turkish", "ankara", "istanbul",

  // --- Europe --------------------------------------------------------------
  "britain", "british", "uk", "england", "english", "london", "scotland",
  "wales", "ireland", "irish", "dublin", "france", "french", "paris",
  "germany", "german", "berlin", "italy", "italian", "rome", "milan",
  "spain", "spanish", "madrid", "portugal", "netherlands", "dutch",
  "amsterdam", "belgium", "brussels", "sweden", "swedish", "stockholm",
  "norway", "norwegian", "oslo", "denmark", "danish", "copenhagen",
  "finland", "poland", "polish", "warsaw", "ukraine", "ukrainian", "kyiv",
  "russia", "russian", "moscow", "putin", "greece", "greek", "athens",
  "switzerland", "swiss", "geneva", "zurich", "austria", "vienna",
  "hungary", "romania", "bulgaria", "serbia", "croatia", "czech", "slovakia",
  "european union", "nato", "brexit",

  // --- Americas ------------------------------------------------------------
  "united states", "america", "american", "washington", "new york",
  "california", "texas", "florida", "chicago", "los angeles", "alaska",
  "trump", "biden", "pentagon", "white house", "canada", "canadian",
  "toronto", "ottawa", "mexico", "mexican", "brazil", "brazilian",
  "argentina", "chile", "colombia", "colombian", "peru", "venezuela",
  "cuba", "haiti", "jamaica", "bolivia", "ecuador", "uruguay", "paraguay",

  // --- Asia and Pacific ----------------------------------------------------
  "china", "chinese", "beijing", "shanghai", "hong kong", "taiwan", "japan",
  "japanese", "tokyo", "korea", "korean", "seoul", "pyongyang", "india",
  "indian", "delhi", "mumbai", "pakistan", "pakistani", "islamabad",
  "bangladesh", "dhaka", "sri lanka", "nepal", "afghanistan", "afghan",
  "kabul", "indonesia", "indonesian", "jakarta", "malaysia", "singapore",
  "thailand", "bangkok", "vietnam", "philippines", "manila", "myanmar",
  "cambodia", "kazakhstan", "uzbekistan", "australia", "australian",
  "sydney", "melbourne", "new zealand", "fiji", "papua new guinea",
];

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PATTERNS = ELSEWHERE.map(
  (t) => new RegExp(`(^|[^\\p{L}])${escape(t)}([^\\p{L}]|$)`, "iu"),
);

/** True if the text names a country, city or people outside the Horn. */
export function mentionsElsewhere(text: string): boolean {
  const hay = text.toLowerCase();
  return PATTERNS.some((p) => p.test(hay));
}
