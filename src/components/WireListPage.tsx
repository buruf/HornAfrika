import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { NewsletterForm } from "@/components/NewsletterForm";
import { AdSlot } from "@/components/AdSlot";
import { HornMap } from "@/components/HornMap";
import { WireHero, WireNotice, WireRow } from "@/components/wire";
import type { WireCardItem } from "@/lib/wire";

/**
 * One layout for every list of wire headlines: country pages, desk pages, the
 * Horn page and /latest.
 *
 * These were four separate article-driven renderers that happened to look
 * alike. Once the articles were retired they all needed the same thing — a
 * heading, a page of headlines, a pager and a sidebar — so they share one
 * implementation rather than four that drift apart.
 *
 * Everything here is a link out. The wire rules hold: the outlet is named
 * before the headline, the copyright line stays on the item, and nothing is
 * dressed up to look like our own reporting.
 */
export function WireListPage({
  eyebrow,
  title,
  blurb,
  accent,
  countrySlug,
  meta,
  headerExtra,
  items,
  total,
  page,
  perPage,
  basePath,
  emptyNote,
  sidebar,
}: {
  eyebrow: string;
  title: string;
  blurb?: string | null;
  accent?: string | null;
  countrySlug?: string;
  meta?: ReactNode;
  headerExtra?: ReactNode;
  items: WireCardItem[];
  total: number;
  page: number;
  perPage: number;
  basePath: string;
  emptyNote?: string;
  sidebar?: ReactNode;
}) {
  // The lead treatment is for page one only; deeper pages are a plain list, as
  // on any wire.
  const [lead, ...rest] = page === 1 ? items : [null, ...items];

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />

      <PageHeader
        eyebrow={eyebrow}
        title={title}
        blurb={blurb ?? undefined}
        accent={accent ?? undefined}
        countrySlug={countrySlug}
        meta={meta}
      >
        {headerExtra}
      </PageHeader>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-5 border-b border-rule pb-4">
            <WireNotice />
          </div>

          {items.length === 0 ? (
            <p className="border border-rule bg-white p-10 text-center text-[0.95rem] leading-relaxed text-ink-mute">
              {emptyNote ??
                "Nothing on the wire here yet. The feeds are checked every hour."}
            </p>
          ) : (
            <>
              {lead && (
                <div className="mb-7 border-b border-rule pb-7">
                  <WireHero item={lead} />
                </div>
              )}
              <div>
                {rest.filter(Boolean).map((item) => (
                  <WireRow key={item!.id} item={item!} />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                perPage={perPage}
                basePath={basePath}
              />
            </>
          )}
        </div>

        <aside className="space-y-6">
          {sidebar}

          <div className="panel p-4">
            <h2 className="text-[1rem] font-extrabold uppercase tracking-[0.06em]">
              Explore the Horn
            </h2>
            <p className="mt-1 text-[0.8rem] text-white/65">Click a country to see news</p>
            <div className="mt-2">
              <HornMap />
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-[1.02rem] font-extrabold uppercase tracking-[0.05em]">
              The Horn Daily
            </h2>
            <p className="mt-1.5 text-[0.83rem] leading-relaxed text-white/70">
              Your daily briefing from Somalia, Ethiopia, Djibouti and Eritrea.
            </p>
            <div className="mt-3.5">
              <NewsletterForm variant="dark" />
            </div>
          </div>

          <Link
            href="/wire/about"
            className="flex items-center justify-between border border-rule bg-white px-4 py-3 text-[0.85rem] font-bold hover:border-ink"
          >
            How the wire works
            <span aria-hidden>→</span>
          </Link>

          <AdSlot position="sidebar" />
        </aside>
      </div>
    </div>
  );
}

/** The desk strip shown on country pages and desk pages. */
export function DeskStrip({
  counts,
  basePath,
  current,
}: {
  counts: Map<string, number>;
  basePath: string;
  current?: string;
}) {
  const desks = [...counts.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  if (desks.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {desks.map(([slug, n]) => (
        <Link
          key={slug}
          href={`${basePath}/${slug}`}
          className={`border px-3 py-1.5 text-[0.76rem] font-bold capitalize transition-colors ${
            current === slug
              ? "border-ink bg-ink text-white"
              : "border-rule-strong hover:border-ink"
          }`}
        >
          {slug}
          <span className="ml-1.5 font-semibold text-ink-mute">{n}</span>
        </Link>
      ))}
    </div>
  );
}
