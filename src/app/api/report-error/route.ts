import { NextResponse } from "next/server";
import { reportError } from "@/lib/report-error";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Receives client-side error reports from the React error boundaries.
 *
 * Anything a browser can POST is attacker-controlled, so this is rate limited,
 * length-capped, and records no stack from the client — only the message and
 * Next's own digest, which is enough to correlate with the server-side entry.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`report:${clientIp(req.headers)}`, 20, 60 * 60_000);
  if (!limit.ok) return NextResponse.json({ ok: true });

  let body: { message?: string; digest?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = String(body.message ?? "").slice(0, 300);
  if (!message) return NextResponse.json({ ok: true });

  await reportError(new Error(message), {
    kind: "client",
    digest: body.digest ? String(body.digest).slice(0, 100) : undefined,
    path: body.path ? String(body.path).slice(0, 200) : undefined,
  });

  return NextResponse.json({ ok: true });
}
