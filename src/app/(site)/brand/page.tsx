import type { Metadata } from "next";
import Link from "next/link";
import {
  MarkCape,
  MarkMasthead,
  MarkQuarters,
  MarkStrait,
  Wordmark,
  type Tone,
} from "@/components/brand";

export const metadata: Metadata = {
  title: "Logo options",
  robots: { index: false, follow: false },
};

type MarkFn = (p: { tone?: Tone; size?: number }) => React.ReactElement;

/** The mark now shipping across the site. */
const CHOSEN = "B";

const OPTIONS: {
  id: string;
  name: string;
  idea: string;
  strength: string;
  risk: string;
  Mark: MarkFn;
  /** Option A is typography only — no icon in the lockup. */
  wordmarkOnly?: boolean;
  rule?: boolean;
}[] = [
  {
    id: "A",
    name: "Masthead Rule",
    idea:
      "No symbol at all. The name, set tight and heavy, with a red rule under it — the way most serious newspapers sign themselves.",
    strength:
      "Fastest to read, impossible to date, and costs nothing to reproduce. A masthead earns authority by looking like a masthead.",
    risk:
      "No mark means nothing to put on an app icon or an avatar except an initial, which is the weakest part of this option.",
    Mark: MarkMasthead,
    wordmarkOnly: true,
    rule: true,
  },
  {
    id: "B",
    name: "The Cape",
    idea:
      "The actual outline of Somalia, Ethiopia, Djibouti and Eritrea, taken from the same boundary data the site's map uses.",
    strength:
      "It is literally the region, and it is honest — not a stylised Africa, but these four countries. Instantly meaningful to anyone from the Horn.",
    risk:
      "Territory is contested here. A silhouette takes a position on borders whether you intend it or not, and it turns to mush below about 20px.",
    Mark: MarkCape,
  },
  {
    id: "C",
    name: "The Strait",
    idea:
      "Two landmasses with a channel between them, which also reads as an H. The Bab el-Mandeb is the fact that explains most of the region's economics.",
    strength:
      "Works at any size down to a favicon, carries a real idea about the region, and sidesteps drawing any border.",
    risk: "Abstract enough that the meaning needs explaining once before it lands.",
    Mark: MarkStrait,
  },
  {
    id: "D",
    name: "Four Quarters",
    idea:
      "Four squares, one in the brand red — four countries, one platform, none of them subordinate.",
    strength:
      "The clearest expression of the editorial promise that all four countries are equal. Scales perfectly and reproduces anywhere.",
    risk:
      "Generic. A four-square grid is a common tech mark and says little about the Horn specifically.",
    Mark: MarkQuarters,
  },
];

