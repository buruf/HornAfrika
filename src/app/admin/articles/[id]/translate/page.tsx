import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@prisma/client";
import { db } from "@/lib/db";
import { can, getSession } from "@/lib/auth";
import { LOCALES, TRANSLATION_LOCALES } from "@/lib/locales";
import { formatDateTime } from "@/lib/format";
import { saveTranslation, setTranslationStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Translate" };

const ERRORS: Record<string, string> = {
  required: "A headline and body are required.",
  locale: "That is not a translatable language.",
  unreviewed:
    "A translation cannot be published until someone has reviewed it. Name the reviewer first — this is the rule that stops unchecked copy going live in a language the desk cannot read.",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#6b7c8c",
  REVIEW: "#a8730f",
  PUBLISHED: "#2f7a3f",
};

export default async function TranslatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string; saved?: string; moved?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "article.editAny")) redirect("/admin");

  const { id } = await params;
  const sp = await searchParams;

  const article = await db.article.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!article) notFound();

  const requested = (sp.locale?.toUpperCase() ?? "SO") as Locale;
  const active: Locale = TRANSLATION_LOCALES.includes(requested) ? requested : "SO";
  const info = LOCALES[active];
  const existing = article.translations.find((t) => t.locale === active);

  const field =
    "mt-1.5 w-full border border-rule-strong bg-white px-3 py-2 text-[0.9rem] outline-none focus:border-ink";
  const label =
    "block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/articles/${article.id}`}
          className="text-[0.8rem] font-bold text-ink-soft hover:text-brand"
        >
          ← Back to article
        </Link>
        <h1 className="text-[1.4rem] font-extrabold leading-tight tracking-[-0.03em]">
          Translate
        </h1>
      </div>

      <p className="max-w-3xl text-[0.92rem] leading-relaxed text-ink-soft">
        Each language has its own review state. An article being live in English says
        nothing about whether its {info.name} version has been read by someone who
        speaks {info.name} — so a translation is only served once it is published in
        its own right.
      </p>

      {/* ------------------------------------------------------ language tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TRANSLATION_LOCALES.map((l) => {
          const tr = article.translations.find((t) => t.locale === l);
          return (
            <Link
              key={l}
              href={`/admin/articles/${article.id}/translate?locale=${l}`}
              className={`flex items-center gap-2 border px-3 py-1.5 text-[0.78rem] font-bold transition-colors ${
                l === active
                  ? "border-ink bg-ink text-white"
                  : "border-rule-strong hover:border-ink"
              }`}
            >
              {LOCALES[l].nativeName}
              {tr && (
                <span
                  className="px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase text-white"
                  style={{ background: STATUS_COLOR[tr.status] }}
                >
                  {tr.status}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {sp.saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Saved.
        </p>
      )}
      {sp.moved && (
        <p className="mt-4 border-l-[3px] border-[#1b5fa8] bg-[#eff5fb] px-4 py-2.5 text-[0.88rem] text-[#134878]">
          Status updated.
        </p>
      )}
      {sp.error && ERRORS[sp.error] && (
        <p className="mt-4 border-l-[3px] border-brand bg-[#fdf0f1] px-4 py-2.5 text-[0.88rem] text-[#8a1020]">
          {ERRORS[sp.error]}
        </p>
      )}

      {/* --------------------------------------------------- workflow strip */}
      {existing && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border border-rule bg-white p-4">
          <div>
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              {info.name} status
            </p>
            <p className="mt-0.5 text-[0.85rem]">
              <span
                className="px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase text-white"
                style={{ background: STATUS_COLOR[existing.status] }}
              >
                {existing.status}
              </span>
              <span className="ml-2 text-ink-mute">
                updated {formatDateTime(existing.updatedAt)}
              </span>
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            {(["DRAFT", "REVIEW", "PUBLISHED"] as const)
              .filter((s) => s !== existing.status)
              .map((s) => (
                <form key={s} action={setTranslationStatus}>
                  <input type="hidden" name="articleId" value={article.id} />
                  <input type="hidden" name="locale" value={active} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-85"
                    style={{ background: STATUS_COLOR[s] }}
                  >
                    {s === "PUBLISHED" ? "Publish" : s}
                  </button>
                </form>
              ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------- side by side */}
      <form action={saveTranslation} className="mt-5">
        <input type="hidden" name="articleId" value={article.id} />
        <input type="hidden" name="locale" value={active} />

        <div className="grid gap-5 lg:grid-cols-2">
          {/* English source, read-only */}
          <div className="border border-rule bg-shell p-4">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              English source
            </p>
            <h2 className="mt-2 text-[1.05rem] font-extrabold leading-snug">
              {article.headline}
            </h2>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-soft">
              {article.deck}
            </p>
            <pre className="mt-3 max-h-[36rem] overflow-y-auto whitespace-pre-wrap font-[inherit] text-[0.86rem] leading-[1.7] text-ink-soft">
              {article.body}
            </pre>
          </div>

          {/* Target language */}
          <div
            className="border border-rule bg-white p-4"
            dir={info.dir}
            lang={info.tag}
          >
            <p
              className="text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute"
              dir="ltr"
            >
              {info.name} — {info.nativeName}
            </p>

            <div className="mt-2">
              <label className={label} dir="ltr" htmlFor="tr-headline">
                Headline
              </label>
              <input
                id="tr-headline"
                name="headline"
                required
                defaultValue={existing?.headline ?? ""}
                className={`${field} text-[1.02rem] font-bold`}
              />
            </div>

            <div className="mt-3">
              <label className={label} dir="ltr" htmlFor="tr-deck">
                Summary
              </label>
              <textarea
                id="tr-deck"
                name="deck"
                rows={2}
                defaultValue={existing?.deck ?? ""}
                className={field}
              />
            </div>

            <div className="mt-3">
              <label className={label} dir="ltr" htmlFor="tr-body">
                Body
              </label>
              <textarea
                id="tr-body"
                name="body"
                required
                rows={22}
                defaultValue={existing?.body ?? ""}
                className={`${field} leading-[1.7]`}
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- attribution */}
        <div className="mt-5 border border-rule bg-white p-4">
          <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">
            Attribution
          </h2>
          <p className="mt-1 text-[0.82rem] text-ink-mute">
            A translation cannot be published without a named reviewer.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="tr-by">
                Translated by
              </label>
              <input
                id="tr-by"
                name="translatedBy"
                defaultValue={existing?.translatedBy ?? ""}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="tr-rev">
                Reviewed by
              </label>
              <input
                id="tr-rev"
                name="reviewedBy"
                defaultValue={existing?.reviewedBy ?? ""}
                placeholder="Required before publishing"
                className={field}
              />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-[0.86rem]">
            <input
              type="checkbox"
              name="machineAssisted"
              defaultChecked={existing?.machineAssisted ?? false}
              className="h-4 w-4 accent-[#a8730f]"
            />
            A machine produced the first draft
          </label>
          <p className="mt-1 text-[0.78rem] text-ink-mute">
            Recorded so it is reviewable. Machine output is never published
            unreviewed.
          </p>
        </div>

        <button
          type="submit"
          className="mt-5 bg-brand px-6 py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-brand-dark"
        >
          Save {info.name}
        </button>
      </form>
    </div>
  );
}
