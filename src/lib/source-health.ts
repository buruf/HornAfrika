/**
 * How healthy is a wire source?
 *
 * Two independent questions, deliberately kept apart:
 *
 *   1. Can we reach the feed?      -> lastStatus / failureCount
 *   2. Is anyone still writing?    -> lastItemAt
 *
 * Conflating them is how Halbeeg sat in the source list reporting "ok" for
 * days while its newest story was 591 days old. The fetch was genuinely fine.
 * The newsroom was not.
 *
 * Pure functions over plain values, so the thresholds can be tested without a
 * database or a network.
 */

/** Days without a new published item before a reachable feed counts as stale. */
export const STALE_AFTER_DAYS = 21;

/** Days without a new item before it is not worth fetching at all. */
export const ABANDONED_AFTER_DAYS = 120;

/** Consecutive failures before we stop calling it a blip. */
export const BROKEN_AFTER_FAILURES = 3;

export type SourceHealth =
  | "ok"
  | "quiet"
  | "stale"
  | "abandoned"
  | "failing"
  | "broken"
  | "unknown";

export type HealthInput = {
  active: boolean;
  lastStatus: string | null;
  lastFetchedAt: Date | null;
  lastItemAt: Date | null;
  failureCount: number;
};

const daysSince = (d: Date | null, now: Date): number | null =>
  d ? (now.getTime() - d.getTime()) / 86_400_000 : null;

export function sourceHealth(s: HealthInput, now = new Date()): SourceHealth {
  if (!s.lastFetchedAt) return "unknown";

  // Reachability first: a feed we cannot fetch has no opinion to offer about
  // how recently it published.
  if (s.lastStatus && s.lastStatus !== "ok") {
    return s.failureCount >= BROKEN_AFTER_FAILURES ? "broken" : "failing";
  }

  const age = daysSince(s.lastItemAt, now);
  // Reachable, parsed, but we have never recorded a dated item. Usually a feed
  // whose items carry no publication date.
  if (age === null) return "unknown";

  if (age >= ABANDONED_AFTER_DAYS) return "abandoned";
  if (age >= STALE_AFTER_DAYS) return "stale";
  if (age >= 7) return "quiet";
  return "ok";
}

/** Does this health state need a human to look at it? */
export function needsAttention(h: SourceHealth): boolean {
  return h === "stale" || h === "abandoned" || h === "broken";
}

export const HEALTH_LABEL: Record<SourceHealth, string> = {
  ok: "Publishing",
  quiet: "Quiet",
  stale: "Stale",
  abandoned: "Abandoned",
  failing: "Failing",
  broken: "Broken",
  unknown: "Unknown",
};

export const HEALTH_NOTE: Record<SourceHealth, string> = {
  ok: "New items in the last week.",
  quiet: "Reachable, but nothing new for over a week. Normal for a weekly outlet.",
  stale: `Reachable, but nothing published for ${STALE_AFTER_DAYS}+ days. Check whether the outlet has moved or stopped.`,
  abandoned: `Nothing published for ${ABANDONED_AFTER_DAYS}+ days. The feed answers, but the newsroom appears to have stopped.`,
  failing: "The last fetch failed. Could be a blip.",
  broken: `Failed ${BROKEN_AFTER_FAILURES}+ times in a row. Needs a new feed URL or the publisher's permission.`,
  unknown: "Not fetched yet, or the feed carries no publication dates.",
};
