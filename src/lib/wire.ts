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

/**
 * Only Horn-relevant items reach the reader.
 *
 * The international wires publish everything they cover, so on the first live
 * pull 52% of the wire was untagged international copy — Australian energy
 * policy, a Colombian earthquake, Indian floods. On a platform whose entire
 * claim is the Horn of Africa, that is not "extra coverage", it is noise
 * crowding out the thing readers came for.
 *
 * The rule is the same one used for tagging: the item's own text decides,
 * never the masthead. An item is shown if it names one of the four countries.
 *
 * Whitelisting outlets was tried twice against the live pull and failed twice.
 * Trusting pan-African sources let in Libyan oil fires and Syrian politics.
 * Trusting Somali and Ethiopian outlets still let in Trump, Assad, Musk, Nigel
 * Farage and a Colombian earthquake — regional newsrooms republish world copy
 * like everyone else. A masthead is not evidence of subject matter.
 *
 * The cost is that a genuine regional story whose wording the tagger does not
 * recognise is hidden. That is a tagger gap, and the fix belongs there — see
 * the institution terms in country-tagger.ts — not in a source whitelist that
 * waves through everything an outlet happens to publish.
 *
 * Untagged items are still stored, since the tagger improves and re-tagging is
 * cheaper than re-fetching. They are simply not shown.
 */
const hornRelevant: Prisma.WireItemWhereInput = {
  countries: { some: {} },
};

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
      ...hornRelevant,
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
      ...hornRelevant,
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
      // Same filter as the list, or the header would advertise a headline
      // count that includes items no reader can actually see.
      where: { ...visible, ...hornRelevant },
      orderBy: { fetchedAt: "desc" },
      select: { fetchedAt: true },
    }),
    db.wireItem.count({ where: { ...visible, ...hornRelevant } }),
    db.source.count({ where: { active: true } }),
  ]);
  return { lastFetchedAt: latest?.fetchedAt ?? null, total, sources };
});
