import { beforeEach, describe, expect, it, vi } from "vitest";

// The limiter is the only thing standing between one admin account and an
// unlimited password guessing loop, so its arithmetic is worth pinning down.
// Prisma is mocked: this tests the window logic, not the database.

const store = new Map<string, { key: string; count: number; windowStart: Date }>();

vi.mock("@/lib/db", () => ({
  db: {
    rateLimit: {
      // Return a copy, as Prisma does. Handing back the live object would let
      // a later update mutate the caller's snapshot, which is not how the real
      // client behaves and would hide an off-by-one rather than reveal one.
      findUnique: async ({ where }: { where: { key: string } }) => {
        const row = store.get(where.key);
        return row ? { ...row } : null;
      },
      upsert: async ({
        where,
        create,
      }: {
        where: { key: string };
        create: { key: string; count: number; windowStart: Date };
      }) => {
        store.set(where.key, { ...create });
        return store.get(where.key)!;
      },
      update: async ({ where }: { where: { key: string } }) => {
        const row = store.get(where.key)!;
        row.count += 1;
        return row;
      },
      delete: async ({ where }: { where: { key: string } }) => {
        if (!store.delete(where.key)) throw new Error("not found");
        return null;
      },
    },
  },
}));

const { rateLimit, clearRateLimit, clientIp } = await import("@/lib/rate-limit");

const WINDOW = 15 * 60_000;

describe("rateLimit()", () => {
  beforeEach(() => {
    store.clear();
    vi.useRealTimers();
  });

  it("allows requests up to the limit and then blocks", async () => {
    for (let i = 0; i < 5; i++) {
      const r = await rateLimit("k", 5, WINDOW);
      expect(r.ok).toBe(true);
    }
    const blocked = await rateLimit("k", 5, WINDOW);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("reports how long to wait once blocked", async () => {
    for (let i = 0; i < 5; i++) await rateLimit("k", 5, WINDOW);
    const blocked = await rateLimit("k", 5, WINDOW);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(WINDOW / 1000);
  });

  it("counts down remaining accurately", async () => {
    expect((await rateLimit("k", 3, WINDOW)).remaining).toBe(2);
    expect((await rateLimit("k", 3, WINDOW)).remaining).toBe(1);
    expect((await rateLimit("k", 3, WINDOW)).remaining).toBe(0);
  });

  it("keeps separate keys separate", async () => {
    for (let i = 0; i < 5; i++) await rateLimit("a", 5, WINDOW);
    expect((await rateLimit("a", 5, WINDOW)).ok).toBe(false);
    expect((await rateLimit("b", 5, WINDOW)).ok).toBe(true);
  });

  it("starts a fresh window once the old one expires", async () => {
    for (let i = 0; i < 5; i++) await rateLimit("k", 5, WINDOW);
    expect((await rateLimit("k", 5, WINDOW)).ok).toBe(false);

    // Age the stored window past its expiry.
    store.get("k")!.windowStart = new Date(Date.now() - WINDOW - 1000);

    const afterExpiry = await rateLimit("k", 5, WINDOW);
    expect(afterExpiry.ok).toBe(true);
    expect(afterExpiry.remaining).toBe(4);
  });

  it("fails open when the database is unavailable", async () => {
    // A database problem must not lock every editor out of the CMS — that
    // turns a blip into an outage.
    const { db } = await import("@/lib/db");
    const original = db.rateLimit.findUnique;
    // @ts-expect-error deliberately breaking the mock
    db.rateLimit.findUnique = async () => {
      throw new Error("connection refused");
    };
    const r = await rateLimit("k", 1, WINDOW);
    expect(r.ok).toBe(true);
    db.rateLimit.findUnique = original;
  });

  it("clearRateLimit resets a key and tolerates a missing one", async () => {
    for (let i = 0; i < 5; i++) await rateLimit("k", 5, WINDOW);
    expect((await rateLimit("k", 5, WINDOW)).ok).toBe(false);
    await clearRateLimit("k");
    expect((await rateLimit("k", 5, WINDOW)).ok).toBe(true);
    await expect(clearRateLimit("never-existed")).resolves.toBeUndefined();
  });
});

describe("clientIp()", () => {
  it("takes the first entry of x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" });
    expect(clientIp(h)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then to a constant", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
    expect(clientIp(new Headers())).toBe("unknown");
  });

  it("never returns an empty string, which would collapse all callers to one key", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "" }))).not.toBe("");
    expect(clientIp(new Headers({ "x-real-ip": "  " }))).not.toBe("");
  });
});
