import type { Metadata } from "next";
import Link from "next/link";
import { getWireTrending } from "@/lib/wire";
import { WireStackedCard, WireTrendingItem } from "@/components/wire";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending",
  description: "The most-read stories on Hornafrika today, this week and this month.",
  alternates: { canonical: `${SITE.url}/trending` },
};

/**
 * Windows in hours, because trending is now measured over the wire rather
 * than over article readership.
 *
 * A month-long window defeats the purpose: given long enough, everything
 * accumulates coverage and the ranking stops moving — which is exactly the
 * failure this page had, showing the same 11 August headlines for ten days.
 */
const WINDOWS: { key: string; label: string; hours: number }[] = [
  { key: "today", label: "Today", hours: 24 },
  { key: "week", label: "This Week", hours: 168 },
  { key: "month", label: "This Month", hours: 720 },
];

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const requested = (await searchParams).window;
  const active =
    requested && WINDOWS.some((w) => w.key === requested) ? requested : "today";
  const activeWindow = WINDOWS.find((w) => w.key === active)!;
  const otherWindows = WINDOWS.filter((w) => w.key !== active);

  const [main, ...others] = await Promise.all([
    getWireTrending({ hours: activeWindow.hours, take: 12 }),
    ...otherWindows.map((w) => getWireTrending({ hours: w.hours, take: 5 })),
  ]);

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trending" }]} />

      <PageHeader
        eyebrow="Most read"
        title="Trending Now"
        blurb="Ranked by how many separate newsrooms are covering the same story, which is the honest measure available to an aggregator: we count coverage, not clicks. Nothing here is editorially selected."
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {WINDOWS.map((w) => (
            <Link
              key={w.key}
              href={`/trending?window=${w.key}`}
              className={`border px-4 py-1.5 text-[0.76rem] font-bold uppercase tracking-[0.05em] transition-colors ${
                active === w.key
                  ? "border-ink bg-ink text-white"
                  : "border-rule-strong hover:border-ink"
              }`}
            >
              {w.label}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mt-7 grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {main.length === 0 ? (
            <p className="border border-rule bg-white p-8 text-center text-[0.95rem] text-ink-soft">
              Nothing on the wire in this window yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {main.map(({ item, outlets }, i) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-1 -top-1 z-10 flex h-7 w-7 items-center justify-center bg-brand text-[0.8rem] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <WireStackedCard
                    item={item}
                    showExcerpt={false}
                    note={outlets > 1 ? `${outlets} newsrooms` : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-7">
          {otherWindows.map((w, i) => (
            <div key={w.key} className="card p-4">
              <SectionHead title={w.label} href={`/trending?window=${w.key}`} light />
              <ol className="space-y-3">
                {(others[i] ?? []).map(({ item, outlets }, idx) => (
                  <WireTrendingItem
                    key={item.id}
                    item={item}
                    rank={idx + 1}
                    outlets={outlets}
                  />
                ))}
              </ol>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
