import { db } from "@/lib/db";
import { parseFeed, type ParsedItem } from "@/lib/rss";
import { detectCountries } from "@/lib/country-tagger";
import { detectTopic } from "@/lib/topic-tagger";

/**
 * The wire aggregator.
 *
 * Policy, not just plumbing:
 *  - We identify ourselves honestly in the User-Agent, with a contact URL. We
 *    do not disguise the crawler as a browser to get past a publisher that has
 *    chosen to block bots — a blocked source is recorded as blocked and left
 *    inactive until permission is arranged.
 *  - We store a headline, a short excerpt and a link. Never the full text.
 *  - We never rewrite a headline into our own voice; it stays as published,
 *    attributed to the outlet that wrote it.
 */

export const USER_AGENT =
  "Mozilla/5.0 (compatible; HornafrikaBot/1.0; +https://hornafrika.com/about)";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_ITEMS_PER_FETCH = 40;
/** A source is not refetched inside this window, however often the job runs. */
export const MIN_REFETCH_MINUTES = 20;

export type FetchResult = {
  sourceSlug: string;
  sourceName: string;
  ok: boolean;
  added: number;
  seen: number;
  status: string;
  error?: string;
  skipped?: boolean;
};

// ---------------------------------------------------------------------------
// Country tagging
// ---------------------------------------------------------------------------

// Pure text logic, extracted so it can be tested without a database. See
// country-tagger.ts for why it never inherits the publisher country.
export { detectCountries };

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

const FEED_ACCEPT =
  "application/rss+xml, application/atom+xml, application/xml, text/xml, */*";

async function fetchFeed(url: string): Promise<{ xml: string; status: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const get = (accept: string) =>
    fetch(url, {
      headers: { "user-agent": USER_AGENT, accept },
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store",
    });

  try {
    let res = await get(FEED_ACCEPT);

    // Some publishers run content negotiation that rejects an explicit list of
    // feed types even though `*/*` is in it, and answer 406 to a request they
    // would happily serve. Asking less specifically is not evasion — it is what
    // an ordinary client sends — so one retry is worth it before recording the
    // source as broken.
    if (res.status === 406) res = await get("*/*");

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      (err as Error & { status: string }).status = `http ${res.status}`;
      throw err;
    }
    return { xml: await res.text(), status: "ok" };
  } finally {
    clearTimeout(timer);
  }
}

type SourceRow = {
  id: string;
  slug: string;
  name: string;
  feedUrl: string;
  countryId: string | null;
  lastFetchedAt: Date | null;
};

/** Fetch one source and store anything new. Never throws. */
export async function fetchSource(
  source: SourceRow,
  countryIdBySlug: Map<string, string>,
  opts: { force?: boolean } = {},
): Promise<FetchResult> {
  const base = { sourceSlug: source.slug, sourceName: source.name };

  if (!opts.force && source.lastFetchedAt) {
    const mins = (Date.now() - source.lastFetchedAt.getTime()) / 60_000;
    if (mins < MIN_REFETCH_MINUTES) {
      return { ...base, ok: true, added: 0, seen: 0, status: "skipped", skipped: true };
    }
  }

  let items: ParsedItem[];
  try {
    const { xml } = await fetchFeed(source.feedUrl);
    items = parseFeed(xml, source.feedUrl).slice(0, MAX_ITEMS_PER_FETCH);
  } catch (e) {
    const err = e as Error & { status?: string; name?: string };
    const status =
      err.status ?? (err.name === "AbortError" ? "timeout" : "error");
    await db.source.update({
      where: { id: source.id },
      data: {
        lastFetchedAt: new Date(),
        lastStatus: status,
        lastError: err.message.slice(0, 300),
        failureCount: { increment: 1 },
      },
    });
    return { ...base, ok: false, added: 0, seen: 0, status, error: err.message };
  }

  let added = 0;

  for (const item of items) {
    try {
      // Skip anything we already hold, by guid within the source or by URL.
      const existing = await db.wireItem.findFirst({
        where: {
          OR: [{ sourceId: source.id, guid: item.guid }, { url: item.url }],
        },
        select: { id: true },
      });
      if (existing) continue;

      const created = await db.wireItem.create({
        data: {
          sourceId: source.id,
          guid: item.guid,
          url: item.url,
          title: item.title,
          excerpt: item.excerpt,
          author: item.author ?? null,
          imageUrl: item.imageUrl ?? null,
          publishedAt: item.publishedAt,
          topic: detectTopic(`${item.title} ${item.excerpt}`),
        },
      });

      const detected = detectCountries(`${item.title} ${item.excerpt}`);
      const countryIds = new Set<string>();
      for (const slug of detected) {
        const id = countryIdBySlug.get(slug);
        if (id) countryIds.add(id);
      }

      // Country tags come from the item's own text, never from who published
      // it. Inheriting the outlet's country was measured against a live pull
      // and filed a Colombian bombing, a US mosquito programme and an Arsenal
      // transfer under Somalia — it produced about as many wrong tags as right
      // ones. Untagged items still appear on the main wire and under their
      // source's filter, which is where an international story belongs.

      if (countryIds.size > 0) {
        await db.wireItemCountry.createMany({
          data: [...countryIds].map((countryId) => ({
            wireItemId: created.id,
            countryId,
          })),
        });
      }

      added++;
    } catch {
      // A single malformed item must not abort the whole source.
      continue;
    }
  }

  // Newest item the feed offered, whether or not it was new to us — that is
  // what says the newsroom is still publishing.
  const newest = items.reduce<Date | null>(
    (max, it) => (!max || it.publishedAt > max ? it.publishedAt : max),
    null,
  );

  await db.source.update({
    where: { id: source.id },
    data: {
      lastFetchedAt: new Date(),
      lastStatus: "ok",
      lastError: null,
      lastItemCount: items.length,
      failureCount: 0,
      ...(newest ? { lastItemAt: newest } : {}),
    },
  });

  return { ...base, ok: true, added, seen: items.length, status: "ok" };
}

/** Fetch every active source. Runs with limited concurrency to stay polite. */
export async function runAggregation(
  opts: { force?: boolean; only?: string } = {},
): Promise<{ results: FetchResult[]; added: number; durationMs: number }> {
  const started = Date.now();

  const [sources, countries] = await Promise.all([
    db.source.findMany({
      where: { active: true, ...(opts.only ? { slug: opts.only } : {}) },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        feedUrl: true,
        countryId: true,
        lastFetchedAt: true,
      },
    }),
    db.country.findMany({ select: { id: true, slug: true } }),
  ]);

  const bySlug = new Map(countries.map((c) => [c.slug, c.id]));
  const results: FetchResult[] = [];

  const CONCURRENCY = 5;
  for (let i = 0; i < sources.length; i += CONCURRENCY) {
    const batch = sources.slice(i, i + CONCURRENCY);
    results.push(
      ...(await Promise.all(batch.map((s) => fetchSource(s, bySlug, opts)))),
    );
  }

  return {
    results,
    added: results.reduce((n, r) => n + r.added, 0),
    durationMs: Date.now() - started,
  };
}

/** Wire items older than this are pruned so the table does not grow forever. */
export async function pruneWire(days = 45) {
  const cutoff = new Date(Date.now() - days * 86_400_000);
  const { count } = await db.wireItem.deleteMany({
    where: { publishedAt: { lt: cutoff } },
  });
  return count;
}
