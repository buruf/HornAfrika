import Link from "next/link";
import { EditorialImage } from "@/components/EditorialImage";
import { timeAgo } from "@/lib/format";
import type { WireCardItem } from "@/lib/wire";

/**
 * Wire presentation rules, applied everywhere aggregated content appears:
 *
 *  - the outlet's name is always visible, never smaller than the timestamp;
 *  - the headline links off-site, marked with ↗ and opening in a new tab;
 *  - we show an excerpt, never a body;
 *  - the surrounding block always says these are links to other newsrooms.
 *
 * The visual language is deliberately different from our own cards — no image,
 * a left rule instead of a chip — so a reader can tell at a glance which is
 * Hornafrika reporting and which is a link out.
 */

/**
 * Who wrote this, and where we found it.
 *
 * Normally the same outlet, and only one name shows. When the feed we fetched
 * is a syndicator, the newsroom that did the reporting is named first and the
 * syndicator second — "Shabelle — via AllAfrica".
 */
function Credit({ item, className = "" }: { item: WireCardItem; className?: string }) {
  const wrote = item.originalPublisher;
  return (
    <span className={className}>
      {wrote ? (
        <>
          {wrote}
          <span className="font-semibold text-ink-mute"> — via {item.source.name}</span>
        </>
      ) : (
        item.source.name
      )}
    </span>
  );
}

const KIND_LABEL: Record<string, string> = {
  REGIONAL: "Regional",
  HORN: "Horn",
  PANAFRICAN: "Pan-African",
  INTERNATIONAL: "International",
};

/**
 * State-owned and state-funded outlets are badged rather than excluded. A
 * reader is entitled to know who owns the newsroom before reading it.
 */
function StateTag() {
  return (
    <span
      title="State-owned or state-funded outlet"
      className="border border-[#a8730f] px-1 py-px text-[0.56rem] font-extrabold uppercase tracking-[0.06em] text-[#8a5a00]"
    >
      State-affiliated
    </span>
  );
}

export function WireLink({
  item,
  showExcerpt = true,
}: {
  item: WireCardItem;
  showExcerpt?: boolean;
}) {
  return (
    <article className="border-l-2 border-rule-strong pl-3 transition-colors hover:border-brand">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <Credit
          item={item}
          className="text-[0.7rem] font-extrabold uppercase tracking-[0.07em] text-ink"
        />
        {item.source.stateAffiliated && <StateTag />}
        {item.source.language !== "en" && (
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.06em] text-ink-mute">
            {item.source.language === "so" ? "Somali" : item.source.language === "fr" ? "French" : item.source.language}
          </span>
        )}
        <span className="meta">{timeAgo(item.publishedAt)}</span>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-1 block"
      >
        <h3 className="clamp-3 text-[0.92rem] font-bold leading-[1.32] group-hover:text-brand">
          {item.title}
          <span className="ml-1 text-[0.72rem] font-normal text-ink-mute" aria-hidden>
            ↗
          </span>
        </h3>
      </a>

      {showExcerpt && item.excerpt && (
        <p className="clamp-2 mt-1 text-[0.82rem] leading-relaxed text-ink-soft">
          {item.excerpt}
        </p>
      )}
    </article>
  );
}

