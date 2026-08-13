import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adsChanged } from "@/lib/revalidate";
import { db } from "@/lib/db";
import { getSession, can } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Advertising" };

export default async function AdsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "ads.manage")) redirect("/admin");

  const { saved } = await searchParams;
  const slots = await db.adSlot.findMany({ orderBy: { position: "asc" } });

  async function save(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "ads.manage")) redirect("/admin");

    const id = String(formData.get("id") ?? "");
    await db.adSlot.update({
      where: { id },
      data: {
        active: formData.get("active") === "on",
        label: String(formData.get("label") ?? "").trim() || "Advertisement",
        linkUrl: String(formData.get("linkUrl") ?? "").trim() || null,
      },
    });
    revalidatePath("/", "layout");
  adsChanged();
    redirect("/admin/ads?saved=1");
  }

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Advertising</h1>
      <p className="mt-1.5 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">
        Five declared positions. An inactive slot renders nothing at all — no reserved grey
        box, no layout shift. Editorial content stays the subject of the page.
      </p>

      {saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Saved.
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {slots.map((slot) => (
          <form key={slot.id} action={save} className="border border-rule bg-white p-4">
            <input type="hidden" name="id" value={slot.id} />
            <div className="flex items-center gap-2">
              <span className="text-[0.95rem] font-extrabold">{slot.position}</span>
              <span
                className={`ml-auto px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.07em] ${
                  slot.active ? "bg-[#2f7a3f] text-white" : "border border-rule-strong text-ink-mute"
                }`}
              >
                {slot.active ? "Active" : "Inactive"}
              </span>
            </div>

            <label className="mt-3 block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              Creative label
            </label>
            <input
              name="label"
              defaultValue={slot.label}
              className="mt-1.5 w-full border border-rule-strong px-3 py-2 text-[0.86rem] outline-none focus:border-ink"
            />

            <label className="mt-3 block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              Click-through URL
            </label>
            <input
              name="linkUrl"
              defaultValue={slot.linkUrl ?? ""}
              placeholder="https://…"
              className="mt-1.5 w-full border border-rule-strong px-3 py-2 text-[0.86rem] outline-none focus:border-ink"
            />
            <p className="mt-1 text-[0.72rem] text-ink-mute">
              Links are emitted with <code>rel=&quot;nofollow sponsored&quot;</code>.
            </p>

            <label className="mt-3 flex items-center gap-2 text-[0.86rem]">
              <input
                type="checkbox"
                name="active"
                defaultChecked={slot.active}
                className="h-4 w-4 accent-[#c9182b]"
              />
              Active
            </label>

            <button
              type="submit"
              className="mt-3 bg-ink px-4 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-navy"
            >
              Save slot
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
