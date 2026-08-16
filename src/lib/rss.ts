import { XMLParser } from "fast-xml-parser";

/**
 * Feed parsing for the wire.
 *
 * Handles RSS 2.0, RDF/RSS 1.0 and Atom, because the 28 feeds we pull use all
 * three. Everything is normalised to one shape so the aggregator does not care
 * which dialect a publisher chose.
 */

export type ParsedItem = {
  guid: string;
  url: string;
  title: string;
  excerpt: string;
  author?: string;
  imageUrl?: string;
  publishedAt: Date;
  /** The newsroom that actually wrote it, when the feed we fetched is itself
   *  a syndicator. See splitOriginalPublisher. */
  originalPublisher?: string;
};

/**
 * Pull the original newsroom out of a syndicated excerpt.
 *
 * AllAfrica republishes other people's reporting and marks the source in the
 * body: "[Shabelle] Addis Ababa -- Ethiopia's ambassador...". Crediting
 * AllAfrica for a Shabelle story would be wrong, and the information is right
 * there, so it is parsed out and shown as "Shabelle — via AllAfrica".
 *
 * Conservative on purpose: the prefix must be a short bracketed name at the
 * very start. Square brackets appear in ordinary copy — "[Editor: ...]",
 * "[sic]" — and mistaking one for a byline would invent a publisher, which is
 * worse than missing one.
 */
export function splitOriginalPublisher(excerpt: string): {
  publisher?: string;
  text: string;
} {
  const m = /^\[([^\]]{2,40})\]\s*/.exec(excerpt);
  if (!m) return { text: excerpt };

  const name = m[1].trim();
  // A real masthead, not a note to the reader.
  if (/[:.]/.test(name) || /^(sic|editor|photo|file|update)$/i.test(name)) {
    return { text: excerpt };
  }
  return { publisher: name, text: excerpt.slice(m[0].length) };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  // Feeds are full of HTML entities in titles; let the parser resolve them.
  processEntities: true,
  htmlEntities: true,
});

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  ndash: "–", mdash: "—", hellip: "…", eacute: "é", egrave: "è",
  agrave: "à", ccedil: "ç", ocirc: "ô", uuml: "ü", ouml: "ö", auml: "ä",
  laquo: "«", raquo: "»", deg: "°", euro: "€", pound: "£", copy: "©",
  reg: "®", trade: "™", middot: "·", bull: "•", times: "×", frac12: "½",
};

/**
 * Decode HTML entities. Feeds routinely double-encode, so this runs twice —
 * `&amp;#8211;` in the wild is common and one pass leaves `&#8211;` visible.
 */
function decodeEntities(input: string): string {
  const once = (s: string) =>
    s
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      )
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&([a-z][a-z0-9]*);/gi, (m, name: string) => {
        const v = NAMED_ENTITIES[name.toLowerCase()];
        return v ?? m;
      });
  return once(once(input));
}

/** Publishers put HTML in descriptions. We store text, and only a little of it. */
export function toExcerpt(html: string, max = 240): string {
  const text = decodeEntities(
    String(html ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    // A second tag strip: decoding can reveal markup that was entity-encoded.
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= max) return text;
  // Cut on a word boundary so the excerpt does not end mid-word.
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

const first = <T,>(v: T | T[] | undefined): T | undefined =>
  Array.isArray(v) ? v[0] : v;

function textOf(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (typeof node === "object") {
    const o = node as Record<string, unknown>;
    if ("#text" in o) return String(o["#text"] ?? "");
  }
  return "";
}

/** Atom links are objects with rel/href; RSS links are plain strings. */
function linkOf(node: unknown): string {
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node)) {
    const alt = node.find(
      (l) => typeof l === "object" && l && (l as Record<string, unknown>)["@_rel"] !== "self",
    );
    return linkOf(alt ?? node[0]);
  }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (o["@_href"]) return String(o["@_href"]).trim();
    if (o["#text"]) return String(o["#text"]).trim();
  }
  return "";
}

/**
 * Is this a photograph attached to the story, or furniture?
 *
 * Feeds that embed the image in the description hand us the first <img> in the
 * body, and that is often not the picture: Ethiopia Insight leads with a
 * PayPal donate button, and other feeds start with a logo, a share icon or a
 * 1x1 tracking pixel. One of those as a news thumbnail looks broken, so an
 * image that fails this check is dropped and the card renders text-only —
 * which it handles.
 */
const NOT_A_PHOTO = [
  /paypal/i,
  /gravatar/i,
  /feedburner|feedproxy|feedsportal/i,
  /doubleclick|googlesyndication|scorecardresearch/i,
  /[-_./](logo|icon|avatar|badge|button|banner|spacer|pixel|donate|share)[-_./]/i,
  /[-_./](1x1|blank|transparent|placeholder)[-_./]/i,
  // Animated and vector files in a feed body are decoration, not photography.
  /\.(gif|svg)(\?|$)/i,
];

