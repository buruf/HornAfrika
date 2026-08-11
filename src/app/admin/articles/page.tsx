import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession, STATUS_COLOR, STATUS_LABEL, can } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

const STATUSES = ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "UPDATED", "ARCHIVED"] as const;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; mine?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const status = STATUSES.includes(sp.status as never) ? sp.status : undefined;
  const q = (sp.q ?? "").trim();

  const me = await db.user.findUnique({
    where: { id: session.userId },
    select: { authorId: true },
  });

  // A journalist or contributor only ever sees their own work.
  const restrictToOwn = !can(session.role, "article.editAny");
  const mine = sp.mine === "1";

  const where: Prisma.ArticleWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(q
      ? { OR: [{ headline: { contains: q } }, { deck: { contains: q } }, { slug: { contains: q } }] }
      : {}),
    ...(restrictToOwn || mine
      ? { authorId: me?.authorId ?? "__none__" }
      : {}),
  };

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: { author: true, category: true, country: true },
    }),
    db.article.count({ where }),
  ]);

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (mine) p.set("mine", "1");
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/admin/articles?${s}` : "/admin/articles";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Articles</h1>
        <span className="text-[0.85rem] text-ink-mute">{total} total</span>
        {can(session.role, "article.create") && (
          <Link
            href="/admin/articles/new"
            className="ml-auto bg-brand px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-brand-dark"
          >
            New article
          </Link>
        )}
      </div>

      {restrictToOwn && (
        <p className="mt-2 text-[0.82rem] text-ink-mute">
          You are seeing your own articles. Editors see everything.
        </p>
      )}

      {/* ------------------------------------------------------------ filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={qs({ status: undefined, page: undefined })}
          className={`border px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] ${
            !status ? "border-ink bg-ink text-white" : "border-rule-strong hover:border-ink"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={qs({ status: s, page: undefined })}
            className={`border px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] ${
              status === s ? "border-ink bg-ink text-white" : "border-rule-strong hover:border-ink"
            }`}
            style={status === s ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] } : undefined}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}

        {!restrictToOwn && (
          <Link
            href={qs({ mine: mine ? undefined : "1", page: undefined })}
            className={`border px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] ${
              mine ? "border-ink bg-ink text-white" : "border-rule-strong hover:border-ink"
            }`}
          >
            Mine only
          </Link>
        )}

        <form action="/admin/articles" className="ml-auto flex">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search headlines…"
            className="border border-rule-strong px-3 py-1.5 text-[0.82rem] outline-none focus:border-ink"
          />
          <button
            type="submit"
            className="border border-l-0 border-rule-strong px-3 py-1.5 text-[0.74rem] font-bold uppercase hover:border-ink"
          >
            Search
          </button>
        </form>
      </div>

      {/* -------------------------------------------------------------- table */}
      <div className="mt-5 overflow-x-auto border border-rule bg-white">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-rule bg-shell text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
              <th className="px-3.5 py-2.5">Headline</th>
              <th className="px-3.5 py-2.5">Status</th>
              <th className="px-3.5 py-2.5">Country</th>
              <th className="px-3.5 py-2.5">Section</th>
              <th className="px-3.5 py-2.5">Author</th>
              <th className="px-3.5 py-2.5">Updated</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-rule last:border-b-0 hover:bg-shell">
                <td className="px-3.5 py-2.5">
                  <Link href={`/admin/articles/${a.id}`} className="font-bold hover:text-brand">
                    {a.headline}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    {a.isBreaking && (
                      <span className="bg-brand px-1.5 py-px text-[0.58rem] font-extrabold uppercase text-white">
                        Breaking
                      </span>
                    )}
                    {a.isDeveloping && (
                      <span className="bg-[#8a5a00] px-1.5 py-px text-[0.58rem] font-extrabold uppercase text-white">
                        Developing
                      </span>
                    )}
                    {a.placement !== "NONE" && (
                      <span className="border border-rule-strong px-1.5 py-px text-[0.58rem] font-extrabold uppercase text-ink-soft">
                        {a.placement.replace("_", " ")}
                      </span>
                    )}
                    {a.isSeed && (
                      <span className="border border-rule-strong px-1.5 py-px text-[0.58rem] font-extrabold uppercase text-ink-mute">
                        Seed
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3.5 py-2.5">
                  <span
                    className="inline-block px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.06em] text-white"
                    style={{ background: STATUS_COLOR[a.status] }}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-[0.82rem]">
                  {a.country ? a.country.name : "Horn"}
                </td>
                <td className="px-3.5 py-2.5 text-[0.82rem]">{a.category.name}</td>
                <td className="px-3.5 py-2.5 text-[0.82rem]">{a.author.name}</td>
                <td className="whitespace-nowrap px-3.5 py-2.5 text-[0.78rem] text-ink-mute">
                  {formatDateTime(a.updatedAt)}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3.5 py-10 text-center text-[0.9rem] text-ink-mute">
                  No articles match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={total}
        perPage={PER_PAGE}
        basePath="/admin/articles"
        query={{
          ...(status ? { status } : {}),
          ...(q ? { q } : {}),
          ...(mine ? { mine: "1" } : {}),
        }}
      />
    </div>
  );
}
