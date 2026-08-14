import { describe, expect, it } from "vitest";
import {
  ABANDONED_AFTER_DAYS,
  BROKEN_AFTER_FAILURES,
  STALE_AFTER_DAYS,
  needsAttention,
  sourceHealth,
  type HealthInput,
} from "./source-health";

const NOW = new Date("2026-08-13T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

const base: HealthInput = {
  active: true,
  lastStatus: "ok",
  lastFetchedAt: daysAgo(0),
  lastItemAt: daysAgo(1),
  failureCount: 0,
};

const health = (over: Partial<HealthInput>) =>
  sourceHealth({ ...base, ...over }, NOW);

describe("sourceHealth", () => {
  it("is unknown before the first fetch", () => {
    expect(health({ lastFetchedAt: null })).toBe("unknown");
  });

  it("reports publishing when items are recent", () => {
    expect(health({ lastItemAt: daysAgo(0) })).toBe("ok");
    expect(health({ lastItemAt: daysAgo(6) })).toBe("ok");
  });

  it("distinguishes a quiet week from a stale month", () => {
    expect(health({ lastItemAt: daysAgo(8) })).toBe("quiet");
    expect(health({ lastItemAt: daysAgo(STALE_AFTER_DAYS) })).toBe("stale");
  });

  /**
   * The case this module exists for: every fetch succeeds, the feed is
   * well-formed, and the newsroom stopped publishing well over a year ago.
   */
  it("calls a feed abandoned even though every fetch succeeds", () => {
    expect(
      health({ lastStatus: "ok", failureCount: 0, lastItemAt: daysAgo(591) }),
    ).toBe("abandoned");
    expect(health({ lastItemAt: daysAgo(ABANDONED_AFTER_DAYS) })).toBe("abandoned");
  });

  it("puts reachability ahead of freshness", () => {
    // A feed we cannot fetch cannot tell us how recently it published, so the
    // stale item date must not mask the fetch failure.
    expect(
      health({ lastStatus: "http 403", failureCount: 1, lastItemAt: daysAgo(900) }),
    ).toBe("failing");
    expect(
      health({
        lastStatus: "http 403",
        failureCount: BROKEN_AFTER_FAILURES,
        lastItemAt: daysAgo(900),
      }),
    ).toBe("broken");
  });

  it("is unknown when the feed dates nothing", () => {
    expect(health({ lastItemAt: null })).toBe("unknown");
  });

  it("flags exactly the states a human should act on", () => {
    expect(needsAttention("stale")).toBe(true);
    expect(needsAttention("abandoned")).toBe(true);
    expect(needsAttention("broken")).toBe(true);
    // A blip and a slow week are not chores.
    expect(needsAttention("failing")).toBe(false);
    expect(needsAttention("quiet")).toBe(false);
    expect(needsAttention("ok")).toBe(false);
  });
});
