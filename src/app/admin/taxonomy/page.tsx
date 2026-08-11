import { redirect } from "next/navigation";
import { CountryFlag } from "@/components/CountryFlag";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, can } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Taxonomy" };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

export default async function TaxonomyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "taxonomy.manage")) redirect("/admin");

  const { saved } = await searchParams;

  const [countries, categories, topics, authors] = await Promise.all([
    db.country.findMany({
      orderBy: { order: "asc" },
      include: { regions: { orderBy: { order: "asc" } } },
    }),
    db.category.findMany({
      orderBy: { order: "asc" },
      include: { subcategories: { orderBy: { order: "asc" } } },
    }),
    db.topic.findMany({ orderBy: { name: "asc" } }),
    db.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function addRegion(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "taxonomy.manage")) redirect("/admin");

    const countryId = String(formData.get("countryId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!countryId || !name) redirect("/admin/taxonomy");

    const count = await db.region.count({ where: { countryId } });
    await db.region.create({
      data: {
        countryId,
        name,
        slug: slugify(name),
        blurb: String(formData.get("blurb") ?? "").trim() || null,
        order: count,
      },
    });
    revalidatePath("/", "layout");
    redirect("/admin/taxonomy?saved=region");
  }

  async function addTopic(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "taxonomy.manage")) redirect("/admin");
    const name = String(formData.get("name") ?? "").trim();
    if (!name) redirect("/admin/taxonomy");
    await db.topic.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
    revalidatePath("/", "layout");
    redirect("/admin/taxonomy?saved=topic");
  }

  async function addAuthor(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "taxonomy.manage")) redirect("/admin");
    const name = String(formData.get("name") ?? "").trim();
    if (!name) redirect("/admin/taxonomy");
    await db.author.create({
      data: {
        name,
        slug: slugify(name),
        title: String(formData.get("title") ?? "").trim() || "Contributor",
        bio: String(formData.get("bio") ?? "").trim() || "Writes for Hornafrika.",
        location: String(formData.get("location") ?? "").trim() || null,
        avatarSeed: slugify(name),
      },
    });
    revalidatePath("/", "layout");
    redirect("/admin/taxonomy?saved=author");
  }

  const input =
    "w-full border border-rule-strong bg-white px-3 py-2 text-[0.86rem] outline-none focus:border-ink";
  const btn =
    "bg-ink px-4 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-navy";

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Taxonomy</h1>
      <p className="mt-1.5 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">
        Countries, regions, sections, topics and authors. Regions and topics are additive —
        adding one changes nothing about the site’s structure, which is what lets the
        platform grow without a rebuild.
      </p>

      {saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Added.
        </p>
      )}

      {/* ------------------------------------------------- countries/regions */}
      <section className="mt-7">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          Countries &amp; regions
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {countries.map((c) => (
            <div key={c.id} className="border border-rule bg-white p-4" style={{ borderTop: `3px solid ${c.accent}` }}>
              <p className="text-[1.02rem] font-extrabold">
                <CountryFlag slug={c.slug} /> {c.name}
                <span className="ml-2 text-[0.75rem] font-normal text-ink-mute">/{c.slug}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {c.regions.map((r) => (
                  <span
                    key={r.id}
                    className="border border-rule px-2 py-0.5 text-[0.76rem] text-ink-soft"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
              <form action={addRegion} className="mt-3 flex gap-2">
                <input type="hidden" name="countryId" value={c.id} />
                <input name="name" placeholder="New region name" className={input} />
                <button type="submit" className={btn}>
                  Add
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- sections */}
      <section className="mt-9">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          Sections &amp; subsections
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-rule bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="chip" data-c={cat.slug}>
                  {cat.name}
                </span>
                <span className="ml-auto text-[0.7rem] uppercase tracking-[0.07em] text-ink-mute">
                  {cat.kind}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {cat.subcategories.map((s) => (
                  <span
                    key={s.id}
                    className="border border-rule px-2 py-0.5 text-[0.74rem] text-ink-soft"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ topics */}
      <section className="mt-9 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Topics ({topics.length})
          </h2>
          <div className="border border-rule bg-white p-4">
            <div className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto">
              {topics.map((t) => (
                <span
                  key={t.id}
                  className="border border-rule px-2 py-0.5 text-[0.76rem] text-ink-soft"
                >
                  {t.name}
                </span>
              ))}
            </div>
            <form action={addTopic} className="mt-3 flex gap-2">
              <input name="name" placeholder="New topic" className={input} />
              <button type="submit" className={btn}>
                Add
              </button>
            </form>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Authors ({authors.length})
          </h2>
          <div className="border border-rule bg-white p-4">
            <div className="max-h-52 space-y-1.5 overflow-y-auto">
              {authors.map((a) => (
                <p key={a.id} className="text-[0.85rem]">
                  <span className="font-bold">{a.name}</span>{" "}
                  <span className="text-ink-mute">— {a.title}</span>
                </p>
              ))}
            </div>
            <form action={addAuthor} className="mt-3 space-y-2">
              <input name="name" placeholder="Full name" className={input} />
              <input name="title" placeholder="Title, e.g. Business Reporter" className={input} />
              <input name="location" placeholder="Location" className={input} />
              <textarea name="bio" rows={2} placeholder="Short bio" className={input} />
              <button type="submit" className={btn}>
                Add author
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
