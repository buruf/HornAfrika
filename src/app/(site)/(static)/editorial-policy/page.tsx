import type { Metadata } from "next";
import Link from "next/link";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How Hornafrika reports: sourcing, verification, corrections, the labelling of developing stories, and our rules on the use of AI.",
  alternates: { canonical: `${SITE.url}/editorial-policy` },
};

export default function EditorialPolicyPage() {
  return (
    <StaticPage
      eyebrow="Standards"
      title="Editorial Policy"
      blurb="Hornafrika covers a region where reporting is frequently contested and access is frequently limited. These are the rules we hold ourselves to."
    >
      <H2>Accuracy before speed</H2>
      <p>
        We would rather be second and correct than first and wrong. In the Horn of
        Africa, early reports are routinely revised — casualty figures change, claimed
        territorial gains are reversed, and every party to a dispute has an incentive to
        overstate. We publish what we can stand behind.
      </p>

      <H2>Sourcing</H2>
      <p>
        Every factual claim must be attributable. Where a claim comes from an official
        statement rather than independent observation, we say so on the page. Where we
        cannot corroborate a claim, we either attribute it explicitly or leave it out.
      </p>
      <p>
        We do not publish casualty counts, territorial claims or operational details from
        any party to a conflict — government, allied force or armed group — as established
        fact unless independently corroborated.
      </p>

      <H2>Developing stories</H2>
      <p>
        Articles about events still unfolding carry a <strong>Developing Story</strong>{" "}
        label. That label means details are being confirmed and the report will change. It
        is not a disclaimer for publishing rumour.
      </p>

      <H2>Corrections</H2>
      <p>
        We correct errors of fact promptly and publicly. Corrections are logged on the{" "}
        <Link href="/corrections" className="font-semibold text-brand underline">
          corrections page
        </Link>{" "}
        and noted on the article itself. Every article shows its publication time and, if
        it has been revised, its last-updated time.
      </p>

      <H2>Bylines</H2>
      <p>
        Every article is attributed. Work by a named journalist is signed by that
        journalist, who has a public profile showing their beat, location and previous
        work. Background and context written in-house carries the byline{" "}
        <strong>Hornafrika Desk</strong>.
      </p>
      <p>
        A desk byline means no individual reporter stands behind the piece. We use it
        rather than inventing a name. Nothing here is signed by a journalist who does
        not exist, and no real person&rsquo;s name is attached to work they did not do.
      </p>

      <H2>Independence</H2>
      <p>
        Hornafrika is independent of any government, party or armed group in the region.
        Advertising is clearly labelled and is never permitted to influence, preview or
        suppress editorial content. Sponsored material is marked as sponsored.
      </p>

      <H2>The four countries</H2>
      <p>
        Somalia, Ethiopia, Djibouti and Eritrea are treated as equal subjects. Editorial
        prominence follows the significance of a story, not the volume of content
        available about a given country. Where a story involves more than one country, we
        file it to all of them rather than framing it from a single capital.
      </p>

      <H2>Contested names and status</H2>
      <p>
        The Horn contains disputes over territory, status and naming. Where a name or
        status is contested we say so plainly, describe the competing positions, and avoid
        wording that implies a resolution the parties have not reached.
      </p>

      <H2>Artificial intelligence</H2>
      <p>
        AI tools may assist our journalists with research, translation, transcription and
        editing. They do not replace reporting. No published factual claim, quotation,
        statistic or source rests on AI generation. We never present AI-generated text as
        an eyewitness account, an interview, or a source.
      </p>
      <p>
        Where imagery is illustrative rather than photographic, it is captioned as an
        editorial graphic. We do not publish synthetic images that could be mistaken for
        photographs of real events.
      </p>

      <H2>Aggregated headlines</H2>
      <p>
        Alongside our own reporting we run{" "}
        <Link href="/wire" className="font-semibold text-brand underline">
          The Wire
        </Link>
        , a feed of headlines published by other newsrooms. We store a headline, a short
        extract and a link. We never republish full articles, never rewrite another
        newsroom&rsquo;s headline into our own voice, and never present anyone
        else&rsquo;s reporting as ours.
      </p>
      <p>
        Wire content is kept visually and structurally separate from our journalism: it
        has its own section, always names the publisher, never appears in Trending or in
        a homepage lead slot, and never mixes into our article feeds. If it is on the
        wire, we did not report it. Which sources we use, how we fetch them, and how a
        publisher can opt out are set out in{" "}
        <Link href="/wire/about" className="font-semibold text-brand underline">
          how the wire works
        </Link>
        .
      </p>

      <H2>Launch scaffolding</H2>
      <p>
        Articles marked as launch scaffolding were written from documented regional
        background to populate the platform before the newsroom began publishing. They
        contain no sourced quotes and no original reporting, they are labelled as such at
        the foot of the article, and they are replaced as real reporting arrives.
      </p>

      <H2>Contact</H2>
      <p>
        Questions about this policy, or about a specific article, can be sent through the{" "}
        <Link href="/contact" className="font-semibold text-brand underline">
          contact page
        </Link>
        .
      </p>
    </StaticPage>
  );
}
