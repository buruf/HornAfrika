"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (fd: FormData, k: string, max = 2000) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

/**
 * A reporter applying to contribute.
 *
 * Creates a PENDING account which cannot sign in. An editor verifies the
 * person before it becomes usable, so nothing here grants any access — the
 * worst a spammer achieves is a row in a review queue.
 */
export async function applyToContribute(formData: FormData) {
  const ip = clientIp(await headers());
  // Public, unauthenticated, and it writes a row. Three applications an hour
  // from one connection is far beyond honest use.
  const limit = await rateLimit(`contribute:${ip}`, 3, 60 * 60_000);
  if (!limit.ok) redirect("/contribute?error=throttled");

  const name = str(formData, "name", 120);
  const email = str(formData, "email", 254).toLowerCase();
  const password = str(formData, "password", 200);
  const location = str(formData, "location", 120);
  const applicationNote = str(formData, "applicationNote", 2000);
  const workLinks = str(formData, "workLinks", 1000);

  if (!name || !EMAIL.test(email) || !location || !applicationNote) {
    redirect("/contribute?error=required");
  }
  if (password.length < 10) redirect("/contribute?error=password");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Do not confirm that an address is already registered. Someone applying
    // twice sees the same acknowledgement as a first-time applicant, and the
    // editor sees only the original application.
    redirect("/contribute?applied=1");
  }

  await db.user.create({
    data: {
      email,
      name,
      role: "CONTRIBUTOR",
      passwordHash: bcrypt.hashSync(password, 12),
      // Cannot sign in until an editor verifies the person behind it.
      active: false,
      contributorStatus: "PENDING",
      location,
      applicationNote,
      workLinks: workLinks || null,
      appliedAt: new Date(),
    },
  });

  redirect("/contribute?applied=1");
}
