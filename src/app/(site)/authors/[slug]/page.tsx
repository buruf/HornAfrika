import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { cardSelect, publishedWhere } from "@/lib/queries";
import { StackedCard } from "@/components/cards";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = await db.author.findUnique({ where: { slug } });
  if (!a) return { title: "Author not found" };
  return {
    title: a.name,
    description: `${a.title}. ${a.bio}`,
    alternates: { canonical: `${SITE.url}/authors/${slug}` },
  };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = await db.author.findUnique({ where: { slug } });
  // A desk gets no profile page — it is a byline, not a journalist, and a
  // page with a bio would imply a person standing behind it.
  if (!author || author.isDesk) notFound();

  const articles = await db.article.findMany({
    where: { ...publishedWhere, authorId: author.id },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: cardSelect,
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    url: `${SITE.url}/authors/${author.slug}`,
    worksFor: { "@type": "NewsMediaOrganization", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="shell py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Journalists", href: "/authors" },
            { label: author.name },
          ]}
        />

        <PageHeader
          eyebrow={author.title}
          title={author.name}
          blurb={author.bio}
          meta={
            author.location ? (
              <span className="text-[0.8rem] text-ink-mute">{author.location}</span>
            ) : undefined
          }
        />

        <div className="mt-8">
          <SectionHead
            title={`${articles.length} ${articles.length === 1 ? "Article" : "Articles"}`}
            light
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {articles.map((a) => (
              <StackedCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
