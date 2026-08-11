import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Role, ArticleStatus } from "@prisma/client";

const COOKIE = "hornafrika_session";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 24) {
    throw new Error("AUTH_SECRET is missing or too short. Set it in .env.");
  }
  return new TextEncoder().encode(s);
}

export type Session = { userId: string; email: string; role: Role; name: string };

export async function signIn(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Compare against a dummy hash when the user does not exist so that a
  // missing account and a wrong password take the same time to answer.
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidnn";
  const ok = bcrypt.compareSync(password, hash);

  if (!user || !ok || !user.active) return null;

  const token = await new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });

  return { userId: user.id, email: user.email, role: user.role, name: user.name };
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const getSession = cache(async (): Promise<Session | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      email: String(payload.email),
      role: payload.role as Role,
      name: String(payload.name),
    };
  } catch {
    return null;
  }
});

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

// The policy itself lives in permissions.ts, which has no runtime dependencies
// and is unit-tested directly. Re-exported here so callers keep one import.
export {
  ROLE_LABEL,
  ROLE_SUMMARY,
  STATUS_LABEL,
  STATUS_COLOR,
  can,
  canEditArticle,
  allowedTransitions,
  type RoleBearer,
} from "@/lib/permissions";
