import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { countByCountry, getByCountry, getHornRegional, getTrending } from "@/lib/queries";
import { HeroCard, StackedCard, TrendingItem } from "@/components/cards";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { AdSlot } from "@/components/AdSlot";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

type Params = {
  params: Promise<{ slug: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function resolve(slug: string, categorySlug: string) {
  const [country, category] = await Promise.all([
    slug === "horn"
      ? null
      : db.country.findUnique({ where: { slug } }),
    db.category.findUnique({ where: { slug: categorySlug } }),
  ]);
  return { country, category, isHorn: slug === "horn" };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, category: categorySlug } = await params;
  const { country, category, isHorn } = await resolve(slug, categorySlug);
  if (!category || (!country && !isHorn)) return { title: "Not found" };

  const place = country?.name ?? "Horn of Africa";
  return {
    title: `${place} ${category.name}`,
    description: `${category.name} news and analysis from ${place}. ${category.blurb ?? ""}`.trim(),
    alternates: { canonical: `${SITE.url}/${slug}/${categorySlug}` },
  };
}

export default async function CountryCategoryPage({ params, searchParams }: Params) {
  const { slug, category: categorySlug } = await params;
  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const skip = (page - 1) * PER_PAGE;

  const { country, category, isHorn } = await resolve(slug, categorySlug);
  if (!category) notFound();
  if (!country && !isHorn) notFound();

  const [articles, total, trending, siblings] = await Promise.all([
    isHorn
      ? getHornRegional(PER_PAGE, skip)
      : getByCountry(slug, { take: PER_PAGE, skip, category: categorySlug }),
    isHorn ? getHornRegional(500, 0).then((r) => r.length) : countByCountry(slug, categorySlug),
    getTrending("week", 5),
    db.category.findMany({ where: { kind: "DESK" }, orderBy: { order: "asc" } }),
  ]);

  const place = country?.name ?? "Horn of Africa";
  const accent = country?.accent;
  const [lead, ...rest] = page === 1 ? articles : [null, ...articles];

  return (
    <div className="shell py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: place, href: `/${slug}` },
          { label: category.name },
        ]}
      />

      <PageHeader
        eyebrow={place}
        title={`${place} ${category.name}`}
        blurb={category.blurb}
        accent={accent}
        countrySlug={country?.slug}
        meta={<span className="text-[0.8rem] text-ink-mute">{total} articles</span>}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/${slug}`}
            className="border border-rule-strong px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] transition-colors hover:border-ink"
          >
            All {place}
          </Link>
          {siblings.map((s) => (
            <Link
              key={s.slug}
              href={`/${slug}/${s.slug}`}
              className={`border px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] transition-colors ${
                s.slug === categorySlug
                  ? "border-ink bg-ink text-white"
                  : "border-rule-strong hover:border-ink"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {articles.length === 0 ? (
            <p className="border border-rule bg-white p-8 text-center text-[0.95rem] text-ink-soft">
              No {category.name.toLowerCase()} stories from {place} yet.{" "}
              <Link href={`/${slug}`} className="font-bold text-brand">
                See all {place} news →
              </Link>
            </p>
          ) : (
            <>
              {lead && (
                <div className="mb-8">
                  <HeroCard article={lead} />
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.filter(Boolean).map((a) => (
                  <StackedCard key={a!.id} article={a!} />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                perPage={PER_PAGE}
                basePath={`/${slug}/${categorySlug}`}
              />
            </>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-4">
            <div className="section-head section-head--light mb-3.5 pb-2.5">
              <h2 className="section-title text-[0.92rem]">Trending Now</h2>
            </div>
            <ol className="space-y-3">
              {trending.map((a, i) => (
                <TrendingItem key={a.id} article={a} rank={i + 1} />
              ))}
            </ol>
          </div>
          <AdSlot position="sidebar" />
        </aside>
      </div>
    </div>
  );
}
