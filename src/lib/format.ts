/**
 * An ISO instant for metadata and structured data, or undefined.
 *
 * The rest of this file already accepts `Date | string` because cached rows
 * arrive as strings; this is the same tolerance for the machine-readable
 * dates. Returning undefined rather than throwing matters here: these values
 * go into og: tags and JSON-LD, where a missing property costs a little SEO
 * and a thrown one costs the whole page. The article route used to call
 * `publishedAt?.toISOString()` directly, which guarded null but not string,
 * and 500'd every article on its second view.
 */
export function toIso(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return `${formatDate(date)} · ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** "1 hour ago" / "3 days ago" — capped at a week, then falls back to a date. */
export function timeAgo(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatShortDate(date);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Article URL. Country stories nest under their country; regional ones under /horn. */
export function articleHref(a: {
  slug: string;
  country?: { slug: string } | null;
  category: { slug: string };
}) {
  const base = a.country?.slug ?? "horn";
  return `/${base}/${a.category.slug}/${a.slug}`;
}

export function categoryHref(slug: string) {
  return `/${slug}`;
}
