import Link from "next/link";
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
