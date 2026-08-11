import Link from "next/link";
import type { Metadata } from "next";
import { MarkCape } from "@/components/brand";
import { getSession, ROLE_LABEL, can } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Hornafrika Admin" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview", perm: null },
  { href: "/admin/articles", label: "Articles", perm: "article.create" },
  { href: "/admin/homepage", label: "Homepage", perm: "homepage.manage" },
  { href: "/admin/taxonomy", label: "Taxonomy", perm: "taxonomy.manage" },
  { href: "/admin/videos", label: "Videos", perm: "video.manage" },
  { href: "/admin/sources", label: "Wire", perm: "taxonomy.manage" },
  { href: "/admin/subscribers", label: "Subscribers", perm: "subscribers.view" },
  { href: "/admin/ads", label: "Advertising", perm: "ads.manage" },
  { href: "/admin/users", label: "Users", perm: "users.manage" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // The login page renders inside this layout too, so it must be reachable
  // while signed out.
  if (!session) {
    return <div className="bg-shell">{children}</div>;
  }

  async function logout() {
    "use server";
    await signOut();
    redirect("/admin/login");
  }

  const items = NAV.filter((n) => !n.perm || can(session.role, n.perm));

  return (
    <div className="min-h-screen bg-shell">
      <div className="border-b border-rule bg-white">
        <div className="shell flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-[1.15rem] font-extrabold leading-none tracking-[-0.03em]"
          >
            <MarkCape size={26} />
            <span className="text-ink">HORN</span>
            <span className="text-brand">AFRIKA</span>
            <span className="ml-2 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-ink-mute">
              CMS
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-2.5 py-1.5 text-[0.8rem] font-bold text-ink-soft transition-colors hover:bg-shell hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-[0.76rem] font-bold text-ink-soft hover:text-brand"
            >
              View site ↗
            </Link>
            <div className="text-right">
              <p className="text-[0.8rem] font-bold leading-tight">{session.name}</p>
              <p className="text-[0.68rem] uppercase tracking-[0.08em] text-ink-mute">
                {ROLE_LABEL[session.role]}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="border border-rule-strong px-3 py-1.5 text-[0.74rem] font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="shell py-7">{children}</div>
    </div>
  );
}
