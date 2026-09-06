import { describe, expect, it } from "vitest";
import { reviveDates } from "./revive-dates";

describe("reviveDates", () => {
  /** The exact shape that crashed the article page. */
  it("revives the dates on a cached article", () => {
    const cached = JSON.parse(
      JSON.stringify({
        headline: "Ethiopia and Somalia agree a framework",
        publishedAt: new Date("2026-08-12T09:00:00Z"),
        revisedAt: null,
        updatedAt: new Date("2026-08-13T10:30:00Z"),
      }),
    );
    // Precondition: JSON really did turn them into strings.
    expect(typeof cached.publishedAt).toBe("string");

    const a = reviveDates(cached);
    expect(a.publishedAt).toBeInstanceOf(Date);
    expect(a.publishedAt.toISOString()).toBe("2026-08-12T09:00:00.000Z");
    expect(a.updatedAt).toBeInstanceOf(Date);
    expect(a.revisedAt).toBeNull();
    expect(a.headline).toBe("Ethiopia and Somalia agree a framework");
  });

  /** Runs on the miss path too, where the values are already Dates. */
  it("leaves real Dates untouched", () => {
    const d = new Date("2026-08-12T09:00:00Z");
    const out = reviveDates({ publishedAt: d });
    expect(out.publishedAt).toBe(d);
  });

  it("is idempotent", () => {
    const once = reviveDates({ at: "2026-08-12T09:00:00.000Z" });
    const twice = reviveDates(once);
    expect(twice.at).toBeInstanceOf(Date);
    expect((twice.at as unknown as Date).toISOString()).toBe("2026-08-12T09:00:00.000Z");
  });

  it("reaches into arrays and nested objects", () => {
    const out = reviveDates({
      items: [
        { publishedAt: "2026-08-12T09:00:00.000Z", source: { name: "Goobjoog" } },
        { publishedAt: "2026-08-13T09:00:00.000Z", source: { name: "Jowhar" } },
      ],
    });
    expect(out.items[0].publishedAt).toBeInstanceOf(Date);
    expect(out.items[1].publishedAt).toBeInstanceOf(Date);
    expect(out.items[0].source.name).toBe("Goobjoog");
  });

  it("does not convert ordinary text that merely contains a date", () => {
    const out = reviveDates({
      headline: "Talks resume on 2026-08-12 after a long pause",
      slug: "talks-resume-2026-08-12",
      body: "Published 2026-08-12T09:00:00Z according to the ministry.",
      partial: "2026-08-12",
      time: "09:00:00",
    });
    for (const v of Object.values(out)) expect(typeof v).toBe("string");
  });

  it("handles null, undefined, numbers and booleans", () => {
    expect(reviveDates(null)).toBeNull();
    expect(reviveDates(undefined)).toBeUndefined();
    const out = reviveDates({ a: null, b: 3, c: true, d: "" });
    expect(out).toEqual({ a: null, b: 3, c: true, d: "" });
  });

  it("does not mutate the value it was given", () => {
    const input = { publishedAt: "2026-08-12T09:00:00.000Z" };
    reviveDates(input);
    expect(typeof input.publishedAt).toBe("string");
  });

  it("accepts an offset as well as Z", () => {
    const out = reviveDates({ at: "2026-08-12T09:00:00+03:00" });
    expect(out.at).toBeInstanceOf(Date);
  });
});
