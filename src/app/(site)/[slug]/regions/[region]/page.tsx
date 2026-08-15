import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Region pages listed our own articles by region. Wire items carry a country
 * but not a region: an RSS item does not say which state it is about, and
 * inferring one from a place name in the headline would be guesswork dressed
 * as structure — the same mistake as inheriting a country from the publisher.
 *
 * So regions stay as navigation and reference on the country page, and the
 * URLs redirect there rather than serving an empty list. If regional filtering
 * is wanted later, the honest route is to extend the gazetteer in
 * country-tagger.ts to record which place matched, not to fake it here.
 */
export default async function RegionPage({
  params,
}: {
  params: Promise<{ slug: string; region: string }>;
}) {
  const { slug } = await params;
  const country = await db.country.findUnique({ where: { slug } });
  if (!country) notFound();
  redirect(`/${slug}`);
}
