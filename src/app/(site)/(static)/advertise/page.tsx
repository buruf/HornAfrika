import type { Metadata } from "next";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Advertising and partnership opportunities on Hornafrika, the news and information platform for the Horn of Africa.",
  alternates: { canonical: `${SITE.url}/advertise` },
};

const PLACEMENTS = [
  { name: "Header", detail: "A single leaderboard beneath the masthead. One advertiser at a time." },
  { name: "Homepage mid-page", detail: "Between editorial sections, never inside them." },
  { name: "Sidebar", detail: "Alongside trending and newsletter modules on section pages." },
  { name: "In-article", detail: "One unit, placed after the body copy rather than inside it." },
  { name: "Footer", detail: "A closing leaderboard above the site footer." },
];

export default function AdvertisePage() {
  return (
    <StaticPage
      eyebrow="Work with us"
      title="Advertise"
      blurb="Reach readers across Somalia, Ethiopia, Djibouti, Eritrea and the Horn's diaspora — without interrupting them."
    >
      <H2>How we handle advertising</H2>
      <p>
        Advertising funds the reporting, and it is designed around the reader rather than
        the impression count. We do not run interstitials, auto-playing video, pop-ups, or
        units that shift the page while it loads. Empty inventory collapses; we do not fill
        space for the sake of it.
      </p>
      <p>
        Advertising has no influence on editorial decisions. Advertisers do not see articles
        before publication and cannot request that a story be changed or withheld.
      </p>

      <H2>Available placements</H2>
      <div className="not-prose space-y-3">
        {PLACEMENTS.map((p) => (
          <div key={p.name} className="border border-rule bg-white p-4">
            <h3 className="text-[0.95rem] font-extrabold">{p.name}</h3>
            <p className="mt-1 text-[0.87rem] text-ink-soft">{p.detail}</p>
          </div>
        ))}
      </div>

      <H2>Targeting</H2>
      <p>
        Campaigns can be placed across the whole platform, or scoped to a country section, a
        region, or an editorial desk — for example business coverage only, or Djibouti only.
      </p>

      <H2>Sponsored content</H2>
      <p>
        We accept clearly labelled sponsored articles. They are visually distinct from
        editorial, carry a permanent sponsorship label, and are excluded from trending and
        from the homepage lead positions.
      </p>

      <H2>Enquiries</H2>
      <p>
        Write to{" "}
        <a href="mailto:advertising@hornafrika.com" className="font-semibold text-brand underline">
          advertising@hornafrika.com
        </a>{" "}
        with your campaign, target market and timing.
      </p>
    </StaticPage>
  );
}
