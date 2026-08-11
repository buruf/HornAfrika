"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ArticleStatus, Placement } from "@prisma/client";
import { db } from "@/lib/db";
import { allowedTransitions, can, canEditArticle, getSession } from "@/lib/auth";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);

async function authorIdFor(userId: string) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { authorId: true } });
  return u?.authorId ?? null;
}

/** Roughly 200 words a minute, floored at one. */
function readMinutes(body: string) {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "untitled";
  let n = 1;
  while (true) {
    const existing = await db.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === ignoreId) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function saveArticle(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const id = str(formData, "id");
  const headline = str(formData, "headline");
  const body = str(formData, "body");

  if (!headline || !body) {
    redirect(id ? `/admin/articles/${id}?error=required` : "/admin/articles/new?error=required");
  }

  const myAuthorId = await authorIdFor(session.userId);

  // -------------------------------------------------------------- update
  if (id) {
    const existing = await db.article.findUnique({
      where: { id },
      select: { authorId: true, status: true, publishedAt: true },
    });
    if (!existing) redirect("/admin/articles?error=missing");
    if (!canEditArticle(session, existing, myAuthorId)) {
      redirect(`/admin/articles/${id}?error=forbidden`);
    }

    const slugInput = str(formData, "slug");
    const slug = await uniqueSlug(slugify(slugInput || headline), id);

    // Only an editor may reassign authorship or set homepage placement.
    const canEditAny = can(session.role, "article.editAny");
    const authorId = canEditAny ? str(formData, "authorId") || existing.authorId : existing.authorId;
    const placement = can(session.role, "homepage.manage")
      ? ((str(formData, "placement") || "NONE") as Placement)
      : undefined;

    await db.article.update({
      where: { id },
      data: {
        headline,
        slug,
        deck: str(formData, "deck"),
        body,
        countryId: str(formData, "countryId") || null,
        regionId: str(formData, "regionId") || null,
        categoryId: str(formData, "categoryId"),
        subcategoryId: str(formData, "subcategoryId") || null,
        authorId,
        ...(placement ? { placement } : {}),
        isBreaking: canEditAny ? formData.get("isBreaking") === "on" : undefined,
        isDeveloping: formData.get("isDeveloping") === "on",
        imageSeed: str(formData, "imageSeed") || slug,
        imageUrl: str(formData, "imageUrl") || null,
        imageCaption: str(formData, "imageCaption"),
        imageCredit: str(formData, "imageCredit") || null,
        sourceNote: str(formData, "sourceNote") || null,
        seoTitle: str(formData, "seoTitle") || null,
        seoDescription: str(formData, "seoDescription") || null,
        canonicalUrl: str(formData, "canonicalUrl") || null,
        readMinutes: readMinutes(body),
        // A live article that is edited records a revision time, which is what
        // the reader-facing "Updated" line and the sitemap both read.
        ...(existing.status === "PUBLISHED" || existing.status === "UPDATED"
          ? { revisedAt: new Date() }
          : {}),
      },
    });

    await syncRelations(id, formData);
    revalidatePath("/", "layout");
    redirect(`/admin/articles/${id}?saved=1`);
  }

  // -------------------------------------------------------------- create
  if (!can(session.role, "article.create")) redirect("/admin?error=forbidden");

  const authorId = can(session.role, "article.editAny")
    ? str(formData, "authorId") || myAuthorId
    : myAuthorId;

  if (!authorId) {
    // Journalists and contributors must be linked to an author profile,
    // because every article has to carry a byline (spec §17).
    redirect("/admin/articles/new?error=noauthor");
  }

  const slug = await uniqueSlug(slugify(str(formData, "slug") || headline));

  const created = await db.article.create({
    data: {
      headline,
      slug,
      deck: str(formData, "deck"),
      body,
      countryId: str(formData, "countryId") || null,
      regionId: str(formData, "regionId") || null,
      categoryId: str(formData, "categoryId"),
      subcategoryId: str(formData, "subcategoryId") || null,
      authorId,
      status: "DRAFT",
      isDeveloping: formData.get("isDeveloping") === "on",
      imageSeed: str(formData, "imageSeed") || slug,
      imageUrl: str(formData, "imageUrl") || null,
      imageCaption: str(formData, "imageCaption"),
      imageCredit: str(formData, "imageCredit") || null,
      sourceNote: str(formData, "sourceNote") || null,
      seoTitle: str(formData, "seoTitle") || null,
      seoDescription: str(formData, "seoDescription") || null,
      readMinutes: readMinutes(body),
    },
  });

  await syncRelations(created.id, formData);
  await db.editorialLog.create({
    data: { articleId: created.id, userId: session.userId, toStatus: "DRAFT", note: "Created." },
  });

  redirect(`/admin/articles/${created.id}?saved=1`);
}

/** Country tags and topics, replaced wholesale on each save. */
async function syncRelations(articleId: string, formData: FormData) {
  const countryIds = formData.getAll("countries").map(String).filter(Boolean);
  const topicIds = formData.getAll("topics").map(String).filter(Boolean);

  const primary = String(formData.get("countryId") ?? "");
  const all = new Set(countryIds);
  if (primary) all.add(primary);

  await db.articleCountry.deleteMany({ where: { articleId } });
  if (all.size) {
    await db.articleCountry.createMany({
      data: [...all].map((countryId) => ({ articleId, countryId })),
    });
  }

  await db.articleTopic.deleteMany({ where: { articleId } });
  if (topicIds.length) {
    await db.articleTopic.createMany({
      data: topicIds.map((topicId) => ({ articleId, topicId })),
    });
  }
}

export async function transitionArticle(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "") as ArticleStatus;
  const note = String(formData.get("note") ?? "").trim() || null;

  const article = await db.article.findUnique({
    where: { id },
    select: { status: true, authorId: true, publishedAt: true },
  });
  if (!article) redirect("/admin/articles?error=missing");

  // The graph is authoritative: an invalid or unpermitted move is rejected
  // here, not merely hidden in the UI.
  if (!allowedTransitions(session.role, article.status).includes(to)) {
    redirect(`/admin/articles/${id}?error=transition`);
  }

  const goingLive = (to === "PUBLISHED" || to === "UPDATED") && !article.publishedAt;

  await db.$transaction([
    db.article.update({
      where: { id },
      data: {
        status: to,
        ...(goingLive ? { publishedAt: new Date() } : {}),
        ...(to === "UPDATED" ? { revisedAt: new Date() } : {}),
      },
    }),
    db.editorialLog.create({
      data: {
        articleId: id,
        userId: session.userId,
        fromStatus: article.status,
        toStatus: to,
        note,
      },
    }),
  ]);

  revalidatePath("/", "layout");
  redirect(`/admin/articles/${id}?moved=1`);
}

export async function deleteArticle(formData: FormData) {
  const session = await getSession();
  if (!session || !can(session.role, "article.delete")) redirect("/admin?error=forbidden");

  const id = String(formData.get("id") ?? "");
  await db.article.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/articles?deleted=1");
}