export function looksLikeAPhoto(url: string): boolean {
  return !NOT_A_PHOTO.some((p) => p.test(url));
}

function imageOf(item: Record<string, unknown>): string | undefined {
  // media:content / media:thumbnail / enclosure, in that order of usefulness.
  const media = first(item["media:content"] as never) as Record<string, unknown> | undefined;
  if (media?.["@_url"] && looksLikeAPhoto(String(media["@_url"]))) {
    return String(media["@_url"]);
  }

  const thumb = first(item["media:thumbnail"] as never) as Record<string, unknown> | undefined;
  if (thumb?.["@_url"] && looksLikeAPhoto(String(thumb["@_url"]))) {
    return String(thumb["@_url"]);
  }

  const enc = first(item.enclosure as never) as Record<string, unknown> | undefined;
  if (
    enc?.["@_url"] &&
    String(enc["@_type"] ?? "").startsWith("image") &&
    looksLikeAPhoto(String(enc["@_url"]))
  ) {
    return String(enc["@_url"]);
  }

  // Some feeds only embed the image in the HTML description.
  const html = String(
    item["content:encoded"] ?? textOf(item.description) ?? item.description ?? "",
  );
  // Take the first embedded image that is plausibly the story's own picture
  // rather than a donate button or a tracking pixel.
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    if (looksLikeAPhoto(m[1])) return m[1];
  }
  return undefined;
}

function dateOf(item: Record<string, unknown>): Date {
  const raw =
    item.pubDate ??
    item.published ??
    item.updated ??
    item["dc:date"] ??
    item.date ??
    null;
  const d = raw ? new Date(textOf(raw) || String(raw)) : null;
  // A feed with an unparseable date should not sort to 1970 and vanish.
  if (!d || Number.isNaN(d.getTime())) return new Date();
  // Nor should a publisher's clock skew put it a week in the future.
  const now = Date.now();
  return d.getTime() > now + 3600_000 ? new Date(now) : d;
}

export function parseFeed(xml: string, feedUrl: string): ParsedItem[] {
  const doc = parser.parse(xml) as Record<string, unknown>;

  const rss = doc.rss as Record<string, unknown> | undefined;
  const rdf = (doc["rdf:RDF"] ?? doc.RDF) as Record<string, unknown> | undefined;
  const feed = doc.feed as Record<string, unknown> | undefined;

  let raw: unknown;
  if (rss) raw = (rss.channel as Record<string, unknown>)?.item;
  else if (rdf) raw = rdf.item;
  else if (feed) raw = feed.entry;

  const list: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : raw
      ? [raw as Record<string, unknown>]
      : [];

  const out: ParsedItem[] = [];

  for (const item of list) {
    const title = toExcerpt(textOf(item.title) || String(item.title ?? ""), 300);
    const url = linkOf(item.link) || linkOf(item.id) || linkOf(item["rdf:about"]);
    if (!title || !url || !/^https?:\/\//i.test(url)) continue;

    const body =
      String(item["content:encoded"] ?? "") ||
      textOf(item.summary) ||
      String(item.summary ?? "") ||
      textOf(item.description) ||
      String(item.description ?? "") ||
      textOf(item.content) ||
      "";

    const guidNode = item.guid ?? item.id ?? url;
    const guid = (textOf(guidNode) || String(guidNode)).slice(0, 400);

    const authorNode = item["dc:creator"] ?? item.author ?? item.creator;
    const author =
      typeof authorNode === "object" && authorNode
        ? // Atom nests the name; RSS dc:creator is text, but carries
          // attributes when the feed declares its namespace inline — in which
          // case the parser hands us an object and the byline is in #text.
          (textOf((authorNode as Record<string, unknown>).name) ||
            textOf(authorNode) ||
            undefined)?.slice(0, 120)
        : authorNode
          ? String(authorNode).slice(0, 120)
          : undefined;

    const { publisher, text } = splitOriginalPublisher(toExcerpt(body));

    out.push({
      guid,
      url: url.split("#")[0],
      title,
      excerpt: text,
      originalPublisher: publisher,
      author: author && author !== "undefined" ? author : undefined,
      imageUrl: imageOf(item),
      publishedAt: dateOf(item),
    });
  }

  // Defensive: a malformed feed should yield nothing rather than nonsense.
  if (out.length === 0 && !/<(item|entry)[\s>]/i.test(xml)) {
    throw new Error(`No items found in feed at ${feedUrl}`);
  }

  return out;
}
