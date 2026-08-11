import { notFound } from "next/navigation";
import { CountryFlag } from "@/components/CountryFlag";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { EditorialImage } from "@/components/EditorialImage";
import { Breadcrumbs } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { ShareBar } from "@/components/ShareBar";
import { formatDate, formatDuration } from "@/lib/format";
import { IconPlay } from "@/components/icons";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const v = await db.video.findFirst({ where: { slug, published: true } });
  if (!v) return { title: "Video not found" };
  return {
    title: v.title,
    description: v.description,
    alternates: { canonical: `${SITE.url}/videos/${slug}` },
    openGraph: { type: "video.other", title: v.title, description: v.description },
  };
}

export default async function VideoPage({ params }: Params) {
  const { slug } = await params;
  const video = await db.video.findFirst({
    where: { slug, published: true },
    include: { country: true },
  });
  if (!video) notFound();

  const more = await db.video.findMany({
    where: { published: true, id: { not: video.id } },
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: { country: true },
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    uploadDate: video.publishedAt.toISOString(),
    duration: `PT${Math.floor(video.durationSec / 60)}M${video.durationSec % 60}S`,
    thumbnailUrl: [`${SITE.url}/api/og/video-${video.slug}`],
    publisher: { "@type": "NewsMediaOrganization", name: SITE.name, url: SITE.url },
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
            { label: "Videos", href: "/videos" },
            { label: video.title },
          ]}
        />

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="relative bg-navy-deep">
              <EditorialImage
                seed={video.imageSeed}
                category="explained"
                alt={video.title}
                className="h-[240px] w-full object-cover sm:h-[360px] lg:h-[460px]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand pl-1 text-white">
                  <IconPlay className="h-6 w-6" />
                </span>
                {/* The player mounts here once a provider is connected. The
                    schema, page and routing are already in place. */}
                <p className="px-6 text-center text-[0.8rem] text-white/70">
                  Video playback is not yet connected. This page is ready for a
                  YouTube or Vimeo embed via the CMS.
                </p>
              </div>
              <span className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 text-[0.72rem] font-bold text-white">
                {formatDuration(video.durationSec)}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="chip" data-c="explained">
                {video.kind}
              </span>
              {video.country && (
                <Link
                  href={`/${video.country.slug}`}
                  className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-ink-soft hover:text-brand"
                >
                  <CountryFlag slug={video.country.slug} /> {video.country.name}
                </Link>
              )}
              <span className="meta">{formatDate(video.publishedAt)}</span>
            </div>

            <h1 className="mt-2.5 max-w-3xl text-[1.7rem] font-extrabold leading-[1.12] tracking-[-0.03em] sm:text-[2.15rem]">
              {video.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft">
              {video.description}
            </p>

            <div className="mt-5 border-y border-rule py-3">
              <ShareBar url={`${SITE.url}/videos/${video.slug}`} title={video.title} />
            </div>
          </div>

          <aside>
            <SectionHead title="More Videos" href="/videos" light />
            <div className="space-y-5">
              {more.map((v) => (
                <article key={v.id} className="group flex gap-3">
                  <Link
                    href={`/videos/${v.slug}`}
                    className="relative shrink-0 overflow-hidden bg-shell"
                  >
                    <EditorialImage
                      seed={v.imageSeed}
                      category="explained"
                      alt={v.title}
                      detail={false}
                      className="h-[64px] w-[104px] object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-[0.62rem] font-bold text-white">
                      {formatDuration(v.durationSec)}
                    </span>
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/videos/${v.slug}`}>
                      <h3 className="hl clamp-2 text-[0.88rem]">{v.title}</h3>
                    </Link>
                    <p className="meta mt-1">{v.country?.name ?? "Horn of Africa"}</p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
