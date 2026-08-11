import type { Metadata } from "next";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing use of Hornafrika.",
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage() {
  return (
    <StaticPage eyebrow="Legal" title="Terms of Use">
      <H2>Using this site</H2>
      <p>
        Hornafrika is free to read. You may link to our articles, quote briefly from them
        with attribution, and share them. You may not republish articles in full, or use
        our content to train commercial models, without written permission.
      </p>

      <H2>Accuracy</H2>
      <p>
        We work to publish accurate information and to correct errors quickly, but we make
        no warranty that every article is free of error. Articles labelled{" "}
        <strong>Developing Story</strong> describe situations still being confirmed.
      </p>

      <H2>Submissions</H2>
      <p>
        Material you send us — tips, pitches, photographs — may be used in our reporting.
        Sending us material does not create an employment or commissioning relationship, and
        does not guarantee publication or payment. Commissioned work is agreed in writing.
      </p>

      <H2>External links</H2>
      <p>
        We link to external sites where they are relevant. We are not responsible for their
        content or their privacy practices.
      </p>

      <H2>Advertising</H2>
      <p>
        Advertisements are labelled. An advertisement appearing alongside an article implies
        no relationship between the advertiser and the article.
      </p>

      <H2>Changes</H2>
      <p>These terms may change. Material changes will be noted on this page.</p>
    </StaticPage>
  );
}
