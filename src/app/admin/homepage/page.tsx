import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, can, STATUS_LABEL } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Homepage" };

const SLOTS: { key: string; label: string; help: string }[] = [
  { key: "lead", label: "Lead story", help: "The single largest story on the homepage." },
  { key: "secondary-1", label: "Secondary 1", help: "Beside the lead." },
  { key: "secondary-2", label: "Secondary 2", help: "Beside the lead." },
  { key: "secondary-3", label: "Secondary 3", help: "Beside the lead." },
  { key: "somalia-lead", label: "Somalia block lead", help: "Top of the Somalia country block." },
  { key: "ethiopia-lead", label: "Ethiopia block lead", help: "Top of the Ethiopia country block." },
  { key: "djibouti-lead", label: "Djibouti block lead", help: "Top of the Djibouti country block." },
  { key: "eritrea-lead", label: "Eritrea block lead", help: "Top of the Eritrea country block." },
  { key: "horn-feature", label: "Horn feature", help: "Regional section feature." },
  { key: "explained-feature", label: "Explained feature", help: "Explainers section feature." },
  { key: "people-feature", label: "People feature", help: "People of the Horn feature." },
];

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "homepage.manage")) redirect("/admin");

  const { saved } = await searchParams;

  const [slots, articles] = await Promise.all([
    db.homepageSlot.findMany({
      include: { article: { select: { id: true, headline: true } } },
    }),
    db.article.findMany({
      where: { status: { in: ["PUBLISHED", "UPDATED"] } },
      orderBy: { publishedAt: "desc" },
      take: 150,
      select: {
        id: true,
        headline: true,
        publishedAt: true,
        status: true,
        country: { select: { name: true, flag: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  const current = new Map(slots.map((s) => [s.slot, s.articleId]));

  async function assign(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "homepage.manage")) redirect("/admin");

    for (const { key } of SLOTS) {
      const value = String(formData.get(key) ?? "") || null;
      await db.homepageSlot.upsert({
        where: { slot: key },
        update: { articleId: value },
        create: { slot: key, articleId: value },
      });
    }
    revalidatePath("/", "layout");
    redirect("/admin/homepage?saved=1");
  }

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Homepage</h1>
      <p className="mt-1.5 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">
        The homepage is edited, not generated. These assignments override the automatic
        ordering. Leave a slot empty and it falls back to the most recent qualifying story,
        so the page is never broken — but an editor’s choice always wins.
      </p>

      {saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Homepage updated.{" "}
          <Link href="/" target="_blank" className="font-bold underline">
            View it ↗
          </Link>
        </p>
      )}

      <form action={assign} className="mt-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {SLOTS.map((slot) => (
            <div key={slot.key} className="border border-rule bg-white p-4">
              <label
                htmlFor={slot.key}
                className="block text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute"
              >
                {slot.label}
              </label>
              <p className="mt-0.5 text-[0.76rem] text-ink-mute">{slot.help}</p>
              <select
                id={slot.key}
                name={slot.key}
                defaultValue={current.get(slot.key) ?? ""}
                className="mt-2 w-full border border-rule-strong bg-white px-3 py-2 text-[0.86rem] outline-none focus:border-ink"
              >
                <option value="">— Automatic (most recent) —</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.country?.flag ?? "🌍"} {a.headline.slice(0, 72)}
                    {a.headline.length > 72 ? "…" : ""} · {formatShortDate(a.publishedAt)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-6 bg-brand px-6 py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-brand-dark"
        >
          Save homepage
        </button>
      </form>

      <section className="mt-10">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          Breaking news ticker
        </h2>
        <p className="mb-3 max-w-2xl text-[0.88rem] text-ink-soft">
          The ticker shows the eight most recent published articles flagged as breaking.
          Set that flag on the article itself.
        </p>
        <div className="border border-rule bg-white">
          {(
            await db.article.findMany({
              where: { isBreaking: true, status: { in: ["PUBLISHED", "UPDATED"] } },
              orderBy: { publishedAt: "desc" },
              take: 10,
              select: { id: true, headline: true, status: true, publishedAt: true },
            })
          ).map((a) => (
            <Link
              key={a.id}
              href={`/admin/articles/${a.id}`}
              className="flex items-center gap-3 border-b border-rule px-4 py-2.5 last:border-b-0 hover:bg-shell"
            >
              <span className="bg-brand px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase text-white">
                Breaking
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.88rem] font-semibold">
                {a.headline}
              </span>
              <span className="shrink-0 text-[0.75rem] text-ink-mute">
                {STATUS_LABEL[a.status]} · {formatShortDate(a.publishedAt)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
