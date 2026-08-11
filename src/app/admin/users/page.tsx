import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession, can, ROLE_LABEL, ROLE_SUMMARY } from "@/lib/auth";
import { formatShortDate } from "@/lib/format";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

const ROLES: Role[] = ["SUPER_ADMIN", "EDITOR", "JOURNALIST", "CONTRIBUTOR", "MODERATOR"];

const ERRORS: Record<string, string> = {
  exists: "An account with that email already exists.",
  short: "Passwords must be at least 8 characters.",
  lastadmin: "You cannot remove the last active Super Admin.",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "users.manage")) redirect("/admin");

  const { saved, error } = await searchParams;

  const [users, authors] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" }, include: { author: true } }),
    db.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function createUser(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "users.manage")) redirect("/admin");

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (password.length < 8) redirect("/admin/users?error=short");
    if (await db.user.findUnique({ where: { email } })) redirect("/admin/users?error=exists");

    await db.user.create({
      data: {
        email,
        name: String(formData.get("name") ?? "").trim() || email,
        role: (String(formData.get("role") ?? "CONTRIBUTOR") as Role),
        passwordHash: bcrypt.hashSync(password, 10),
        authorId: String(formData.get("authorId") ?? "") || null,
      },
    });
    revalidatePath("/admin/users");
    redirect("/admin/users?saved=1");
  }

  async function updateUser(formData: FormData) {
    "use server";
    const s = await getSession();
    if (!s || !can(s.role, "users.manage")) redirect("/admin");

    const id = String(formData.get("id") ?? "");
    const role = String(formData.get("role") ?? "") as Role;
    const active = formData.get("active") === "on";

    // Locking every Super Admin out of the CMS is unrecoverable from the UI,
    // so the last active one cannot be demoted or deactivated here.
    const target = await db.user.findUnique({ where: { id } });
    if (!target) redirect("/admin/users");
    if (target.role === "SUPER_ADMIN" && (role !== "SUPER_ADMIN" || !active)) {
      const remaining = await db.user.count({
        where: { role: "SUPER_ADMIN", active: true, id: { not: id } },
      });
      if (remaining === 0) redirect("/admin/users?error=lastadmin");
    }

    const newPassword = String(formData.get("password") ?? "");
    if (newPassword && newPassword.length < 8) redirect("/admin/users?error=short");

    await db.user.update({
      where: { id },
      data: {
        role,
        active,
        authorId: String(formData.get("authorId") ?? "") || null,
        ...(newPassword ? { passwordHash: bcrypt.hashSync(newPassword, 10) } : {}),
      },
    });
    revalidatePath("/admin/users");
    redirect("/admin/users?saved=1");
  }

  const input =
    "w-full border border-rule-strong bg-white px-3 py-2 text-[0.86rem] outline-none focus:border-ink";
  const label = "block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";

  return (
    <div>
      <h1 className="text-[1.7rem] font-extrabold tracking-[-0.03em]">Users &amp; roles</h1>

      {saved && (
        <p className="mt-4 border-l-[3px] border-[#2f7a3f] bg-[#f0f7f1] px-4 py-2.5 text-[0.88rem] text-[#1e5228]">
          Saved.
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-4 border-l-[3px] border-brand bg-[#fdf0f1] px-4 py-2.5 text-[0.88rem] text-[#8a1020]">
          {ERRORS[error]}
        </p>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
          What each role can do
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {ROLES.map((r) => (
            <div key={r} className="border border-rule bg-white p-3">
              <p className="text-[0.82rem] font-extrabold">{ROLE_LABEL[r]}</p>
              <p className="mt-1 text-[0.76rem] leading-relaxed text-ink-mute">
                {ROLE_SUMMARY[r]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <h2 className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-ink-mute">
            Accounts ({users.length})
          </h2>
          <div className="space-y-3">
            {users.map((u) => (
              <form key={u.id} action={updateUser} className="border border-rule bg-white p-4">
                <input type="hidden" name="id" value={u.id} />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-[0.98rem] font-extrabold">{u.name}</p>
                  <p className="text-[0.82rem] text-ink-mute">{u.email}</p>
                  <p className="ml-auto text-[0.74rem] text-ink-mute">
                    Created {formatShortDate(u.createdAt)}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={label}>Role</label>
                    <select name="role" defaultValue={u.role} className={input}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Author byline</label>
                    <select name="authorId" defaultValue={u.authorId ?? ""} className={input}>
                      <option value="">None</option>
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Reset password</label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Leave blank to keep"
                      className={input}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-[0.85rem]">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={u.active}
                      className="h-4 w-4 accent-[#2f7a3f]"
                    />
                    Active
                  </label>
                  <button
                    type="submit"
                    className="ml-auto bg-ink px-4 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-white hover:bg-navy"
                  >
                    Save
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>

        <form action={createUser} className="space-y-3 self-start border border-rule bg-white p-4">
          <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">Add a user</h2>
          <div>
            <label className={label} htmlFor="u-name">Name</label>
            <input id="u-name" name="name" required className={input} />
          </div>
          <div>
            <label className={label} htmlFor="u-email">Email</label>
            <input id="u-email" name="email" type="email" required className={input} />
          </div>
          <div>
            <label className={label} htmlFor="u-pass">Password</label>
            <input
              id="u-pass"
              name="password"
              type="password"
              required
              minLength={8}
              className={input}
            />
            <p className="mt-1 text-[0.72rem] text-ink-mute">Minimum 8 characters.</p>
          </div>
          <div>
            <label className={label} htmlFor="u-role">Role</label>
            <select id="u-role" name="role" defaultValue="CONTRIBUTOR" className={input}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="u-author">Author byline</label>
            <select id="u-author" name="authorId" className={input}>
              <option value="">None</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[0.72rem] text-ink-mute">
              Journalists and contributors need one to file, since every article carries a
              byline.
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-brand py-2.5 text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
          >
            Create user
          </button>
        </form>
      </div>
    </div>
  );
}
