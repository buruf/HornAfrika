import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  // An unauthenticated endpoint that writes a row on every call. Ten signups
  // per address per hour is far above honest use and well below useful abuse.
  const limit = await rateLimit(
    `newsletter:${clientIp(req.headers)}`,
    10,
    60 * 60_000,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many signups from this connection. Try again later." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: { email?: string; countryPref?: string; edition?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const countryPref = (body.countryPref ?? "").trim() || null;

  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const edition = (body.edition ?? "DAILY").toUpperCase();
  const allowed = ["DAILY", "WEEKLY", "SOMALIA", "ETHIOPIA", "DJIBOUTI", "ERITREA"];
  if (!allowed.includes(edition)) {
    return NextResponse.json({ error: "Unknown edition." }, { status: 400 });
  }

  // Re-subscribing is not an error, and we do not disclose whether an address
  // was already on the list.
  await db.newsletterSub.upsert({
    where: { email_edition: { email, edition: edition as never } },
    update: { countryPref },
    create: { email, edition: edition as never, countryPref },
  });

  return NextResponse.json({
    ok: true,
    message: "You're subscribed to The Horn Daily.",
  });
}
