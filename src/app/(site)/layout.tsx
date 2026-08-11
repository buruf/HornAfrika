import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BreakingTicker } from "@/components/BreakingTicker";
import { getBreaking } from "@/lib/queries";
import { articleHref } from "@/lib/format";
import { SITE } from "@/lib/site";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breaking = await getBreaking();

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

      {breaking.length > 0 && (
        <BreakingTicker
          items={breaking.map((a) => ({
            href: articleHref(a),
            headline: a.headline,
          }))}
        />
      )}

      <main id="main">{children}</main>

      <SiteFooter />
    </>
  );
}
