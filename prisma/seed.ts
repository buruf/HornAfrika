import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COUNTRIES, CATEGORIES, TOPICS, DESK_AUTHOR, DEV_AUTHORS, USERS } from "./seed-data";
import { ARTICLES, VIDEOS } from "./seed-articles";
import { SOURCES } from "./seed-sources";

const prisma = new PrismaClient();

/**
 * Production seeding differs in exactly one way: it never creates the demo
 * accounts. Everything else — countries, sections, wire sources, the seed
 * articles — is the same launch scaffolding either way.
 */
const IS_PRODUCTION =
  process.env.NODE_ENV === "production" || process.env.SEED_ENV === "production";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function ago(days: number, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d;
}

async function main() {
  // This seed is destructive: it clears every table before inserting. That is
  // right for a local reset and catastrophic against a live site, so in
  // production it refuses to run over existing content unless someone has
  // explicitly asked for a wipe.
  if (IS_PRODUCTION) {
    const existing = await prisma.article.count();
    if (existing > 0 && process.env.SEED_RESET !== "yes-delete-everything") {
      throw new Error(
        `Refusing to seed: the production database already holds ${existing} articles. ` +
          `This seed deletes all content before inserting. To wipe deliberately, ` +
          `set SEED_RESET=yes-delete-everything.`,
      );
    }
  }

  console.log("Clearing existing data…");
  await prisma.wireItemCountry.deleteMany();
  await prisma.wireItem.deleteMany();
  await prisma.source.deleteMany();
  await prisma.articleViewDaily.deleteMany();
  await prisma.editorialLog.deleteMany();
  await prisma.homepageSlot.deleteMany();
  await prisma.articleTopic.deleteMany();
  await prisma.articleCountry.deleteMany();
  await prisma.article.deleteMany();
  await prisma.video.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.region.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();
  await prisma.author.deleteMany();
  await prisma.newsletterSub.deleteMany();
  await prisma.adSlot.deleteMany();
  await prisma.siteSetting.deleteMany();

  console.log("Seeding countries and regions…");
  const countryBySlug: Record<string, string> = {};
  const regionByKey: Record<string, string> = {};
  for (const c of COUNTRIES) {
    const country = await prisma.country.create({
      data: {
        slug: c.slug,
        name: c.name,
        nativeName: c.nativeName,
        flag: c.flag,
        blurb: c.blurb,
        capital: c.capital,
        accent: c.accent,
        order: c.order,
      },
    });
    countryBySlug[c.slug] = country.id;
    for (const [i, r] of c.regions.entries()) {
      const region = await prisma.region.create({
        data: {
          slug: r.slug,
          name: r.name,
          blurb: r.blurb,
          countryId: country.id,
          order: i,
        },
      });
      regionByKey[`${c.slug}/${r.slug}`] = region.id;
    }
  }

  console.log("Seeding categories…");
  const categoryBySlug: Record<string, string> = {};
  const subcatByKey: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: {
        slug: c.slug,
        name: c.name,
        kind: c.kind as Prisma.CategoryCreateInput["kind"],
        color: c.color,
        blurb: c.blurb,
        inNav: c.inNav,
        order: c.order,
      },
    });
    categoryBySlug[c.slug] = cat.id;
    for (const [i, s] of c.subs.entries()) {
      const sub = await prisma.subcategory.create({
        data: { slug: slugify(s), name: s, categoryId: cat.id, order: i },
      });
      subcatByKey[`${c.slug}/${slugify(s)}`] = sub.id;
    }
  }

  console.log("Seeding topics…");
  const topicBySlug: Record<string, string> = {};
  for (const t of TOPICS) {
    const topic = await prisma.topic.create({
      data: {
        slug: t,
        name: t
          .split("-")
          .map((w) => (w === "gerd" || w === "igad" ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
          .join(" "),
      },
    });
    topicBySlug[t] = topic.id;
  }

  console.log("Seeding authors and users…");
  const authorBySlug: Record<string, string> = {};

  // The desk is the only byline that ships. Scaffolding is attributed to it
  // rather than to invented reporters; real journalists are added through the
  // CMS when they exist.
  const desk = await prisma.author.create({ data: DESK_AUTHOR });
  authorBySlug[DESK_AUTHOR.slug] = desk.id;

  if (!IS_PRODUCTION) {
    for (const a of DEV_AUTHORS) {
      const author = await prisma.author.create({ data: a });
      authorBySlug[a.slug] = author.id;
    }
    console.log(`  development: + ${DEV_AUTHORS.length} test-fixture authors`);
  }
  // The five demo accounts share a password that is printed in the README and
  // in this repository. Creating them on a public deployment would hand the
  // CMS to anyone who read either. In production we create exactly one Super
  // Admin, from environment variables, and nothing else.
  if (IS_PRODUCTION) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Refusing to seed production without ADMIN_EMAIL and ADMIN_PASSWORD. " +
          "The demo accounts are never created outside development.",
      );
    }
    if (password.length < 12) {
      throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
    }

    await prisma.user.create({
      data: {
        email,
        name: process.env.ADMIN_NAME?.trim() || "Administrator",
        role: "SUPER_ADMIN",
        passwordHash: bcrypt.hashSync(password, 12),
      },
    });
    console.log(`  production: created one Super Admin (${email})`);
  } else {
    for (const u of USERS) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role as Prisma.UserCreateInput["role"],
          passwordHash: bcrypt.hashSync(u.password, 10),
          authorId: u.author ? authorBySlug[u.author] : null,
        },
      });
    }
    console.log(`  development: created ${USERS.length} demo accounts`);
  }

  console.log(`Seeding ${ARTICLES.length} articles…`);
  const idBySlug: Record<string, string> = {};
  for (const a of ARTICLES) {
    const publishedAt = ago(a.daysAgo, a.hoursAgo ?? 0);
    const article = await prisma.article.create({
      data: {
        slug: a.slug,
        headline: a.headline,
        deck: a.deck,
        body: a.body,
        countryId: a.country ? countryBySlug[a.country] : null,
        regionId: a.region && a.country ? regionByKey[`${a.country}/${a.region}`] ?? null : null,
        categoryId: categoryBySlug[a.category],
        subcategoryId: a.subcategory
          ? subcatByKey[`${a.category}/${a.subcategory}`] ?? null
          : null,
        authorId: authorBySlug[a.author],
        status: "PUBLISHED",
        placement: (a.placement ?? "NONE") as Prisma.ArticleCreateInput["placement"],
        isBreaking: a.isBreaking ?? false,
        isDeveloping: a.isDeveloping ?? false,
        isSeed: true,
        imageSeed: a.slug,
        imageCaption: a.imageCaption,
        sourceNote: a.sourceNote ?? null,
        // No brand suffix here — the Next metadata template appends it.
        seoTitle: a.headline,
        seoDescription: a.deck.slice(0, 300),
        readMinutes: a.readMinutes,
        publishedAt,
      },
    });
    idBySlug[a.slug] = article.id;

    // Country associations. The primary country is always included; a story
    // listing several countries becomes a Horn regional story.
    const countrySlugs = new Set<string>(a.countries ?? []);
    if (a.country) countrySlugs.add(a.country);
    for (const cs of countrySlugs) {
      if (!countryBySlug[cs]) continue;
      await prisma.articleCountry.create({
        data: { articleId: article.id, countryId: countryBySlug[cs] },
      });
    }

    for (const t of a.topics) {
      if (!topicBySlug[t]) continue;
      await prisma.articleTopic.create({
        data: { articleId: article.id, topicId: topicBySlug[t] },
      });
    }

    await prisma.editorialLog.create({
      data: {
        articleId: article.id,
        toStatus: "PUBLISHED",
        note: "Seeded as published scaffolding content.",
      },
    });

    // Synthesise readership so trending has something real to rank, as one
    // row per day rather than one per view. Readership is weighted toward the
    // days just after publication, which is how it actually behaves.
    const span = Math.max(1, a.daysAgo + 1);
    const perDay = new Map<number, number>();
    for (let i = 0; i < a.views; i++) {
      const bias = Math.pow(Math.random(), 2); // clusters near publication
      const viewedAt = new Date(publishedAt.getTime() + bias * span * 86400000);
      if (viewedAt > new Date()) continue;
      const day = Date.UTC(
        viewedAt.getUTCFullYear(),
        viewedAt.getUTCMonth(),
        viewedAt.getUTCDate(),
      );
      perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }
    if (perDay.size > 0) {
      await prisma.articleViewDaily.createMany({
        data: [...perDay].map(([day, count]) => ({
          articleId: article.id,
          day: new Date(day),
          count,
        })),
      });
    }
  }

  console.log("Seeding videos…");
  for (const v of VIDEOS) {
    await prisma.video.create({
      data: {
        slug: v.slug,
        title: v.title,
        description: v.description,
        countryId: v.country ? countryBySlug[v.country] : null,
        kind: v.kind as Prisma.VideoCreateInput["kind"],
        durationSec: v.durationSec,
        imageSeed: v.slug,
        published: true,
        publishedAt: ago(v.daysAgo),
      },
    });
  }

  console.log("Setting editor-controlled homepage slots…");
  const slots: Array<[string, string | null]> = [
    ["lead", "ethiopia-somalia-framework-for-cooperation"],
    ["secondary-1", "djibouti-port-expansion-plan"],
    ["secondary-2", "somalia-border-security-operations-galmudug"],
    ["secondary-3", "eritrean-music-global-stage"],
    ["somalia-lead", "president-meets-regional-leaders-ankara"],
    ["ethiopia-lead", "parliament-passes-new-investment-law"],
    ["djibouti-lead", "new-port-expansion-boost-trade"],
    ["eritrea-lead", "independence-day-celebrated-nationwide"],
    ["horn-feature", "why-the-red-sea-is-vital-to-the-horn-of-africa"],
    ["explained-feature", "horn-of-africa-strategic-importance"],
    ["people-feature", "profile-horn-diaspora-engineers"],
  ];
  for (const [slot, slug] of slots) {
    await prisma.homepageSlot.create({
      data: { slot, articleId: slug ? idBySlug[slug] ?? null : null },
    });
  }

  console.log("Seeding ad slots (all inactive — editorial first)…");
  for (const [position, label] of [
    ["header", "Header leaderboard"],
    ["homepage-mid", "Homepage mid-page"],
    ["sidebar", "Sidebar rectangle"],
    ["in-article", "In-article unit"],
    ["footer", "Footer leaderboard"],
  ] as const) {
    await prisma.adSlot.create({ data: { position, label, active: false } });
  }

  console.log(`Seeding ${SOURCES.length} wire sources…`);
  for (const [i, s] of SOURCES.entries()) {
    await prisma.source.create({
      data: {
        slug: s.slug,
        name: s.name,
        homepageUrl: s.homepageUrl,
        feedUrl: s.feedUrl,
        kind: s.kind as Prisma.SourceCreateInput["kind"],
        language: s.language ?? "en",
        countryId: s.country ? countryBySlug[s.country] : null,
        active: s.active,
        stateAffiliated: s.stateAffiliated ?? false,
        note: s.note ?? null,
        order: i,
      },
    });
  }

  await prisma.siteSetting.createMany({
    data: [
      { key: "site.tagline", value: "The Horn of Africa, Connected." },
      { key: "newsletter.name", value: "The Horn Daily" },
    ],
  });

  const counts = {
    countries: await prisma.country.count(),
    regions: await prisma.region.count(),
    categories: await prisma.category.count(),
    articles: await prisma.article.count(),
    viewDayRows: await prisma.articleViewDaily.count(),
    videos: await prisma.video.count(),
    users: await prisma.user.count(),
    sources: await prisma.source.count(),
    activeSources: await prisma.source.count({ where: { active: true } }),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
