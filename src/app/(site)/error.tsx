"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Reader-facing failure page.
 *
 * A news site that shows a stack trace has lost more than a page view. This
 * says what happened in plain language, offers a way onward, and reports the
 * failure so the operator learns about it without a reader having to email.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Fire and forget. The digest is Next's own id for the server error, which
    // is what ties this to the entry the server already wrote.
    fetch("/api/report-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <div className="shell py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">
          Something went wrong
        </p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.03em] sm:text-[2.5rem]">
          This page didn’t load
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
          The fault is ours, not yours, and it has been reported automatically.
          Try again in a moment.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-brand px-6 py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-rule-strong px-6 py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] hover:border-ink"
          >
            Go to the homepage
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[0.75rem] text-ink-mute">
            Reference: <code>{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
