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
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.07em] text-ink">
          {item.source.name}
        </span>
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
          {item.source.name}
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
          Headline and extract © {item.source.name} — reproduced for reference,
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

/** The four-country chips shown on the wire band. */
function CountryChips({ item }: { item: WireCardItem }) {
  if (item.countries.length === 0) return null;
  return (
    <>
      {item.countries.map(({ country }) => (
        <Link
          key={country.slug}
          href={`/${country.slug}`}
          className="border border-rule px-1.5 py-px text-[0.58rem] font-extrabold uppercase tracking-[0.06em] text-ink-mute transition-colors hover:border-brand hover:text-brand"
        >
          {country.name}
        </Link>
      ))}
    </>
  );
}

/**
 * The wire's front-page band.
 *
 * This sits high on the homepage because it is the only part of the front page
 * that moves. Our own article count is fixed; the wire turns over every couple
 * of hours, and a reader arriving twice in a day should be able to see that.
 * Hence the freshness line in the header — it is the page saying, checkably,
 * that it is current.
 */
export function WireBand({
  items,
  lastFetchedAt,
  sourceCount,
}: {
  items: WireCardItem[];
  lastFetchedAt: Date | null;
  sourceCount: number;
}) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;

  return (
    <section className="mt-9 border-t-[3px] border-ink pt-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-[1.35rem] font-extrabold tracking-[-0.02em]">The Wire</h2>
        <p className="text-[0.8rem] text-ink-soft">
          Headlines from {sourceCount} newsrooms across the Horn and beyond
        </p>
        {lastFetchedAt && (
          <span className="flex items-center gap-1.5 text-[0.74rem] font-semibold text-ink-mute">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f7a3f]"
              aria-hidden
            />
            Updated {timeAgo(lastFetchedAt)}
          </span>
        )}
        <Link
          href="/wire"
          className="ml-auto text-[0.74rem] font-extrabold uppercase tracking-[0.07em] text-brand hover:underline"
        >
          All headlines →
        </Link>
      </div>

      <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
        {/* The newest item is given the excerpt; the rest are headline-only so
            four columns stay level and scannable. */}
        <div className="border-t-2 border-brand pt-3">
          <WireLink item={lead} />
          <div className="mt-4 space-y-4 border-t border-rule pt-4">
            {rest.slice(0, 2).map((item) => (
              <WireLink key={item.id} item={item} showExcerpt={false} />
            ))}
          </div>
        </div>

        {[0, 1, 2].map((col) => {
          const slice = rest.slice(2 + col * 3, 2 + col * 3 + 3);
          if (slice.length === 0) return null;
          return (
            <div key={col} className="space-y-4 border-t border-rule pt-3">
              {slice.map((item) => (
                <div key={item.id}>
                  <WireLink item={item} showExcerpt={false} />
                  <div className="mt-1.5 flex flex-wrap gap-1.5 pl-3">
                    <CountryChips item={item} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="mt-4 border-t border-rule pt-3 text-[0.76rem] leading-relaxed text-ink-mute">
        Each headline and extract above is the work of the newsroom credited
        beside it and remains its copyright; we link out rather than reproduce.{" "}
        <Link href="/wire/about" className="font-semibold text-brand hover:underline">
          How the wire works
        </Link>
      </p>
    </section>
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
