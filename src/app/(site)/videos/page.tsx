import type { Metadata } from "next";
import { CountryFlag } from "@/components/CountryFlag";
import Link from "next/link";
import { db } from "@/lib/db";
import { EditorialImage } from "@/components/EditorialImage";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { formatDuration, formatShortDate } from "@/lib/format";
import { IconPlay } from "@/components/icons";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const KINDS = ["NEWS", "INTERVIEW", "EXPLAINER", "DOCUMENTARY", "CULTURE", "BUSINESS"] as const;

export const metadata: Metadata = {
  title: "Videos",
  description:
    "News, interviews, explainers and documentary video from Somalia, Ethiopia, Djibouti and Eritrea.",
  alternates: { canonical: `${SITE.url}/videos` },
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const kind = (await searchParams).kind?.toUpperCase();
  const active = KINDS.includes(kind as never) ? kind : undefined;

  const videos = await db.video.findMany({
    where: { published: true, ...(active ? { kind: active as never } : {}) },
    orderBy: { publishedAt: "desc" },
    include: { country: true },
  });

  return (
    <div className="shell py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Videos" }]} />

      <PageHeader
        eyebrow="Watch"
        title="Videos"
        blurb="News, interviews, explainers and documentary film from across the Horn of Africa."
        meta={<span className="text-[0.8rem] text-ink-mute">{videos.length} videos</span>}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/videos"
            className={`border px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] transition-colors ${
              !active ? "border-ink bg-ink text-white" : "border-rule-strong hover:border-ink"
            }`}
          >
            All
          </Link>
          {KINDS.map((k) => (
            <Link
              key={k}
              href={`/videos?kind=${k.toLowerCase()}`}
              className={`border px-3 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.05em] transition-colors ${
                active === k ? "border-ink bg-ink text-white" : "border-rule-strong hover:border-ink"
              }`}
            >
              {k.charAt(0) + k.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v) => (
          <article key={v.id} className="group">
            <Link href={`/videos/${v.slug}`} className="relative block overflow-hidden bg-shell">
              <EditorialImage
                seed={v.imageSeed}
                category="explained"
                alt={v.title}
                detail={false}
                className="h-[164px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/90 pl-0.5 text-white">
                  <IconPlay className="h-[18px] w-[18px]" />
                </span>
              </span>
              <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-[0.68rem] font-bold text-white">
                {formatDuration(v.durationSec)}
              </span>
              <span className="absolute left-2 top-2 chip" data-c="explained">
                {v.kind}
              </span>
            </Link>
            <div className="pt-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {v.country && (
                  <span className="text-[0.66rem] font-bold uppercase tracking-[0.09em] text-ink-mute">
                    <CountryFlag slug={v.country.slug} /> {v.country.name}
                  </span>
                )}
                <span className="meta">{formatShortDate(v.publishedAt)}</span>
              </div>
              <Link href={`/videos/${v.slug}`}>
                <h3 className="hl clamp-2 mt-1 text-[0.98rem]">{v.title}</h3>
              </Link>
              <p className="clamp-2 mt-1.5 text-[0.84rem] leading-relaxed text-ink-soft">
                {v.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
