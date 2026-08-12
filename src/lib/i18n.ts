import type { Locale } from "@prisma/client";
import { cache } from "react";
import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/locales";

/**
 * Interface strings.
 *
 * Two rules shape this file:
 *
 * 1. English is the fallback for every key. A missing translation shows the
 *    English word, never a key name and never an empty element.
 * 2. A language is not live because the code supports it. Locales are switched
 *    on by an editor once a native speaker has read the edition — see
 *    getEnabledLocales(). Shipping half-translated chrome would be the same
 *    broken promise as the six dead links this replaced.
 *
 * The Somali entries below are a first pass and are marked for native review.
 * Nothing here reaches a reader until Somali is enabled.
 */

export type StringKey =
  | "nav.home"
  | "nav.latest"
  | "nav.trending"
  | "nav.wire"
  | "nav.videos"
  | "nav.more"
  | "nav.search"
  | "nav.sections"
  | "nav.regions"
  | "section.politics"
  | "section.business"
  | "section.security"
  | "section.economy"
  | "section.society"
  | "section.culture"
  | "section.sports"
  | "section.explained"
  | "section.people"
  | "section.horn"
  | "country.somalia"
  | "country.ethiopia"
  | "country.djibouti"
  | "country.eritrea"
  | "article.published"
  | "article.updated"
  | "article.readMinutes"
  | "article.share"
  | "article.related"
  | "article.developing"
  | "article.availableIn"
  | "article.readInEnglish"
  | "article.translationNote"
  | "newsletter.title"
  | "newsletter.pitch"
  | "newsletter.subscribe"
  | "newsletter.email"
  | "common.readMore"
  | "common.viewAll"
  | "common.language";

type Dictionary = Partial<Record<StringKey, string>>;

const en: Record<StringKey, string> = {
  "nav.home": "Home",
  "nav.latest": "Latest",
  "nav.trending": "Trending",
  "nav.wire": "The Wire",
  "nav.videos": "Videos",
  "nav.more": "More",
  "nav.search": "Search",
  "nav.sections": "Sections",
  "nav.regions": "Regions",
  "section.politics": "Politics",
  "section.business": "Business",
  "section.security": "Security",
  "section.economy": "Economy",
  "section.society": "Society",
  "section.culture": "Culture",
  "section.sports": "Sports",
  "section.explained": "Explained",
  "section.people": "People",
  "section.horn": "Horn of Africa",
  "country.somalia": "Somalia",
  "country.ethiopia": "Ethiopia",
  "country.djibouti": "Djibouti",
  "country.eritrea": "Eritrea",
  "article.published": "Published",
  "article.updated": "Updated",
  "article.readMinutes": "min read",
  "article.share": "Share",
  "article.related": "Related stories",
  "article.developing": "Developing story",
  "article.availableIn": "Also available in",
  "article.readInEnglish": "Read the English original",
  "article.translationNote":
    "This translation was produced by our desk. Where it differs from the English original, the English text stands.",
  "newsletter.title": "The Horn Daily",
  "newsletter.pitch":
    "Your daily briefing from Somalia, Ethiopia, Djibouti and Eritrea.",
  "newsletter.subscribe": "Subscribe",
  "newsletter.email": "Enter your email",
  "common.readMore": "Read more",
  "common.viewAll": "View all",
  "common.language": "Language",
};

// First-pass Somali. Reviewed by a native speaker before SO is enabled.
const so: Dictionary = {
  "nav.home": "Bogga hore",
  "nav.latest": "Wararkii ugu dambeeyay",
  "nav.trending": "Kuwa la akhrinayo",
  "nav.wire": "Wararka Kale",
  "nav.videos": "Muuqaallo",
  "nav.more": "Wax dheeraad ah",
  "nav.search": "Raadi",
  "nav.sections": "Qaybaha",
  "nav.regions": "Gobollada",
  "section.politics": "Siyaasadda",
  "section.business": "Ganacsiga",
  "section.security": "Amniga",
  "section.economy": "Dhaqaalaha",
  "section.society": "Bulshada",
  "section.culture": "Dhaqanka",
  "section.sports": "Ciyaaraha",
  "section.horn": "Geeska Afrika",
  "country.somalia": "Soomaaliya",
  "country.ethiopia": "Itoobiya",
  "country.djibouti": "Jabuuti",
  "country.eritrea": "Ereteriya",
  "article.published": "La daabacay",
  "article.updated": "La cusboonaysiiyay",
  "article.share": "Wadaag",
  "article.developing": "War socda",
  "newsletter.subscribe": "Isdiiwaangeli",
  "newsletter.email": "Iimaylkaaga geli",
  "common.readMore": "Akhri wax dheeraad ah",
  "common.viewAll": "Dhammaan eeg",
  "common.language": "Luqadda",
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  EN: en,
  SO: so,
  AM: {},
  AR: {},
  TI: {},
  FR: {},
};

/** Translate a key, falling back to English rather than showing a key name. */
export function t(locale: Locale, key: StringKey): string {
  return DICTIONARIES[locale]?.[key] ?? en[key];
}

/** How complete a locale's chrome is — shown in the admin, not to readers. */
export function localeCoverage(locale: Locale): {
  translated: number;
  total: number;
  percent: number;
} {
  const total = Object.keys(en).length;
  const translated = Object.keys(DICTIONARIES[locale] ?? {}).length;
  return { translated, total, percent: Math.round((translated / total) * 100) };
}

/**
 * Which locales are actually served.
 *
 * Stored as a site setting so enabling Somali is an editorial decision taken
 * when the edition is ready, not a side effect of deploying code.
 */
export const getEnabledLocales = cache(async (): Promise<Locale[]> => {
  try {
    const row = await db.siteSetting.findUnique({ where: { key: "locales.enabled" } });
    if (!row?.value) return [DEFAULT_LOCALE];
    const enabled = row.value
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s): s is Locale => s in DICTIONARIES);
    // English is always served; it is the canonical edition.
    return enabled.includes(DEFAULT_LOCALE) ? enabled : [DEFAULT_LOCALE, ...enabled];
  } catch {
    return [DEFAULT_LOCALE];
  }
});
