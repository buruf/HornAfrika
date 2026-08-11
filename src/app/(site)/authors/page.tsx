import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Journalists",
  description: "The reporters and editors covering the Horn of Africa for Hornafrika.",
  alternates: { canonical: `${SITE.url}/authors` },
};

export default async function AuthorsPage() {
  const authors = await db.author.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: { where: { status: { in: ["PUBLISHED", "UPDATED"] } } },
        },
      },
    },
  });

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journalists" }]} />

      <PageHeader
        eyebrow="Newsroom"
        title="Our Journalists"
        blurb="Every article on Hornafrika carries a named author. These are the reporters and editors who write them."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((a) => (
          <Link
            key={a.id}
            href={`/authors/${a.slug}`}
            className="border border-rule bg-white p-5 transition-colors hover:border-ink"
          >
            <h2 className="text-[1.1rem] font-extrabold">{a.name}</h2>
            <p className="mt-0.5 text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-brand">
              {a.title}
            </p>
            {a.location && <p className="text-[0.78rem] text-ink-mute">{a.location}</p>}
            <p className="mt-2.5 text-[0.88rem] leading-relaxed text-ink-soft">{a.bio}</p>
            <p className="mt-3 text-[0.75rem] text-ink-mute">
              {a._count.articles} {a._count.articles === 1 ? "article" : "articles"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
