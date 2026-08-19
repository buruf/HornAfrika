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
  // The publisher's own thumbnail, where the feed offers one (about half do).
  // Used for the homepage lead; hotlinked to the publisher rather than copied,
  // which is the same posture as the headline itself.
  imageUrl: true,
  // The desk this was filed to, or null. See topic-tagger.ts.
  topic: true,
  // Set when we fetched this from a syndicator rather than the newsroom.
  originalPublisher: true,
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
  // Which of the four an item is about. Shown as a chip on the wire band so a
  // reader can see at a glance that the page covers four countries and not
  // just the one that happens to publish most.
  countries: {
    select: { country: { select: { slug: true, name: true } } },
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

/**
 * The other side of that filter: everything the Horn rule excludes.
 *
 * These items were always fetched and stored, and until now nothing could
 * reach them. That is a lot of live material — roughly 226 items a day, and
 * crucially they keep arriving overnight when Horn newsrooms have stopped
 * filing. Giving them an explicit "World" scope on /wire surfaces them without
 * letting them anywhere near the Horn pages, which is what the original filter
 * was protecting.
 */
const worldOnly: Prisma.WireItemWhereInput = {
  countries: { none: {} },
};

export type WireScope = "horn" | "world";

type WireFilter = {
  scope?: WireScope;
  country?: string;
  source?: string;
  kind?: string;
  topic?: string;
  excludeIds?: string[];
};

function wireWhere({ scope, country, source, kind, topic, excludeIds }: WireFilter) {
  return {
    ...visible,
    // A country filter only means anything inside the Horn scope.
    ...(scope === "world" ? worldOnly : hornRelevant),
    ...(country ? { countries: { some: { country: { slug: country } } } } : {}),
    ...(source ? { source: { slug: source } } : {}),
    ...(kind ? { source: { kind: kind as never } } : {}),
    ...(topic ? { topic } : {}),
    ...(excludeIds?.length ? { id: { notIn: excludeIds } } : {}),
  } satisfies Prisma.WireItemWhereInput;
}

export async function getWire(
  opts: WireFilter & { take?: number; skip?: number } = {},
) {
  const { take = 30, skip = 0, ...filter } = opts;
  return db.wireItem.findMany({
    where: wireWhere(filter),
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: wireSelect,
  });
}

/**
 * How many headlines each desk is holding, for the category strip and for
 * deciding whether a desk is worth linking to at all.
 */
export async function getTopicCounts(country?: string): Promise<Map<string, number>> {
  const rows = await db.wireItem.groupBy({
    by: ["topic"],
    where: wireWhere({ country }),
    _count: true,
  });
  return new Map(
    rows.filter((r) => r.topic).map((r) => [r.topic as string, r._count]),
  );
}

/**
 * Deal wire slots round-robin between the countries, each taking its next
 * freshest item in turn.
 *
 * Straight recency makes this a Somalia site. That is arithmetic, not
 * judgement: Somali outlets are the most numerous and the most prolific we can
 * reach, so the newest eleven items were all Somalia and a platform claiming
 * four countries showed one.
 *
 * Reserving one slot per country and filling the rest by recency was the first
 * attempt, and it was not enough — Somalia simply took every unreserved slot,
 * so eight of eleven were still Somalia. Dealing in rotation is what actually
 * evens the page out: each country takes a turn, and a country with nothing
 * left is skipped rather than padded, so the band degrades to whatever the
 * supply really is instead of pretending.
 *
 * Any slots still open once every country is exhausted go to the freshest
 * remaining items, tagged or not, so the band never renders short.
 *
 * Pure, so the rule can be tested without a database.
 */
export function balanceByCountry<
  T extends { id: string; publishedAt: Date; countries: { country: { slug: string } }[] },
>(items: T[], take: number, countrySlugs: string[]): T[] {
  const byRecency = [...items].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );

  // One queue per country, freshest first. An item tagged with two countries
  // sits in both queues; whichever turn comes first claims it, and `picked`
  // stops it being dealt twice.
  const queues = new Map(
    countrySlugs.map((slug) => [
      slug,
      byRecency.filter((i) => i.countries.some((c) => c.country.slug === slug)),
    ]),
  );
  const cursor = new Map(countrySlugs.map((slug) => [slug, 0]));
  const picked = new Map<string, T>();

  let dealt = true;
  while (picked.size < take && dealt) {
    dealt = false;
    for (const slug of countrySlugs) {
      if (picked.size >= take) break;

      const queue = queues.get(slug)!;
      let at = cursor.get(slug)!;
      while (at < queue.length && picked.has(queue[at].id)) at++;
      cursor.set(slug, at);

      if (at < queue.length) {
        picked.set(queue[at].id, queue[at]);
        cursor.set(slug, at + 1);
        dealt = true;
      }
    }
  }

  for (const item of byRecency) {
    if (picked.size >= take) break;
    if (!picked.has(item.id)) picked.set(item.id, item);
  }

  // Reads as a wire, so it goes back into time order once the mix is settled.
  return [...picked.values()].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
}

