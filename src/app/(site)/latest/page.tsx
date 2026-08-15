import type { Metadata } from "next";
import { countWire, getWire } from "@/lib/wire";
import { WireListPage } from "@/components/WireListPage";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

export const metadata: Metadata = {
  title: "Latest",
  description:
    "Everything on the Hornafrika wire, newest first — headlines about Somalia, Ethiopia, Djibouti and Eritrea from the newsrooms covering them.",
  alternates: { canonical: `${SITE.url}/latest` },
};

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [items, total] = await Promise.all([
    getWire({ take: PER_PAGE, skip }),
    countWire(),
  ]);

  return (
    <WireListPage
      eyebrow="Newest first"
      title="Latest"
      blurb="Every Horn headline we hold, in the order it was published. This is the same material as The Wire, without the country and desk grouping."
      meta={<span className="text-[0.8rem] text-ink-mute">{total} headlines</span>}
      items={items}
      total={total}
      page={page}
      perPage={PER_PAGE}
      basePath="/latest"
    />
  );
}
