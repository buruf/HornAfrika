import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";
import { getCountriesWithRegions, getNavCategories } from "@/lib/queries";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { SearchToggle } from "@/components/SearchToggle";
import { TopBar } from "@/components/TopBar";
import { IconChevron } from "@/components/icons";

const COUNTRY_SECTIONS = [
  ["Latest", ""],
  ["Politics", "/politics"],
  ["Business", "/business"],
  ["Security", "/security"],
  ["Economy", "/economy"],
  ["Culture", "/culture"],
  ["Sports", "/sports"],
  ["Society", "/society"],
] as const;

const MORE_LINKS = [
  ["Horn of Africa", "/horn"],
  ["The Wire", "/wire"],
  ["Economy", "/economy"],
  ["Society", "/society"],
  ["Explained", "/explained"],
  ["People of the Horn", "/people"],
  ["Authors", "/authors"],
  ["About", "/about"],
  ["Editorial Policy", "/editorial-policy"],
  ["Advertise", "/advertise"],
  ["Submit a Story", "/submit-a-story"],
] as const;

export async function SiteHeader() {
  const [countries, categories] = await Promise.all([
    getCountriesWithRegions(),
    getNavCategories(),
  ]);

  // No display utility in the base: each item sets its own, so the responsive
  // tiers below can hide items without two display classes fighting.
  const navBase =
    "relative items-center gap-1 whitespace-nowrap px-2 py-3 text-[0.79rem] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:text-brand xl:px-2.5 2xl:px-3 2xl:text-[0.82rem]";
  const navItem = `flex ${navBase}`;

  /**
   * The full nav needs about 1290px; showing it from `lg` pushed the search
   * button past the viewport edge and scrolled the whole page sideways.
   * Desks now appear only once there is room for them, and everything stays
   * reachable under MORE at every width.
   */
  const navFromXl = `hidden xl:flex ${navBase}`;
  const navFrom2xl = `hidden 2xl:flex ${navBase}`;

  return (
    <header className="sticky top-0 z-40 bg-white no-print">
      <TopBar />

      <div className="border-b border-rule bg-white">
        <div className="shell flex items-center gap-4 py-3">
          <Logo />

          {/* Desktop navigation. Dropdowns are CSS-only — the country sections
              have to be immediately reachable (spec §2) without shipping a
              menu runtime to every reader. */}
          <nav className="ml-auto hidden items-center lg:flex" aria-label="Main">
            <Link href="/" className={navItem}>
              <span className="relative">
                Home
                <span className="absolute -bottom-[13px] left-0 h-[3px] w-full bg-brand" />
              </span>
            </Link>

            {countries.map((c) => (
              <div key={c.slug} className="group relative">
                <Link href={`/${c.slug}`} className={navItem}>
                  {c.name.toUpperCase()}
                  <IconChevron className="h-3 w-3 opacity-55 transition-transform group-hover:rotate-180" />
                </Link>

                {/* Two rules keep this panel inside the window:
                    display:none when closed, because a hidden-but-laid-out
                    440px panel still counts toward document width and scrolled
                    the page sideways; and right-0 rather than left-0, because
                    the nav sits at the right edge and a left-anchored panel ran
                    past the viewport on the last two countries. */}
                <div className="absolute right-0 top-full z-50 hidden w-[440px] border border-rule bg-white shadow-[0_16px_40px_-12px_rgba(11,31,51,0.28)] group-hover:block group-focus-within:block">
                  <div className="flex items-center gap-2 border-b border-rule bg-shell px-4 py-2.5">
                    <CountryFlag slug={c.slug} className="text-lg" />
                    <span className="text-[0.78rem] font-bold uppercase tracking-[0.07em]">
                      {c.name}
                    </span>
                    <Link
                      href={`/${c.slug}`}
                      className="ml-auto text-[0.7rem] font-bold uppercase tracking-wide text-brand"
                    >
                      All news →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 px-4 py-3.5">
                    <div>
                      <p className="pb-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
                        Sections
                      </p>
                      <ul className="space-y-1.5">
                        {COUNTRY_SECTIONS.map(([label, path]) => (
                          <li key={label}>
                            <Link
                              href={`/${c.slug}${path}`}
                              className="text-[0.83rem] text-ink-soft hover:text-brand"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="pb-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
                        Regions
                      </p>
                      <ul className="space-y-1.5">
                        {c.regions.map((r) => (
                          <li key={r.slug}>
                            <Link
                              href={`/${c.slug}/regions/${r.slug}`}
                              className="text-[0.83rem] text-ink-soft hover:text-brand"
                            >
                              {r.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className={i < 3 ? navFromXl : navFrom2xl}
              >
                {cat.name.toUpperCase()}
              </Link>
            ))}

            <Link href="/videos" className={navFrom2xl}>
              VIDEOS
            </Link>

            <div className="group relative">
              <span className={`${navItem} cursor-default`}>
                MORE
                <IconChevron className="h-3 w-3 opacity-55 transition-transform group-hover:rotate-180" />
              </span>
              <div className="absolute right-0 top-full z-50 hidden w-[26rem] border border-rule bg-white shadow-[0_16px_40px_-12px_rgba(11,31,51,0.28)] group-hover:block group-focus-within:block">
                <div className="grid grid-cols-2 gap-x-5 px-4 py-3">
                  {/* Desks live here too, so every section stays reachable at
                      widths where the top-level links are hidden. */}
                  <div>
                    <p className="pb-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
                      Sections
                    </p>
                    <ul className="space-y-1.5">
                      {categories.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/${cat.slug}`}
                            className="text-[0.83rem] text-ink-soft hover:text-brand"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/videos"
                          className="text-[0.83rem] text-ink-soft hover:text-brand"
                        >
                          Videos
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="pb-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink-mute">
                      More
                    </p>
                    <ul className="space-y-1.5">
                      {MORE_LINKS.map(([label, href]) => (
                        <li key={href}>
                          <Link
                            href={href}
                            className="text-[0.83rem] text-ink-soft hover:text-brand"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-3">
            <div className="hidden lg:block">
              <SearchToggle />
            </div>
            <Link
              href="/search"
              aria-label="Search"
              className="p-1.5 text-ink lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-[22px] w-[22px]">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </Link>
            <MobileNav
              countries={countries.map((c) => ({
                slug: c.slug,
                name: c.name,
                flag: c.flag,
                regions: c.regions.map((r) => ({ slug: r.slug, name: r.name })),
              }))}
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              more={[
                { slug: "horn", name: "Horn of Africa" },
                { slug: "wire", name: "The Wire" },
                { slug: "explained", name: "Explained" },
                { slug: "people", name: "People" },
                { slug: "videos", name: "Videos" },
              ]}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
