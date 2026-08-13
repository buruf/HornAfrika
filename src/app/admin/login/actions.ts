"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { signIn } from "@/lib/auth";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Module-level action rather than an inline closure, so the login form works
 * as a plain HTML POST before (and without) hydration.
 */

// Two ceilings, deliberately. Limiting only by address lets an attacker
// rotate addresses against one account; limiting only by account lets them
// spray one password across many accounts. Together they close both.
const PER_IP = { limit: 10, windowMs: 15 * 60_000 };
const PER_ACCOUNT = { limit: 5, windowMs: 15 * 60_000 };

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const ip = clientIp(await headers());

  const [byIp, byAccount] = await Promise.all([
    rateLimit(`login:ip:${ip}`, PER_IP.limit, PER_IP.windowMs),
    rateLimit(`login:email:${email}`, PER_ACCOUNT.limit, PER_ACCOUNT.windowMs),
  ]);

  if (!byIp.ok || !byAccount.ok) {
    const wait = Math.max(byIp.retryAfterSeconds, byAccount.retryAfterSeconds);
    redirect(
      `/admin/login?error=throttled&wait=${Math.ceil(wait / 60)}&next=${encodeURIComponent(next)}`,
    );
  }

  const result = await signIn(email, password);

  if (!result.ok) {
    // A wrong password and an unknown address are indistinguishable. The
    // application states are only reachable once the password was correct.
    const code =
      result.reason === "invalid" ? "1" : result.reason;
    redirect(`/admin/login?error=${code}&next=${encodeURIComponent(next)}`);
  }

  // A successful sign-in clears the account counter, so someone who mistypes
  // twice and then gets it right is not still near the ceiling. The address
  // counter is left alone: it is the defence against a shared attacking host.
  await clearRateLimit(`login:email:${email}`);

  redirect(next.startsWith("/admin") && next !== "/admin/login" ? next : "/admin");
}
