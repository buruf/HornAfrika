import type { Metadata } from "next";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the Hornafrika newsroom, advertising desk and technical team.",
  alternates: { canonical: `${SITE.url}/contact` },
};

const DESKS = [
  { name: "Newsroom", detail: "Story tips, press releases and interview requests.", email: "newsroom@hornafrika.com" },
  { name: "Corrections", detail: "Errors of fact in a published article.", email: "corrections@hornafrika.com" },
  { name: "Advertising", detail: "Sponsorship, display and partnership enquiries.", email: "advertising@hornafrika.com" },
  { name: "Careers", detail: "Applications and freelance pitches.", email: "careers@hornafrika.com" },
];

export default function ContactPage() {
  return (
    <StaticPage
      eyebrow="Get in touch"
      title="Contact"
      blurb="Reach the right desk directly. We read everything, and we reply to what we can."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {DESKS.map((d) => (
          <div key={d.name} className="border border-rule bg-white p-4">
            <h2 className="text-[1rem] font-extrabold">{d.name}</h2>
            <p className="mt-1 text-[0.88rem] text-ink-soft">{d.detail}</p>
            <a
              href={`mailto:${d.email}`}
              className="mt-2 inline-block text-[0.88rem] font-semibold text-brand underline"
            >
              {d.email}
            </a>
          </div>
        ))}
      </div>

      <H2>Sending us something sensitive</H2>
      <p>
        If you are sharing information that could put you at risk, do not send it from a
        work account or an account tied to your identity. Contact the newsroom first
        without details, and we will arrange a more secure channel.
      </p>

      <H2>Right of reply</H2>
      <p>
        If you or your organisation is the subject of an article and you believe it is
        inaccurate or incomplete, write to the corrections desk. We assess every request on
        the facts, and we publish corrections where we got something wrong.
      </p>
    </StaticPage>
  );
}
