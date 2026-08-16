import type { Metadata } from "next";
import Link from "next/link";
import { getTrending, type TrendingWindow } from "@/lib/queries";
import { StackedCard, TrendingItem } from "@/components/cards";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending",
  description: "The most-read stories on Hornafrika today, this week and this month.",
  alternates: { canonical: `${SITE.url}/trending` },
};

const WINDOWS: { key: TrendingWindow; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const requested = (await searchParams).window as TrendingWindow | undefined;
  const active: TrendingWindow =
    requested && ["today", "week", "month"].includes(requested) ? requested : "week";

  const [main, ...others] = await Promise.all([
    getTrending(active, 12),
    ...WINDOWS.filter((w) => w.key !== active).map((w) => getTrending(w.key, 5)),
  ]);

  const otherWindows = WINDOWS.filter((w) => w.key !== active);

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trending" }]} />

      <PageHeader
        eyebrow="Most read"
        title="Trending Now"
        blurb="Ranked by readership weighted for recency, so a story that peaked weeks ago does not hold the top of the list. This is measured, not editorially selected."
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
              Not enough readership data in this window yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {main.map((a, i) => (
                <div key={a.id} className="relative">
                  <span className="absolute -left-1 -top-1 z-10 flex h-7 w-7 items-center justify-center bg-brand text-[0.8rem] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <StackedCard article={a} showDeck={false} />
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
                {(others[i] ?? []).map((a, idx) => (
                  <TrendingItem key={a.id} article={a} rank={idx + 1} />
                ))}
              </ol>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
