import type { Metadata } from "next";
import { CountryFlag } from "@/components/CountryFlag";
import Link from "next/link";
import { getAllCategories, getCategoryCounts, getCountriesWithRegions } from "@/lib/queries";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Sections",
  description:
    "Every section on Hornafrika: politics, business, security, economy, society, culture, sports, explainers, people and regional coverage.",
  alternates: { canonical: `${SITE.url}/categories` },
};

export default async function CategoriesPage() {
  const [categories, counts, countries] = await Promise.all([
    getAllCategories(),
    getCategoryCounts(),
    getCountriesWithRegions(),
  ]);

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sections" }]} />

      <PageHeader
        eyebrow="Index"
        title="All Sections"
        blurb="Every desk, format and place covered by Hornafrika."
      />

      <section className="mt-8">
        <SectionHead title="Editorial Desks" light />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="border border-rule bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="chip" data-c={c.slug}>
                  {c.name}
                </span>
                <span className="ml-auto text-[0.75rem] text-ink-mute">
                  {counts.get(c.id) ?? 0} articles
                </span>
              </div>
              <Link href={`/${c.slug}`} className="mt-2.5 block">
                <h2 className="hl text-[1.08rem]">{c.name}</h2>
              </Link>
              {c.blurb && (
                <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-soft">{c.blurb}</p>
              )}
              {c.subcategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.subcategories.map((s) => (
                    <span
                      key={s.id}
                      className="border border-rule px-2 py-0.5 text-[0.7rem] text-ink-mute"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHead title="Countries & Regions" light />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((c) => (
            <div
              key={c.id}
              className="border border-rule bg-white p-4"
              style={{ borderTop: `3px solid ${c.accent}` }}
            >
              <Link href={`/${c.slug}`} className="flex items-center gap-2">
                <CountryFlag slug={c.slug} className="text-lg" />
                <span className="text-[1.02rem] font-extrabold hover:text-brand">{c.name}</span>
              </Link>
              <p className="mt-1 text-[0.76rem] text-ink-mute">Capital: {c.capital}</p>
              <ul className="mt-3 space-y-1.5">
                {c.regions.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/${c.slug}/regions/${r.slug}`}
                      className="text-[0.85rem] text-ink-soft hover:text-brand"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHead title="Formats" light />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Videos", "/videos", "News, interviews, explainers and documentary film."],
            ["Explained", "/explained", "Background and context behind the headlines."],
            ["People of the Horn", "/people", "Profiles and interviews from across the region."],
          ].map(([label, href, blurb]) => (
            <Link
              key={href}
              href={href}
              className="border border-rule bg-white p-4 hover:border-ink"
            >
              <h2 className="text-[1.02rem] font-extrabold">{label}</h2>
              <p className="mt-1.5 text-[0.86rem] text-ink-soft">{blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
