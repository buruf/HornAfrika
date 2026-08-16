import { describe, expect, it } from "vitest";
import { parseFeed, splitOriginalPublisher, toExcerpt } from "@/lib/rss";

describe("toExcerpt()", () => {
  it("strips tags and collapses whitespace", () => {
    expect(toExcerpt("<p>Hello   <b>world</b></p>\n<p>Again</p>")).toBe(
      "Hello world Again",
    );
  });

  it("removes script and style content entirely", () => {
    expect(toExcerpt("<style>.a{color:red}</style><p>Real text</p>")).toBe("Real text");
    expect(toExcerpt("<script>alert('x')</script>Real text")).toBe("Real text");
  });

  it("decodes named and numeric entities", () => {
    expect(toExcerpt("Somalia &amp; Ethiopia")).toBe("Somalia & Ethiopia");
    expect(toExcerpt("caf&eacute;")).toBe("café");
    expect(toExcerpt("dash &#8211; here")).toBe("dash – here");
    expect(toExcerpt("hex &#x2014; here")).toBe("hex — here");
  });

  it("decodes double-encoded entities, which feeds do constantly", () => {
    expect(toExcerpt("Ports &amp;amp; logistics")).toBe("Ports & logistics");
    expect(toExcerpt("dash &amp;#8211; here")).toBe("dash – here");
  });

  it("strips markup that only appears after decoding", () => {
    // A feed that entity-encodes its HTML would otherwise leak tags into the
    // excerpt after the decode pass.
    expect(toExcerpt("&lt;p&gt;Encoded markup&lt;/p&gt;")).toBe("Encoded markup");
  });

  it("keeps short text untouched and adds no ellipsis", () => {
    const short = "A short line.";
    expect(toExcerpt(short)).toBe(short);
  });

  it("truncates on a word boundary with an ellipsis", () => {
    const text = "word ".repeat(100).trim();
    const out = toExcerpt(text, 40);
    expect(out.length).toBeLessThanOrEqual(41);
    expect(out.endsWith("…")).toBe(true);
    // Never cut mid-word.
    expect(out.replace("…", "").trimEnd().endsWith("word")).toBe(true);
  });

  it("still truncates when there is no space to cut on", () => {
    const out = toExcerpt("x".repeat(300), 50);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(51);
  });

  it("survives empty and non-string input", () => {
    expect(toExcerpt("")).toBe("");
    expect(toExcerpt(undefined as unknown as string)).toBe("");
    expect(toExcerpt(null as unknown as string)).toBe("");
  });
});

// ---------------------------------------------------------------------------

const RSS2 = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Example Wire</title>
    <item>
      <title>Djibouti expands port capacity</title>
      <link>https://example.com/djibouti-port</link>
      <guid isPermaLink="false">abc-123</guid>
      <description>&lt;p&gt;The terminal will handle more containers.&lt;/p&gt;</description>
      <pubDate>Sat, 09 Aug 2026 08:30:00 GMT</pubDate>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">A Reporter</dc:creator>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Wire</title>
  <entry>
    <title>Ethiopia passes investment law</title>
    <link rel="alternate" href="https://example.org/ethiopia-law"/>
    <id>tag:example.org,2026:1</id>
    <summary>Parliament approved the bill.</summary>
    <updated>2026-08-09T10:00:00Z</updated>
    <author><name>Atom Author</name></author>
  </entry>
</feed>`;

const RDF = `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns="http://purl.org/rss/1.0/">
  <channel><title>RDF Wire</title></channel>
  <item>
    <title>Eritrea marks independence</title>
    <link>https://example.net/eritrea</link>
    <description>Celebrations were held.</description>
  </item>