/** Larger presentation for the /wire page itself. */
export function WireRow({ item }: { item: WireCardItem }) {
  return (
    <article className="border-b border-rule py-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <a
          href={item.source.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.72rem] font-extrabold uppercase tracking-[0.07em] text-brand hover:underline"
        >
          <Credit item={item} />
        </a>
        <span className="border border-rule px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-[0.06em] text-ink-mute">
          {KIND_LABEL[item.source.kind] ?? item.source.kind}
        </span>
        {item.source.stateAffiliated && <StateTag />}
        {item.author && (
          <span className="text-[0.74rem] text-ink-mute">{item.author}</span>
        )}
        <span className="meta ml-auto">{timeAgo(item.publishedAt)}</span>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-1.5 block"
      >
        <h2 className="clamp-3 text-[1.08rem] font-extrabold leading-[1.25] group-hover:text-brand">
          {item.title}
          <span className="ml-1.5 text-[0.8rem] font-normal text-ink-mute" aria-hidden>
            ↗
          </span>
        </h2>
      </a>

      {item.excerpt && (
        <p className="clamp-3 mt-1.5 max-w-3xl text-[0.88rem] leading-relaxed text-ink-soft">
          {item.excerpt}
        </p>
      )}

      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.74rem] font-bold text-ink-mute hover:text-brand"
        >
          Read at {item.source.name} ↗
        </a>
        {/* Ownership stated on the item itself. The headline and extract are
            the publisher's work, not ours, and saying so here is clearer than
            burying it in a policy page nobody opens. */}
        <span className="text-[0.72rem] text-ink-mute">
          Headline and extract © {item.originalPublisher ?? item.source.name} —
          reproduced for reference,
          full article at the publisher.
        </span>
      </div>
    </article>
  );
}

/**
 * A wire headline in the compact row style used by the Latest grid.
 *
 * Deliberately built to match TextItem in components/cards.tsx line for line —
 * same border, same padding, same type scale — so mixing wire headlines into
 * that grid changes what it says, not how it looks. The outlet name sits where
 * the category chip would, and the arrow marks the link out.
 */
export function WireTextItem({ item }: { item: WireCardItem }) {
  return (
    <article className="border-b border-rule py-3 last:border-b-0">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Credit
          item={item}
          className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-brand"
        />
        {item.source.stateAffiliated && <StateTag />}
        <span className="meta ml-auto">{timeAgo(item.publishedAt)}</span>
      </div>
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        <h3 className="hl clamp-2 text-[0.98rem]">
          {item.title}
          <span className="ml-1 text-[0.72rem] font-normal text-ink-mute" aria-hidden>
            ↗
          </span>
        </h3>
      </a>
    </article>
  );
}

/**
 * A wire headline in the Trending list style.
 *
 * Matches TrendingItem in cards.tsx — same rank pill, same clamp, same meta
 * line — so the Trending card keeps its shape while the content underneath it
 * becomes something that actually changes. Where an article shows its date,
 * this shows how many newsrooms carried the story, because that is the thing
 * being ranked.
 */
export function WireTrendingItem({
  item,
  rank,
  outlets,
}: {
  item: WireCardItem;
  rank: number;
  outlets: number;
}) {
  return (
    <li className="flex gap-3 border-b border-rule pb-3 last:border-b-0 last:pb-0">
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-brand text-[0.7rem] font-extrabold text-white">
        {rank}
      </span>
      <div className="min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hl clamp-3 text-[0.88rem] leading-[1.32]"
        >
          {item.title}
          <span className="ml-1 text-[0.7rem] font-normal text-ink-mute" aria-hidden>
            ↗
          </span>
        </a>
        <p className="meta mt-1">
          {outlets > 1 ? `${outlets} newsrooms` : item.originalPublisher ?? item.source.name}
          <span className="mx-1.5">·</span>
          {timeAgo(item.publishedAt)}
        </p>
      </div>
    </li>
  );
}

/**
 * A wire headline in the StackedCard style, for the grids that used articles.
 *
 * Line for line the same as StackedCard in cards.tsx: same image box, same
 * padding, same type. The category chip's slot carries the outlet instead,
 * which is the one thing that must differ.
 */
