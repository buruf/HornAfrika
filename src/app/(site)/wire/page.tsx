import type { Metadata } from "next";
import Link from "next/link";
import {
  balanceByCountry,
  spreadSources,
  countWire,
  getWire,
  getWireFreshness,
  getWireSources,
  type WireScope,
} from "@/lib/wire";
import { WireNotice, WireRow } from "@/components/wire";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { Pagination } from "@/components/Pagination";
import { CountryFlag } from "@/components/CountryFlag";
import { getCountries } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

const KINDS = [
  { key: "REGIONAL", label: "Regional outlets" },
  { key: "HORN", label: "Horn-wide" },
  { key: "PANAFRICAN", label: "Pan-African" },
  { key: "INTERNATIONAL", label: "International" },
];

export const metadata: Metadata = {
  title: "The Wire",
  description:
    "Headlines about the Horn of Africa from newsrooms across Somalia, Ethiopia, Djibouti, Eritrea, the continent and the world. Links open at the publisher.",
  alternates: { canonical: `${SITE.url}/wire` },
};

export default async function WirePage({
  searchParams,
}: {
  searchParams: Promise<{
    scope?: string;
    country?: string;
    source?: string;
    kind?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  // World is everything the Horn filter excludes. A country filter is
  // meaningless there, so switching scope drops it.
  const scope: WireScope = sp.scope === "world" ? "world" : "horn";
  const filters = {
    scope,
    country: scope === "world" ? undefined : sp.country,
    source: sp.source,
    kind: sp.kind,
  };

  const [rawItems, total, sources, countries, freshness] = await Promise.all([
    getWire({ ...filters, take: PER_PAGE, skip: (page - 1) * PER_PAGE }),
    countWire(filters),
    getWireSources(),
    getCountries(),
    getWireFreshness(),
  ]);

  /**
   * The unfiltered first page is dealt round-robin between the four countries;
   * everything else stays in strict time order.
   *
   * Straight recency made this a Somalia page for the same arithmetic reason
   * as the homepage — the newest twenty items ran fourteen Somalia to seven
   * Ethiopia. That is not what a four-country platform should open with.
   *
   * It applies only to page one, and only when nothing is filtered: once a
   * reader asks for a country, a source or page two they have asked something
   * specific, and reordering would answer a different question. `/latest`
   * stays chronological throughout — that is the page that promises it.
   */
  // Country balancing is a Horn idea; world items have no country to balance.
  const unfiltered = !filters.country && !filters.source && !filters.kind;
  const items =
    scope === "horn" && unfiltered && page === 1
      ? spreadSources(
          balanceByCountry(rawItems, rawItems.length, countries.map((c) => c.slug)),
        )
      : spreadSources(rawItems);

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, ...extra })) {
      // Horn is the default, so leaving it out keeps /wire canonical rather
      // than serving the same page at both /wire and /wire?scope=horn.
      if (k === "scope" && v === "horn") continue;
      if (v) p.set(k, v);
    }
    const s = p.toString();
    return s ? `/wire?${s}` : "/wire";
  };

  const activeSource = sources.find((s) => s.slug === sp.source);
  const activeCountry = countries.find((c) => c.slug === sp.country);

  const pill = (on: boolean) =>
    `border px-3 py-1.5 text-[0.74rem] font-bold transition-colors ${
      on ? "border-ink bg-ink text-white" : "border-rule-strong hover:border-ink"
    }`;

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "The Wire" }]} />

      <PageHeader
        eyebrow="Aggregated"
        title="The Wire"
        blurb="What the rest of the world is publishing about the Horn of Africa — and what the Horn's own newsrooms are publishing about everywhere else."
        meta={
          <span className="text-[0.8rem] text-ink-mute">
            {total} headlines · {freshness.sources} sources
            {freshness.lastFetchedAt ? ` · updated ${timeAgo(freshness.lastFetchedAt)}` : ""}
          </span>
        }
      >
        <div className="mt-4 max-w-3xl border-l-[3px] border-brand bg-white px-4 py-3">
          <WireNotice />
        </div>
      </PageHeader>

      {/* ------------------------------------------------------------ filters */}
      <div className="mt-6 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
            Scope
          </span>
          <Link
            href={qs({ scope: undefined, country: undefined, page: undefined })}
            className={pill(scope === "horn")}
          >
            Horn of Africa
          </Link>
          <Link
            href={qs({ scope: "world", country: undefined, page: undefined })}
            className={pill(scope === "world")}
          >
            World
          </Link>
          <span className="text-[0.74rem] text-ink-mute">
            {scope === "world"
              ? "Everything else our sources filed — not about the Horn."
              : "Headlines naming Somalia, Ethiopia, Djibouti or Eritrea."}
          </span>
        </div>

        {scope === "horn" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
            Country
          </span>
          <Link href={qs({ country: undefined, page: undefined })} className={pill(!sp.country)}>
            All
          </Link>
          {countries.map((c) => (
            <Link
              key={c.slug}
              href={qs({ country: c.slug, page: undefined })}
              className={`${pill(sp.country === c.slug)} inline-flex items-center gap-1.5`}
            >
              <CountryFlag slug={c.slug} />
              {c.name}
            </Link>
          ))}
        </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
            Source type
          </span>
          <Link href={qs({ kind: undefined, page: undefined })} className={pill(!sp.kind)}>
            All
          </Link>
          {KINDS.map((k) => (
            <Link
              key={k.key}
              href={qs({ kind: k.key, page: undefined })}
              className={pill(sp.kind === k.key)}
            >
              {k.label}
            </Link>
          ))}
        </div>

        {(activeSource || activeCountry) && (
          <p className="text-[0.82rem] text-ink-mute">
            Filtered to{" "}
            {activeSource && (
              <strong className="text-ink">{activeSource.name}</strong>
            )}
            {activeSource && activeCountry && " · "}
            {activeCountry && <strong className="text-ink">{activeCountry.name}</strong>}
            {" · "}
            <Link href="/wire" className="font-semibold text-brand underline">
              clear
            </Link>
          </p>
        )}
      </div>

      <div className="mt-7 grid gap-9 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {items.length === 0 ? (
            <div className="border border-rule bg-white p-10 text-center">
              <p className="text-[1.02rem] font-bold">Nothing on the wire for this filter yet.</p>
              <p className="mt-2 text-[0.9rem] text-ink-soft">
                {freshness.total === 0
                  ? "The aggregator has not run yet. An administrator can trigger it from the Sources page."
                  : "Try a different country or source type."}
              </p>
            </div>
          ) : (
            <>
              <div className="border-t border-rule">
                {items.map((item) => (
                  <WireRow key={item.id} item={item} />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                perPage={PER_PAGE}
                basePath="/wire"
                query={Object.fromEntries(
                  Object.entries(filters).filter(([, v]) => Boolean(v)) as [string, string][],
                )}
              />
            </>
          )}
        </div>

        <aside className="space-y-6">
          <div>
            <SectionHead title="Sources" href="/wire/about" hrefLabel="About" light />
            <div className="space-y-3.5">
              {KINDS.map((k) => {
                const group = sources.filter((s) => s.kind === k.key);
                if (group.length === 0) return null;
                return (
                  <div key={k.key}>
                    <p className="mb-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
                      {k.label}
                    </p>
                    <ul className="space-y-1">
                      {group.map((s) => (
                        <li key={s.slug} className="flex items-baseline gap-2">
                          <Link
                            href={qs({ source: s.slug, page: undefined })}
                            className={`text-[0.83rem] ${
                              sp.source === s.slug
                                ? "font-bold text-brand"
                                : "text-ink-soft hover:text-brand"
                            }`}
                          >
                            {s.name}
                          </Link>
                          <span className="ml-auto text-[0.7rem] text-ink-mute">
                            {s._count.items}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-rule bg-shell p-4">
            <p className="text-[0.78rem] leading-relaxed text-ink-soft">
              Are you a publisher who would rather not appear here, or who wants a
              different feed used?{" "}
              <Link href="/contact" className="font-semibold text-brand underline">
                Tell us
              </Link>{" "}
              and we will act on it.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