</rdf:RDF>`;

describe("parseFeed()", () => {
  it("parses RSS 2.0", () => {
    const [item] = parseFeed(RSS2, "https://example.com/feed");
    expect(item.title).toBe("Djibouti expands port capacity");
    expect(item.url).toBe("https://example.com/djibouti-port");
    expect(item.guid).toBe("abc-123");
    expect(item.excerpt).toBe("The terminal will handle more containers.");
    expect(item.author).toBe("A Reporter");
    expect(item.publishedAt.toISOString()).toBe("2026-08-09T08:30:00.000Z");
  });

  it("parses Atom, following rel=alternate rather than rel=self", () => {
    const [item] = parseFeed(ATOM, "https://example.org/feed");
    expect(item.title).toBe("Ethiopia passes investment law");
    expect(item.url).toBe("https://example.org/ethiopia-law");
    expect(item.excerpt).toBe("Parliament approved the bill.");
    expect(item.author).toBe("Atom Author");
  });

  it("parses RDF / RSS 1.0", () => {
    const [item] = parseFeed(RDF, "https://example.net/feed");
    expect(item.title).toBe("Eritrea marks independence");
    expect(item.url).toBe("https://example.net/eritrea");
  });

  it("falls back to the URL when a feed gives no guid", () => {
    const [item] = parseFeed(RDF, "https://example.net/feed");
    expect(item.guid).toBeTruthy();
  });

  it("gives every item a usable date even when the feed omits one", () => {
    // A missing date must not produce an Invalid Date, or ordering breaks.
    const [item] = parseFeed(RDF, "https://example.net/feed");
    expect(item.publishedAt).toBeInstanceOf(Date);
    expect(Number.isNaN(item.publishedAt.getTime())).toBe(false);
  });

  it("throws on content that is not a feed, so the source gets flagged", () => {
    // Deliberate: a publisher serving an HTML error page should be recorded as
    // a failing source, not silently logged as "fetched, 0 items".
    expect(() => parseFeed("", "https://x.test/feed")).toThrow();
    expect(() => parseFeed("not xml at all", "https://x.test/feed")).toThrow();
    expect(() =>
      parseFeed("<html><body>nope</body></html>", "https://x.test/feed"),
    ).toThrow();
  });

  it("returns an empty array for a valid feed that happens to be empty", () => {
    // An empty <item> element means the feed is real but had nothing to give.
    const empty = `<rss version="2.0"><channel><title>Quiet</title>
      <item></item></channel></rss>`;
    expect(parseFeed(empty, "https://x.test/feed")).toEqual([]);
  });

  it("skips items with no title or no link", () => {
    const partial = `<rss version="2.0"><channel>
      <item><title>No link here</title></item>
      <item><link>https://x.test/no-title</link></item>
      <item><title>Good one</title><link>https://x.test/good</link></item>
    </channel></rss>`;
    const items = parseFeed(partial, "https://x.test/feed");
    expect(items.map((i) => i.title)).toEqual(["Good one"]);
  });

  it("handles a single item that is not wrapped in an array", () => {
    // fast-xml-parser collapses a lone <item> to an object, not a list.
    expect(parseFeed(RSS2, "https://example.com/feed")).toHaveLength(1);
  });
});

describe("splitOriginalPublisher", () => {
  it("lifts the newsroom AllAfrica names in the body", () => {
    const r = splitOriginalPublisher(
      "[Shabelle] Addis Ababa -- Ethiopia's ambassador has accused Eritrea...",
    );
    expect(r.publisher).toBe("Shabelle");
    expect(r.text).toBe(
      "Addis Ababa -- Ethiopia's ambassador has accused Eritrea...",
    );
  });

  it("leaves an ordinary excerpt alone", () => {
    const plain = "Ethiopia's central bank raised rates on Tuesday.";
    expect(splitOriginalPublisher(plain)).toEqual({ text: plain });
  });

  /**
   * Square brackets appear in ordinary copy. Inventing a publisher from one is
   * worse than missing a real one, so anything that does not look like a
   * masthead is left in place.
   */
  it("does not mistake an editorial note for a byline", () => {
    for (const s of [
      "[Editor: confirm the figure] The budget passed.",
      "[sic] as published",
      "[Photo] A crowd gathers",
      "[File] Troops on parade",
    ]) {
      expect(splitOriginalPublisher(s).publisher).toBeUndefined();
    }
  });

  it("ignores a bracket that is not at the start", () => {
    const s = "The minister said [sic] the deal was done";
    expect(splitOriginalPublisher(s)).toEqual({ text: s });
  });

  it("ignores an implausibly long bracket", () => {
    const s = `[${"x".repeat(60)}] body text`;
    expect(splitOriginalPublisher(s).publisher).toBeUndefined();
  });
});
