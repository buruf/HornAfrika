import { db } from "@/lib/db";
import { cache } from "react";
import type { Prisma } from "@prisma/client";

export const wireSelect = {
  id: true,
  title: true,
  excerpt: true,
  url: true,
  author: true,
  publishedAt: true,
  source: {
    select: {
      slug: true,
      name: true,
      homepageUrl: true,
      kind: true,
      language: true,
      stateAffiliated: true,
    },
  },
} satisfies Prisma.WireItemSelect;

export type WireCardItem = Prisma.WireItemGetPayload<{ select: typeof wireSelect }>;

const visible: Prisma.WireItemWhereInput = { hidden: false };

export async function getWire(opts: {
  take?: number;
  skip?: number;
  country?: string;
  source?: string;
  kind?: string;
} = {}) {
  const { take = 30, skip = 0, country, source, kind } = opts;
  return db.wireItem.findMany({
    where: {
      ...visible,
      ...(country ? { countries: { some: { country: { slug: country } } } } : {}),
      ...(source ? { source: { slug: source } } : {}),
      ...(kind ? { source: { kind: kind as never } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: wireSelect,
  });
}

export async function countWire(opts: { country?: string; source?: string; kind?: string } = {}) {
  const { country, source, kind } = opts;
  return db.wireItem.count({
    where: {
      ...visible,
      ...(country ? { countries: { some: { country: { slug: country } } } } : {}),
      ...(source ? { source: { slug: source } } : {}),
      ...(kind ? { source: { kind: kind as never } } : {}),
    },
  });
}

export const getWireSources = cache(async () =>
  db.source.findMany({
    where: { active: true },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      homepageUrl: true,
      kind: true,
      country: { select: { slug: true, name: true } },
      _count: { select: { items: true } },
    },
  }),
);

/** Freshness indicator for the wire header — when did anything last arrive? */
export const getWireFreshness = cache(async () => {
  const [latest, total, sources] = await Promise.all([
    db.wireItem.findFirst({
      where: visible,
      orderBy: { fetchedAt: "desc" },
      select: { fetchedAt: true },
    }),
    db.wireItem.count({ where: visible }),
    db.source.count({ where: { active: true } }),
  ]);
  return { lastFetchedAt: latest?.fetchedAt ?? null, total, sources };
});