function Swatch({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-ink-mute">
        {label}
      </p>
      <div
        className={`flex min-h-[92px] items-center justify-center border p-4 ${
          dark ? "border-navy-deep bg-navy-deep" : "border-rule bg-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="shell py-8">
      <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-brand">
        Brand
      </p>
      <h1 className="mt-1.5 text-[2.2rem] font-extrabold tracking-[-0.03em]">
        Logo options
      </h1>
      <p className="mt-3 max-w-3xl text-[1rem] leading-relaxed text-ink-soft">
        Four directions for the HORNAFRIKA mark. Each is shown as a full lockup, at
        the size it would actually sit in the site header, as a favicon, reversed on
        the dark panel colour, and in single-colour form for print and fax-quality
        reproduction. Nothing here introduces a second brand colour.
      </p>
      <p className="mt-2 max-w-3xl text-[0.88rem] text-ink-mute">
        The wordmark is real HTML text in the site&rsquo;s own font stack, so these are
        not mockups of the type — they are the type. Marks are SVG.
      </p>

      <div className="mt-10 space-y-12">
        {OPTIONS.map((opt) => {
          const { Mark } = opt;
          return (
            <section key={opt.id} className="border-t-[3px] border-ink pt-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center text-[0.9rem] font-extrabold text-white"
                  style={{ background: opt.id === CHOSEN ? "#c9182b" : "#0b1f33" }}
                >
                  {opt.id}
                </span>
                <h2 className="text-[1.5rem] font-extrabold tracking-[-0.02em]">
                  {opt.name}
                </h2>
                {opt.id === CHOSEN && (
                  <span className="bg-brand px-2 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-white">
                    Selected — in use
                  </span>
                )}
              </div>

              <div className="mt-3 grid gap-x-8 gap-y-2 lg:grid-cols-3">
                <p className="text-[0.92rem] leading-relaxed text-ink-soft">
                  <strong className="text-ink">The idea. </strong>
                  {opt.idea}
                </p>
                <p className="text-[0.92rem] leading-relaxed text-ink-soft">
                  <strong className="text-ink">Why it works. </strong>
                  {opt.strength}
                </p>
                <p className="text-[0.92rem] leading-relaxed text-ink-soft">
                  <strong className="text-ink">The catch. </strong>
                  {opt.risk}
                </p>
              </div>

              {/* ------------------------------------------------- primary */}
              <div className="mt-6 border border-rule bg-white p-8">
                <p className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-ink-mute">
                  Primary lockup
                </p>
                <div className="flex items-center gap-4">
                  {!opt.wordmarkOnly && <Mark size={62} />}
                  <Wordmark size={44} tagline rule={opt.rule} />
                </div>
              </div>

              {/* ------------------------------------------------ variants */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Swatch label="In the header (actual size)">
                  <div className="flex items-center gap-2.5">
                    {!opt.wordmarkOnly && <Mark size={34} />}
                    <Wordmark size={26} rule={opt.rule} />
                  </div>
                </Swatch>

                <Swatch label="Reversed on navy" dark>
                  <div className="flex items-center gap-2.5">
                    {!opt.wordmarkOnly && <Mark size={34} tone="dark" />}
                    <Wordmark size={26} tone="dark" rule={opt.rule} />
                  </div>
                </Swatch>

                <Swatch label="Single colour">
                  <div className="flex items-center gap-2.5">
                    {!opt.wordmarkOnly && <Mark size={34} tone="mono" />}
                    <Wordmark size={26} tone="mono" rule={opt.rule} />
                  </div>
                </Swatch>

                <Swatch label="App icon / favicon">
                  <div className="flex items-end gap-4">
                    <div className="text-center">
                      <Mark size={48} />
                      <p className="mt-1.5 text-[0.6rem] text-ink-mute">48</p>
                    </div>
                    <div className="text-center">
                      <Mark size={32} />
                      <p className="mt-1.5 text-[0.6rem] text-ink-mute">32</p>
                    </div>
                    <div className="text-center">
                      <Mark size={16} />
                      <p className="mt-1.5 text-[0.6rem] text-ink-mute">16</p>
                    </div>
                  </div>
                </Swatch>
              </div>

              {/* ------------------------------------------- in situ header */}
              <div className="mt-4 border border-rule">
                <div className="bg-navy-deep px-4 py-1.5 text-[0.62rem] font-semibold text-white/70">
                  Sunday, 9 August 2026
                </div>
                <div className="flex items-center gap-4 bg-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {!opt.wordmarkOnly && <Mark size={36} />}
                    <Wordmark size={27} tagline={opt.wordmarkOnly} rule={opt.rule} />
                  </div>
                  <nav className="ml-auto hidden items-center gap-4 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-ink-soft md:flex">
                    <span className="text-ink">Home</span>
                    <span>Somalia</span>
                    <span>Ethiopia</span>
                    <span>Djibouti</span>
                    <span>Eritrea</span>
                    <span>More</span>
                  </nav>
                </div>
                <div className="flex items-stretch border-t border-rule">
                  <span className="bg-brand px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-white">
                    Breaking News
                  </span>
                  <span className="flex items-center px-4 text-[0.78rem] font-semibold">
                    Ethiopia and Somalia Agree on New Framework for Cooperation
                  </span>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-14 border-t-[3px] border-ink pt-6">
        <h2 className="text-[1.2rem] font-extrabold">Side by side, at icon size</h2>
        <p className="mt-1.5 text-[0.9rem] text-ink-soft">
          This is the test most marks fail. A browser tab shows the icon at 16px.
        </p>
        <div className="mt-5 flex flex-wrap gap-8">
          {OPTIONS.map((opt) => {
            const { Mark } = opt;
            return (
              <div key={opt.id} className="text-center">
                <div className="flex items-end gap-3">
                  <Mark size={64} />
                  <Mark size={32} />
                  <Mark size={16} />
                </div>
                <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink-mute">
                  {opt.id} · {opt.name}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 border-l-[3px] border-brand bg-white p-6">
        <h2 className="text-[1.05rem] font-extrabold">
          Decision: B — The Cape
        </h2>
        <p className="mt-2 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft">
          The Cape is the mark. It is live in the site header, the footer, the CMS,
          the 404 page, the favicon and the Open Graph card. Two things were settled
          in the process of shipping it:
        </p>
        <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-[0.93rem] leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">It has two cuts.</strong> Below 28px the full
            coastline collapses, so the mark switches to a blunter silhouette with
            less padding. The favicon is rasterised from that cut at 48, 32 and 16px
            rather than downscaled, so the small sizes are pixel-fitted.
          </li>
          <li>
            <strong className="text-ink">Somaliland is inside Somalia&rsquo;s
            outline.</strong> That matches the position already set out in the{" "}
            <Link href="/editorial-policy" className="font-semibold text-brand underline">
              editorial policy
            </Link>
            , so the mark and the newsroom say the same thing. It is a real editorial
            position and worth knowing that the logo now carries it.
          </li>
        </ul>
        <p className="mt-4 text-[0.86rem] text-ink-mute">
          Regenerate the mark and icons after any boundary-data change with{" "}
          <code>node scripts/build-horn-map.mjs</code> then{" "}
          <code>node scripts/build-brand-icons.mjs</code>. This page is{" "}
          <code>noindex</code> and kept as the brand record —{" "}
          <Link href="/" className="font-semibold text-brand underline">
            back to the site
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
