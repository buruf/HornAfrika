import { notFound } from "next/navigation";
import { CountryFlag } from "@/components/CountryFlag";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  countByCategory,
  countByCountry,
  getByCategory,
  getByCountry,
  getHornRegional,
  getTrending,
  getVideos,
} from "@/lib/queries";
import { HeroCard, RowCard, StackedCard, TrendingItem } from "@/components/cards";
import { SectionHead } from "@/components/SectionHead";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { NewsletterForm } from "@/components/NewsletterForm";
import { AdSlot } from "@/components/AdSlot";
import { HornMap } from "@/components/HornMap";
import { getWire } from "@/lib/wire";
import { WireRail } from "@/components/wire";
import { SITE } from "@/lib/site";
import { IconArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

const COUNTRY_SECTIONS = [
  "politics",
  "business",
  "security",
  "economy",
  "culture",
  "sports",
  "society",
] as const;

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

async function resolve(slug: string) {
  const [country, category] = await Promise.all([
    db.country.findUnique({
      where: { slug },
      include: { regions: { orderBy: { order: "asc" } } },
    }),
    db.category.findUnique({ where: { slug } }),
  ]);
  return { country, category };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "horn") {
    return {
      title: "Horn of Africa — Regional Coverage",
      description:
        "Stories that involve more than one country of the Horn: relations, the Red Sea, trade corridors, ports, migration and regional diplomacy.",
      alternates: { canonical: `${SITE.url}/horn` },
    };
  }

  const { country, category } = await resolve(slug);
  if (country) {
    return {
      title: `${country.name} News`,
      description: country.blurb,
      alternates: { canonical: `${SITE.url}/${slug}` },
      openGraph: { title: `${country.name} News | ${SITE.name}`, description: country.blurb },
    };
  }
  if (category) {
    return {
      title: category.name,
      description: category.blurb ?? `${category.name} coverage from across the Horn of Africa.`,
      alternates: { canonical: `${SITE.url}/${slug}` },
    };
  }
  return { title: "Not found" };
}

export default async function SectionPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const skip = (page - 1) * PER_PAGE;

  if (slug === "horn") return <HornPage page={page} skip={skip} />;

  const { country, category } = await resolve(slug);
  if (country) return <CountryPage slug={slug} page={page} skip={skip} country={country} />;
  if (category) return <CategoryPage category={category} page={page} skip={skip} />;

  notFound();
}

// ---------------------------------------------------------------------------
// Country landing page (spec §8)
// ---------------------------------------------------------------------------

