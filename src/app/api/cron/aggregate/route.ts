import { NextResponse } from "next/server";
import { pruneWire, runAggregation } from "@/lib/aggregator";
import { getSession } from "@/lib/auth";
import { reportError } from "@/lib/report-error";

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

  // Nobody watches a cron run. If the whole job throws, or if enough sources
  // fail that the wire is effectively stale, that has to reach /admin/errors
  // rather than dying in a log nobody opens.
  try {
    const { results, added, durationMs } = await runAggregation({ force, only });
    const pruned = await pruneWire();

    const failed = results.filter((r) => !r.ok);
    if (results.length > 0 && failed.length > results.length / 2) {
      await reportError(
        new Error(
          `Wire aggregation degraded: ${failed.length} of ${results.length} sources failed ` +
            `(${failed.map((f) => `${f.sourceSlug}:${f.status}`).join(", ")})`,
        ),
        { kind: "cron", path: "/api/cron/aggregate" },
      );
    }

    return NextResponse.json({
      ok: true,
      added,
      pruned,
      durationMs,
      sources: results.length,
      failed: failed.map((r) => ({
        source: r.sourceSlug,
        status: r.status,
        error: r.error,
      })),
      results,
    });
  } catch (err) {
    await reportError(err, { kind: "cron", path: "/api/cron/aggregate" });
    return NextResponse.json(
      { ok: false, error: "Aggregation failed" },
      { status: 500 },
    );
  }
}

export const POST = GET;
