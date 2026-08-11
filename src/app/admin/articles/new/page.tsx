import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, can } from "@/lib/auth";
import { getFormOptions } from "@/lib/admin-options";
import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New article" };

const ERRORS: Record<string, string> = {
  required: "A headline and body are required.",
  noauthor:
    "Your account is not linked to an author profile, so an article from you would have no byline. Ask a Super Admin to link one.",
};

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "article.create")) redirect("/admin");

  const { error } = await searchParams;
  const [options, me] = await Promise.all([
    getFormOptions(),
    db.user.findUnique({ where: { id: session.userId }, select: { authorId: true } }),
  ]);

  const defaultCategory =
    options.categories.find((c) => c.slug === "politics")?.id ?? options.categories[0]?.id ?? "";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/admin/articles" className="text-[0.8rem] font-bold text-ink-soft hover:text-brand">
          ← Articles
        </Link>
        <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em]">New article</h1>
        <span className="border border-rule-strong px-2 py-0.5 text-[0.66rem] font-extrabold uppercase tracking-[0.07em] text-ink-mute">
          Saves as draft
        </span>
      </div>

      {error && ERRORS[error] && (
        <p className="mb-5 border-l-[3px] border-brand bg-[#fdf0f1] px-4 py-3 text-[0.88rem] text-[#8a1020]">
          {ERRORS[error]}
        </p>
      )}

      <ArticleForm
        options={options}
        canEditAny={can(session.role, "article.editAny")}
        canManageHomepage={can(session.role, "homepage.manage")}
        values={{
          headline: "",
          slug: "",
          deck: "",
          body: "",
          countryId: "",
          regionId: "",
          categoryId: defaultCategory,
          subcategoryId: "",
          authorId: me?.authorId ?? options.authors[0]?.id ?? "",
          placement: "NONE",
          isBreaking: false,
          isDeveloping: false,
          imageSeed: "",
          imageUrl: "",
          imageCaption: "",
          imageCredit: "",
          sourceNote: "",
          seoTitle: "",
          seoDescription: "",
          canonicalUrl: "",
          countryIds: [],
          topicIds: [],
        }}
      />
    </div>
  );
}
