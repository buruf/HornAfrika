import { db } from "@/lib/db";

/**
 * Fixed-window rate limiting, backed by Postgres.
 *
 * Serverless invocations do not share memory, so an in-process counter stops
 * counting the moment there are two instances. The database is the only state
 * every invocation already shares, and the endpoints worth limiting — sign-in,
 * newsletter signup — are far too low-volume for the extra write to matter.
 *
 * Fixed windows allow a burst at a boundary (up to 2× the limit across two
 * adjacent windows). For slowing down credential stuffing that is irrelevant,
 * and it costs one row and one query instead of the sorted set a sliding
 * window needs.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStartCutoff = new Date(now.getTime() - windowMs);

  try {
    const existing = await db.rateLimit.findUnique({ where: { key } });

    // No record, or the previous window has expired: start a fresh one.
    if (!existing || existing.windowStart < windowStartCutoff) {
      await db.rateLimit.upsert({
        where: { key },
        update: { count: 1, windowStart: now },
        create: { key, count: 1, windowStart: now },
      });
      return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (existing.count >= limit) {
      const elapsed = now.getTime() - existing.windowStart.getTime();
      return {
        ok: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((windowMs - elapsed) / 1000)),
      };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return {
      ok: true,
      remaining: limit - existing.count - 1,
      retryAfterSeconds: 0,
    };
  } catch (err) {
    // Fail open. A database problem should not lock every reader out of the
    // newsletter or every editor out of the CMS — that turns a blip into an
    // outage. The cost is that limiting pauses exactly when the database is
    // already unhealthy, which is not when credential stuffing succeeds.
    console.error("rateLimit unavailable, allowing request:", err);
    return { ok: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** Clear a key — called after a successful sign-in so honest users reset. */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await db.rateLimit.delete({ where: { key } });
  } catch {
    // Nothing to clear.
  }
}

/**
 * Best-effort client address.
 *
 * Behind Vercel, x-forwarded-for is set by the platform and its first entry is
 * the client. This is spoofable in principle, which is why sign-in is limited
 * per account as well as per address — an attacker rotating addresses still
 * hits the account ceiling.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
