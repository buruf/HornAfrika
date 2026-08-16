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
 * These four rules are the whole contract, and they are all explicit markings.
 *
 * There used to be a fifth, unwritten one: make it visually weaker than our
 * own cards — no picture, a left rule instead of a chip, small type — so the
 * difference was obvious at a glance. That worked while the wire was a rail
 * beside real article cards. Once the articles were retired the wire became
 * the entire site, and the whole front page inherited the subordinate styling:
 * every headline at 14px, pictures under a tenth of the page. It read as thin,
 * because it was designed to.
 *
 * So the weakness is gone and the markings stay. `WireCard` is a full card for
 * where the wire is the main event; `WireLink` remains for rails and dense
 * lists. When real reporting returns it will stand out by carrying a byline
 * and staying on the site, not by everything else being quiet.
 */

/**
 * Who wrote this, and where we found it.
 *
 * Normally those are the same outlet and only one name shows. When we fetched
 * a syndicator, the newsroom that did the reporting is named first and the
 * syndicator second — "Shabelle — via AllAfrica". Crediting AllAfrica alone
 * for a Shabelle story would be inaccurate, and the feed tells us, so we say
 * it.
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
  showImage = false,
}: {
  item: WireCardItem;
  showExcerpt?: boolean;
  /** Publisher thumbnail above the headline, where the feed offers one. */
  showImage?: boolean;
}) {
  return (
    <article className="border-l-2 border-rule-strong pl-3 transition-colors hover:border-brand">
      {showImage && item.imageUrl && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden
          className="mb-2 block overflow-hidden bg-shell"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-[124px] w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
          />
        </a>
      )}
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
    <article className="grid gap-4 border-b border-rule py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_180px]">
      <div className="min-w-0">
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
          Headline{item.imageUrl ? ", extract and picture" : " and extract"} ©{" "}
          {item.originalPublisher ?? item.source.name} — reproduced for
          reference, full article at the publisher.
        </span>
      </div>
      </div>

      {/* The publisher's own thumbnail where the feed offers one, hotlinked
          rather than copied — the same posture as the headline. Where it does
          not, the deterministic editorial graphic stands in, so a list of
          twenty headlines is not half pictures and half gaps. Decorative
          either way: it carries nothing the headline does not, so it is hidden
          from screen readers and the link beside it stands alone. */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        className="order-first block overflow-hidden bg-shell sm:order-none"
      >
        <EditorialImage
          seed={item.id}
          category={item.topic ?? "default"}
          src={item.imageUrl}
          alt=""
          detail={false}
          className="h-[130px] w-full object-cover transition-transform duration-500 hover:scale-[1.04] sm:h-[120px]"
        />
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

/**
 * A full card for a wire item: picture, outlet, headline, extract.
 *
 * The wire's other presentations are deliberately quiet — a left rule, no
 * picture, small type — so that a link out could never be mistaken for our own
 * reporting sitting beside it. That was the right call when the wire was a
 * rail next to article cards. It became the wrong one the moment the wire
 * became the entire site: every headline on the page rendered at 14px with no
 * image, and the site read as thin.
 *
 * So aggregation gets a proper card now that aggregation is the product. What
 * keeps it honest is not visual weakness but explicit marking — the outlet is
 * named above the headline, the arrow says it leaves the site, and the section
 * around it carries the standing notice. When real reporting returns it will
 * be the thing that stands out, because it will carry a byline and stay on the
 * site.
 *
 * About half of wire items have a picture. The rest fall back to the same
 * deterministic editorial graphic used elsewhere on the site — abstract, never
 * a stand-in photograph of an event that we do not have a photograph of.
 */
export function WireCard({
  item,
  imageHeight = "h-[168px]",
  showExcerpt = true,
}: {
  item: WireCardItem;
  imageHeight?: string;
  showExcerpt?: boolean;
}) {
  return (
    <article className="group/card flex flex-col">
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
          className={`${imageHeight} w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]`}
        />
      </a>

      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <Credit
          item={item}
          className="text-[0.68rem] font-extrabold uppercase tracking-[0.07em] text-brand"
        />
        {item.source.stateAffiliated && <StateTag />}
        <span className="meta">{timeAgo(item.publishedAt)}</span>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-1 block"
      >
        <h3 className="clamp-3 text-[1.02rem] font-extrabold leading-[1.24] tracking-[-0.01em] group-hover:text-brand">
          {item.title}
          <span className="ml-1 text-[0.76rem] font-normal text-ink-mute" aria-hidden>
            ↗
          </span>
        </h3>
      </a>

      {showExcerpt && item.excerpt && (
        <p className="clamp-2 mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">
          {item.excerpt}
        </p>
      )}
    </article>
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
 * The lead card at the top of the homepage.
 *
 * Bigger than anything else on the wire, because it is the first thing a
 * reader sees and it has to carry the claim that this site is current. It
 * still obeys every wire rule — outlet named first and prominently, headline
 * links off-site with ↗, extract not body, copyright stated — so nobody can
 * mistake it for our own reporting just because it is large.
 *
 * The image is the publisher's, hotlinked rather than copied, and is
 * decorative: it carries no information the headline does not, so it is
 * marked aria-hidden and the link text stands alone for screen readers.
 */
export function WireHero({ item }: { item: WireCardItem }) {
  return (
    <article className="grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
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
          priority
          className="h-[240px] w-full object-cover transition-transform duration-500 hover:scale-[1.03] sm:h-[340px]"
        />
      </a>

      <div>
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <a
            href={item.source.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-brand hover:underline"
          >
            <Credit item={item} />
          </a>
          {item.source.stateAffiliated && <StateTag />}
          <CountryChips item={item} />
          <span className="meta">{timeAgo(item.publishedAt)}</span>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-2 block"
        >
          <h3 className="text-[1.5rem] font-extrabold leading-[1.14] tracking-[-0.02em] group-hover:text-brand sm:text-[1.85rem]">
            {item.title}
            <span className="ml-1.5 text-[1rem] font-normal text-ink-mute" aria-hidden>
              ↗
            </span>
          </h3>
        </a>

        {item.excerpt && (
          <p className="clamp-4 mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">
            {item.excerpt}
          </p>
        )}

        <p className="mt-2.5 text-[0.74rem] text-ink-mute">
          Headline, extract and picture © {item.originalPublisher ?? item.source.name}{" "}
          — reproduced for reference, full article at the publisher.
        </p>
      </div>
    </article>
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

        {rest.slice(2).map((item) => (
          <div key={item.id} className="border-t border-rule pt-3">
            <WireCard item={item} imageHeight="h-[132px]" showExcerpt={false} />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <CountryChips item={item} />
            </div>
          </div>
        ))}
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
