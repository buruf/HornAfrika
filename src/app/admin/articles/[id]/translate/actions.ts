"use server";

import { revalidatePath } from "next/cache";
import { articleChanged } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import type { Locale, TranslationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { can, getSession } from "@/lib/auth";
import { ALL_LOCALES } from "@/lib/locales";

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};

export async function saveTranslation(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  // Translating is editorial work on a published piece, so it sits with the
  // same people who can edit any article.
  if (!can(session.role, "article.editAny")) redirect("/admin");

  const articleId = str(formData, "articleId");
  const locale = str(formData, "locale") as Locale;
  if (!ALL_LOCALES.includes(locale) || locale === "EN") {
    redirect(`/admin/articles/${articleId}/translate?error=locale`);
  }

  const headline = str(formData, "headline");
  const body = str(formData, "body");
  if (!headline || !body) {
    redirect(`/admin/articles/${articleId}/translate?locale=${locale}&error=required`);
  }

  const data = {
    headline,
    deck: str(formData, "deck"),
    body,
    translatedBy: str(formData, "translatedBy") || null,
    reviewedBy: str(formData, "reviewedBy") || null,
    machineAssisted: formData.get("machineAssisted") === "on",
  };

  await db.articleTranslation.upsert({
    where: { articleId_locale: { articleId, locale } },
    update: data,
    create: { articleId, locale, ...data },
  });

  revalidatePath("/", "layout");
  articleChanged();
  redirect(`/admin/articles/${articleId}/translate?locale=${locale}&saved=1`);
}

export async function setTranslationStatus(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "article.publish")) redirect("/admin");

  const articleId = str(formData, "articleId");
  const locale = str(formData, "locale") as Locale;
  const status = str(formData, "status") as TranslationStatus;

  if (!["DRAFT", "REVIEW", "PUBLISHED"].includes(status)) {
    redirect(`/admin/articles/${articleId}/translate?locale=${locale}`);
  }

  const existing = await db.articleTranslation.findUnique({
    where: { articleId_locale: { articleId, locale } },
  });
  if (!existing) redirect(`/admin/articles/${articleId}/translate?locale=${locale}`);

  // Publishing a translation that nobody has checked is the exact failure the
  // editorial policy rules out, so the reviewer field is required to go live.
  if (status === "PUBLISHED" && !existing.reviewedBy) {
    redirect(
      `/admin/articles/${articleId}/translate?locale=${locale}&error=unreviewed`,
    );
  }

  await db.articleTranslation.update({
    where: { articleId_locale: { articleId, locale } },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
    },
  });

  revalidatePath("/", "layout");
  articleChanged();
  redirect(`/admin/articles/${articleId}/translate?locale=${locale}&moved=1`);
}
