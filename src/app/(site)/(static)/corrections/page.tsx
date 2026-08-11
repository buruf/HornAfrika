import type { Metadata } from "next";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "Hornafrika corrects errors of fact promptly and publicly. Published corrections are listed here.",
  alternates: { canonical: `${SITE.url}/corrections` },
};

export default function CorrectionsPage() {
  return (
    <StaticPage
      eyebrow="Accountability"
      title="Corrections"
      blurb="We correct errors of fact promptly and publicly. Every correction is logged here and noted on the article itself."
    >
      <H2>How to report an error</H2>
      <p>
        Write to{" "}
        <a href="mailto:corrections@hornafrika.com" className="font-semibold text-brand underline">
          corrections@hornafrika.com
        </a>{" "}
        with the article headline, the specific claim you believe is wrong, and — where you
        can — a source. We assess every request on the facts.
      </p>

      <H2>What we correct</H2>
      <p>
        Errors of fact: names, titles, dates, figures, locations, sequences of events, and
        attributions. We also correct headlines that misrepresent the article beneath them.
      </p>
      <p>
        We do not remove accurate reporting because a subject dislikes it. Where a subject
        disputes an accurate article, we will publish a right of reply rather than delete
        the piece.
      </p>

      <H2>How corrections appear</H2>
      <p>
        A corrected article carries an updated timestamp, and the correction is described
        at the foot of the article. Substantive corrections are also listed on this page.
        We do not silently edit published articles.
      </p>

      <H2>Correction log</H2>
      <div className="border border-rule bg-white p-6 text-center">
        <p className="text-[0.95rem] text-ink-soft">
          No corrections have been published yet.
        </p>
        <p className="mt-1.5 text-[0.85rem] text-ink-mute">
          This log is populated automatically as corrections are issued.
        </p>
      </div>
    </StaticPage>
  );
}
