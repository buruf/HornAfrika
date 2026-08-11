import type { Metadata } from "next";
import { CountryFlag } from "@/components/CountryFlag";
import Link from "next/link";
import { search, searchEntities } from "@/lib/search";
import { StackedCard, TextItem } from "@/components/cards";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { IconSearch } from "@/components/icons";
import { getCountries, getAllCategories } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Hornafrika for articles, countries, regions, people and topics.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE.url}/search` },
};

const SUGGESTIONS = [
  "Somalia Ethiopia",
  "Red Sea",
  "ports",
  "Djibouti trade",
  "Eritrea culture",
  "drought",
  "GERD",
  "Berbera",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? "").trim();

  const [hits, entities, countries, categories] = await Promise.all([
    q ? search(q, 40) : Promise.resolve([]),
    q ? searchEntities(q) : Promise.resolve({ countries: [], regions: [], topics: [], authors: [] }),
    getCountries(),
    getAllCategories(),
  ]);

  const complete = hits.filter((h) => h.matchedAll);
  const partial = hits.filter((h) => !h.matchedAll);
  const terms = q.split(/\s+/).filter((t) => t.length > 1);

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <PageHeader
        eyebrow="Search"
        title={q ? `Results for “${q}”` : "Search Hornafrika"}
        blurb={
          q
            ? undefined
            : "Search articles, countries, regions, topics and authors across the Horn of Africa."
        }
      >
        <form action="/search" className="mt-5 flex max-w-2xl">
          <div className="flex flex-1 items-center gap-2 border border-rule-strong bg-white px-3.5 py-3">
            <IconSearch className="h-[18px] w-[18px] text-ink-mute" />
            <label className="sr-only" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              autoFocus={!q}
              placeholder="Try: Somalia Ethiopia, ports, Red Sea…"
              className="w-full bg-transparent text-[0.98rem] outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-brand px-5 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark"
          >
            Search
          </button>
        </form>
      </PageHeader>

      {!q && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <SectionHead title="Popular searches" light />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="border border-rule-strong bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-ink-soft hover:border-ink hover:text-ink"
                >
                  {s}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <SectionHead title="Browse by country" light />
              <div className="grid gap-3 sm:grid-cols-2">
                {countries.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${c.slug}`}
                    className="flex items-center gap-3 border border-rule bg-white px-4 py-3 hover:border-ink"
                  >
                    <CountryFlag slug={c.slug} className="text-xl" />
                    <span className="text-[0.95rem] font-bold">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <SectionHead title="Sections" light />
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="border border-rule-strong px-2.5 py-1.5 text-[0.8rem] font-semibold text-ink-soft hover:border-ink hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}

      {q && (
        <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {hits.length === 0 ? (
              <div className="border border-rule bg-white p-10 text-center">
                <p className="text-[1.05rem] font-bold">No results for “{q}”.</p>
                <p className="mt-2 text-[0.9rem] text-ink-soft">
                  Try fewer words, or browse{" "}
                  <Link href="/horn" className="font-semibold text-brand underline">
                    regional coverage
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-[0.85rem] text-ink-mute">
                  {hits.length} {hits.length === 1 ? "result" : "results"}
                  {terms.length > 1 && complete.length > 0 && (
                    <> · {complete.length} matching all {terms.length} terms</>
                  )}
                </p>

                {complete.length > 0 && (
                  <>
                    {terms.length > 1 && (
                      <SectionHead
                        title={`Matching all terms`}
                        note={terms.join(" + ")}
                        light
                      />
                    )}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {complete.slice(0, 12).map((h) => (
                        <StackedCard key={h.article.id} article={h.article} />
                      ))}
                    </div>
                  </>
                )}

                {partial.length > 0 && (
                  <div className="mt-9">
                    <SectionHead title="Other matches" light />
                    <div>
                      {partial.slice(0, 20).map((h) => (
                        <TextItem key={h.article.id} article={h.article} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-6">
            {entities.countries.length > 0 && (
              <div>
                <SectionHead title="Countries" light />
                <ul className="space-y-2">
                  {entities.countries.map((c) => (
                    <li key={c.id}>
                      <Link href={`/${c.slug}`} className="text-[0.9rem] font-semibold hover:text-brand">
                        <CountryFlag slug={c.slug} /> {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entities.regions.length > 0 && (
              <div>
                <SectionHead title="Regions" light />
                <ul className="space-y-2">
                  {entities.regions.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/${r.country.slug}/regions/${r.slug}`}
                        className="text-[0.9rem] font-semibold hover:text-brand"
                      >
                        {r.name}
                        <span className="ml-1.5 text-[0.78rem] font-normal text-ink-mute">
                          {r.country.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entities.topics.length > 0 && (
              <div>
                <SectionHead title="Topics" light />
                <div className="flex flex-wrap gap-2">
                  {entities.topics.map((t) => (
                    <Link
                      key={t.id}
                      href={`/search?q=${encodeURIComponent(t.name)}`}
                      className="border border-rule-strong px-2.5 py-1 text-[0.78rem] font-semibold text-ink-soft hover:border-ink"
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {entities.authors.length > 0 && (
              <div>
                <SectionHead title="People" light />
                <ul className="space-y-2">
                  {entities.authors.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/authors/${a.slug}`}
                        className="text-[0.9rem] font-semibold hover:text-brand"
                      >
                        {a.name}
                      </Link>
                      <p className="text-[0.76rem] text-ink-mute">{a.title}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
