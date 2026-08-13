import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { applyToContribute } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report for Hornafrika",
  description:
    "Local reporters in Somalia, Ethiopia, Djibouti and Eritrea can register to contribute. Once we have verified you, you can file your own articles, and an editor reviews each one before publication.",
  alternates: { canonical: `${SITE.url}/contribute` },
};

const ERRORS: Record<string, string> = {
  required:
    "Please give your name, a working email, where you report from, and a few lines about yourself.",
  password: "Choose a password of at least 10 characters.",
  throttled:
    "Several applications have come from this connection already. Please try again later, or email newsroom@hornafrika.com.",
};

const field =
  "mt-1.5 w-full border border-rule-strong bg-white px-3 py-2.5 text-[0.95rem] outline-none focus:border-ink";
const label =
  "block text-[0.7rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";

export default async function ContributePage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string; error?: string }>;
}) {
  const { applied, error } = await searchParams;

  if (applied) {
    return (
      <div className="shell py-6">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Contribute" }]}
        />
        <PageHeader eyebrow="Thank you" title="Your application is with an editor" />
        <div className="mt-7 max-w-[46rem] space-y-4 text-[1rem] leading-[1.75] text-[#17293a]">
          <p>
            We read every application. Before opening an account we check that
            you are who you say you are — usually by looking at work you have
            already published, and sometimes by getting in touch.
          </p>
          <p>
            You will hear from us either way. If you have published work that is
            not online, or you would rather we contacted you another way, write
            to{" "}
            <a
              href="mailto:newsroom@hornafrika.com"
              className="font-semibold text-brand underline"
            >
              newsroom@hornafrika.com
            </a>
            .
          </p>
          <p className="border-l-[3px] border-rule-strong pl-4 text-[0.92rem] text-ink-soft">
            Until an editor has verified you, signing in will tell you the
            application is still being read. That is expected — nothing has gone
            wrong.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contribute" }]} />

      <PageHeader
        eyebrow="For reporters"
        title="Report for Hornafrika"
        blurb="If you are a reporter in Somalia, Ethiopia, Djibouti or Eritrea and would like to contribute to this website, you can do so by registering first — once you have been verified, you will be able to upload your own news articles, and each one is published after an editor has reviewed it."
      />

      <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {error && ERRORS[error] && (
            <p className="mb-5 border-l-[3px] border-brand bg-[#fdf0f1] px-4 py-3 text-[0.9rem] leading-relaxed text-[#8a1020]">
              {ERRORS[error]}
            </p>
          )}

          <form action={applyToContribute} className="border border-rule bg-white p-5">
            <h2 className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em]">
              Register
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="c-name">
                  Full name
                </label>
                <input id="c-name" name="name" required className={field} />
              </div>
              <div>
                <label className={label} htmlFor="c-location">
                  Where you report from
                </label>
                <input
                  id="c-location"
                  name="location"
                  required
                  placeholder="Hargeisa, Somaliland"
                  className={field}
                />
              </div>
              <div>
                <label className={label} htmlFor="c-email">
                  Email
                </label>
                <input
                  id="c-email"
                  name="email"
                  type="email"
                  required
                  className={field}
                />
              </div>
              <div>
                <label className={label} htmlFor="c-password">
                  Choose a password
                </label>
                <input
                  id="c-password"
                  name="password"
                  type="password"
                  required
                  minLength={10}
                  className={field}
                />
                <p className="mt-1 text-[0.76rem] text-ink-mute">
                  At least 10 characters. It only works once you are verified.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className={label} htmlFor="c-note">
                Who you are and what you cover
              </label>
              <textarea
                id="c-note"
                name="applicationNote"
                required
                rows={5}
                placeholder="Which outlets you have written for, the beats you follow, the languages you file in."
                className={field}
              />
            </div>

            <div className="mt-4">
              <label className={label} htmlFor="c-links">
                Links to published work
              </label>
              <textarea
                id="c-links"
                name="workLinks"
                rows={3}
                placeholder="One link per line. This is the main thing an editor looks at."
                className={field}
              />
            </div>

            <button
              type="submit"
              className="mt-5 bg-brand px-6 py-2.5 text-[0.78rem] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-brand-dark"
            >
              Apply to contribute
            </button>

            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-mute">
              Registering creates an account that cannot sign in until an editor
              has verified you. We store your name, email, location and what you
              tell us here, and nothing else.
            </p>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="border border-rule bg-white p-5">
            <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">
              How it works
            </h2>
            <ol className="mt-3 space-y-3 text-[0.88rem] leading-relaxed text-ink-soft">
              {[
                "You register, telling us who you are and where you report from.",
                "An editor verifies you — normally by reading work you have already published.",
                "Once verified, you can sign in and write articles in the newsroom system.",
                "You submit a piece for review. An editor reads it before anything goes live.",
                "When it publishes, it carries your byline and your own author page.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[0.68rem] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-rule bg-shell p-5">
            <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">
              What we look for
            </h2>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
              Reporting you can stand behind. We would rather have one story you
              have checked than five you have heard. Read our{" "}
              <Link
                href="/editorial-policy"
                className="font-semibold text-brand underline"
              >
                editorial standards
              </Link>{" "}
              before you file — particularly the parts on sourcing and on
              developing stories.
            </p>
          </div>

          <div className="border border-rule bg-shell p-5">
            <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">
              Your safety
            </h2>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
              Reporting in this region carries real risk. If publishing under
              your own name would put you in danger, say so in your application
              and we will discuss how to handle attribution before you file
              anything.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
