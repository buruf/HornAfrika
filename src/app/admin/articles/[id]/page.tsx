import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  allowedTransitions,
  can,
  canEditArticle,
  getSession,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/auth";
import { getFormOptions } from "@/lib/admin-options";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { WorkflowBar } from "@/components/admin/WorkflowBar";
import { deleteArticle } from "@/app/admin/articles/actions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit article" };

const ERRORS: Record<string, string> = {
  required: "A headline and body are required.",
  forbidden: "You do not have permission to edit this article at its current stage.",
  transition: "That workflow move is not permitted from the current status.",
};

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; moved?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const { saved, moved, error } = await searchParams;

  const [article, options, me] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: {
        countries: true,
        topics: true,
        author: true,
        editorialLog: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
        _count: { select: { views: true } },
      },
    }),
    getFormOptions(),
    db.user.findUnique({ where: { id: session.userId }, select: { authorId: true } }),
  ]);

  if (!article) notFound();

  const editable = canEditArticle(session, article, me?.authorId ?? null);
  const moves = allowedTransitions(session.role, article.status);

  const countrySlug =
    options.countries.find((c) => c.id === article.countryId)?.slug ?? "horn";
  const categorySlug =
    options.categories.find((c) => c.id === article.categoryId)?.slug ?? "news";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/admin/articles" className="text-[0.8rem] font-bold text-ink-soft hover:text-brand">
          ← Articles
        </Link>
        <span
          className="px-2 py-0.5 text-[0.64rem] font-extrabold uppercase tracking-[0.07em] text-white"
          style={{ background: STATUS_COLOR[article.status] }}
        >
          {STATUS_LABEL[article.status]}
        </span>
        {article.isSeed && (
          <span className="border border-rule-strong px-2 py-0.5 text-[0.64rem] font-extrabold uppercase tracking-[0.07em] text-ink-mute">
            Launch scaffolding
          </span>
        )}
        <span className="text-[0.78rem] text-ink-mute">
          {article._count.views.toLocaleString("en-GB")} reads
        </span>
        {(article.status === "PUBLISHED" || article.status === "UPDATED") && (
          <Link
            href={`/${countrySlug}/${categorySlug}/${article.slug}`}
            target="_blank"
            className="text-[0.78rem] font-bold text-brand"
          >
            View live ↗
          </Link>
        )}
      </div>

      <h1 className="text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em]">
        {article.headline}
      </h1>

      {saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Saved.
        </p>
      )}
      {moved && (
        <p className="mt-4 border-l-[3px] border-[#1b5fa8] bg-[#eff5fb] px-4 py-2.5 text-[0.88rem] text-[#134878]">
          Status updated to {STATUS_LABEL[article.status].toLowerCase()}.
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-4 border-l-[3px] border-brand bg-[#fdf0f1] px-4 py-2.5 text-[0.88rem] text-[#8a1020]">
          {ERRORS[error]}
        </p>
      )}

      {/* ------------------------------------------------------- workflow bar */}
      <div className="mt-5 border border-rule bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div>
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              Editorial workflow
            </p>
            <p className="mt-0.5 text-[0.82rem] text-ink-soft">
              Draft → Review → Approved → Published → Updated → Archived
            </p>
          </div>

          <WorkflowBar
            id={article.id}
            moves={moves}
            labels={STATUS_LABEL}
            colors={STATUS_COLOR}
          />
        </div>
      </div>

      {!editable && (
        <p className="mt-4 border-l-[3px] border-[#a8730f] bg-[#fdf8ec] px-4 py-2.5 text-[0.88rem] text-[#6b5312]">
          This article is read-only for you at its current stage. An editor can still make
          changes.
        </p>
      )}

      <div className="mt-6">
        {editable ? (
          <ArticleForm
            options={options}
            canEditAny={can(session.role, "article.editAny")}
            canManageHomepage={can(session.role, "homepage.manage")}
            values={{
              id: article.id,
              headline: article.headline,
              slug: article.slug,
              deck: article.deck,
              body: article.body,
              countryId: article.countryId ?? "",
              regionId: article.regionId ?? "",
              categoryId: article.categoryId,
              subcategoryId: article.subcategoryId ?? "",
              authorId: article.authorId,
              placement: article.placement,
              isBreaking: article.isBreaking,
              isDeveloping: article.isDeveloping,
              imageSeed: article.imageSeed,
              imageUrl: article.imageUrl ?? "",
              imageCaption: article.imageCaption,
              imageCredit: article.imageCredit ?? "",
              sourceNote: article.sourceNote ?? "",
              seoTitle: article.seoTitle ?? "",
              seoDescription: article.seoDescription ?? "",
              canonicalUrl: article.canonicalUrl ?? "",
              countryIds: article.countries.map((c) => c.countryId),
              topicIds: article.topics.map((t) => t.topicId),
            }}
          />
        ) : (
          <div className="border border-rule bg-white p-6">
            <p className="text-[1rem] leading-relaxed text-ink-soft">{article.deck}</p>
            <pre className="mt-4 whitespace-pre-wrap font-[inherit] text-[0.95rem] leading-[1.7]">
              {article.body}
            </pre>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------- audit log */}
      <section className="mt-8 max-w-3xl">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          Editorial history
        </h2>
        <div className="border border-rule bg-white">
          {article.editorialLog.map((l) => (
            <div key={l.id} className="border-b border-rule px-4 py-3 last:border-b-0">
              <p className="text-[0.85rem]">
                <span className="font-bold">{l.user?.name ?? "System"}</span>
                {l.fromStatus ? (
                  <>
                    {" "}
                    moved this from{" "}
                    <span className="font-semibold">{STATUS_LABEL[l.fromStatus]}</span> to{" "}
                    <span className="font-semibold">{STATUS_LABEL[l.toStatus]}</span>
                  </>
                ) : (
                  <> set the status to <span className="font-semibold">{STATUS_LABEL[l.toStatus]}</span></>
                )}
              </p>
              {l.note && <p className="mt-0.5 text-[0.83rem] text-ink-soft">“{l.note}”</p>}
              <p className="mt-0.5 text-[0.74rem] text-ink-mute">{formatDateTime(l.createdAt)}</p>
            </div>
          ))}
          {article.editorialLog.length === 0 && (
            <p className="px-4 py-5 text-[0.85rem] text-ink-mute">No history recorded.</p>
          )}
        </div>
      </section>

      {can(session.role, "article.delete") && (
        <section className="mt-8 max-w-3xl border border-[#e0b8bc] bg-[#fdf6f7] p-4">
          <h2 className="text-[0.8rem] font-extrabold uppercase tracking-[0.09em] text-[#8a1020]">
            Delete permanently
          </h2>
          <p className="mt-1 text-[0.84rem] text-ink-soft">
            Archiving is almost always the right choice — it keeps the record and the audit
            trail. Deletion is irreversible and removes the readership history with it.
          </p>
          <form action={deleteArticle} className="mt-3">
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              className="border border-[#8a1020] px-3 py-1.5 text-[0.74rem] font-extrabold uppercase tracking-[0.06em] text-[#8a1020] transition-colors hover:bg-[#8a1020] hover:text-white"
            >
              Delete article
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