/**
 * Nudge items so the same outlet does not appear twice in a row.
 *
 * Country balance fixes which stories get picked; it does nothing about the
 * order they land in, because the list is put back into time order afterwards.
 * Outlets publish in batches — Addis Fortune files a week's stories within
 * minutes of each other — so the top of the wire was six consecutive items
 * from one masthead. Balanced by country, monotonous to read.
 *
 * This is the lightest possible fix: walk the list, and when an item repeats
 * the previous outlet, pull the next differently-sourced item forward past it.
 * Chronology is disturbed by a few positions at most, and never reordered
 * wholesale. If everything left is from one outlet it simply gives up, which
 * is correct — there is nothing to interleave with.
 */
export function spreadSources<T extends { source: { slug: string } }>(
  items: T[],
): T[] {
  const out = [...items];
  for (let i = 1; i < out.length; i++) {
    if (out[i].source.slug !== out[i - 1].source.slug) continue;

    const swap = out.findIndex(
      (candidate, j) =>
        j > i &&
        candidate.source.slug !== out[i - 1].source.slug &&
        // Do not create a new clash with whatever follows the hole we leave.
        (j + 1 >= out.length || out[j + 1].source.slug !== out[i].source.slug),
    );
    if (swap > i) {
      const [moved] = out.splice(swap, 1);
      out.splice(i, 0, moved);
    }
  }
  return out;
}

/**
 * The front-page band: a pool of recent items, balanced across the four
 * countries. The pool is deliberately much larger than the band so a country
 * that has been quiet for a few hours can still be found.
 */
export async function getWireBand(take = 11, countrySlugs: string[]) {
  const pool = await getWire({ take: 120 });
  return balanceByCountry(pool, take, countrySlugs);
}

/**
 * The lead slot at the very top of the homepage.
 *
 * An aggregator's front page has to open with something that was published
 * today. Ours opened with a fixed article set whose newest piece was three
 * days old and getting older every morning, because nothing rewrites it. The
 * wire is two hours old, so the wire leads.
 *
 * A picture is preferred but not required: about half of wire items carry one,
 * and a recent headline with no image beats a good-looking stale one. Age wins
 * over decoration, so the search widens rather than reaching further back.
 */
export async function getWireLead(): Promise<WireCardItem | null> {
  const recent = await getWire({ take: 40 });
  return recent.find((i) => i.imageUrl) ?? recent[0] ?? null;
}

/**
 * The freshest wire items for each country, for the four-country blocks.
 *
 * One query rather than four, because the blocks are rendered together and
 * four round trips to Neon on every homepage request is a waste of the
 * connection pool.
 */
export async function getWireByCountry(
  countrySlugs: string[],
  perCountry = 5,
): Promise<Map<string, WireCardItem[]>> {
  const pool = await getWire({ take: 400 });
  const out = new Map<string, WireCardItem[]>();
  for (const slug of countrySlugs) {
    out.set(
      slug,
      pool
        .filter((i) => i.countries.some((c) => c.country.slug === slug))
        .slice(0, perCountry),
    );
  }
  return out;
}

export async function countWire(opts: WireFilter = {}) {
  return db.wireItem.count({ where: wireWhere(opts) });
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
