import type { Metadata } from "next";
import Link from "next/link";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Hornafrika",
  description:
    "Hornafrika is an independent news and information platform for Somalia, Ethiopia, Djibouti and Eritrea — the four countries of the Horn of Africa.",
  alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="Who we are"
      title="About Hornafrika"
      blurb="An independent news and information platform for the Horn of Africa — Somalia, Ethiopia, Djibouti and Eritrea."
    >
      <H2>What we are building</H2>
      <p>
        Most coverage of this region is organised by country, and most of it is written
        from somewhere else. The result is that a reader trying to understand the Horn has
        to assemble it from four separate national conversations and a scattering of
        foreign-desk dispatches.
      </p>
      <p>
        Hornafrika is built on the opposite assumption: that the Horn of Africa is one
        region with four countries in it, and that the most consequential stories —
        ports, the Red Sea, migration, trade corridors, water, security — do not stop at
        a border.
      </p>

      <H2>Four first-class countries</H2>
      <p>
        Somalia, Ethiopia, Djibouti and Eritrea each have a full section, their own
        regional breakdowns, and equal standing on the homepage. Editorial prominence
        follows what matters, not what happens to be easiest to cover.
      </p>

      <H2>What we publish</H2>
      <p>
        Politics, business, economy, security, society, culture and sport, alongside three
        formats we think the region is short of: <Link href="/explained" className="font-semibold text-brand underline">Explained</Link>,
        which gives the background behind a story;{" "}
        <Link href="/people" className="font-semibold text-brand underline">People of the Horn</Link>,
        which profiles the people building things here; and{" "}
        <Link href="/horn" className="font-semibold text-brand underline">Horn of Africa</Link>,
        for the stories that belong to more than one country.
      </p>

      <H2>How we report</H2>
      <p>
        Carefully, and with our sourcing visible. Our{" "}
        <Link href="/editorial-policy" className="font-semibold text-brand underline">
          editorial policy
        </Link>{" "}
        sets out how we handle contested claims, developing stories, corrections and the
        use of AI tools.
      </p>

      <H2>Independence</H2>
      <p>
        Hornafrika is independent of any government, political party or armed group in the
        region. Advertising is labelled and separated from editorial decisions.
      </p>

      <H2>Get in touch</H2>
      <p>
        Story tips, corrections, advertising enquiries and job applications all go through
        the <Link href="/contact" className="font-semibold text-brand underline">contact page</Link>.
      </p>
    </StaticPage>
  );
}
