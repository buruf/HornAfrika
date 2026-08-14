import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession, can } from "@/lib/auth";
import { formatDateTime, timeAgo } from "@/lib/format";
import {
  HEALTH_LABEL,
  HEALTH_NOTE,
  sourceHealth,
  type SourceHealth,
} from "@/lib/source-health";
import {
  addSource,
  deleteSource,
  fetchNow,
  toggleHidden,
  updateSource,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wire sources" };

const HEALTH_COLOUR: Record<SourceHealth, string> = {
  ok: "#2f7a3f",
  quiet: "#5c6b78",
  stale: "#a8730f",
  abandoned: "#8a1020",
  failing: "#a8730f",
  broken: "#8a1020",
  unknown: "#5c6b78",
};

const KINDS = ["REGIONAL", "HORN", "PANAFRICAN", "INTERNATIONAL"] as const;

const MESSAGES: Record<string, string> = {
  added: "Source added.",
  updated: "Source updated.",
  deleted: "Source removed.",
  moderated: "Wire item updated.",
};

const ERRORS: Record<string, string> = {
  invalid: "A name and a valid feed URL are required.",
  duplicate: "That feed URL is already registered.",
  forbidden: "Only a Super Admin can delete a source.",
};

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; fetched?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "taxonomy.manage")) redirect("/admin");

  const { saved, error, fetched } = await searchParams;

  const [sources, countries, recent, totals] = await Promise.all([
    db.source.findMany({
      orderBy: [{ active: "desc" }, { kind: "asc" }, { name: "asc" }],
      include: { country: true, _count: { select: { items: true } } },
    }),
    db.country.findMany({ orderBy: { order: "asc" } }),
    db.wireItem.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 12,
      include: { source: { select: { name: true } } },
    }),
    db.wireItem.count(),
  ]);

  const active = sources.filter((s) => s.active);
  const failing = active.filter((s) => s.failureCount > 0);

  // Reachability and freshness are different failures. A feed can answer 200
  // with ten tidy items for months after the newsroom behind it stopped.
  const healthOf = new Map(sources.map((s) => [s.id, sourceHealth(s)]));
  const stalled = active.filter((s) => {
    const h = healthOf.get(s.id)!;
    return h === "stale" || h === "abandoned";
  });

  const input =
    "w-full border border-rule-strong bg-white px-3 py-2 text-[0.86rem] outline-none focus:border-ink";
  const label = "block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Wire sources</h1>
        <span className="text-[0.85rem] text-ink-mute">
          {active.length} active of {sources.length} · {totals} headlines held
        </span>
        <form action={fetchNow} className="ml-auto">
          <button
            type="submit"
            className="bg-brand px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-brand-dark"
          >
            Fetch all now
          </button>
        </form>
      </div>

      <p className="mt-1.5 max-w-3xl text-[0.9rem] leading-relaxed text-ink-soft">
        The wire stores a headline, a short extract and a link — never full text. Our
        crawler identifies itself honestly and is not disguised as a browser, so a
        publisher that blocks bots stays switched off until permission is arranged.
        Readers can see all of this at{" "}
        <Link href="/wire/about" target="_blank" className="font-semibold text-brand underline">
          /wire/about
        </Link>
        .
      </p>

      {fetched !== undefined && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Fetch complete — {fetched} new {Number(fetched) === 1 ? "headline" : "headlines"}{" "}
          added.{" "}
          <Link href="/wire" target="_blank" className="font-bold underline">
            View the wire ↗
          </Link>
        </p>
      )}
      {saved && MESSAGES[saved] && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          {MESSAGES[saved]}
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-4 border-l-[3px] border-brand bg-[#fdf0f1] px-4 py-2.5 text-[0.88rem] text-[#8a1020]">
          {ERRORS[error]}
        </p>
      )}

      {failing.length > 0 && (
        <div className="mt-5 border-l-[3px] border-[#a8730f] bg-[#fdf8ec] px-4 py-3">
          <p className="text-[0.86rem] font-bold text-[#6b5312]">
            {failing.length} active {failing.length === 1 ? "source is" : "sources are"}{" "}
            failing
          </p>
          <ul className="mt-1 space-y-0.5 text-[0.83rem] text-[#6b5312]">
            {failing.map((s) => (
              <li key={s.id}>
                {s.name} — {s.lastStatus} ({s.failureCount}{" "}
                {s.failureCount === 1 ? "failure" : "consecutive failures"})
              </li>
            ))}
          </ul>
        </div>
      )}

      {stalled.length > 0 && (
        <div className="mt-4 border-l-[3px] border-[#8a1020] bg-[#fdf0f1] px-4 py-3">
          <p className="text-[0.86rem] font-bold text-[#8a1020]">
            {stalled.length} active {stalled.length === 1 ? "source is" : "sources are"}{" "}
            reachable but no longer publishing
          </p>
          <p className="mt-0.5 text-[0.8rem] text-[#8a1020]">
            These fetch cleanly, so nothing looks wrong, but nothing new is
            arriving from them either.
          </p>
          <ul className="mt-1 space-y-0.5 text-[0.83rem] text-[#8a1020]">
            {stalled.map((s) => (
              <li key={s.id}>
                {s.name} — newest item{" "}
                {s.lastItemAt ? timeAgo(s.lastItemAt) : "unknown"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-3">
          {sources.map((s) => (
            <form
              key={s.id}
              action={updateSource}
              className="border border-rule bg-white p-4"
              style={{
                borderLeft: `3px solid ${
                  !s.active ? "#cdd4da" : s.failureCount > 0 ? "#a8730f" : "#2f7a3f"
                }`,
              }}
            >
              <input type="hidden" name="id" value={s.id} />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <a
                  href={s.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[1rem] font-extrabold hover:text-brand"
                >
                  {s.name} ↗
                </a>
                <span className="text-[0.72rem] uppercase tracking-[0.07em] text-ink-mute">
                  {s.kind}
                </span>
                {s.language !== "en" && (
                  <span className="border border-rule px-1.5 py-px text-[0.62rem] font-bold uppercase text-ink-mute">
                    {s.language}
                  </span>
                )}
                <span className="ml-auto text-[0.76rem] text-ink-mute">
                  {s._count.items} held
                </span>
              </div>

              <p className="mt-0.5 break-all text-[0.74rem] text-ink-mute">{s.feedUrl}</p>

              <p className="mt-1.5 text-[0.78rem]">
                {s.lastFetchedAt ? (
                  <>
                    <span
                      className="font-bold"
                      style={{ color: HEALTH_COLOUR[healthOf.get(s.id)!] }}
                      title={HEALTH_NOTE[healthOf.get(s.id)!]}
                    >
                      {HEALTH_LABEL[healthOf.get(s.id)!]}
                    </span>
                    <span className="text-ink-mute">
                      {" "}
                      · fetch {s.lastStatus} {timeAgo(s.lastFetchedAt)} ·{" "}
                      {s.lastItemCount} items in feed · newest{" "}
                      {s.lastItemAt ? timeAgo(s.lastItemAt) : "undated"}
                    </span>
                  </>
                ) : (
                  <span className="text-ink-mute">Never fetched</span>
                )}
              </p>
              {s.lastError && (
                <p className="mt-1 text-[0.76rem] text-[#8a1020]">{s.lastError}</p>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={label}>Type</label>
                  <select name="kind" defaultValue={s.kind} className={input}>
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Primary country</label>
                  <select name="countryId" defaultValue={s.countryId ?? ""} className={input}>
                    <option value="">None / regional</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Note</label>
                  <input name="note" defaultValue={s.note ?? ""} className={input} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-[0.85rem]">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={s.active}
                    className="h-4 w-4 accent-[#2f7a3f]"
                  />
                  Active
                </label>
                <label
                  className="flex items-center gap-2 text-[0.85rem]"
                  title="Badges every headline from this outlet as state-owned or state-funded"
                >
                  <input
                    type="checkbox"
                    name="stateAffiliated"
                    defaultChecked={s.stateAffiliated}
                    className="h-4 w-4 accent-[#a8730f]"
                  />
                  State-affiliated
                </label>
                <button
                  type="submit"
                  className="bg-ink px-4 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-navy"
                >
                  Save
                </button>
                <span className="ml-auto flex gap-2">
                  <button
                    type="submit"
                    formAction={fetchNow}
                    name="only"
                    value={s.slug}
                    className="border border-rule-strong px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.05em] hover:border-ink"
                  >
                    Fetch this
                  </button>
                  {session.role === "SUPER_ADMIN" && (
                    <button
                      type="submit"
                      formAction={deleteSource}
                      className="border border-[#e0b8bc] px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-[#8a1020] hover:bg-[#8a1020] hover:text-white"
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            </form>
          ))}
        </div>

        <aside className="space-y-6">
          <form action={addSource} className="space-y-3 border border-rule bg-white p-4">
            <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">
              Add a source
            </h2>
            <div>
              <label className={label} htmlFor="s-name">Name</label>
              <input id="s-name" name="name" required className={input} />
            </div>
            <div>
              <label className={label} htmlFor="s-feed">Feed URL</label>
              <input id="s-feed" name="feedUrl" required placeholder="https://…/feed/" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="s-home">Homepage URL</label>
              <input id="s-home" name="homepageUrl" placeholder="Optional" className={input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label} htmlFor="s-kind">Type</label>
                <select id="s-kind" name="kind" className={input}>
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="s-lang">Language</label>
                <input id="s-lang" name="language" defaultValue="en" className={input} />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="s-country">Primary country</label>
              <select id="s-country" name="countryId" className={input}>
                <option value="">None / regional</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-[0.85rem]">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[#2f7a3f]" />
              Active
            </label>
            <button
              type="submit"
              className="w-full bg-brand py-2.5 text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
            >
              Add source
            </button>
          </form>

          <div>
            <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
              Recently ingested
            </h2>
            <div className="border border-rule bg-white">
              {recent.map((item) => (
                <div key={item.id} className="border-b border-rule p-3 last:border-b-0">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-mute">
                    {item.source.name}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`clamp-2 mt-0.5 block text-[0.84rem] font-semibold hover:text-brand ${
                      item.hidden ? "line-through opacity-50" : ""
                    }`}
                  >
                    {item.title}
                  </a>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[0.7rem] text-ink-mute">
                      {formatDateTime(item.publishedAt)}
                    </span>
                    <form action={toggleHidden} className="ml-auto">
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-[0.7rem] font-bold uppercase tracking-[0.05em] text-ink-mute hover:text-brand"
                      >
                        {item.hidden ? "Unhide" : "Hide"}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <p className="p-4 text-[0.85rem] text-ink-mute">
                  Nothing ingested yet. Use “Fetch all now”.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
