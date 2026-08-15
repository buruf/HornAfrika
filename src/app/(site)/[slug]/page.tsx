import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";
import { db } from "@/lib/db";
import { countWire, getTopicCounts, getWire, getWireSources } from "@/lib/wire";
import { DeskStrip, WireListPage } from "@/components/WireListPage";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

/**
 * One slug space serves countries and desks, so a request could be either.
 * Countries win: they are the platform's primary axis, and no desk shares a
 * slug with one.
 */
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
        "Headlines from across Somalia, Ethiopia, Djibouti and Eritrea, gathered from the newsrooms covering the region.",
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
      description:
        category.blurb ?? `${category.name} headlines from across the Horn of Africa.`,
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
  if (country) return <CountryPage page={page} skip={skip} country={country} />;
  if (category) return <DeskPage category={category} page={page} skip={skip} />;

  notFound();
}

// ---------------------------------------------------------------------------
// Country landing page
// ---------------------------------------------------------------------------

async function CountryPage({
  page,
  skip,
  country,
}: {
  page: number;
  skip: number;
  country: NonNullable<Awaited<ReturnType<typeof resolve>>["country"]>;
}) {
  const slug = country.slug;

  const [items, total, deskCounts, sources] = await Promise.all([
    getWire({ country: slug, take: PER_PAGE, skip }),
    countWire({ country: slug }),
    getTopicCounts(slug),
    getWireSources(),
  ]);

  // Outlets whose beat is this country, so a reader can see who the coverage
  // is actually coming from — and, for the countries where every reachable
  // outlet is state-run or partisan, judge it accordingly.
  const countrySources = sources.filter((s) => s.country?.slug === slug);

  return (
    <WireListPage
      eyebrow="Country"
      title={`${country.name} News`}
      blurb={country.blurb}
      accent={country.accent}
      countrySlug={slug}
      meta={
        <span className="text-[0.8rem] text-ink-mute">
          Capital: {country.capital}
          {country.nativeName ? ` · ${country.nativeName}` : ""} · {total} headlines
        </span>
      }
      headerExtra={<DeskStrip counts={deskCounts} basePath={`/${slug}`} />}
      items={items}
      total={total}
      page={page}
      perPage={PER_PAGE}
      basePath={`/${slug}`}
      emptyNote={`No headlines mentioning ${country.name} have come through the wire recently. The feeds are checked every hour.`}
      sidebar={
        <>
          {countrySources.length > 0 && (
            <div className="border border-rule bg-white p-4">
              <p className="mb-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
                {country.name} outlets on the wire
              </p>
              <ul className="space-y-1.5">
                {countrySources.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/wire?source=${s.slug}`}
                      className="text-[0.85rem] font-semibold text-ink-soft hover:text-brand"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {country.regions.length > 0 && (
            <div className="border border-rule bg-white p-4">
              <p className="mb-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
                Regions of {country.name}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {country.regions.map((r) => (
                  <span key={r.slug} className="text-[0.83rem] text-ink-soft">
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Desk page — the wire filtered to one subject
// ---------------------------------------------------------------------------

async function DeskPage({
  category,
  page,
  skip,
}: {
  category: { slug: string; name: string; blurb: string | null };
  page: number;
  skip: number;
}) {
  const [items, total, countries] = await Promise.all([
    getWire({ topic: category.slug, take: PER_PAGE, skip }),
    countWire({ topic: category.slug }),
    db.country.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <WireListPage
      eyebrow="Desk"
      title={category.name}
      blurb={
        category.blurb ??
        `${category.name} headlines from across Somalia, Ethiopia, Djibouti and Eritrea.`
      }
      meta={<span className="text-[0.8rem] text-ink-mute">{total} headlines</span>}
      headerExtra={
        <div className="mt-4 flex flex-wrap gap-2">
          {countries.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}/${category.slug}`}
              className="flex items-center gap-1.5 border border-rule-strong px-3 py-1.5 text-[0.76rem] font-bold transition-colors hover:border-ink"
            >
              <CountryFlag slug={c.slug} />
              {c.name}
            </Link>
          ))}
        </div>
      }
      items={items}
      total={total}
      page={page}
      perPage={PER_PAGE}
      basePath={`/${category.slug}`}
      emptyNote={`Nothing has been filed to the ${category.name.toLowerCase()} desk recently. Desks are assigned from the text of each headline, so a quiet desk usually means a quiet week rather than a fault.`}
    />
  );
}

// ---------------------------------------------------------------------------
// Horn of Africa — everything, all four countries
// ---------------------------------------------------------------------------

async function HornPage({ page, skip }: { page: number; skip: number }) {
  const [items, total, countries, deskCounts] = await Promise.all([
    getWire({ take: PER_PAGE, skip }),
    countWire(),
    db.country.findMany({ orderBy: { order: "asc" } }),
    getTopicCounts(),
  ]);

  return (
    <WireListPage
      eyebrow="Regional"
      title="Horn of Africa"
      blurb="Everything on the wire from the four countries of the Horn — Somalia, Ethiopia, Djibouti and Eritrea — newest first, whichever newsroom published it."
      meta={<span className="text-[0.8rem] text-ink-mute">{total} headlines</span>}
      headerExtra={
        <>
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
          <DeskStrip counts={deskCounts} basePath="" />
        </>
      }
      items={items}
      total={total}
      page={page}
      perPage={PER_PAGE}
      basePath="/horn"
    />
  );
}
