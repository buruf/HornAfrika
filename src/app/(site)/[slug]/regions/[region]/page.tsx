import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getByCountry, getTrending, publishedWhere } from "@/lib/queries";
import { HeroCard, StackedCard, TrendingItem } from "@/components/cards";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { AdSlot } from "@/components/AdSlot";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

type Params = {
  params: Promise<{ slug: string; region: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function resolve(countrySlug: string, regionSlug: string) {
  const country = await db.country.findUnique({
    where: { slug: countrySlug },
    include: { regions: { orderBy: { order: "asc" } } },
  });
  if (!country) return null;
  const region = country.regions.find((r) => r.slug === regionSlug);
  if (!region) return null;
  return { country, region };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, region: regionSlug } = await params;
  const found = await resolve(slug, regionSlug);
  if (!found) return { title: "Not found" };
  return {
    title: `${found.region.name}, ${found.country.name}`,
    description:
      found.region.blurb ?? `News from ${found.region.name} in ${found.country.name}.`,
    alternates: { canonical: `${SITE.url}/${slug}/regions/${regionSlug}` },
  };
}

export default async function RegionPage({ params, searchParams }: Params) {
  const { slug, region: regionSlug } = await params;
  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const skip = (page - 1) * PER_PAGE;

  const found = await resolve(slug, regionSlug);
  if (!found) notFound();
  const { country, region } = found;

  const [articles, total, trending] = await Promise.all([
    getByCountry(slug, { take: PER_PAGE, skip, region: regionSlug }),
    db.article.count({
      where: { ...publishedWhere, region: { slug: regionSlug, countryId: country.id } },
    }),
    getTrending("week", 5),
  ]);

  const [lead, ...rest] = page === 1 ? articles : [null, ...articles];

  return (
    <div className="shell py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: country.name, href: `/${slug}` },
          { label: "Regions" },
          { label: region.name },
        ]}
      />

      <PageHeader
        eyebrow={`${country.name} · Region`}
        title={region.name}
        blurb={region.blurb}
        accent={country.accent}
        countrySlug={country.slug}
        meta={<span className="text-[0.8rem] text-ink-mute">{total} articles</span>}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {country.regions.map((r) => (
            <Link
              key={r.slug}
              href={`/${slug}/regions/${r.slug}`}
              className={`border px-3 py-1.5 text-[0.74rem] font-bold transition-colors ${
                r.slug === regionSlug
                  ? "border-ink bg-ink text-white"
                  : "border-rule-strong hover:border-ink"
              }`}
            >
              {r.name}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {articles.length === 0 ? (
            <div className="border border-rule bg-white p-8 text-center">
              <p className="text-[0.95rem] text-ink-soft">
                No stories filed to {region.name} yet.
              </p>
              <Link
                href={`/${slug}`}
                className="mt-2 inline-block text-[0.88rem] font-bold text-brand"
              >
                See all {country.name} news →
              </Link>
            </div>
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
                basePath={`/${slug}/regions/${regionSlug}`}
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
