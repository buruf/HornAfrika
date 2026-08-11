"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, getSession } from "@/lib/auth";
import { runAggregation, pruneWire } from "@/lib/aggregator";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

async function guard() {
  const session = await getSession();
  if (!session || !can(session.role, "taxonomy.manage")) redirect("/admin");
  return session;
}

export async function addSource(formData: FormData) {
  await guard();

  const name = String(formData.get("name") ?? "").trim();
  const feedUrl = String(formData.get("feedUrl") ?? "").trim();
  const homepageUrl = String(formData.get("homepageUrl") ?? "").trim();

  if (!name || !feedUrl || !/^https?:\/\//i.test(feedUrl)) {
    redirect("/admin/sources?error=invalid");
  }
  if (await db.source.findUnique({ where: { feedUrl } })) {
    redirect("/admin/sources?error=duplicate");
  }

  let slug = slugify(name);
  if (await db.source.findUnique({ where: { slug } })) slug = `${slug}-2`;

  const count = await db.source.count();
  await db.source.create({
    data: {
      slug,
      name,
      feedUrl,
      homepageUrl: homepageUrl || new URL(feedUrl).origin,
      kind: (String(formData.get("kind") ?? "REGIONAL") as never),
      language: String(formData.get("language") ?? "en").trim() || "en",
      countryId: String(formData.get("countryId") ?? "") || null,
      active: formData.get("active") === "on",
      note: String(formData.get("note") ?? "").trim() || null,
      order: count,
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/sources?saved=added");
}

export async function updateSource(formData: FormData) {
  await guard();

  const id = String(formData.get("id") ?? "");
  const source = await db.source.findUnique({ where: { id }, select: { id: true } });
  if (!source) redirect("/admin/sources");

  await db.source.update({
    where: { id },
    data: {
      active: formData.get("active") === "on",
      kind: (String(formData.get("kind") ?? "REGIONAL") as never),
      countryId: String(formData.get("countryId") ?? "") || null,
      stateAffiliated: formData.get("stateAffiliated") === "on",
      note: String(formData.get("note") ?? "").trim() || null,
      // Re-enabling a source clears the failure streak so health reads true.
      ...(formData.get("active") === "on" ? { failureCount: 0 } : {}),
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/sources?saved=updated");
}

export async function deleteSource(formData: FormData) {
  const session = await guard();
  if (session.role !== "SUPER_ADMIN") redirect("/admin/sources?error=forbidden");

  await db.source.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/", "layout");
  redirect("/admin/sources?saved=deleted");
}

/** Fetch everything now, ignoring the twenty-minute politeness window. */
export async function fetchNow(formData: FormData) {
  await guard();

  const only = String(formData.get("only") ?? "") || undefined;
  const { added } = await runAggregation({ force: true, only });
  await pruneWire();

  revalidatePath("/", "layout");
  redirect(`/admin/sources?fetched=${added}`);
}

export async function toggleHidden(formData: FormData) {
  const session = await getSession();
  if (!session || !can(session.role, "moderation")) redirect("/admin");

  const id = String(formData.get("id") ?? "");
  const item = await db.wireItem.findUnique({ where: { id }, select: { hidden: true } });
  if (!item) redirect("/admin/sources");

  await db.wireItem.update({ where: { id }, data: { hidden: !item.hidden } });
  revalidatePath("/", "layout");
  redirect("/admin/sources?saved=moderated");
}
