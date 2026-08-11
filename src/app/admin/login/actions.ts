"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

/**
 * Module-level action rather than an inline closure, so the login form works
 * as a plain HTML POST before (and without) hydration.
 */
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const result = await signIn(email, password);

  // One message for every failure mode — a wrong password and an unknown
  // address must be indistinguishable from outside.
  if (!result) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  redirect(next.startsWith("/admin") && next !== "/admin/login" ? next : "/admin");
}
