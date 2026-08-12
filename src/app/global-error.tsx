"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches failures in the root layout itself, where no
 * site chrome is available. It must render its own <html> and <body>, and must
 * not import anything that could be the thing that broke.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f4f6f8",
          color: "#0b1f33",
          padding: "1.25rem",
        }}
      >
        <div style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            <span>HORN</span>
            <span style={{ color: "#c9182b" }}>AFRIKA</span>
          </p>
          <h1 style={{ marginTop: "1.5rem", fontSize: "1.6rem", fontWeight: 800 }}>
            The site is temporarily unavailable
          </h1>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6, color: "#3d5060" }}>
            Something failed at the root of the application. It has been reported
            and we are looking at it.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              background: "#c9182b",
              color: "#fff",
              padding: "0.7rem 1.5rem",
              fontWeight: 800,
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Reload
          </a>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#6b7c8c" }}>
              Reference: <code>{error.digest}</code>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
