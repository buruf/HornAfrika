import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { countWire, getTopicCounts, getWire } from "@/lib/wire";
import { DeskStrip, WireListPage } from "@/components/WireListPage";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

type Params = {
  params: Promise<{ slug: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function resolve(slug: string, category: string) {
  const [country, desk] = await Promise.all([
    db.country.findUnique({ where: { slug } }),
    db.category.findUnique({ where: { slug: category } }),
  ]);
  return { country, desk };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, category } = await params;
  const { country, desk } = await resolve(slug, category);
  if (!country || !desk) return { title: "Not found" };

  return {
    title: `${desk.name} — ${country.name}`,
    description: `${desk.name} headlines about ${country.name}, gathered from the newsrooms covering the Horn of Africa.`,
    alternates: { canonical: `${SITE.url}/${slug}/${category}` },
  };
}

/** One country, one desk — the intersection of the two filters. */
export default async function CountryDeskPage({ params, searchParams }: Params) {
  const { slug, category } = await params;
  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const skip = (page - 1) * PER_PAGE;

  const { country, desk } = await resolve(slug, category);
  if (!country || !desk) notFound();

  const [items, total, deskCounts] = await Promise.all([
    getWire({ country: slug, topic: category, take: PER_PAGE, skip }),
    countWire({ country: slug, topic: category }),
    getTopicCounts(slug),
  ]);

  return (
    <WireListPage
      eyebrow={country.name}
      title={`${desk.name} — ${country.name}`}
      blurb={`${desk.name} headlines about ${country.name}. Every item links to the newsroom that published it.`}
      accent={country.accent}
      countrySlug={country.slug}
      meta={<span className="text-[0.8rem] text-ink-mute">{total} headlines</span>}
      headerExtra={
        <>
          <DeskStrip counts={deskCounts} basePath={`/${slug}`} current={category} />
          <p className="mt-3 text-[0.82rem]">
            <Link
              href={`/${slug}`}
              className="font-semibold text-brand hover:underline"
            >
              ← All {country.name} headlines
            </Link>
          </p>
        </>
      }
      items={items}
      total={total}
      page={page}
      perPage={PER_PAGE}
      basePath={`/${slug}/${category}`}
      emptyNote={`Nothing filed to the ${desk.name.toLowerCase()} desk about ${country.name} recently. Try the other desks above, or all ${country.name} headlines.`}
    />
  );
}
