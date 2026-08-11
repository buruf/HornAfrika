import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getLatest, getTrending, publishedWhere } from "@/lib/queries";
import { StackedCard, TrendingItem } from "@/components/cards";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { Pagination } from "@/components/Pagination";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 18;

export const metadata: Metadata = {
  title: "Latest News",
  description:
    "The most recent reporting from Somalia, Ethiopia, Djibouti, Eritrea and the wider Horn of Africa.",
  alternates: { canonical: `${SITE.url}/latest` },
};

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const [articles, total, trending] = await Promise.all([
    getLatest(PER_PAGE, (page - 1) * PER_PAGE),
    db.article.count({ where: publishedWhere }),
    getTrending("week", 5),
  ]);

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Latest" }]} />

      <PageHeader
        eyebrow="Newsroom"
        title="Latest News"
        blurb="Everything published across the platform, newest first."
        meta={<span className="text-[0.8rem] text-ink-mute">{total} articles</span>}
      />

      <div className="mt-7 grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <StackedCard key={a.id} article={a} />
            ))}
          </div>
          <Pagination page={page} total={total} perPage={PER_PAGE} basePath="/latest" />
        </div>

        <aside>
          <div className="card p-4">
            <SectionHead title="Trending Now" href="/trending" light />
            <ol className="space-y-3">
              {trending.map((a, i) => (
                <TrendingItem key={a.id} article={a} rank={i + 1} />
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
