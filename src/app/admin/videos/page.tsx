import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, can } from "@/lib/auth";
import { formatDuration, formatShortDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Videos" };

const KINDS = ["NEWS", "INTERVIEW", "EXPLAINER", "DOCUMENTARY", "CULTURE", "BUSINESS"] as const;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "video.manage")) redirect("/admin");

  const { saved } = await searchParams;

  const [videos, countries] = await Promise.all([
    db.video.findMany({ orderBy: { publishedAt: "desc" }, include: { country: true } }),
    db.country.findMany({ orderBy: { order: "asc" } }),
  ]);

  async function addVideo(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "video.manage")) redirect("/admin");

    const title = String(formData.get("title") ?? "").trim();
    if (!title) redirect("/admin/videos");

    const minutes = Number(formData.get("minutes") ?? 0) || 0;
    const seconds = Number(formData.get("seconds") ?? 0) || 0;

    let slug = slugify(title);
    if (await db.video.findUnique({ where: { slug } })) slug = `${slug}-${Date.now() % 10000}`;

    await db.video.create({
      data: {
        title,
        slug,
        description: String(formData.get("description") ?? "").trim(),
        countryId: String(formData.get("countryId") ?? "") || null,
        kind: (String(formData.get("kind") ?? "NEWS") as never),
        durationSec: minutes * 60 + seconds,
        imageSeed: slug,
        provider: String(formData.get("provider") ?? "").trim() || null,
        externalId: String(formData.get("externalId") ?? "").trim() || null,
        published: formData.get("published") === "on",
      },
    });
    revalidatePath("/", "layout");
    redirect("/admin/videos?saved=1");
  }

  async function togglePublished(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "video.manage")) redirect("/admin");
    const id = String(formData.get("id") ?? "");
    const v = await db.video.findUnique({ where: { id }, select: { published: true } });
    if (!v) redirect("/admin/videos");
    await db.video.update({ where: { id }, data: { published: !v.published } });
    revalidatePath("/", "layout");
    redirect("/admin/videos");
  }

  const input =
    "w-full border border-rule-strong bg-white px-3 py-2 text-[0.86rem] outline-none focus:border-ink";
  const label = "block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Videos</h1>
      <p className="mt-1.5 max-w-2xl text-[0.92rem] text-ink-soft">
        Video records carry their own metadata and pages. Add a provider and external ID
        when a player is connected; until then the page renders with its thumbnail and
        schema in place.
      </p>

      {saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Video added.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-x-auto border border-rule bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-rule bg-shell text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                <th className="px-3.5 py-2.5">Title</th>
                <th className="px-3.5 py-2.5">Kind</th>
                <th className="px-3.5 py-2.5">Country</th>
                <th className="px-3.5 py-2.5">Length</th>
                <th className="px-3.5 py-2.5">Published</th>
                <th className="px-3.5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-b border-rule last:border-b-0">
                  <td className="px-3.5 py-2.5">
                    <Link
                      href={`/videos/${v.slug}`}
                      target="_blank"
                      className="text-[0.88rem] font-bold hover:text-brand"
                    >
                      {v.title}
                    </Link>
                  </td>
                  <td className="px-3.5 py-2.5 text-[0.8rem]">{v.kind}</td>
                  <td className="px-3.5 py-2.5 text-[0.8rem]">
                    {v.country ? v.country.name : "Horn"}
                  </td>
                  <td className="px-3.5 py-2.5 text-[0.8rem]">{formatDuration(v.durationSec)}</td>
                  <td className="px-3.5 py-2.5 text-[0.78rem] text-ink-mute">
                    {v.published ? formatShortDate(v.publishedAt) : "Unpublished"}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <form action={togglePublished}>
                      <input type="hidden" name="id" value={v.id} />
                      <button
                        type="submit"
                        className="border border-rule-strong px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.05em] hover:border-ink"
                      >
                        {v.published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={addVideo} className="space-y-3 border border-rule bg-white p-4">
          <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">Add a video</h2>

          <div>
            <label className={label} htmlFor="v-title">Title</label>
            <input id="v-title" name="title" required className={input} />
          </div>
          <div>
            <label className={label} htmlFor="v-desc">Description</label>
            <textarea id="v-desc" name="description" rows={3} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="v-kind">Kind</label>
              <select id="v-kind" name="kind" className={input}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="v-country">Country</label>
              <select id="v-country" name="countryId" className={input}>
                <option value="">Horn of Africa</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="v-min">Minutes</label>
              <input id="v-min" name="minutes" type="number" min="0" defaultValue="4" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="v-sec">Seconds</label>
              <input id="v-sec" name="seconds" type="number" min="0" max="59" defaultValue="0" className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="v-prov">Provider</label>
              <input id="v-prov" name="provider" placeholder="youtube" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="v-ext">External ID</label>
              <input id="v-ext" name="externalId" className={input} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-[0.85rem]">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-[#c9182b]" />
            Publish immediately
          </label>
          <button
            type="submit"
            className="w-full bg-brand py-2.5 text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
          >
            Add video
          </button>
        </form>
      </div>
    </div>
  );
}
