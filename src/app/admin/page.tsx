import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, ROLE_LABEL, ROLE_SUMMARY, STATUS_COLOR, STATUS_LABEL, can } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const WORKFLOW = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "UPDATED", "ARCHIVED"] as const;

export default async function AdminOverview() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [counts, recent, log, subs, views24h, seedCount] = await Promise.all([
    db.article.groupBy({ by: ["status"], _count: { status: true } }),
    db.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { author: true, category: true, country: true },
    }),
    db.editorialLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { article: { select: { headline: true, slug: true } }, user: true },
    }),
    db.newsletterSub.count(),
    db.articleView.count({
      where: { viewedAt: { gte: new Date(Date.now() - 86400000) } },
    }),
    db.article.count({ where: { isSeed: true } }),
  ]);

  const byStatus = new Map(counts.map((c) => [c.status, c._count.status]));
  const total = counts.reduce((n, c) => n + c._count.status, 0);

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">
        Welcome, {session.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-[0.9rem] text-ink-soft">
        {ROLE_LABEL[session.role]} — {ROLE_SUMMARY[session.role]}
      </p>

      {/* ---------------------------------------------------- workflow board */}
      <section className="mt-7">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          Editorial workflow
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {WORKFLOW.map((s) => (
            <Link
              key={s}
              href={`/admin/articles?status=${s}`}
              className="border border-rule bg-white p-4 transition-colors hover:border-ink"
              style={{ borderTop: `3px solid ${STATUS_COLOR[s]}` }}
            >
              <p className="text-[1.7rem] font-extrabold leading-none">{byStatus.get(s) ?? 0}</p>
              <p className="mt-1 text-[0.75rem] font-bold uppercase tracking-[0.05em] text-ink-soft">
                {STATUS_LABEL[s]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ stats */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total articles", value: total },
          { label: "Reads (24h)", value: views24h.toLocaleString("en-GB") },
          { label: "Newsletter subscribers", value: subs },
          { label: "Launch scaffolding", value: seedCount },
        ].map((s) => (
          <div key={s.label} className="border border-rule bg-white p-4">
            <p className="text-[1.4rem] font-extrabold leading-none">{s.value}</p>
            <p className="mt-1.5 text-[0.75rem] text-ink-mute">{s.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* -------------------------------------------------- recent edits */}
        <section>
          <div className="mb-3 flex items-center">
            <h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
              Recently updated
            </h2>
            {can(session.role, "article.create") && (
              <Link
                href="/admin/articles/new"
                className="ml-auto bg-brand px-3 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-brand-dark"
              >
                New article
              </Link>
            )}
          </div>
          <div className="border border-rule bg-white">
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/admin/articles/${a.id}`}
                className="flex items-start gap-3 border-b border-rule p-3.5 last:border-b-0 hover:bg-shell"
              >
                <span
                  className="mt-1 shrink-0 px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.06em] text-white"
                  style={{ background: STATUS_COLOR[a.status] }}
                >
                  {STATUS_LABEL[a.status]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.9rem] font-bold">{a.headline}</span>
                  <span className="mt-0.5 block text-[0.74rem] text-ink-mute">
                    {a.country?.name ?? "Horn of Africa"} · {a.category.name} ·{" "}
                    {a.author.name} · {formatDateTime(a.updatedAt)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- audit trail */}
        <section>
          <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Workflow activity
          </h2>
          <div className="border border-rule bg-white">
            {log.map((l) => (
              <div key={l.id} className="border-b border-rule p-3.5 last:border-b-0">
                <p className="text-[0.82rem]">
                  <span className="font-bold">{l.user?.name ?? "System"}</span>{" "}
                  <span className="text-ink-soft">
                    moved to {STATUS_LABEL[l.toStatus].toLowerCase()}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-[0.78rem] text-ink-soft">
                  {l.article.headline}
                </p>
                <p className="mt-0.5 text-[0.72rem] text-ink-mute">
                  {formatDateTime(l.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
