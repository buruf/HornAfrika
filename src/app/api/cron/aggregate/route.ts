import { NextResponse } from "next/server";
import { pruneWire, runAggregation } from "@/lib/aggregator";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled aggregation.
 *
 * Authorised either by a bearer token (for a cron service) or by a signed-in
 * admin session. It fails closed: with no CRON_SECRET configured, only a
 * signed-in Super Admin or Editor can trigger it.
 */
async function authorise(req: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = req.headers.get("authorization") ?? "";
    const provided = header.replace(/^Bearer\s+/i, "");
    // Constant-time-ish compare: equal lengths first, then a full scan.
    if (provided.length === secret.length) {
      let diff = 0;
      for (let i = 0; i < secret.length; i++) {
        diff |= provided.charCodeAt(i) ^ secret.charCodeAt(i);
      }
      if (diff === 0) return true;
    }
  }

  const session = await getSession();
  return session?.role === "SUPER_ADMIN" || session?.role === "EDITOR";
}

export async function GET(req: Request) {
  if (!(await authorise(req))) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const only = url.searchParams.get("source") ?? undefined;

  const { results, added, durationMs } = await runAggregation({ force, only });
  const pruned = await pruneWire();

  return NextResponse.json({
    ok: true,
    added,
    pruned,
    durationMs,
    sources: results.length,
    failed: results.filter((r) => !r.ok).map((r) => ({
      source: r.sourceSlug,
      status: r.status,
      error: r.error,
    })),
    results,
  });
}

export const POST = GET;
