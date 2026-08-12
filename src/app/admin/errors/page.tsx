import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, can } from "@/lib/auth";
import { formatDateTime, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Errors" };

const KIND_COLOR: Record<string, string> = {
  server: "#8a1020",
  client: "#1b5fa8",
  cron: "#a8730f",
  action: "#5b4b8a",
};

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ cleared?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "ads.manage")) redirect("/admin");

  const { cleared } = await searchParams;

  const [errors, last24h] = await Promise.all([
    db.errorLog.findMany({ orderBy: { lastSeenAt: "desc" }, take: 100 }),
    db.errorLog.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - 86_400_000) } },
    }),
  ]);

  async function clearAll() {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "ads.manage")) redirect("/admin");
    await db.errorLog.deleteMany();
    revalidatePath("/admin/errors");
    redirect("/admin/errors?cleared=1");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Errors</h1>
        <span className="text-[0.85rem] text-ink-mute">
          {errors.length} distinct · {last24h} seen in the last 24 hours
        </span>
        {errors.length > 0 && (
          <form action={clearAll} className="ml-auto">
            <button
              type="submit"
              className="border border-rule-strong px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] hover:border-ink"
            >
              Clear all
            </button>
          </form>
        )}
      </div>

      <p className="mt-1.5 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">
        Identical failures are folded into one row with a count, so a route
        breaking every two hours does not bury everything else. Set{" "}
        <code>ERROR_WEBHOOK_URL</code> to also get pushed alerts.
      </p>

      {cleared && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Cleared.
        </p>
      )}

      {errors.length === 0 ? (
        <div className="mt-6 border border-rule bg-white p-10 text-center">
          <p className="text-[1rem] font-bold">Nothing has failed.</p>
          <p className="mt-1.5 text-[0.9rem] text-ink-mute">
            Server exceptions, client boundary errors and cron failures all land here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {errors.map((e) => (
            <div key={e.id} className="border border-rule bg-white p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className="px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.07em] text-white"
                  style={{ background: KIND_COLOR[e.kind] ?? "#0b1f33" }}
                >
                  {e.kind}
                </span>
                {e.count > 1 && (
                  <span className="border border-rule-strong px-1.5 py-0.5 text-[0.66rem] font-extrabold text-ink-soft">
                    ×{e.count}
                  </span>
                )}
                {e.path && (
                  <code className="text-[0.8rem] text-ink-soft">{e.path}</code>
                )}
                <span className="ml-auto text-[0.75rem] text-ink-mute">
                  {timeAgo(e.lastSeenAt)} · first seen {formatDateTime(e.createdAt)}
                </span>
              </div>

              <p className="mt-2 text-[0.92rem] font-semibold">{e.message}</p>

              {e.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[0.76rem] font-bold uppercase tracking-[0.06em] text-ink-mute">
                    Stack
                  </summary>
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap border border-rule bg-shell p-3 text-[0.72rem] leading-relaxed text-ink-soft">
                    {e.stack}
                  </pre>
                </details>
              )}

              {e.digest && (
                <p className="mt-1.5 text-[0.72rem] text-ink-mute">
                  digest <code>{e.digest}</code>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