export function WireStackedCard({
  item,
  imageHeight = "h-[168px]",
  showExcerpt = true,
  note,
}: {
  item: WireCardItem;
  imageHeight?: string;
  showExcerpt?: boolean;
  note?: string;
}) {
  return (
    <article className="group flex flex-col">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        className="block overflow-hidden bg-shell"
      >
        <EditorialImage
          seed={item.id}
          category={item.topic ?? "default"}
          src={item.imageUrl}
          alt=""
          detail={false}
          className={`${imageHeight} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`}
        />
      </a>
      <div className="pt-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="bg-brand px-2 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-[0.07em] text-white">
            {item.originalPublisher ?? item.source.name}
          </span>
          {item.source.stateAffiliated && <StateTag />}
          {item.countries.map(({ country }) => (
            <span
              key={country.slug}
              className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-mute"
            >
              {country.name}
            </span>
          ))}
        </div>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          <h3 className="hl clamp-3 text-[1.03rem]">
            {item.title}
            <span className="ml-1 text-[0.75rem] font-normal text-ink-mute" aria-hidden>
              ↗
            </span>
          </h3>
        </a>
        {showExcerpt && item.excerpt && (
          <p className="clamp-2 mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">
            {item.excerpt}
          </p>
        )}
        <p className="meta mt-2">
          {timeAgo(item.publishedAt)}
          {note && (
            <>
              <span className="mx-1.5">·</span>
              {note}
            </>
          )}
        </p>
      </div>
    </article>
  );
}

/**
 * Wire equivalents of OverlayCard, RowCard and BulletItem.
 *
 * Each matches its counterpart in cards.tsx line for line, so a section can
 * fall back to the wire without the page changing shape. The one deliberate
 * difference in every case: the outlet's name takes the category chip's slot,
 * and the link carries the arrow. That is what keeps a link out from reading
 * as our own reporting when the two sit side by side in the same grid.
 */
