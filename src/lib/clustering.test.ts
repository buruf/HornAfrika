import { describe, expect, it } from "vitest";
import { clusterStories, keyTerms, type Clusterable } from "./clustering";

const NOW = new Date("2026-08-22T12:00:00Z");
const at = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

let n = 0;
const item = (title: string, sourceSlug: string, hoursAgo = 1): Clusterable => ({
  id: `i${n++}`,
  title,
  publishedAt: at(hoursAgo),
  source: { slug: sourceSlug },
});

describe("keyTerms", () => {
  it("drops stopwords and short words", () => {
    expect([...keyTerms("The president is on a new visit")]).toEqual([
      "president",
      "visit",
    ]);
  });

  /**
   * Almost every headline we hold names a Horn country, so counting them would
   * cluster the whole wire into one lump.
   */
  it("drops the country names that appear in nearly every headline", () => {
    expect([...keyTerms("Somalia and Ethiopia sign railway agreement")]).toEqual([
      "sign",
      "railway",
      "agreement",
    ]);
  });

  it("ignores punctuation and case", () => {
    expect(keyTerms("Drought: LIVESTOCK dying").has("livestock")).toBe(true);
  });
});

describe("clusterStories", () => {
  it("ranks the story the most newsrooms covered first", () => {
    const clusters = clusterStories([
      item("Parliament approves budget bill", "goobjoog", 3),
      item("Parliament approves the budget bill today", "caasimada", 2),
      item("MPs approve budget bill in parliament", "jowhar", 1),
      item("Fishermen report record sardine catch", "radio-ergo", 1),
    ]);

    expect(clusters[0].outlets).toBe(3);
    expect(clusters[0].items).toHaveLength(3);
    expect(clusters[1].outlets).toBe(1);
  });

  it("shows the freshest item as the cluster's face", () => {
    const clusters = clusterStories([
      item("Port expansion contract signed", "a", 5),
      item("Port expansion contract signed with investor", "b", 1),
    ]);
    expect(clusters[0].lead.source.slug).toBe("b");
  });

  /**
   * The setting that stops every story about the same official collapsing
   * together on one shared word.
   */
  it("needs two shared words, not one", () => {
    const clusters = clusterStories([
      item("President meets farmers", "a"),
      item("President opens hospital", "b"),
    ]);
    expect(clusters).toHaveLength(2);
  });

  it("does not let one outlet's follow-ups look like broad coverage", () => {
    const clusters = clusterStories([
      item("Drought emergency declared in villages", "radio-ergo", 4),
      item("Drought emergency widens across villages", "radio-ergo", 2),
      item("Cholera cases climb sharply", "goobjoog", 1),
    ]);
    // Two items, but one newsroom, so it does not outrank a single-outlet story.
    expect(clusters[0].outlets).toBe(1);
    expect(clusters.every((c) => c.outlets === 1)).toBe(true);
  });

  it("breaks ties on recency", () => {
    const clusters = clusterStories([
      item("Sardine catch reaches record levels", "a", 9),
      item("Railway freight volumes climbing again", "b", 1),
    ]);
    expect(clusters[0].lead.source.slug).toBe("b");
  });

  it("handles an empty list and a single item", () => {
    expect(clusterStories([])).toEqual([]);
    const one = clusterStories([item("A lone headline about shipping", "a")]);
    expect(one).toHaveLength(1);
    expect(one[0].outlets).toBe(1);
  });

  it("does not mutate the input", () => {
    const input = [item("Budget bill passes", "a", 3), item("Harvest begins", "b", 1)];
    const order = input.map((i) => i.id);
    clusterStories(input);
    expect(input.map((i) => i.id)).toEqual(order);
  });
});
