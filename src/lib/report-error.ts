import { db } from "@/lib/db";

/**
 * Error reporting without a third-party service.
 *
 * A solo newsroom will not notice a 3am exception in a log stream, and a
 * Sentry account is a decision the operator should make rather than one this
 * code makes for them. Errors are written to a table so they are visible at
 * /admin/errors, and optionally pushed to a webhook if one is configured.
 *
 * Identical errors are folded into one row with a count, so a route failing
 * every two hours does not bury everything else.
 */

/** Cheap stable hash so repeat failures group instead of flooding. */
function fingerprint(message: string, stack?: string): string {
  const basis = `${message}\n${(stack ?? "").split("\n").slice(0, 3).join("\n")}`;
  let h = 2166136261;
  for (let i = 0; i < basis.length; i++) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export type ErrorContext = {
  path?: string;
  kind?: "server" | "client" | "cron" | "action";
  digest?: string;
};

export async function reportError(
  error: unknown,
  context: ErrorContext = {},
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.slice(0, 500) || "Unknown error";
  const stack = err.stack?.slice(0, 4000);
  const digest = context.digest ?? fingerprint(message, stack);

  // Always log first. If the database is the thing that is broken, the log
  // stream is the only place this will survive.
  console.error(
    JSON.stringify({
      level: "error",
      digest,
      path: context.path,
      kind: context.kind ?? "server",
      message,
    }),
  );

  try {
    const existing = await db.errorLog.findFirst({
      where: { digest, path: context.path ?? null },
      select: { id: true },
    });

    if (existing) {
      await db.errorLog.update({
        where: { id: existing.id },
        data: { count: { increment: 1 }, lastSeenAt: new Date() },
      });
    } else {
      await db.errorLog.create({
        data: {
          message,
          stack,
          digest,
          path: context.path ?? null,
          kind: context.kind ?? "server",
        },
      });
    }
  } catch (writeErr) {
    // Reporting must never be able to cause a second failure.
    console.error("Could not persist error report:", writeErr);
  }

  const webhook = process.env.ERROR_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: `Hornafrika error on ${context.path ?? "unknown path"}: ${message}`,
        }),
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      // A dead webhook is not worth escalating.
    }
  }
}
