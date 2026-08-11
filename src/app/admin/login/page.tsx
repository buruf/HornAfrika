import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { MarkCape } from "@/components/brand";
import { login } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-14">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <MarkCape size={52} />
        </div>
        <p className="mt-3 text-center text-[1.7rem] font-extrabold leading-none tracking-[-0.03em]">
          <span className="text-ink">HORN</span>
          <span className="text-brand">AFRIKA</span>
        </p>
        <p className="mt-1.5 text-center text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
          Content Management
        </p>

        <form action={login} className="mt-7 border border-rule bg-white p-6">
          <input type="hidden" name="next" value={next ?? "/admin"} />

          {error && (
            <p className="mb-4 border-l-[3px] border-brand bg-[#fdf0f1] px-3 py-2 text-[0.84rem] text-[#8a1020]">
              Those credentials were not recognised.
            </p>
          )}

          <label className="block text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1.5 w-full border border-rule-strong px-3 py-2.5 text-[0.92rem] outline-none focus:border-ink"
          />

          <label className="mt-4 block text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full border border-rule-strong px-3 py-2.5 text-[0.92rem] outline-none focus:border-ink"
          />

          <button
            type="submit"
            className="mt-5 w-full bg-brand py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-brand-dark"
          >
            Sign in
          </button>
        </form>

        {/* Development only. Printing the seeded accounts and their shared
            password on a public login page would hand the CMS to anyone who
            found the URL, so this block must never render in production. */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-4 border border-rule bg-shell p-4 text-[0.78rem] leading-relaxed text-ink-soft">
            <p className="font-bold text-ink">Local development accounts</p>
            <p className="mt-1.5">
              admin@hornafrika.com — Super Admin
              <br />
              editor@hornafrika.com — Editor
              <br />
              journalist@hornafrika.com — Journalist
              <br />
              contributor@hornafrika.com — Contributor
              <br />
              moderator@hornafrika.com — Moderator
            </p>
            <p className="mt-1.5">
              Password for all: <code className="font-bold">hornafrika</code>
            </p>
            <p className="mt-2 text-[0.74rem] text-ink-mute">
              Shown only in development. These accounts are never seeded in
              production.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
