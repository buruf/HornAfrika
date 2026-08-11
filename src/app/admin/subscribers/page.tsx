import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, can } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "subscribers.view")) redirect("/admin");

  const [subs, byEdition, byCountry] = await Promise.all([
    db.newsletterSub.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.newsletterSub.groupBy({ by: ["edition"], _count: { edition: true } }),
    db.newsletterSub.groupBy({ by: ["countryPref"], _count: { countryPref: true } }),
  ]);

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Subscribers</h1>
      <p className="mt-1.5 max-w-2xl text-[0.92rem] text-ink-soft">
        The Horn Daily list. We store an email address, a chosen edition and an optional
        country preference — nothing else.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-rule bg-white p-4">
          <p className="text-[1.5rem] font-extrabold leading-none">{subs.length}</p>
          <p className="mt-1 text-[0.75rem] text-ink-mute">Recent subscribers shown</p>
        </div>
        <div className="border border-rule bg-white p-4">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute">
            By edition
          </p>
          <ul className="mt-1.5 space-y-0.5 text-[0.83rem]">
            {byEdition.map((e) => (
              <li key={e.edition}>
                {e.edition} — <strong>{e._count.edition}</strong>
              </li>
            ))}
            {byEdition.length === 0 && <li className="text-ink-mute">None yet</li>}
          </ul>
        </div>
        <div className="border border-rule bg-white p-4">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute">
            By country preference
          </p>
          <ul className="mt-1.5 space-y-0.5 text-[0.83rem]">
            {byCountry.map((c) => (
              <li key={c.countryPref ?? "all"}>
                {c.countryPref ?? "All of the Horn"} — <strong>{c._count.countryPref}</strong>
              </li>
            ))}
            {byCountry.length === 0 && <li className="text-ink-mute">None yet</li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-rule bg-white">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-rule bg-shell text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
              <th className="px-3.5 py-2.5">Email</th>
              <th className="px-3.5 py-2.5">Edition</th>
              <th className="px-3.5 py-2.5">Country</th>
              <th className="px-3.5 py-2.5">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-rule last:border-b-0">
                <td className="px-3.5 py-2.5 text-[0.86rem]">{s.email}</td>
                <td className="px-3.5 py-2.5 text-[0.8rem]">{s.edition}</td>
                <td className="px-3.5 py-2.5 text-[0.8rem]">{s.countryPref ?? "All"}</td>
                <td className="px-3.5 py-2.5 text-[0.78rem] text-ink-mute">
                  {formatDateTime(s.createdAt)}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3.5 py-10 text-center text-[0.9rem] text-ink-mute">
                  No subscribers yet. The signup forms are live on the homepage, footer,
                  country pages and every article.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
