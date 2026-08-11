import { describe, expect, it } from "vitest";
import { articleHref, formatDuration, timeAgo } from "@/lib/format";
import { editorialImageMarkup } from "@/lib/editorial-image";

describe("articleHref() — the published URL scheme", () => {
  it("nests a country story under its country and section", () => {
    expect(
      articleHref({
        slug: "president-meets-regional-leaders-ankara",
        country: { slug: "somalia" },
        category: { slug: "politics" },
      }),
    ).toBe("/somalia/politics/president-meets-regional-leaders-ankara");
  });

  it("files a story with no single country under the horn pseudo-country", () => {
    expect(
      articleHref({
        slug: "why-ports-matter",
        country: null,
        category: { slug: "explained" },
      }),
    ).toBe("/horn/explained/why-ports-matter");
  });

  it("never produces the doubled /horn/horn/ path", () => {
    // The regional desk slug is "regional" precisely so this cannot happen.
    const href = articleHref({
      slug: "ethiopia-somalia-framework",
      country: null,
      category: { slug: "regional" },
    });
    expect(href).toBe("/horn/regional/ethiopia-somalia-framework");
    expect(href).not.toContain("/horn/horn/");
  });

  it("treats a missing country the same as an explicit null", () => {
    expect(
      articleHref({ slug: "x", category: { slug: "business" } }),
    ).toBe("/horn/business/x");
  });

  it("always returns a rooted path with exactly three segments", () => {
    const href = articleHref({
      slug: "a",
      country: { slug: "eritrea" },
      category: { slug: "culture" },
    });
    expect(href.startsWith("/")).toBe(true);
    expect(href.split("/").filter(Boolean)).toHaveLength(3);
  });
});

describe("formatDuration()", () => {
  it("pads seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
    expect(formatDuration(9)).toBe("0:09");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });
});

describe("timeAgo()", () => {
  const ago = (ms: number) => new Date(Date.now() - ms);

  it("describes recent times in relative terms", () => {
    expect(timeAgo(ago(30_000))).toBe("just now");
    expect(timeAgo(ago(5 * 60_000))).toBe("5 minutes ago");
    expect(timeAgo(ago(60 * 60_000))).toBe("1 hour ago");
    expect(timeAgo(ago(3 * 60 * 60_000))).toBe("3 hours ago");
    expect(timeAgo(ago(26 * 60 * 60_000))).toBe("1 day ago");
  });

  it("falls back to a date beyond a week", () => {
    const out = timeAgo(ago(30 * 24 * 60 * 60_000));
    expect(out).not.toContain("ago");
    expect(out).toMatch(/\d{4}/);
  });

  it("returns an empty string for no date", () => {
    expect(timeAgo(null)).toBe("");
    expect(timeAgo(undefined)).toBe("");
  });
});

describe("editorialImageMarkup() — deterministic article graphics", () => {
  it("returns identical markup for the same seed", () => {
    const a = editorialImageMarkup("some-article-slug", "politics");
    const b = editorialImageMarkup("some-article-slug", "politics");
    expect(a).toBe(b);
  });

  it("returns different markup for different seeds", () => {
    const a = editorialImageMarkup("article-one", "politics");
    const b = editorialImageMarkup("article-two", "politics");
    expect(a).not.toBe(b);
  });

  it("varies by category so sections read differently", () => {
    const politics = editorialImageMarkup("same-seed", "politics");
    const business = editorialImageMarkup("same-seed", "business");
    expect(politics).not.toBe(business);
  });

  it("produces valid, self-contained SVG fragments", () => {
    const markup = editorialImageMarkup("seed", "culture");
    expect(markup).toContain("<rect");
    // Balanced group tags, or the article page renders a broken image.
    const open = (markup.match(/<g[\s>]/g) ?? []).length;
    const close = (markup.match(/<\/g>/g) ?? []).length;
    expect(open).toBe(close);
    // No external references — these must work offline.
    expect(markup).not.toMatch(/https?:\/\//);
  });

  it("gives every unknown category a usable fallback", () => {
    const markup = editorialImageMarkup("seed", "not-a-real-category");
    expect(markup.length).toBeGreaterThan(100);
    expect(markup).toContain("<rect");
  });

  it("scopes gradient ids per seed so two images cannot collide", () => {
    // Duplicate ids on one page would make every card use the first gradient.
    const a = editorialImageMarkup("seed-a", "politics");
    const b = editorialImageMarkup("seed-b", "politics");
    const idOf = (s: string) => s.match(/id="sky-([^"]+)"/)?.[1];
    expect(idOf(a)).toBeTruthy();
    expect(idOf(a)).not.toBe(idOf(b));
  });
});
