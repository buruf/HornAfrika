import type { Locale } from "@prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { getEnabledLocales } from "@/lib/i18n";

/**
 * Reading translations.
 *
 * Two gates, both deliberate. A translation is served only when the language
 * itself is switched on for the site, and when that individual translation has
 * been published in its own right. Either gate closed means the reader gets
 * English — which is honest — rather than a half-finished draft.
 */

export type ArticleText = {
  locale: Locale;
  headline: string;
  deck: string;
  body: string;
  /** True when the reader is seeing a translation rather than the original. */
  isTranslation: boolean;
  translatedBy: string | null;
  reviewedBy: string | null;
};

/** Which languages a given article can actually be read in, right now. */
export async function availableLocales(articleId: string): Promise<Locale[]> {
  const [enabled, translations] = await Promise.all([
    getEnabledLocales(),
    db.articleTranslation.findMany({
      where: { articleId, status: "PUBLISHED" },
      select: { locale: true },
    }),
  ]);

  const live = translations
    .map((t) => t.locale)
    .filter((l) => enabled.includes(l));

  return [DEFAULT_LOCALE, ...live];
}

/**
 * The text to render for a locale, falling back to the English original.
 */
export async function articleText(
  article: { id: string; headline: string; deck: string; body: string },
  locale: Locale,
): Promise<ArticleText> {
  const english: ArticleText = {
    locale: DEFAULT_LOCALE,
    headline: article.headline,
    deck: article.deck,
    body: article.body,
    isTranslation: false,
    translatedBy: null,
    reviewedBy: null,
  };

  if (locale === DEFAULT_LOCALE) return english;

  const enabled = await getEnabledLocales();
  if (!enabled.includes(locale)) return english;

  const tr = await db.articleTranslation.findUnique({
    where: { articleId_locale: { articleId: article.id, locale } },
  });
  if (!tr || tr.status !== "PUBLISHED") return english;

  return {
    locale,
    headline: tr.headline,
    deck: tr.deck,
    body: tr.body,
    isTranslation: true,
    translatedBy: tr.translatedBy,
    reviewedBy: tr.reviewedBy,
  };
}
