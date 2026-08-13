import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, getSession } from "@/lib/auth";
import { taxonomyChanged } from "@/lib/revalidate";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contributors" };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

export default async function ContributorsPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  // Verifying a person's identity is an editor-level decision.
  if (!can(session.role, "article.editAny")) redirect("/admin");

  const { done } = await searchParams;

  const [pending, verified, declined] = await Promise.all([
    db.user.findMany({
      where: { contributorStatus: "PENDING" },
      orderBy: { appliedAt: "asc" },
    }),
    db.user.findMany({
      where: { contributorStatus: "VERIFIED", appliedAt: { not: null } },
      orderBy: { reviewedAt: "desc" },
      include: { author: true, _count: { select: { editorialLogs: true } } },
    }),
    db.user.findMany({
      where: { contributorStatus: "DECLINED" },
      orderBy: { reviewedAt: "desc" },
      take: 20,
    }),
  ]);

  /**
   * Approving a reporter does two things: it opens the account, and it creates
   * the author record that carries their byline. Without the second, a
   * verified contributor could not file anything, because every article has to
   * be attributable to someone.
   */
  async function verify(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "article.editAny")) redirect("/admin");

    const id = String(formData.get("id") ?? "");
    const user = await db.user.findUnique({ where: { id } });
    if (!user || user.contributorStatus !== "PENDING") redirect("/admin/contributors");

    let slug = slugify(user.name) || `reporter-${id.slice(0, 6)}`;
    if (await db.author.findUnique({ where: { slug } })) slug = `${slug}-${id.slice(0, 4)}`;

    const author = await db.author.create({
      data: {
        slug,
        name: user.name,
        title: String(formData.get("title") ?? "").trim() || "Contributor",
        bio:
          String(formData.get("bio") ?? "").trim() ||
          `Reports for Hornafrika from ${user.location ?? "the Horn of Africa"}.`,
        location: user.location,
        avatarSeed: slug,
        isDesk: false,
      },
    });

    await db.user.update({
      where: { id },
      data: {
        contributorStatus: "VERIFIED",
        active: true,
        authorId: author.id,
        reviewedAt: new Date(),
        reviewedBy: s.name,
      },
    });

    revalidatePath("/", "layout");
    taxonomyChanged();
    redirect("/admin/contributors?done=verified");
  }

  async function decline(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "article.editAny")) redirect("/admin");

    const id = String(formData.get("id") ?? "");
    await db.user.update({
      where: { id },
      data: {
        contributorStatus: "DECLINED",
        active: false,
        reviewedAt: new Date(),
        reviewedBy: s.name,
        reviewNote: String(formData.get("reviewNote") ?? "").trim() || null,
      },
    });
    redirect("/admin/contributors?done=declined");
  }

  const input =
    "w-full border border-rule-strong bg-white px-3 py-2 text-[0.86rem] outline-none focus:border-ink";
  const label =
    "block text-[0.66rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Contributors</h1>
        {pending.length > 0 && (
          <span className="bg-brand px-2 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-[0.07em] text-white">
            {pending.length} awaiting review
          </span>
        )}
      </div>
      <p className="mt-1.5 max-w-3xl text-[0.92rem] leading-relaxed text-ink-soft">
        Reporters who registered at <code>/contribute</code>. A pending account
        cannot sign in. Verifying one opens the account and creates the author
        record that carries their byline — so check the published work before
        you approve, because approval is what puts a name on the masthead.
      </p>

      {done && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          {done === "verified"
            ? "Verified. They can now sign in and file, and their work still goes through review before publication."
            : "Declined. The account cannot sign in."}
        </p>
      )}

      {/* ------------------------------------------------------------ pending */}
      <section className="mt-7">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          Awaiting verification
        </h2>

        {pending.length === 0 ? (
          <p className="border border-rule bg-white p-8 text-center text-[0.92rem] text-ink-mute">
            No applications waiting.
          </p>
        ) : (
          <div className="space-y-4">
            {pending.map((u) => (
              <div key={u.id} className="border border-rule bg-white p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[1.05rem] font-extrabold">{u.name}</h3>
                  <span className="text-[0.85rem] text-ink-soft">{u.email}</span>
                  {u.location && (
                    <span className="border border-rule-strong px-2 py-0.5 text-[0.72rem] font-semibold text-ink-soft">
                      {u.location}
                    </span>
                  )}
                  <span className="ml-auto text-[0.75rem] text-ink-mute">
                    applied {formatDateTime(u.appliedAt)}
                  </span>
                </div>

                {u.applicationNote && (
                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-[0.9rem] leading-relaxed text-ink-soft">
                    {u.applicationNote}
                  </p>
                )}

                {u.workLinks && (
                  <div className="mt-3">
                    <p className={label}>Published work</p>
                    <ul className="mt-1 space-y-1">
                      {u.workLinks
                        .split(/\s*\n\s*/)
                        .filter(Boolean)
                        .map((raw, i) => {
                          const isUrl = /^https?:\/\//i.test(raw);
                          return (
                            <li key={i} className="text-[0.85rem]">
                              {isUrl ? (
                                <a
                                  href={raw}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow"
                                  className="break-all text-brand underline"
                                >
                                  {raw}
                                </a>
                              ) : (
                                <span className="break-all text-ink-soft">{raw}</span>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <form action={verify} className="border border-[#c5e0cb] bg-[#f4faf5] p-4">
                    <input type="hidden" name="id" value={u.id} />
                    <p className="text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-[#1e5228]">
                      Verify this reporter
                    </p>
                    <div className="mt-2.5">
                      <label className={label} htmlFor={`t-${u.id}`}>
                        Byline title
                      </label>
                      <input
                        id={`t-${u.id}`}
                        name="title"
                        placeholder="Correspondent"
                        className={input}
                      />
                    </div>
                    <div className="mt-2.5">
                      <label className={label} htmlFor={`b-${u.id}`}>
                        Public bio
                      </label>
                      <textarea
                        id={`b-${u.id}`}
                        name="bio"
                        rows={2}
                        placeholder="Shown on their author page. Leave blank for a default."
                        className={input}
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 bg-[#2f7a3f] px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.07em] text-white hover:opacity-90"
                    >
                      Verify and open account
                    </button>
                  </form>

                  <form action={decline} className="border border-rule bg-shell p-4">
                    <input type="hidden" name="id" value={u.id} />
                    <p className="text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                      Decline
                    </p>
                    <div className="mt-2.5">
                      <label className={label} htmlFor={`n-${u.id}`}>
                        Internal note
                      </label>
                      <textarea
                        id={`n-${u.id}`}
                        name="reviewNote"
                        rows={2}
                        placeholder="Why. Kept internal, not sent to the applicant."
                        className={input}
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 border border-[#8a1020] px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.07em] text-[#8a1020] hover:bg-[#8a1020] hover:text-white"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------- verified */}
      {verified.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Verified reporters ({verified.length})
          </h2>
          <div className="border border-rule bg-white">
            {verified.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-rule px-4 py-3 last:border-b-0"
              >
                <span className="text-[0.92rem] font-bold">{u.name}</span>
                <span className="text-[0.82rem] text-ink-mute">{u.email}</span>
                {u.location && (
                  <span className="text-[0.78rem] text-ink-mute">{u.location}</span>
                )}
                <span className="ml-auto text-[0.75rem] text-ink-mute">
                  verified by {u.reviewedBy} · {formatDateTime(u.reviewedAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {declined.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Declined ({declined.length})
          </h2>
          <div className="border border-rule bg-white">
            {declined.map((u) => (
              <div
                key={u.id}
                className="border-b border-rule px-4 py-3 text-[0.85rem] last:border-b-0"
              >
                <span className="font-semibold">{u.name}</span>{" "}
                <span className="text-ink-mute">{u.email}</span>
                {u.reviewNote && (
                  <p className="mt-0.5 text-[0.8rem] text-ink-mute">{u.reviewNote}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
