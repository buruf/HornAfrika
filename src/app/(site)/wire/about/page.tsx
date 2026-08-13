import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How the Wire Works",
  description:
    "How Hornafrika aggregates headlines from other newsrooms: what we take, what we never take, how sources are chosen, and how publishers can opt out.",
  alternates: { canonical: `${SITE.url}/wire/about` },
};

export default async function WireAboutPage() {
  const [active, inactive] = await Promise.all([
    db.source.count({ where: { active: true } }),
    db.source.findMany({
      where: { active: false },
      orderBy: { name: "asc" },
      select: { name: true, homepageUrl: true, note: true },
    }),
  ]);

  return (
    <StaticPage
      eyebrow="The Wire"
      title="How the Wire Works"
      blurb="Hornafrika aggregates headlines from other newsrooms so that one page shows what the whole region — and the world — is publishing about the Horn of Africa."
    >
      <H2>What we take</H2>
      <p>
        For each story we store the headline as the publisher wrote it, a short
        extract of roughly 240 characters, the publication time, the author where the
        feed provides one, and the link.
      </p>

      <H2>What we never take</H2>
      <p>
        We do not copy full articles. We do not rewrite other newsrooms&rsquo; headlines
        into our own voice. We do not strip bylines, and we do not present anyone
        else&rsquo;s reporting as ours. The full article stays on the publisher&rsquo;s
        own site, where their advertising and their byline are.
      </p>

      <H2>Copyright</H2>
      <p>
        <strong>
          Copyright in every aggregated headline, extract and photograph remains
          with the newsroom that published it.
        </strong>{" "}
        Hornafrika claims no ownership of any of it. Each item names its
        publisher, carries a copyright line, and links to the original.
      </p>
      <p>
        We take only what is needed to tell a reader that a story exists and
        send them to it — a headline, a short extract, a link. We do not
        reproduce publishers&rsquo; photographs at all: an image is their
        property and their bandwidth, so the wire carries text only and the
        picture stays where the article is.
      </p>
      <p>
        If you publish in the Horn and want your work removed from the wire,
        write to{" "}
        <a
          href="mailto:newsroom@hornafrika.com"
          className="font-semibold text-brand underline"
        >
          newsroom@hornafrika.com
        </a>{" "}
        and we will remove it. We will not ask you to justify the request.
      </p>

      <H2>Photography on our own articles</H2>
      <p>
        Articles written by the Hornafrika desk carry photographs from Wikimedia
        Commons published under free licences — Creative Commons, or public
        domain. Every one names the photographer, states the licence, and links
        to the original file so the terms can be checked. Where a photograph
        illustrates a place rather than documenting the specific event reported,
        the caption says so.
      </p>

      <H2>How it is kept separate</H2>
      <p>
        Aggregated headlines live in their own section and their own visual style, and
        are always labelled with the outlet that published them. They never appear in
        our Trending list, never occupy a homepage lead slot, and are never mixed into
        our own article feeds. If it is on the wire, we did not report it.
      </p>

      <H2>How we fetch</H2>
      <p>
        We read publicly published RSS and Atom feeds, at most every twenty minutes per
        source. Our crawler identifies itself honestly as{" "}
        <code className="text-[0.9em]">HornafrikaBot</code> with a contact address. We
        do not disguise it as a browser to get around a publisher that has chosen to
        block automated requests — where a publisher blocks us, we record that and
        leave the source switched off.
      </p>

      <H2>How stories reach a country page</H2>
      <p>
        A wire item is tagged to a country by what it says, not by who published
        it. We match country names, capitals, demonyms, major regions and
        well-known institutions across English, Somali, Amharic, Tigrinya and
        French. A BBC report about Ethiopia therefore reaches the Ethiopia page,
        and a Somali newspaper&rsquo;s report on Colombia does not reach the
        Somalia page.
      </p>
      <p>
        The trade-off is that a local story which never names its own country
        stays on the main wire rather than a country page. We prefer that to the
        alternative, which put foreign news under the wrong flag.
      </p>

      <H2>Which sources</H2>
      <p>
        {active} feeds are active: newsrooms in Somalia, Ethiopia and Djibouti,
        Horn-wide and pan-African outlets, and international broadcasters and wires.
        Sources are chosen for regional relevance, not for whether they agree with us —
        the wire deliberately includes outlets whose editorial positions differ sharply
        from one another.
      </p>
      <p>
        Outlets that are state-owned or state-funded carry a{" "}
        <span className="border border-[#a8730f] px-1 py-px text-[0.6rem] font-extrabold uppercase tracking-[0.06em] text-[#8a5a00]">
          State-affiliated
        </span>{" "}
        badge on every headline. We badge rather than exclude: state media is often the
        only source reporting a given event in this region, and a reader is entitled to
        know who owns the newsroom before deciding what to make of it.
      </p>
      <p>
        No Eritrean outlet currently publishes a feed we can reach, so coverage of
        Eritrea on the wire comes through the international and pan-African sources,
        matched by subject. We would rather say that plainly than leave the gap
        unexplained.
      </p>

      {inactive.length > 0 && (
        <>
          <H2>Sources currently switched off</H2>
          <p>
            These outlets are listed but not being fetched. In most cases their servers
            refuse automated requests; we leave them off rather than work around it.
          </p>
          <ul className="not-prose space-y-2">
            {inactive.map((s) => (
              <li key={s.name} className="border-l-2 border-rule-strong pl-3">
                <a
                  href={s.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.92rem] font-bold hover:text-brand"
                >
                  {s.name} ↗
                </a>
                {s.note && (
                  <p className="text-[0.83rem] text-ink-mute">{s.note}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <H2>Publishers</H2>
      <p>
        If you publish one of these outlets and would prefer not to appear on the wire,
        or would like a different feed used, or want your outlet added, write to{" "}
        <a
          href="mailto:newsroom@hornafrika.com"
          className="font-semibold text-brand underline"
        >
          newsroom@hornafrika.com
        </a>
        . Removal requests are acted on without argument.
      </p>

      <H2>Corrections</H2>
      <p>
        We cannot correct another newsroom&rsquo;s article. If a wire headline is wrong,
        take it up with the publisher — the link goes straight to them. If we have
        mis-attributed something, or tagged a story to the wrong country, that is ours
        to fix and you can{" "}
        <Link href="/corrections" className="font-semibold text-brand underline">
          tell us here
        </Link>
        .
      </p>
    </StaticPage>
  );
}
