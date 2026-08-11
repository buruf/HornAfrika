import { db } from "@/lib/db";
import { editorialImageMarkup } from "@/lib/editorial-image";
import { HORN_SILHOUETTE } from "@/lib/horn-geo";

/**
 * Open Graph image for an article.
 *
 * Returns SVG rather than a rasterised image: it is generated in under a
 * millisecond, needs no font loading and no satori/resvg dependency, and every
 * major social platform renders SVG OG images. If a platform is found that does
 * not, this route is the single place to swap in an ImageResponse.
 */

const CHARS_PER_LINE = 30;

function wrap(text: string, max = CHARS_PER_LINE, maxLines = 4): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > max) {
      if (current) lines.push(current.trim());
      current = w;
      if (lines.length === maxLines - 1 && words.indexOf(w) < words.length - 1) {
        // Last available line: take what fits and ellipsise.
        const rest = words.slice(words.indexOf(w)).join(" ");
        lines.push(rest.length > max ? rest.slice(0, max - 1).trimEnd() + "…" : rest);
        return lines;
      }
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, maxLines);
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const article = await db.article.findUnique({
    where: { slug },
    select: {
      headline: true,
      imageSeed: true,
      category: { select: { slug: true, name: true } },
      country: { select: { name: true } },
    },
  });

  const headline = article?.headline ?? "HORNAFRIKA — The Horn of Africa, Connected.";
  const categorySlug = article?.category.slug ?? "regional";
  const kicker = [article?.country?.name, article?.category.name]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();

  const lines = wrap(headline);
  const startY = 470 - (lines.length - 1) * 52;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">` +
    editorialImageMarkup(article?.imageSeed ?? slug, categorySlug) +
    `<rect width="1200" height="675" fill="#000" opacity="0.36"/>` +
    `<rect x="0" y="380" width="1200" height="295" fill="#0a1c2e" opacity="0.72"/>` +
    (kicker
      ? `<text x="64" y="${startY - 62}" fill="#ff5a68" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="24" font-weight="800" letter-spacing="3.4">${escape(kicker)}</text>`
      : "") +
    lines
      .map(
        (line, i) =>
          `<text x="64" y="${startY + i * 60}" fill="#ffffff" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="52" font-weight="800" letter-spacing="-1.2">${escape(line)}</text>`,
      )
      .join("") +
    // The Cape mark, bare rather than plated so it does not read as a grey
    // box, and sized to sit on the wordmark's cap height.
    `<g transform="translate(64 596) scale(0.46)">` +
    `<path d="${HORN_SILHOUETTE}" fill="#ff5a68"/></g>` +
    `<text x="124" y="632" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="30" font-weight="800" letter-spacing="-0.8">` +
    `<tspan fill="#ffffff">HORN</tspan><tspan fill="#ff5a68">AFRIKA</tspan></text>` +
    `<text x="1136" y="632" text-anchor="end" fill="#ffffff" opacity="0.6" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="20" font-weight="600">hornafrika.com</text>` +
    `</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
