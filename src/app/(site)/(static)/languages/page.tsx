import type { Metadata } from "next";
import Link from "next/link";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Languages",
  description:
    "Hornafrika publishes in English. Somali, Arabic, Amharic, Tigrinya and French are planned, and we are looking for translators.",
  alternates: { canonical: `${SITE.url}/languages` },
};

const PLANNED = [
  {
    name: "Somali",
    native: "Soomaali",
    why: "The first language of most readers in Somalia, Djibouti and the Somali Region of Ethiopia, and of much of the diaspora.",
  },
  {
    name: "Amharic",
    native: "አማርኛ",
    why: "Ethiopia's federal working language, and the largest single readership in the region.",
  },
  {
    name: "Arabic",
    native: "العربية",
    why: "An official language in both Somalia and Djibouti, and the language much of the Gulf coverage of this region is written in.",
  },
  {
    name: "Tigrinya",
    native: "ትግርኛ",
    why: "Spoken across Eritrea and Tigray — the part of the Horn our English coverage reaches least well.",
  },
  {
    name: "French",
    native: "Français",
    why: "Djibouti's administrative language, and the language of most Djiboutian public record.",
  },
];

export default function LanguagesPage() {
  return (
    <StaticPage
      eyebrow="Languages"
      title="We publish in English"
      blurb="A platform for the Horn of Africa should not be readable in only one of its languages. It currently is, and we would rather say so than pretend otherwise."
    >
      <H2>Where this stands</H2>
      <p>
        Every article on Hornafrika is written and published in English. There is no
        translated edition yet, and no machine-translated one either — an automatic
        translation of a contested security story is a good way to publish something we
        never said.
      </p>

      <H2>What is planned</H2>
      <div className="not-prose space-y-3">
        {PLANNED.map((l) => (
          <div key={l.name} className="border border-rule bg-white p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-[1rem] font-extrabold">{l.name}</h3>
              <span className="text-[0.9rem] text-ink-mute">{l.native}</span>
              <span className="ml-auto border border-rule-strong px-2 py-0.5 text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                Planned
              </span>
            </div>
            <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-soft">{l.why}</p>
          </div>
        ))}
      </div>

      <H2>The honest order</H2>
      <p>
        Interface translation is the easy half and the less useful one. A reader who
        cannot read the articles is not helped by a translated navigation bar. So
        languages will arrive a whole edition at a time — navigation, section pages and
        articles together — rather than as a switcher that changes the menus and leaves
        the journalism in English.
      </p>

      <H2>If you can help</H2>
      <p>
        We are looking for translators and, better still, reporters who file in these
        languages first. If that is you, write to{" "}
        <a
          href="mailto:newsroom@hornafrika.com"
          className="font-semibold text-brand underline"
        >
          newsroom@hornafrika.com
        </a>{" "}
        — see also{" "}
        <Link href="/careers" className="font-semibold text-brand underline">
          careers
        </Link>
        .
      </p>
    </StaticPage>
  );
}
