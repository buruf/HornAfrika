import { notFound } from "next/navigation";
import { CountryFlag } from "@/components/CountryFlag";
import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getArticle, getByCountry, getRelated, getTrending } from "@/lib/queries";
import { EditorialImage } from "@/components/EditorialImage";
import { ArticleBody } from "@/components/ArticleBody";
import { ShareBar } from "@/components/ShareBar";
import { Breadcrumbs } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { RowCard, StackedCard, TrendingItem } from "@/components/cards";
import { AdSlot } from "@/components/AdSlot";
import { NewsletterForm } from "@/components/NewsletterForm";
import { formatDate, formatDateTime } from "@/lib/format";
import { SITE } from "@/lib/site";

import type { Locale } from "@prisma/client";
import { DEFAULT_LOCALE, LOCALES, localeFromSegment } from "@/lib/locales";
import { articleText, availableLocales } from "@/lib/translations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string; category: string; article: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { article: articleSlug } = await params;
  const a = await getArticle(articleSlug);
  if (!a) return { title: "Article not found" };

  const canonical =
    a.canonicalUrl ??
    `${SITE.url}/${a.country?.slug ?? "horn"}/${a.category.slug}/${a.slug}`;

  // hreflang for every language this article is genuinely readable in, so a
  // Somali speaker searching in Somali is sent to the Somali version rather
  // than to English. Listing languages that do not exist would be worse than
  // listing none.
  const languages: Record<string, string> = {};
  for (const l of await availableLocales(a.id)) {
    languages[LOCALES[l].tag] =
      l === DEFAULT_LOCALE ? canonical : `${canonical}?lang=${LOCALES[l].tag}`;
  }

  return {
    title: a.seoTitle ?? a.headline,
    description: a.seoDescription ?? a.deck,
    alternates: {
      canonical,
      ...(Object.keys(languages).length > 1 ? { languages } : {}),
    },
    openGraph: {
      type: "article",
      title: a.headline,
      description: a.deck,
      url: canonical,
      publishedTime: a.publishedAt?.toISOString(),
      modifiedTime: (a.revisedAt ?? a.updatedAt).toISOString(),
      authors: [a.author.name],
      section: a.category.name,
      images: [{ url: `${SITE.url}/api/og/${a.slug}`, width: 1200, height: 675 }],
    },
    twitter: {
      card: "summary_large_image",
      title: a.headline,
      description: a.deck,
      images: [`${SITE.url}/api/og/${a.slug}`],
    },
  };
}

