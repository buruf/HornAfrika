import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BreakingTicker } from "@/components/BreakingTicker";
import { getBreaking, getCountries } from "@/lib/queries";
import { balanceByCountry, getWire, spreadSources } from "@/lib/wire";
import { buildTickerItems } from "@/lib/ticker";
import { articleHref } from "@/lib/format";
import { SITE } from "@/lib/site";

/**
 * Every page under this layout is rendered per request.
 *
 * The header carries a live breaking-news ticker, so nothing here can be
 * meaningfully prerendered — and without this, Next tried to build the static
 * pages at compile time, which made the *build* depend on the database being
 * reachable. A paused database or a network blip would then fail a deploy on a
 * site that has no genuinely static pages to begin with.
 */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The ticker is chrome, not content. If the database is briefly unreachable
  // the right outcome is a page without a ticker, not an error page.
  // The strip carries editor-flagged stories while they are still current,
  // and the newest wire headlines the rest of the time. Without the second
  // half it advertised a five-day-old story as breaking news, because nothing
  // had been flagged since.
  let tickerItems: ReturnType<typeof buildTickerItems> = [];
  try {
    const [breaking, pool, countries] = await Promise.all([
      getBreaking(),
      getWire({ take: 60 }),
      getCountries(),
    ]);
    // Dealt round-robin, or the strip is eight Somali headlines: those outlets
    // publish most, so straight recency hands them the whole ticker.
    const wire = spreadSources(
      balanceByCountry(pool, 8, countries.map((c) => c.slug)),
    );
    tickerItems = buildTickerItems(
      breaking.map((a) => ({
        headline: a.headline,
        publishedAt: a.publishedAt,
        href: articleHref(a),
      })),
      wire,
    );
  } catch (err) {
    console.error("Breaking ticker unavailable:", err);
  }

  const organisationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE.name,
    url: SITE.url,
    slogan: SITE.tagline,
    description: SITE.description,
    areaServed: ["Somalia", "Ethiopia", "Djibouti", "Eritrea"],
    ethicsPolicy: `${SITE.url}/editorial-policy`,
    correctionsPolicy: `${SITE.url}/corrections`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader />

      {tickerItems.length > 0 && <BreakingTicker items={tickerItems} />}

      <main id="main">{children}</main>

      <SiteFooter />
    </>
  );
}
