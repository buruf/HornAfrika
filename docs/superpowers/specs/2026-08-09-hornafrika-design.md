# HORNAFRIKA.COM — Design Spec

Date: 2026-08-09
Status: Approved

## 1. Purpose

A regional news and information platform for the Horn of Africa — Somalia, Ethiopia,
Djibouti and Eritrea — built so that all four countries are first-class. Not a Somali
news site that also covers neighbours. The target impression on first load is:
"This is the place to understand what is happening across the Horn of Africa."

## 2. Stack

- Next.js 15, App Router, React Server Components
- TypeScript, strict
- Tailwind CSS v4
- Prisma ORM over SQLite (`file:./dev.db`); switching to Postgres is a datasource change
- Auth: JWT in an httpOnly cookie, signed with `jose`; passwords hashed with `bcryptjs`
- No client-side data fetching on reader pages

Rationale for RSC-first: the platform must perform on slow mobile connections
(§26). Reader pages render on the server and ship interactive JS only for the
breaking ticker, mobile menu, search box, map, and newsletter form.

## 3. Data model

```
Country      slug, name, nativeName, flag, blurb, accent
Region       slug, name, countryId          -- extensible without schema change
Category     slug, name, kind, color, order
Subcategory  slug, name, categoryId
Topic        slug, name
Author       slug, name, title, bio, avatarSeed
User         email, passwordHash, role, authorId?
Article      slug, headline, deck, body, countryId?, regionId?, categoryId,
             subcategoryId?, authorId, status, placement, isBreaking,
             isDeveloping, isSeed, publishedAt, updatedAt, seoTitle,
             seoDescription, imageSeed, imageCaption, sourceNote
ArticleCountry   join table -- multi-country stories power the Horn section
ArticleTopic     join table
Video        slug, title, countryId?, durationSec, provider, externalId, kind
ArticleView  articleId, viewedAt          -- real trending, not date sort
NewsletterSub    email, edition, countryPref
AdSlot       position, active, label
EditorialLog articleId, userId, fromStatus, toStatus, note, createdAt
HomepageSlot slot, articleId              -- editor-controlled homepage
```

`ArticleCountry` is the key structural decision. A story about Ethiopia–Somalia
relations belongs to both country pages and to `/horn` without being duplicated.

## 4. Editorial workflow (§24)

`DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> UPDATED -> ARCHIVED`

Roles and permitted transitions:

| Role         | Create | Edit own | Edit any | Publish | Manage users |
|--------------|--------|----------|----------|---------|--------------|
| SUPER_ADMIN  | yes    | yes      | yes      | yes     | yes          |
| EDITOR       | yes    | yes      | yes      | yes     | no           |
| JOURNALIST   | yes    | yes      | no       | no      | no           |
| CONTRIBUTOR  | yes    | draft only | no     | no      | no           |
| MODERATOR    | no     | no       | no       | no      | no           |

Every transition writes an `EditorialLog` row.

## 5. Routing (§25)

```
/                                   homepage
/somalia | /ethiopia | /djibouti | /eritrea
/<country>/regions/<region>
/<country>/<category>               country + category
/<country>/<category>/<slug>        article
/horn                               multi-country regional
/politics /business /security /economy /society /culture /sports
/explained /people /videos
/search?q=
/about /contact /editorial-policy /privacy /terms /corrections /careers
/advertise /submit-a-story
/admin/...                          CMS
```

No query-string article ids. Every article emits `NewsArticle` JSON-LD,
`BreadcrumbList`, canonical URL, and an OG image from `/api/og/<slug>`.

## 6. Design system (§27)

- Ink `#0B1F33`, brand red `#C9182B`, paper `#FFFFFF`, hairline `#E3E6EA`
- One strong brand colour; category chips are the only additional colour
- Square corners; hairline rules rather than card shadows; no gradients,
  no glassmorphism, no decorative illustration
- Headlines: tight bold sans. Body: 1.7 line-height, comfortable measure
- Generous whitespace; sections differentiated by weight, not by decoration

## 7. Imagery

No licensed photography is available and generic AI-generated African imagery is
explicitly out of scope. Article imagery is deterministic editorial SVG derived
from `imageSeed` + category — abstract, category-coded, honest about being a
graphic rather than a photograph. The CMS exposes a real image URL field, so
photographs replace the placeholder per-article with no code change.

## 8. Homepage hierarchy (§29)

Header -> breaking ticker -> lead story + secondary -> The Horn (four equal
country blocks) -> Horn regional -> Politics -> Business -> Security -> Culture
-> Sports -> Explained -> Video -> Newsletter -> Footer. Sidebar carries
Trending, the interactive map, and The Horn Daily signup.

The lead and secondary slots come from `HomepageSlot`, set by an editor. Only
Trending is algorithmic (§20).

## 9. Trending (§19)

`ArticleView` rows are aggregated over today / 7 days / 30 days. Score combines
view count with a recency decay so an older story cannot dominate indefinitely.
Not a publication-date sort.

## 10. Search (§18)

Multi-term AND matching across headline, deck, body, country, region, category
and topic names, with field-weighted scoring. `Somalia Ethiopia` returns stories
that involve both, ranked above stories that mention only one.

## 11. Content honesty (§17)

Seed content carries real, checkable regional context. No fabricated quotes,
named eyewitnesses, or invented statistics. Where a figure is required the text
uses a clearly-labelled placeholder for an editor to complete. All seed rows set
`isSeed = true` and are visibly badged in the admin so real reporting is never
confused with scaffolding.

## 12. Advertising (§22)

Ad slots are declared positions — header, mid-homepage, sidebar, in-article,
footer — rendered only when an `AdSlot` row is active. Empty slots collapse to
nothing. Editorial content stays dominant.

## 13. Future expansion (§32)

Jobs, directory, real estate, events, travel, weather, currency, classifieds,
podcasts, live TV, forums, diaspora, data dashboards. These attach as new
top-level route groups and new Prisma models; none require changing the article,
country, region, or category models.

## 14. Out of scope for this pass

Real photography, live video ingestion, comments, payment, translation of body
copy into the five secondary languages (the language selector is wired and the UI
chrome is translatable; article bodies remain English until translations exist).