export function WireOverlayCard({
  item,
  height = "h-[152px]",
  fill = false,
}: {
  item: WireCardItem;
  height?: string;
  fill?: boolean;
}) {
  return (
    <article
      className={`group relative isolate overflow-hidden bg-navy-deep ${
        fill ? "min-h-[150px] md:min-h-0" : "self-start"
      }`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={fill ? "block h-full" : "block"}
      >
        <EditorialImage
          seed={item.id}
          category={item.topic ?? "default"}
          src={item.imageUrl}
          alt=""
          detail={false}
          className={
            fill
              ? "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              : `${height} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`
          }
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <span className="bg-brand px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.07em] text-white">
            {item.originalPublisher ?? item.source.name}
          </span>
          <h3 className="clamp-2 mt-2 text-[0.98rem] font-extrabold leading-[1.22] text-white">
            {item.title}
            <span className="ml-1 text-[0.72rem] font-normal text-white/70" aria-hidden>
              ↗
            </span>
          </h3>
          <p className="mt-1.5 text-[0.72rem] text-white/60">{timeAgo(item.publishedAt)}</p>
        </div>
      </a>
    </article>
  );
}

export function WireRowCard({ item }: { item: WireCardItem }) {
  return (
    <article className="group flex gap-3.5">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        className="shrink-0 overflow-hidden bg-shell"
      >
        <EditorialImage
          seed={item.id}
          category={item.topic ?? "default"}
          src={item.imageUrl}
          alt=""
          detail={false}
          className="h-[74px] w-[104px] object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </a>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Credit
            item={item}
            className="text-[0.62rem] font-extrabold uppercase tracking-[0.07em] text-brand"
          />
        </div>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          <h3 className="hl clamp-2 text-[0.92rem]">
            {item.title}
            <span className="ml-1 text-[0.7rem] font-normal text-ink-mute" aria-hidden>
              ↗
            </span>
          </h3>
        </a>
        <p className="meta mt-1">{timeAgo(item.publishedAt)}</p>
      </div>
    </article>
  );
}

export function WireBulletItem({ item }: { item: WireCardItem }) {
  return (
    <li className="flex gap-2.5">
      <span
        className="mt-[0.55rem] h-[5px] w-[5px] shrink-0 rounded-full bg-brand"
        aria-hidden
      />
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hl clamp-2 text-[0.87rem] leading-[1.4]"
      >
        {item.title}
        <span className="ml-1 text-[0.68rem] font-normal text-ink-mute" aria-hidden>
          ↗
        </span>
      </a>
    </li>
  );
}

/**
 * A wire headline dressed as a hero slide.
 *
 * Deliberately identical to HeroCard in cards.tsx — same gradient, same type
 * scale, same padding — because it shares the hero carousel with real
 * articles and a reader should not see the furniture change underneath them
 * as it rotates.
 *
 * What does change is the attribution: the outlet's name replaces the category
 * chip, the arrow marks the link out, and the credit line names whoever wrote
 * it. Those are the markings that keep a link out from reading as our
 * reporting, and they do not depend on the slide being visually weaker.
 */
export function WireHeroSlide({ item }: { item: WireCardItem }) {
  return (
    <article className="group relative isolate min-h-[330px] overflow-hidden bg-navy-deep sm:min-h-[400px] md:min-h-0">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <EditorialImage
          seed={item.id}
          category={item.topic ?? "default"}
          src={item.imageUrl}
          alt=""
          priority
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="bg-brand px-2 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-white">
              {item.originalPublisher ?? item.source.name}
            </span>
            {item.source.stateAffiliated && <StateTag />}
            {item.countries.map(({ country }) => (
              <span
                key={country.slug}
                className="border border-white/40 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-white/85"
              >
                {country.name}
              </span>
            ))}
          </div>
          <h2 className="max-w-3xl text-[1.6rem] font-extrabold leading-[1.1] tracking-[-0.028em] text-white sm:text-[2.15rem] lg:text-[2.6rem]">
            {item.title}
            <span className="ml-2 text-[1.1rem] font-normal text-white/70" aria-hidden>
              ↗
            </span>
          </h2>
          {item.excerpt && (
            <p className="clamp-2 mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-white/80 sm:text-[1rem]">
              {item.excerpt}
            </p>
          )}
          <p className="mt-4 text-[0.78rem] text-white/65">
            {timeAgo(item.publishedAt)}
            <span className="mx-2 text-white/35">·</span>
            Published by {item.originalPublisher ?? item.source.name}, not Hornafrika
          </p>
        </div>
      </a>
    </article>
  );
}

/**
 * The standing explanation. Shown wherever wire content appears, so a reader is
 * never left guessing whether they are reading Hornafrika or someone else.
 */
export function WireNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[0.72rem] leading-relaxed text-ink-mute">
        Headlines from other newsrooms. Links open at the publisher.
      </p>
    );
  }
  return (
    <p className="text-[0.83rem] leading-relaxed text-ink-soft">
      These are headlines published by other newsrooms, not Hornafrika reporting.
      We show the headline, a short extract and a link; the full article stays
      with the publisher who wrote it, and{" "}
      <strong className="text-ink">
        copyright in each headline and extract remains with that publisher
      </strong>
      .{" "}
      <Link href="/wire/about" className="font-semibold text-brand underline">
        How the wire works
      </Link>
    </p>
  );
}

/** Sidebar/homepage rail used on the homepage and country pages. */
export function WireRail({
  items,
  title = "The Wire",
  href = "/wire",
  note,
}: {
  items: WireCardItem[];
  title?: string;
  href?: string;
  note?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="card p-4">
      <div className="section-head section-head--light mb-1.5 pb-2.5">
        <h2 className="section-title text-[0.92rem]">{title}</h2>
        <Link href={href} className="section-more">
          All
        </Link>
      </div>
      <p className="mb-3.5 text-[0.72rem] leading-relaxed text-ink-mute">
        {note ?? "Headlines from other newsrooms. Links open at the publisher."}
      </p>
      <div className="space-y-3.5">
        {items.map((item) => (
          <WireLink key={item.id} item={item} showExcerpt={false} />
        ))}
      </div>
      <Link
        href={href}
        className="mt-3.5 inline-block text-[0.72rem] font-bold uppercase tracking-[0.06em] text-brand"
      >
        More from the wire →
      </Link>
    </section>
  );
}
