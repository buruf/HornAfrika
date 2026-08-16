import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";
import { SectionHead } from "@/components/SectionHead";
import { AdSlot } from "@/components/AdSlot";
import { HornMap } from "@/components/HornMap";
import { NewsletterForm } from "@/components/NewsletterForm";
import { EditorialImage } from "@/components/EditorialImage";
import {
  BulletItem,
  HeroCard,
  OverlayCard,
  RowCard,
  StackedCard,
  TextItem,
  TrendingItem,
} from "@/components/cards";
import {
  getAllCategories,
  getByCategory,
  getCategoryCounts,
  getCountries,
  getCountryBlocks,
  getHomepageSlots,
  getHornRegional,
  getLatest,
  getLeadAndSecondaries,
  getTrending,
  getVideos,
} from "@/lib/queries";
import {
  balanceByCountry,
  getWire,
  getWireFreshness,
  spreadSources,
} from "@/lib/wire";
import {
  WireBand,
  WireCard,
  WireHero,
  WireLink,
  WireRail,
} from "@/components/wire";
import { articleHref, formatDuration, timeAgo } from "@/lib/format";
import { IconArrowRight, IconPlay, IconTrend } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { lead, secondaries } = await getLeadAndSecondaries();

  // Everything already on screen above the fold is kept out of the sections
  // below it, so no story appears twice on one page.
  const usedIds = new Set(
    [lead?.id, ...secondaries.map((s) => s.id)].filter(Boolean) as string[],
  );

  const [
    trending,
    countryBlocks,
    horn,
    latest,
    categories,
    counts,
    videos,
    slots,
    wirePool,
    wireFreshness,
    wireCountries,
  ] = await Promise.all([
    getTrending("week", 5),
    getCountryBlocks([...usedIds]),
    getHornRegional(5, 0, [...usedIds]),
    getLatest(16),
    getAllCategories(),
    getCategoryCounts(),
    getVideos(4),
    getHomepageSlots(),
    // One pool serves the lead, the band, the country blocks, the rail and the
    // desk rows, each claiming its slice in order so nothing repeats on the
    // page. It is deliberately much larger than the sum of those slices: the
    // desk rows draw last and only take items already matching their desk, so
    // a tight pool silently starved Business and Society out of the page.
    getWire({ take: 300 }),
    getWireFreshness(),
    getCountries(),
  ]);

  // Do we hold any of our own published writing at all? Everything in the
  // features half of the page hangs off this.
  const hasFeatures = Boolean(lead) || secondaries.length > 0;

  const countrySlugs = wireCountries.map((c) => c.slug);

  // The lead takes the freshest item that has a picture; a headline from this
  // morning with no image still beats a good-looking one from yesterday, so
  // the search widens rather than reaching further back.
  const wireLead = wirePool.find((i) => i.imageUrl) ?? wirePool[0] ?? null;

  // Everything below claims its slice in order, so no headline appears twice.
  const taken = new Set(wireLead ? [wireLead.id] : []);
  const claim = (items: typeof wirePool, n: number) => {
    const out = items.filter((i) => !taken.has(i.id)).slice(0, n);
    for (const i of out) taken.add(i.id);
    return out;
  };

  const wireTop = claim(wirePool, 4);

  // Each country is guaranteed a place on the band; the rest goes by recency.
  // Balanced across the four countries, then nudged so one outlet's batch
  // does not fill the band with a single masthead.
  const wireMain = spreadSources(
    balanceByCountry(wirePool.filter((i) => !taken.has(i.id)), 11, countrySlugs),
  );
  for (const i of wireMain) taken.add(i.id);

  // The four country blocks run on the wire rather than on articles. They used
  // to show our own headlines, which meant four columns of three-to-thirteen
  // day old copy under a heading that says "latest".
  const wireByCountry = new Map(
    countrySlugs.map((slug) => [
      slug,
      wirePool
        .filter(
          (i) => !taken.has(i.id) && i.countries.some((c) => c.country.slug === slug),
        )
        .slice(0, 4),
    ]),
  );
  for (const items of wireByCountry.values()) for (const i of items) taken.add(i.id);

  const wireRail = claim(wirePool, 5);

  // A full-width grid under the country blocks. Balanced too, so the biggest
  // block of the page is not eight Somali headlines in a row.
  const latestWire = spreadSources(
    balanceByCountry(
      wirePool.filter((i) => !taken.has(i.id)),
      8,
      countrySlugs,
    ),
  );
  for (const i of latestWire) taken.add(i.id);

  // Desk rows, drawn from the same pool. A desk with nothing left after the
  // bands above have taken their share is dropped rather than shown empty.
  const deskSections = categories
    .filter((c) => c.kind === "DESK")
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      items: wirePool.filter((i) => !taken.has(i.id) && i.topic === c.slug).slice(0, 4),
    }))
    .filter((d) => d.items.length >= 2);
  for (const d of deskSections) for (const i of d.items) taken.add(i.id);

  const categoryTiles = categories
    // The regional desk already has its own landing page and sidebar panel.
    .filter((c) => c.slug !== "regional")
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: counts.get(c.id) ?? 0,
    }));

  return (
    <div className="shell py-5">
      {/* ==================================================================
          TODAY — the wire, at the very top.

          This is the answer to a page that read as stale. Aggregation was
          working the whole time: the wire is two hours old. But it sat below
          a fixed set of articles whose newest piece was three days old and
          ageing every morning, because nothing rewrites them. On an
          aggregator the freshest thing has to be the first thing, so the wire
          leads and our own features follow underneath.
      ================================================================== */}
      {wireLead && (
        <section className="mb-9">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-[3px] border-ink pb-2.5">
            <h2 className="text-[1.35rem] font-extrabold tracking-[-0.02em]">Today</h2>
            <p className="text-[0.8rem] text-ink-soft">
              Latest from {wireFreshness.sources} newsrooms across the Horn
            </p>
            {wireFreshness.lastFetchedAt && (
              <span className="flex items-center gap-1.5 text-[0.74rem] font-semibold text-ink-mute">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f7a3f]"
                  aria-hidden
                />
                Checked {timeAgo(wireFreshness.lastFetchedAt)}
              </span>
            )}
            <Link
              href="/wire"
              className="ml-auto text-[0.74rem] font-extrabold uppercase tracking-[0.07em] text-brand hover:underline"
            >
              All headlines →
            </Link>
          </div>

          <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] lg:items-start">
            <WireHero item={wireLead} />
            <div className="space-y-4 border-t border-rule pt-4 lg:border-t-0 lg:pt-0">
              {wireTop.map((item) => (
                <WireLink key={item.id} item={item} showExcerpt={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our own writing, when there is any.

          Everything here is conditional on articles existing. The launch
          articles have been retired, so today this renders nothing at all —
          and that is the honest state of a site with no reporters yet. The
          moment a verified contributor files something and an editor
          publishes it, this section comes back on its own. */}
      {hasFeatures && (
        <SectionHead
          title="Features & Background"
          note="Reporting and explainers from Hornafrika"
        />
      )}

      {/* ==================================================================
          THE TOP BAND — hero, the three secondaries, and Trending, as one
          grid row so all three columns share a height and bottom-align.

          The row is stretched rather than pinned to a fixed number: the
          secondary stack sets a floor with min-h, Trending grows if its
          headlines wrap, and the row takes the larger of the two. The hero
          and the secondaries render in `fill` mode, where the picture is
          absolutely positioned and covers the card, so stretching the card
          grows the picture with it and the headline stays on the image.

          Column widths deliberately mirror the two-column grid below —
          (1.72fr + gap + 1fr) === the main column there — so the sidebar
          edge lines up straight down the page.
      ================================================================== */}
      {hasFeatures && (
      <section className="grid gap-5 md:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1.72fr)_minmax(0,1fr)_340px]">
        {lead && <HeroCard article={lead} fill />}

        <div className="grid gap-5 sm:grid-cols-2 md:min-h-[500px] md:grid-cols-1 md:grid-rows-3">
          {secondaries.map((a) => (
            <OverlayCard key={a.id} article={a} fill />
          ))}
        </div>

        <div className="card flex flex-col p-4 md:col-span-2 lg:col-span-1">
          <div className="section-head section-head--light mb-3.5 pb-2.5">
            <IconTrend className="h-4 w-4 text-brand" />
            <h2 className="section-title text-[0.92rem]">Trending Now</h2>
          </div>
          <ol className="space-y-3">
            {trending.map((a, i) => (
              <TrendingItem key={a.id} article={a} rank={i + 1} />
            ))}
          </ol>
          {/* mt-auto keeps this on the bottom edge when the row is taller
              than the list, so the card never ends with a ragged hole. */}
          <Link
            href="/trending"
            className="mt-auto inline-flex items-center gap-1.5 pt-3.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand"
          >
            Today · Week · Month
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
      )}

      {/* More of the wire, below the features. The lead band is at the top of
          the page; this is the wider spread, balanced across the four
          countries. */}
      <WireBand
        items={wireMain}
        lastFetchedAt={wireFreshness.lastFetchedAt}
        sourceCount={wireFreshness.sources}
      />

      {/* ==================================================================
          Below the band: one main column and one continuous sidebar.

          These were previously separate two-column sections, each with its
          own little sidebar, so any height mismatch inside one showed up as
          dead white space. A single pair of columns cannot develop that hole.
      ================================================================== */}
      <div className="mt-9 grid items-start gap-x-5 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-9">
          {/* ------------------------------------------------------ THE HORN */}
          <section className="card p-4 sm:p-5">
          <SectionHead
            title="The Horn"
            note="Latest from the four countries of the Horn of Africa"
          />
          {/* Equal columns, identical treatment: no country outranks another
              on this page because of how much content happens to exist. */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {countryBlocks.map(({ country, lead: cLead, rest }) => (
              <div
                key={country.slug}
                className="border border-rule"
                style={{ borderTop: `3px solid ${country.accent}` }}
              >
                <div className="flex items-center gap-2 border-b border-rule px-3 py-2.5">
                  <CountryFlag slug={country.slug} className="text-lg" />
                  <Link
                    href={`/${country.slug}`}
                    className="text-[0.82rem] font-extrabold uppercase tracking-[0.07em] hover:text-brand"
                    style={{ color: country.accent }}
                  >
                    {country.name}
                  </Link>
                </div>

                {cLead && (
                  <Link href={articleHref(cLead)} className="block overflow-hidden bg-shell">
                    <EditorialImage
                      seed={cLead.imageSeed}
                      category={cLead.category.slug}
                      src={cLead.imageUrl}
                      alt={cLead.imageCaption}
                      detail={false}
                      className="h-[92px] w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                    />
                  </Link>
                )}

                {(wireByCountry.get(country.slug)?.length ?? 0) > 0 && (
                  <div className="px-3 pt-3">
                    <WireCard
                      item={wireByCountry.get(country.slug)![0]}
                      imageHeight="h-[120px]"
                      showExcerpt={false}
                    />
                  </div>
                )}

                {(cLead || rest.length > 0) && (
                  <ul className="space-y-2 px-3 py-3">
                    {cLead && <BulletItem article={cLead} />}
                    {rest.map((a) => (
                      <BulletItem key={a.id} article={a} />
                    ))}
                  </ul>
                )}

                {/* Today's headlines for this country, from the wire.
                    Without these the block is three-to-thirteen day old copy
                    under a heading that promises the latest. Kept visually
                    distinct from our own bullets above — outlet named, links
                    out — so the two are never confused. */}
                {(wireByCountry.get(country.slug)?.length ?? 0) > 0 && (
                  <div className="border-t border-rule bg-shell px-3 py-3">
                    <p className="mb-2 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute">
                      More on the wire
                    </p>
                    <ul className="space-y-2.5">
                      {wireByCountry.get(country.slug)!.slice(1).map((item) => (
                        <li key={item.id}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            <span className="block text-[0.6rem] font-extrabold uppercase tracking-[0.07em] text-ink-mute">
                              {item.source.name} · {timeAgo(item.publishedAt)}
                            </span>
                            <span className="clamp-2 block text-[0.8rem] font-semibold leading-[1.3] group-hover:text-brand">
                              {item.title}
                              <span className="ml-1 text-[0.66rem] font-normal text-ink-mute" aria-hidden>
                                ↗
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-rule px-3 py-2.5">
                  <Link
                    href={`/${country.slug}`}
                    className="inline-flex items-center gap-1.5 text-[0.74rem] font-bold hover:opacity-75"
                    style={{ color: country.accent }}
                  >
                    More {country.name} News
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </section>

          {/* ------------------------------------------------ Horn regional */}
          {horn.length > 0 && (
          <section>
            <SectionHead
              title="Horn of Africa"
              note="Stories that belong to more than one country"
              href="/horn"
            />
            {horn.length > 0 && (
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <StackedCard article={horn[0]} imageHeight="h-[236px]" />
                <div className="space-y-4">
                  {horn.slice(1, 5).map((a) => (
                    <RowCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}
          </section>
          )}

        </div>

        {/* ============================================ the single sidebar */}
        <aside className="space-y-5">
          <div className="panel p-4">
            <h2 className="text-[1rem] font-extrabold uppercase tracking-[0.06em]">
              Explore the Horn
            </h2>
            <p className="mt-1 text-[0.8rem] text-white/65">Click a country to see news</p>
            <div className="mt-2">
              <HornMap />
            </div>
            <Link
              href="/horn"
              className="mt-2 flex items-center justify-center gap-2 bg-brand py-2.5 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark"
            >
              View Regional Coverage
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
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

          {/* Between lg and xl the country blocks stack 2x2, which makes the
              main column ~660px taller than the sidebar. The wire rail fills
              exactly that band and is hidden again once the blocks go
              four-across and the columns even out on their own. */}
          <div className="hidden lg:block xl:hidden">
            <WireRail items={wireRail} />
          </div>

          <AdSlot position="sidebar" />
        </aside>
      </div>

      {/* -------------------------------------------------------------- Latest
          A full-width grid of cards. The article version of this section went
          when the articles did, and nothing replaced it, which is most of why
          the page felt short. */}
      {latestWire.length > 0 && (
        <section className="mt-9">
          <SectionHead
            title="Latest"
            href="/latest"
            hrefLabel="All"
            note="Newest headlines from across the Horn — links open at the publisher"
          />
          <div className="grid gap-x-7 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {latestWire.map((item) => (
              <WireCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <AdSlot position="homepage-mid" className="mt-9" />

      {/* ------------------------------------------------------------------
          Desk sections, from the wire.

          These used to be our own articles. The desk each headline belongs on
          is inferred from its text (see topic-tagger.ts) — imperfect, and
          about a third of items get no desk at all, which is why they simply
          do not appear here rather than being forced onto a desk.

          A desk with nothing recent is skipped entirely: an empty heading is
          worse than a shorter page.
      ------------------------------------------------------------------ */}
      {deskSections.map(({ slug, name, items }) => (
        <section key={slug} className="mt-10">
          <SectionHead
            title={name}
            href={`/${slug}`}
            hrefLabel="All"
            note="Headlines from other newsrooms — links open at the publisher"
          />
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <WireCard key={item.id} item={item} showExcerpt={false} />
            ))}
          </div>
        </section>
      ))}

      {/* ------------------------------------------------------------------
          Video
      ------------------------------------------------------------------ */}
      <section className="mt-10">
        <SectionHead title="Videos" href="/videos" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v) => (
            <article key={v.id} className="group">
              <Link href={`/videos/${v.slug}`} className="relative block overflow-hidden bg-shell">
                <EditorialImage
                  seed={v.imageSeed}
                  category="explained"
                  alt={v.title}
                  detail={false}
                  className="h-[150px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/90 pl-0.5 text-white">
                    <IconPlay className="h-4 w-4" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-[0.68rem] font-bold text-white">
                  {formatDuration(v.durationSec)}
                </span>
              </Link>
              <div className="pt-2.5">
                {v.country && (
                  <span className="text-[0.66rem] font-bold uppercase tracking-[0.09em] text-ink-mute">
                    <CountryFlag slug={v.country.slug} /> {v.country.name}
                  </span>
                )}
                <Link href={`/videos/${v.slug}`}>
                  <h3 className="hl clamp-2 mt-1 text-[0.95rem]">{v.title}</h3>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* The Wire used to sit here, eleventh on the page. It now runs directly
          under the top band — see the note there. */}

      {/* ------------------------------------------------------------------
          Top stories & categories tile strip
      ------------------------------------------------------------------ */}
      <section className="mt-10">
        <div className="card p-4 sm:p-5">
          <SectionHead
            title="Top Stories & Categories"
            href="/categories"
            hrefLabel="View all categories"
          />
          {/* Ten tiles: nine sections plus video. The column count matches so
              the strip stays a single row on wide screens. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
            {categoryTiles.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="group border border-rule transition-colors hover:border-ink"
              >
                <div className="flex items-center gap-1.5 border-b border-rule px-2 py-2">
                  <span className="chip" data-c={c.slug} style={{ padding: "0.12rem 0.3rem" }}>
                    {c.name.slice(0, 1)}
                  </span>
                  <span className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.05em]">
                    {c.name}
                  </span>
                </div>
                <EditorialImage
                  seed={`cat-${c.slug}`}
                  category={c.slug}
                  alt=""
                  detail={false}
                  className="h-[62px] w-full object-cover"
                />
                <p className="px-2 py-1.5 text-[0.68rem] text-ink-mute">
                  {c.count} {c.count === 1 ? "Article" : "Articles"}
                </p>
              </Link>
            ))}
            <Link
              href="/videos"
              className="group border border-rule transition-colors hover:border-ink"
            >
              <div className="flex items-center gap-1.5 border-b border-rule px-2 py-2">
                <span className="chip" data-c="politics" style={{ padding: "0.12rem 0.3rem" }}>
                  V
                </span>
                <span className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.05em]">
                  Videos
                </span>
              </div>
              <EditorialImage
                seed="cat-videos"
                category="horn"
                alt=""
                detail={false}
                className="h-[62px] w-full object-cover"
              />
              <p className="px-2 py-1.5 text-[0.68rem] text-ink-mute">{videos.length}+ Videos</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
