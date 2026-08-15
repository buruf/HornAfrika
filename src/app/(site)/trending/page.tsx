import { redirect } from "next/navigation";

/**
 * Trending ranked our own articles by read count. With the articles retired
 * there is nothing honest to rank: we hold headlines and links, and we do not
 * measure what readers click on the way out.
 *
 * Rather than show a page of "most read" that is really just "most recent"
 * dressed up, this sends readers to the wire. Bringing it back means counting
 * outbound clicks — WireItem.clicks exists and nothing writes to it yet —
 * which is a deliberate decision about tracking, not an oversight to paper
 * over here.
 */
export default function TrendingPage() {
  redirect("/latest");
}
