# HORNAFRIKA

**The Horn of Africa, Connected.**

A regional news and information platform covering Somalia, Ethiopia, Djibouti and
Eritrea — built so that all four countries are first-class, and so that the
stories which cross borders have somewhere to live.

## Running it

```bash
npm install
npm run db:reset
npm run dev
```

Then open <http://localhost:3040>.

`db:reset` recreates the SQLite database and seeds it with 4 countries, 27
regions, 10 sections, 46 articles, 12 videos, 8 authors, 5 user accounts, 37
wire sources, and roughly 49,000 synthetic read events (so the trending ranking
has real data to sort).

To pull live headlines into the wire:

```bash
npm run wire -- --force
```

## CMS

Sign in at <http://localhost:3040/admin>.

| Email | Role | Can |
|---|---|---|
| admin@hornafrika.com | Super Admin | Everything, including users and ad slots |
| editor@hornafrika.com | Editor | Publish anything, control the homepage |
| journalist@hornafrika.com | Journalist | Create and edit own work, submit for review |
| contributor@hornafrika.com | Contributor | Draft own work, submit for review |
| moderator@hornafrika.com | Moderator | Community moderation only |

Password for all seeded accounts: `hornafrika`. **Change these before deploying.**

## Stack

- **Next.js 15** (App Router, React Server Components) — reader pages render on
  the server and ship almost no JavaScript
- **TypeScript**, strict
- **Tailwind CSS v4**
- **Prisma** over **SQLite** — moving to Postgres is a `datasource` change; no
  model depends on a SQLite-specific feature
- **Auth**: JWT in an httpOnly cookie (`jose`), passwords hashed with `bcryptjs`

## Structure

```
src/app/(site)/     public site — carries the header, ticker and footer
src/app/admin/      the CMS — its own frame, gated by middleware
src/app/api/        newsletter signup, OG image generation
src/components/     shared UI
src/lib/            data access, search, auth, formatting
prisma/             schema and seed
docs/superpowers/   the design spec this was built from
```

### URLs

```
/                                homepage
/somalia /ethiopia /djibouti /eritrea
/<country>/regions/<region>
/<country>/<category>
/<country>/<category>/<slug>     article
/horn                            multi-country regional coverage
/politics /business /security /economy /society /culture /sports
/explained /people /videos /trending /latest /search
/wire                            aggregated headlines from other newsrooms
/wire/about                      what we take, what we never take, opt-out
```

`horn` acts as a pseudo-country for stories with no single home, so a regional
article lands at `/horn/regional/<slug>` rather than under an arbitrary capital.

## Things worth knowing

**The homepage is edited, not generated.** `HomepageSlot` rows hold an editor's
choice of lead, secondaries and per-country leads. Empty slots fall back to the
most recent qualifying story so the page is never broken, but the editor always
wins. Only the Trending block is algorithmic, and it is confined to the sidebar.

**Multi-country stories are structural.** The `ArticleCountry` join table means
an Ethiopia–Somalia story is genuinely first-class on both country pages and in
`/horn`, without being duplicated. Two or more countries makes it regional.

**Trending is measured.** `ArticleView` rows are aggregated over today / 7 days /
30 days and weighted by a recency decay, so an old story that once peaked cannot
sit at the top forever. It is not a publication-date sort.

**Search matches all terms.** `Somalia Ethiopia` returns stories involving both,
ranked above stories mentioning only one, with field weighting across headline,
deck, body, country, region, section, topic and author.

**Imagery is honest.** No licensed photography was available, and generic
AI-generated African imagery was out of scope, so each article carries a
deterministic abstract graphic derived from its slug and section — captioned as
an editorial graphic. Adding a real photo URL through the CMS replaces it
everywhere with no code change.

**Seed content is labelled.** Every seeded article sets `isSeed`, is badged in
the admin, and carries a note at the foot of the page saying it is launch
scaffolding written from documented regional background, containing no sourced
quotes or original reporting. Nothing in the seed invents a quote, an
eyewitness, or a statistic; where a live figure belongs, the text carries a
bracketed editor placeholder that renders as a visible note.

**Advertising collapses when empty.** Five declared positions, each rendering
nothing at all unless an administrator activates it.

## The Wire (news aggregation)

`/wire` aggregates headlines from **28 live feeds**: newsrooms in Somalia,
Ethiopia and Djibouti, Horn-wide and pan-African outlets, and international
broadcasters and wires. Managed at `/admin/sources`; a full live pull takes
about 12 seconds.

**What is stored:** headline, ~240-character extract, publication time, author
where the feed gives one, and the link. Never full text. Republishing whole
articles would require a syndication licence from each publisher; the
headline-plus-extract-plus-link model is the defensible one and is what is
built.

**Separation.** Wire items are separate models, a separate section and a
distinct visual style (left rule, no image, publisher name always shown). They
never enter Trending, never occupy a homepage lead slot, and never mix into
article feeds. The reader-facing policy is at `/wire/about`.

**Crawler ethics.** `HornafrikaBot` identifies itself honestly with a contact
URL and is deliberately *not* disguised as a browser. Nine outlets that block
automated requests are seeded inactive with the exact error recorded, so the
choice to approach them for permission is yours rather than something the code
quietly worked around.

**State media is badged, not excluded.** Sources marked `stateAffiliated` carry
a visible badge on every headline. Currently: Fana Broadcasting, La Nation,
ADDS Djibouti, VOA and Shabait. Editors can change the flag in the CMS.

**Country tagging is by text, not by publisher.** Country names, capitals,
demonyms, regions and institutions are matched across English, Somali, Amharic,
Tigrinya and French. Inheriting the outlet's country was tried, measured against
a live pull, and removed — it filed a Colombian bombing, a US mosquito programme
and an Arsenal transfer under Somalia, producing about as many wrong tags as
right ones. Untagged items stay on the main wire, which is where an
international story belongs.

**Eritrea is thin, and visibly so.** No Eritrean outlet publishes a feed we can
reach — Shabait, TesfaNews and Eritrean Press all block or fail. Eritrea
coverage therefore arrives only through the international wires, and `/wire/about`
says so rather than leaving the gap unexplained.

**Scheduling.** `GET /api/cron/aggregate` runs the same job, authorised by
`CRON_SECRET` as a bearer token, or by a signed-in Editor/Super Admin. It fails
closed. Sources are not refetched within 20 minutes; items older than 45 days
are pruned.

## Before deploying

1. Change every seeded password, and set a strong `AUTH_SECRET`.
2. Point `DATABASE_URL` at Postgres and change the Prisma `datasource` provider.
3. Set `NEXT_PUBLIC_SITE_URL` to the real origin — canonicals, OG images,
   sitemap and JSON-LD all derive from it.
4. Replace the placeholder social links in `TopBar` and `SiteFooter`.
5. Decide what to do with the seeded articles: keep them as background, or
   archive them as real reporting arrives.
6. Set `CRON_SECRET` and point a scheduler at `/api/cron/aggregate` — every
   20–30 minutes is sensible. Without it the wire only updates when someone
   presses "Fetch all now".
7. Consider writing to the publishers whose feeds are switched off, and to the
   ones you rely on most. Aggregation works better as a relationship than as a
   crawl.

## Not built yet

Live video playback (the pages, routing and schema are in place, awaiting a
provider), translated article bodies (the language selector and UI chrome are
wired; copy is English), comments, and the weather widget in the top utility bar
— that slot currently holds capital quick-links rather than an unsourced figure.
