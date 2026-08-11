import Link from "next/link";
import { EditorialImage } from "@/components/EditorialImage";
import { articleHref, formatShortDate, timeAgo } from "@/lib/format";
import type { CardArticle } from "@/lib/queries";

function Chip({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="chip" data-c={slug}>
      {name}
    </span>
  );
}

function DevelopingChip() {
  return <span className="chip chip--developing">Developing Story</span>;
}

/**
 * Full-bleed hero with the headline sitting on the image.
 *
 * Two modes, because the headline is absolutely positioned against the bottom
 * of the card and must never drift away from the picture:
 *
 * - default: the image has a fixed height and the card is `self-start`, so a
 *   taller neighbour in the same grid row cannot stretch it.
 * - `fill`: the image is absolutely positioned and covers the card, so the card
 *   *is* free to stretch — the picture grows with it and the headline stays
 *   pinned to its bottom edge. Use this when the card shares a row with others
 *   that should bottom-align.
 */
export function HeroCard({
  article,
  fill = false,
}: {
  article: CardArticle;
  fill?: boolean;
}) {
  return (
    <article
      className={`group relative isolate overflow-hidden bg-navy-deep ${
        fill ? "min-h-[330px] sm:min-h-[400px] md:min-h-0" : "self-start"
      }`}
    >
      <Link href={articleHref(article)} className={fill ? "block h-full" : "block"}>
        <EditorialImage
          seed={article.imageSeed}
          category={article.category.slug}
          src={article.imageUrl}
          alt={article.imageCaption}
          priority
          className={
            fill
              ? "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              : "h-[330px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-[400px] lg:h-[490px]"
          }
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Chip slug={article.category.slug} name={article.category.name} />
            {article.isDeveloping && <DevelopingChip />}
          </div>
          <h2 className="max-w-3xl text-[1.6rem] font-extrabold leading-[1.1] tracking-[-0.028em] text-white sm:text-[2.15rem] lg:text-[2.6rem]">
            {article.headline}
          </h2>
          <p className="clamp-2 mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-white/80 sm:text-[1rem]">
            {article.deck}
          </p>
          <p className="mt-4 text-[0.78rem] text-white/65">
            {formatShortDate(article.publishedAt)}
            <span className="mx-2 text-white/35">·</span>
            {timeAgo(article.publishedAt)}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Compact overlay card — the hero's companions. Same two modes as HeroCard. */
export function OverlayCard({
  article,
  height = "h-[152px]",
  fill = false,
}: {
  article: CardArticle;
  height?: string;
  fill?: boolean;
}) {
  return (
    <article
      className={`group relative isolate overflow-hidden bg-navy-deep ${
        fill ? "min-h-[150px] md:min-h-0" : "self-start"
      }`}
    >
      <Link href={articleHref(article)} className={fill ? "block h-full" : "block"}>
        <EditorialImage
          seed={article.imageSeed}
          category={article.category.slug}
          src={article.imageUrl}
          alt={article.imageCaption}
          detail={false}
          className={
            fill
              ? "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              : `${height} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`
          }
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <Chip slug={article.category.slug} name={article.category.name} />
          <h3 className="clamp-2 mt-2 text-[0.98rem] font-extrabold leading-[1.22] text-white">
            {article.headline}
          </h3>
          <p className="mt-1.5 text-[0.72rem] text-white/60">
            {formatShortDate(article.publishedAt)}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Image above, text below — the default listing card. */
export function StackedCard({
  article,
  showDeck = true,
  imageHeight = "h-[168px]",
}: {
  article: CardArticle;
  showDeck?: boolean;
  imageHeight?: string;
}) {
  return (
    <article className="group flex flex-col">
      <Link href={articleHref(article)} className="block overflow-hidden bg-shell">
        <EditorialImage
          seed={article.imageSeed}
          category={article.category.slug}
          src={article.imageUrl}
          alt={article.imageCaption}
          detail={false}
          className={`${imageHeight} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`}
        />
      </Link>
      <div className="pt-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Chip slug={article.category.slug} name={article.category.name} />
          {article.country && (
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-mute">
              {article.country.name}
            </span>
          )}
        </div>
        <Link href={articleHref(article)}>
          <h3 className="hl clamp-3 text-[1.03rem]">{article.headline}</h3>
        </Link>
        {showDeck && (
          <p className="clamp-2 mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">
            {article.deck}
          </p>
        )}
        <p className="meta mt-2">
          {formatShortDate(article.publishedAt)}
          <span className="mx-1.5">·</span>
          {article.readMinutes} min read
        </p>
      </div>
    </article>
  );
}

/** Side-by-side thumbnail and headline. */
export function RowCard({ article }: { article: CardArticle }) {
  return (
    <article className="group flex gap-3.5">
      <Link href={articleHref(article)} className="shrink-0 overflow-hidden bg-shell">
        <EditorialImage
          seed={article.imageSeed}
          category={article.category.slug}
          src={article.imageUrl}
          alt={article.imageCaption}
          detail={false}
          className="h-[74px] w-[104px] object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </Link>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Chip slug={article.category.slug} name={article.category.name} />
        </div>
        <Link href={articleHref(article)}>
          <h3 className="hl clamp-2 text-[0.92rem]">{article.headline}</h3>
        </Link>
        <p className="meta mt-1">{timeAgo(article.publishedAt)}</p>
      </div>
    </article>
  );
}

/** Bulleted headline, no image — the country-block list style. */
export function BulletItem({ article }: { article: CardArticle }) {
  return (
    <li className="flex gap-2.5">
      <span
        className="mt-[0.55rem] h-[5px] w-[5px] shrink-0 rounded-full bg-brand"
        aria-hidden
      />
      <Link href={articleHref(article)} className="hl clamp-2 text-[0.87rem] leading-[1.4]">
        {article.headline}
      </Link>
    </li>
  );
}

/** Numbered trending entry. */
export function TrendingItem({
  article,
  rank,
}: {
  article: CardArticle;
  rank: number;
}) {
  return (
    <li className="flex gap-3 border-b border-rule pb-3 last:border-b-0 last:pb-0">
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-brand text-[0.7rem] font-extrabold text-white">
        {rank}
      </span>
      <div className="min-w-0">
        <Link href={articleHref(article)} className="hl clamp-3 text-[0.88rem] leading-[1.32]">
          {article.headline}
        </Link>
        <p className="meta mt-1">{formatShortDate(article.publishedAt)}</p>
      </div>
    </li>
  );
}

/** Headline-only list row with a rule, used in "Latest" columns. */
export function TextItem({ article }: { article: CardArticle }) {
  return (
    <article className="border-b border-rule py-3 last:border-b-0">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Chip slug={article.category.slug} name={article.category.name} />
        {article.country && (
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-mute">
            {article.country.name}
          </span>
        )}
        <span className="meta ml-auto">{timeAgo(article.publishedAt)}</span>
      </div>
      <Link href={articleHref(article)}>
        <h3 className="hl clamp-2 text-[0.98rem]">{article.headline}</h3>
      </Link>
    </article>
  );
}
