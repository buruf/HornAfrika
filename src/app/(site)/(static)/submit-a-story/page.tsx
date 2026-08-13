import type { Metadata } from "next";
import Link from "next/link";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Submit a Story",
  description: "Send Hornafrika a story tip, a pitch, or a correction.",
  alternates: { canonical: `${SITE.url}/submit-a-story` },
};

export default function SubmitStoryPage() {
  return (
    <StaticPage
      eyebrow="Share your story"
      title="Submit a Story"
      blurb="Tips, pitches and documents from across the Horn and its diaspora."
    >
      <H2>Story tips</H2>
      <p>
        If you know about something we should be covering, tell us what it is, where it is,
        and how you know. Tips do not need to be complete — we will do the reporting. Write
        to{" "}
        <a href="mailto:newsroom@hornafrika.com" className="font-semibold text-brand underline">
          newsroom@hornafrika.com
        </a>
        .
      </p>

      <H2>Before you send something sensitive</H2>
      <p>
        Do not use a work account, a device belonging to your employer, or a network you do
        not control. Contact the newsroom first without details and we will arrange a more
        secure channel. If sending information could put you at risk, weigh that carefully
        before you send anything at all.
      </p>

      <H2>Pitches from journalists</H2>
      <p>
        We commission freelance reporting. A good pitch says what the story is, why it
        matters now, who you can reach, what you can verify, and what it will cost. Send
        pitches to{" "}
        <a href="mailto:newsroom@hornafrika.com" className="font-semibold text-brand underline">
          newsroom@hornafrika.com
        </a>{" "}
        with <em>Pitch</em> in the subject line.
      </p>

      <H2>Reporters in the region</H2>
      <p>
        If you are a reporter in Somalia, Ethiopia, Djibouti or Eritrea and would
        like to contribute to this website, you can do so by{" "}
        <Link href="/contribute" className="font-semibold text-brand underline">
          registering first
        </Link>{" "}
        — once you have been verified, you will be able to upload your own news
        articles, and each one is published after an editor has reviewed it.
      </p>

      <H2>Contributor submissions</H2>
      <p>
        Verified contributors file drafts directly in our newsroom system, and those
        drafts enter the editorial review queue. Everything submitted is read by an
        editor before it can be published — nothing goes live unreviewed.
      </p>

      <H2>What we will not publish</H2>
      <p>
        Unverifiable claims presented as fact, material intended to identify or endanger a
        private individual, and content produced on behalf of a government, party or armed
        group without disclosure. See our{" "}
        <Link href="/editorial-policy" className="font-semibold text-brand underline">
          editorial policy
        </Link>
        .
      </p>
    </StaticPage>
  );
}