async function CountryPage({
  slug,
  page,
  skip,
  country,
}: {
  slug: string;
  page: number;
  skip: number;
  country: NonNullable<Awaited<ReturnType<typeof resolve>>["country"]>;
}) {
  const [articles, total, trending, videos, wire] = await Promise.all([
    getByCountry(slug, { take: PER_PAGE, skip }),
    countByCountry(slug),
    getTrending("week", 5),
    getVideos(3),
    getWire({ country: slug, take: 6 }),
  ]);

  const [lead, ...rest] = page === 1 ? articles : [null, ...articles];

  // Section rails only render where the country actually has coverage, so a
  // country page never shows a row of empty headings.
  const sections = await Promise.all(
    COUNTRY_SECTIONS.map(async (s) => ({
      slug: s,
      items: await getByCountry(slug, { take: 3, category: s, exclude: lead ? [lead.id] : [] }),
    })),
  );
  const liveSections = sections.filter((s) => s.items.length > 0);

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: country.name }]} />

      <PageHeader
        eyebrow="Country"
        title={`${country.name} News`}
        blurb={country.blurb}
        accent={country.accent}
        countrySlug={country.slug}
        meta={
          <span className="text-[0.8rem] text-ink-mute">
            Capital: {country.capital}
            {country.nativeName ? ` · ${country.nativeName}` : ""} · {total} articles
          </span>
        }
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {COUNTRY_SECTIONS.map((s) => (
            <Link
              key={s}
              href={`/${slug}/${s}`}
              className="border border-rule-strong px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] transition-colors hover:border-ink hover:bg-ink hover:text-white"
            >
              {s}
            </Link>
          ))}
        </div>
      </PageHeader>

      {/* Regional breakdown (spec §8). New regions appear here automatically. */}
      {country.regions.length > 0 && (
        <section className="mt-6 border border-rule bg-white p-4">
          <p className="mb-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Regions of {country.name}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {country.regions.map((r) => (
              <Link
                key={r.slug}
                href={`/${slug}/regions/${r.slug}`}
                className="text-[0.86rem] font-semibold text-ink-soft hover:text-brand"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {lead && (
            <div className="mb-8">
              <HeroCard article={lead} />
            </div>
          )}

          <SectionHead title={`Latest from ${country.name}`} light />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.filter(Boolean).map((a) => (
              <StackedCard key={a!.id} article={a!} />
            ))}
          </div>

          <Pagination page={page} total={total} perPage={PER_PAGE} basePath={`/${slug}`} />

          {page === 1 &&
            liveSections.map(({ slug: s, items }) => (
              <section key={s} className="mt-10">
                <SectionHead
                  title={`${country.name} ${s}`}
                  href={`/${slug}/${s}`}
                  light
                />
                <div className="grid gap-6 sm:grid-cols-3">
                  {items.map((a) => (
                    <StackedCard key={a.id} article={a} imageHeight="h-[140px]" showDeck={false} />
                  ))}
                </div>
              </section>
            ))}
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

          <WireRail
            items={wire}
            title={`${country.name} on the Wire`}
            href={`/wire?country=${slug}`}
            note={`What other newsrooms are publishing about ${country.name}. Links open at the publisher.`}
          />

          <div className="panel p-5">
            <h2 className="text-[1rem] font-extrabold uppercase tracking-[0.05em]">
              {country.name} Briefing
            </h2>
            <p className="mt-1.5 text-[0.83rem] leading-relaxed text-white/70">
              Get the {country.name} edition of The Horn Daily.
            </p>
            <div className="mt-3.5">
              <NewsletterForm variant="dark" defaultCountry={slug} showCountry />
            </div>
          </div>

          {videos.length > 0 && (
            <div>
              <SectionHead title="Videos" href="/videos" light />
              <div className="space-y-4">
                {videos.map((v) => (
                  <Link key={v.id} href={`/videos/${v.slug}`} className="block">
                    <h3 className="hl clamp-2 text-[0.9rem]">{v.title}</h3>
                    <p className="meta mt-1">{v.country?.name ?? "Horn of Africa"}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <AdSlot position="sidebar" />
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category page
// ---------------------------------------------------------------------------

async function CategoryPage({
  category,
  page,
  skip,
}: {
  category: { id: string; slug: string; name: string; blurb: string | null };
  page: number;
  skip: number;
}) {
  const [articles, total, subcategories, trending] = await Promise.all([
    getByCategory(category.slug, { take: PER_PAGE, skip }),
    countByCategory(category.slug),
    db.subcategory.findMany({ where: { categoryId: category.id }, orderBy: { order: "asc" } }),
    getTrending("week", 5),
  ]);

  const [lead, ...rest] = page === 1 ? articles : [null, ...articles];

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />

      <PageHeader
        eyebrow="Section"
        title={category.name}
        blurb={category.blurb}
        meta={<span className="text-[0.8rem] text-ink-mute">{total} articles</span>}
      >
        {subcategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {subcategories.map((s) => (
              <span
                key={s.id}
                className="border border-rule px-2.5 py-1 text-[0.72rem] font-semibold text-ink-soft"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </PageHeader>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
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
            basePath={`/${category.slug}`}
          />
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

// ---------------------------------------------------------------------------
// Horn of Africa regional page (spec §10)
// ---------------------------------------------------------------------------

async function HornPage({ page, skip }: { page: number; skip: number }) {
  const [articles, countries, trending, wire] = await Promise.all([
    getHornRegional(PER_PAGE, skip),
    db.country.findMany({ orderBy: { order: "asc" } }),
    getTrending("month", 5),
    getWire({ take: 6 }),
  ]);
  const total = (await getHornRegional(500, 0)).length;
  const [lead, ...rest] = page === 1 ? articles : [null, ...articles];

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Horn of Africa" }]} />

      <PageHeader
        eyebrow="Regional"
        title="Horn of Africa"
        blurb="Stories that belong to more than one country: relations between the four states, the Red Sea, trade corridors and ports, migration, climate, and the regional bodies that bind them together. This is the coverage that treats the Horn as one region rather than four separate news beats."
        meta={<span className="text-[0.8rem] text-ink-mute">{total} articles</span>}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {countries.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="flex items-center gap-1.5 border border-rule-strong px-3 py-1.5 text-[0.76rem] font-bold transition-colors hover:border-ink"
            >
              <CountryFlag slug={c.slug} />
              {c.name}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
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
          <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/horn" />
        </div>

        <aside className="space-y-6">
          <div className="panel p-4">
            <h2 className="text-[1rem] font-extrabold uppercase tracking-[0.06em]">
              Explore the Horn
            </h2>
            <p className="mt-1 text-[0.8rem] text-white/65">Click a country to see news</p>
            <div className="mt-2">
              <HornMap />
            </div>
          </div>

          <div className="card p-4">
            <div className="section-head section-head--light mb-3.5 pb-2.5">
              <h2 className="section-title text-[0.92rem]">Most Read This Month</h2>
            </div>
            <ol className="space-y-3">
              {trending.map((a, i) => (
                <TrendingItem key={a.id} article={a} rank={i + 1} />
              ))}
            </ol>
          </div>

          <WireRail
            items={wire}
            title="The Wire"
            note="What other newsrooms are publishing about the Horn. Links open at the publisher."
          />

          <Link
            href="/explained"
            className="flex items-center justify-between border border-rule bg-white px-4 py-3 text-[0.85rem] font-bold hover:border-ink"
          >
            Read the Explainers
            <IconArrowRight className="h-4 w-4" />
          </Link>

          <AdSlot position="sidebar" />
        </aside>
      </div>
    </div>
  );
}