export default async function ArticlePage({ params, searchParams }: Params) {
  const { article: articleSlug } = await params;
  const a = await getArticle(articleSlug);
  if (!a) notFound();

  const countryIds = a.countries.map((c) => c.countryId);

  // Which language the reader asked for, and which this piece actually exists
  // in. An unknown or unavailable code silently falls back to English rather
  // than erroring — a bad URL should not break a news page.
  const requested = localeFromSegment((await searchParams).lang ?? "");
  const [available, related, trending] = await Promise.all([
    availableLocales(a.id),
    getRelated(a.id, a.categoryId, countryIds),
    getTrending("week", 5),
  ]);
  const locale: Locale =
    requested && available.includes(requested) ? requested : DEFAULT_LOCALE;
  const text = await articleText(a, locale);
  const localeInfo = LOCALES[text.locale];

  // "More from <country>" blocks for every country the story touches.
  const moreFrom = await Promise.all(
    a.countries.slice(0, 2).map(async (ac) => ({
      country: ac.country,
      items: await getByCountry(ac.country.slug, { take: 3, exclude: [a.id] }),
    })),
  );

  // Record the read after the response is streamed, so trending stays real
  // without putting a write on the reader's critical path.
  after(async () => {
    try {
      await db.articleView.create({ data: { articleId: a.id } });
    } catch {
      // A missed view must never surface as a page error.
    }
  });

  const canonical = `${SITE.url}/${a.country?.slug ?? "horn"}/${a.category.slug}/${a.slug}`;
  const wasUpdated =
    a.revisedAt && a.publishedAt && a.revisedAt.getTime() - a.publishedAt.getTime() > 60000;

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.headline,
    description: a.deck,
    datePublished: a.publishedAt?.toISOString(),
    dateModified: (a.revisedAt ?? a.updatedAt).toISOString(),
    // A desk byline is an Organization. Emitting Person for it would publish
    // structured data asserting a journalist exists when none does.
    author: a.author.isDesk
      ? { "@type": "Organization", name: a.author.name, url: SITE.url }
      : {
          "@type": "Person",
          name: a.author.name,
          jobTitle: a.author.title,
          url: `${SITE.url}/authors/${a.author.slug}`,
        },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    image: [`${SITE.url}/api/og/${a.slug}`],
    articleSection: a.category.name,
    keywords: a.topics.map((t) => t.topic.name).join(", "),
    contentLocation: a.country
      ? { "@type": "Place", name: a.country.name }
      : { "@type": "Place", name: "Horn of Africa" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: a.country?.name ?? "Horn of Africa",
        item: `${SITE.url}/${a.country?.slug ?? "horn"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: a.category.name,
        item: `${SITE.url}/${a.country?.slug ?? "horn"}/${a.category.slug}`,
      },
      { "@type": "ListItem", position: 4, name: a.headline, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="shell py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: a.country?.name ?? "Horn of Africa",
              href: `/${a.country?.slug ?? "horn"}`,
            },
            {
              label: a.category.name,
              href: `/${a.country?.slug ?? "horn"}/${a.category.slug}`,
            },
          ]}
        />

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article>
            {/* ------------------------------------------------- masthead */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Link href={`/${a.country?.slug ?? "horn"}/${a.category.slug}`}>
                <span className="chip" data-c={a.category.slug}>
                  {a.category.name}
                </span>
              </Link>
              {a.country && (
                <Link
                  href={`/${a.country.slug}`}
                  className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-ink-soft hover:text-brand"
                >
                  <CountryFlag slug={a.country.slug} /> {a.country.name}
                </Link>
              )}
              {a.region && (
                <Link
                  href={`/${a.country?.slug}/regions/${a.region.slug}`}
                  className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-ink-mute hover:text-brand"
                >
                  {a.region.name}
                </Link>
              )}
              {a.isDeveloping && (
                <span className="chip chip--developing">Developing Story</span>
              )}
              {a.isBreaking && <span className="chip">Breaking</span>}
            </div>

            {/* lang and dir are set on the text itself, not the page, because
                the surrounding chrome stays English until a whole edition is
                translated. Ethiopic and Arabic also need more line height than
                Latin at the same size or the diacritics collide. */}
            <div
              lang={localeInfo.tag}
              dir={localeInfo.dir}
              className={
                localeInfo.script === "latin" ? "" : "leading-relaxed [&_h1]:leading-[1.25]"
              }
            >
              <h1 className="max-w-4xl text-[1.85rem] font-extrabold leading-[1.1] tracking-[-0.032em] sm:text-[2.45rem]">
                {text.headline}
              </h1>

              <p className="mt-4 max-w-3xl text-[1.1rem] leading-relaxed text-ink-soft">
                {text.deck}
              </p>
            </div>

            <LanguageSwitcher
              available={available}
              current={text.locale}
              hrefFor={(l) =>
                l === DEFAULT_LOCALE
                  ? canonical.replace(SITE.url, "")
                  : `${canonical.replace(SITE.url, "")}?lang=${LOCALES[l].tag}`
              }
            />

            {/* --------------------------------------------- byline block */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-rule py-3">
              <div>
                {/* A desk is not a person and gets no author page. */}
                {a.author.isDesk ? (
                  <span className="text-[0.88rem] font-bold">{a.author.name}</span>
                ) : (
                  <Link
                    href={`/authors/${a.author.slug}`}
                    className="text-[0.88rem] font-bold hover:text-brand"
                  >
                    {a.author.name}
                  </Link>
                )}
                <p className="text-[0.75rem] text-ink-mute">{a.author.title}</p>
              </div>
              <div className="text-[0.78rem] text-ink-mute">
                <p>Published {formatDateTime(a.publishedAt)}</p>
                {wasUpdated && <p>Updated {formatDateTime(a.revisedAt)}</p>}
              </div>
              <span className="text-[0.78rem] text-ink-mute">{a.readMinutes} min read</span>
              <div className="ml-auto">
                <ShareBar url={canonical} title={a.headline} />
              </div>
            </div>

            {/* ------------------------------------------------- lead image */}
            <figure className="mt-6">
              <EditorialImage
                seed={a.imageSeed}
                category={a.category.slug}
                src={a.imageUrl}
                alt={a.imageCaption}
                priority
                className="h-[240px] w-full object-cover sm:h-[340px] lg:h-[430px]"
              />
              <figcaption className="mt-2 flex flex-wrap gap-x-2 text-[0.76rem] text-ink-mute">
                <span>{a.imageCaption}</span>
                <span className="font-semibold">
                  {a.imageCredit ??
                    (a.imageUrl ? "" : "Illustration: Hornafrika editorial graphic")}
                </span>
              </figcaption>
            </figure>

            {/* ---------------------------------------------- source note */}
            {a.sourceNote && (
              <p className="mt-5 border-l-[3px] border-brand bg-white px-4 py-3 text-[0.86rem] leading-relaxed text-ink-soft">
                <strong className="mr-1.5 font-extrabold uppercase tracking-[0.08em] text-ink">
                  Sourcing
                </strong>
                {a.sourceNote}
              </p>
            )}

            {a.isDeveloping && (
              <p className="mt-4 border border-[#e0c48a] bg-[#fdf8ec] px-4 py-3 text-[0.86rem] leading-relaxed text-[#6b5312]">
                <strong className="mr-1.5 font-extrabold uppercase tracking-[0.08em]">
                  Developing story
                </strong>
                Details are still being confirmed and this report will be updated as
                verified information becomes available.
              </p>
            )}

            {text.isTranslation && (
              <p className="mt-5 border-l-[3px] border-[#1b5fa8] bg-[#eff5fb] px-4 py-3 text-[0.86rem] leading-relaxed text-[#134878]">
                <strong className="mr-1.5 font-extrabold uppercase tracking-[0.08em]">
                  Translation
                </strong>
                Translated into {LOCALES[text.locale].name}
                {text.translatedBy ? ` by ${text.translatedBy}` : ""}
                {text.reviewedBy ? `, reviewed by ${text.reviewedBy}` : ""}. Where this
                differs from the English original, the English text stands.
              </p>
            )}

            <div
              className="mt-6 max-w-[46rem]"
              lang={localeInfo.tag}
              dir={localeInfo.dir}
            >
              <ArticleBody body={text.body} />
            </div>

            <AdSlot position="in-article" className="mt-8 max-w-[46rem]" />

            {/* ------------------------------------------------- topic tags */}
            {a.topics.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
                  Topics
                </span>
                {a.topics.map((t) => (
                  <Link
                    key={t.topicId}
                    href={`/search?q=${encodeURIComponent(t.topic.name)}`}
                    className="border border-rule-strong px-2.5 py-1 text-[0.75rem] font-semibold text-ink-soft hover:border-ink hover:text-ink"
                  >
                    {t.topic.name}
                  </Link>
                ))}
              </div>
            )}

            {/* -------------------------------------------- related country */}
            {a.countries.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
                  Countries
                </span>
                {a.countries.map((c) => (
                  <Link
                    key={c.countryId}
                    href={`/${c.country.slug}`}
                    className="border border-rule-strong px-2.5 py-1 text-[0.75rem] font-semibold text-ink-soft hover:border-ink hover:text-ink"
                  >
                    <CountryFlag slug={c.country.slug} /> {c.country.name}
                  </Link>
                ))}
              </div>
            )}

            {/* ------------------------------------------------ author card */}
            <div className="mt-8 border border-rule bg-white p-5">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
                {a.author.isDesk ? "About this byline" : "About the author"}
              </p>
              {a.author.isDesk ? (
                <p className="mt-1.5 text-[1.05rem] font-extrabold">{a.author.name}</p>
              ) : (
                <Link
                  href={`/authors/${a.author.slug}`}
                  className="mt-1.5 block text-[1.05rem] font-extrabold hover:text-brand"
                >
                  {a.author.name}
                </Link>
              )}
              <p className="text-[0.8rem] text-ink-mute">
                {a.author.title}
                {a.author.location ? ` · ${a.author.location}` : ""}
              </p>
              <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-ink-soft">
                {a.author.bio}
              </p>
            </div>

            {/* --------------------------------------- credibility footer */}
            <div className="mt-4 border border-rule bg-shell p-4 text-[0.8rem] leading-relaxed text-ink-soft">
              <p>
                <strong className="text-ink">Corrections.</strong> Hornafrika corrects
                errors of fact promptly and publicly. If something here is wrong,{" "}
                <Link href="/corrections" className="font-semibold text-brand underline">
                  tell us
                </Link>
                .
              </p>
              <p className="mt-1.5">
                Published {formatDate(a.publishedAt)}
                {wasUpdated ? ` · Last updated ${formatDate(a.revisedAt)}` : ""} · Read our{" "}
                <Link href="/editorial-policy" className="font-semibold text-brand underline">
                  editorial standards
                </Link>
                .
              </p>
              {a.isSeed && (
                <p className="mt-2 border-t border-rule-strong pt-2 text-[0.76rem] text-ink-mute">
                  This article is launch scaffolding written from documented regional
                  background. It contains no sourced quotes or original reporting, and
                  will be replaced as the newsroom publishes.
                </p>
              )}
            </div>

            {/* ---------------------------------------------------- related */}
            {related.length > 0 && (
              <section className="mt-10">
                <SectionHead title="Related Stories" light />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((r) => (
                    <StackedCard
                      key={r.id}
                      article={r}
                      showDeck={false}
                      imageHeight="h-[130px]"
                    />
                  ))}
                </div>
              </section>
            )}

            {moreFrom.map(
              ({ country, items }) =>
                items.length > 0 && (
                  <section key={country.id} className="mt-9">
                    <SectionHead
                      title={`More from ${country.name}`}
                      href={`/${country.slug}`}
                      light
                    />
                    <div className="grid gap-6 sm:grid-cols-3">
                      {items.map((r) => (
                        <StackedCard
                          key={r.id}
                          article={r}
                          showDeck={false}
                          imageHeight="h-[130px]"
                        />
                      ))}
                    </div>
                  </section>
                ),
            )}
          </article>

          {/* ------------------------------------------------------ sidebar */}
          <aside className="space-y-6 no-print">
            <div className="card p-4">
              <div className="section-head section-head--light mb-3.5 pb-2.5">
                <h2 className="section-title text-[0.92rem]">Trending Now</h2>
              </div>
              <ol className="space-y-3">
                {trending.map((t, i) => (
                  <TrendingItem key={t.id} article={t} rank={i + 1} />
                ))}
              </ol>
            </div>

            <div className="panel p-5">
              <h2 className="text-[1rem] font-extrabold uppercase tracking-[0.05em]">
                The Horn Daily
              </h2>
              <p className="mt-1.5 text-[0.83rem] leading-relaxed text-white/70">
                Your daily briefing from Somalia, Ethiopia, Djibouti and Eritrea.
              </p>
              <div className="mt-3.5">
                <NewsletterForm variant="dark" />
              </div>
            </div>

            {related.length > 0 && (
              <div>
                <SectionHead title="Also in this section" light />
                <div className="space-y-4">
                  {related.slice(0, 3).map((r) => (
                    <RowCard key={`s-${r.id}`} article={r} />
                  ))}
                </div>
              </div>
            )}

            <AdSlot position="sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
}
