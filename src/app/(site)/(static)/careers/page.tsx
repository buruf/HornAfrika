import type { Metadata } from "next";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Hornafrika — reporting, editing and engineering roles across the Horn of Africa.",
  alternates: { canonical: `${SITE.url}/careers` },
};

const ROLES = [
  { title: "Correspondent — Somalia", location: "Mogadishu", type: "Full time" },
  { title: "Correspondent — Ethiopia", location: "Addis Ababa", type: "Full time" },
  { title: "Business Reporter", location: "Djibouti City or Addis Ababa", type: "Full time" },
  { title: "Video Producer", location: "Nairobi or remote", type: "Full time" },
  { title: "Freelance Contributors", location: "Across the Horn and diaspora", type: "Freelance" },
];

export default function CareersPage() {
  return (
    <StaticPage
      eyebrow="Join our team"
      title="Careers"
      blurb="We are building a newsroom that treats the Horn of Africa as one region. If that is the work you want to do, we would like to hear from you."
    >
      <H2>Open roles</H2>
      <div className="not-prose space-y-3">
        {ROLES.map((r) => (
          <div key={r.title} className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-rule bg-white p-4">
            <h3 className="text-[0.98rem] font-extrabold">{r.title}</h3>
            <span className="text-[0.82rem] text-ink-mute">{r.location}</span>
            <span className="ml-auto border border-rule-strong px-2 py-0.5 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-ink-soft">
              {r.type}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[0.85rem] text-ink-mute">
        Roles listed here are indicative of the newsroom we are building. Confirm current
        openings with the careers desk before applying.
      </p>

      <H2>What we look for</H2>
      <p>
        Reporters with genuine access and genuine caution. Language ability across Somali,
        Amharic, Tigrinya, Arabic, French and English is valued. So is a habit of checking
        a claim before repeating it.
      </p>

      <H2>Freelance</H2>
      <p>
        We commission freelance reporting from across the four countries and the diaspora.
        Pitches should say what the story is, why now, who you can reach, and what you can
        verify.
      </p>

      <H2>Applying</H2>
      <p>
        Send a short note and three examples of your work to{" "}
        <a href="mailto:careers@hornafrika.com" className="font-semibold text-brand underline">
          careers@hornafrika.com
        </a>
        .
      </p>
    </StaticPage>
  );
}
