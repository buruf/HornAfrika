import type { Locale } from "@prisma/client";

/**
 * The languages of the Horn.
 *
 * One registry so that a language's script, direction, native name and URL
 * prefix are stated once. Getting `dir` wrong on Arabic or `lang` wrong on
 * Amharic is the kind of error that makes a site unreadable to exactly the
 * readers it was translated for, and it is invisible to anyone testing in
 * English.
 */

export type LocaleInfo = {
  code: Locale;
  /** BCP-47 tag for the lang attribute and hreflang. */
  tag: string;
  /** Path prefix. English is unprefixed — it is the canonical edition. */
  prefix: string;
  /** Name in English, for admin screens. */
  name: string;
  /** Name in the language itself, for the reader-facing switcher. */
  nativeName: string;
  dir: "ltr" | "rtl";
  /** Ethiopic and Arabic need more line height than Latin at the same size. */
  script: "latin" | "ethiopic" | "arabic";
};

export const LOCALES: Record<Locale, LocaleInfo> = {
  EN: {
    code: "EN",
    tag: "en",
    prefix: "",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    script: "latin",
  },
  SO: {
    code: "SO",
    tag: "so",
    prefix: "/so",
    name: "Somali",
    nativeName: "Soomaali",
    dir: "ltr",
    script: "latin",
  },
  AM: {
    code: "AM",
    tag: "am",
    prefix: "/am",
    name: "Amharic",
    nativeName: "አማርኛ",
    dir: "ltr",
    script: "ethiopic",
  },
  AR: {
    code: "AR",
    tag: "ar",
    prefix: "/ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    script: "arabic",
  },
  TI: {
    code: "TI",
    tag: "ti",
    prefix: "/ti",
    name: "Tigrinya",
    nativeName: "ትግርኛ",
    dir: "ltr",
    script: "ethiopic",
  },
  FR: {
    code: "FR",
    tag: "fr",
    prefix: "/fr",
    name: "French",
    nativeName: "Français",
    dir: "ltr",
    script: "latin",
  },
};

export const DEFAULT_LOCALE: Locale = "EN";

/** Every locale except the default, in the order the switcher lists them. */
export const TRANSLATION_LOCALES: Locale[] = ["SO", "AM", "AR", "TI", "FR"];

export const ALL_LOCALES: Locale[] = [DEFAULT_LOCALE, ...TRANSLATION_LOCALES];

/** Resolve a URL segment such as "so" to a locale, or null if it is not one. */
export function localeFromSegment(segment: string): Locale | null {
  const lower = segment.toLowerCase();
  const found = ALL_LOCALES.find((l) => LOCALES[l].tag === lower);
  return found ?? null;
}

/** Prefix a path for a locale. English is unprefixed. */
export function localePath(locale: Locale, path: string): string {
  const prefix = LOCALES[locale].prefix;
  if (!prefix) return path || "/";
  return `${prefix}${path === "/" ? "" : path}`;
}
