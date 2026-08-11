/**
 * Deterministic editorial graphics.
 *
 * No licensed photography is available, and generic AI-generated African
 * imagery is explicitly out of scope (spec §27). Every article therefore gets
 * an abstract, category-coded graphic derived from its slug — stable across
 * renders, honest about being a graphic, and free at runtime: no network, no
 * decode, no layout shift.
 *
 * When a real photograph arrives through the CMS `imageUrl` field it replaces
 * this entirely. Nothing else in the codebase has to change.
 */

const PALETTES: Record<string, [string, string, string]> = {
  politics: ["#7d1220", "#c9182b", "#f0a8a8"],
  business: ["#0f3a63", "#1b5fa8", "#8fc0e8"],
  security: ["#332a52", "#5b4b8a", "#b3a6d6"],
  economy: ["#0a4747", "#0f7b7b", "#8fd3d3"],
  society: ["#1c4a26", "#2f7a3f", "#9fd2ac"],
  culture: ["#66450a", "#a8730f", "#e8c98a"],
  sports: ["#0f4a32", "#1c7a52", "#93d6b8"],
  horn: ["#081826", "#0f2942", "#7d98b0"],
  explained: ["#232d63", "#3b4a9c", "#a8b2e0"],
  people: ["#611f36", "#a8365c", "#e2a3ba"],
  default: ["#0a1c2e", "#22475f", "#8fa8bb"],
};

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG so the same slug always yields the same picture. */
function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/**
 * Returns the inner markup of the SVG (no <svg> wrapper) on a 0 0 1200 675
 * viewBox, so the same generator can serve a React component and a raw
 * OG-image response.
 */
export function editorialImageMarkup(
  seed: string,
  category = "default",
  opts: { detail?: boolean } = {},
): string {
  const [dark, mid, light] = PALETTES[category] ?? PALETTES.default;
  const r = rng(seed);
  const id = hash(seed).toString(36);
  const detail = opts.detail !== false;

  const W = 1200;
  const H = 675;

  // Horizon sits in the lower third, the way a photographer would place it.
  const horizon = H * (0.58 + r() * 0.16);

  const parts: string[] = [];

  parts.push(
    `<defs>` +
      `<linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="${dark}"/>` +
      `<stop offset="100%" stop-color="${mid}"/>` +
      `</linearGradient>` +
      `<linearGradient id="ground-${id}" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0%" stop-color="${dark}"/>` +
      `<stop offset="100%" stop-color="#04101c"/>` +
      `</linearGradient>` +
      `<clipPath id="frame-${id}"><rect width="${W}" height="${H}"/></clipPath>` +
      `</defs>`,
  );

  parts.push(`<g clip-path="url(#frame-${id})">`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#sky-${id})"/>`);

  // A low sun/moon disc, placed off-centre.
  const cx = W * (0.16 + r() * 0.68);
  const cr = 52 + r() * 74;
  parts.push(
    `<circle cx="${cx.toFixed(0)}" cy="${(horizon - cr * 0.55).toFixed(0)}" r="${cr.toFixed(0)}" fill="${light}" opacity="0.20"/>`,
  );

  // Horizontal atmosphere bands above the horizon.
  const bands = 3 + Math.floor(r() * 3);
  for (let i = 0; i < bands; i++) {
    const y = horizon * (0.18 + (i / bands) * 0.74);
    const h = 5 + r() * 26;
    parts.push(
      `<rect x="0" y="${y.toFixed(0)}" width="${W}" height="${h.toFixed(0)}" fill="${light}" opacity="${(0.045 + r() * 0.07).toFixed(3)}"/>`,
    );
  }

  if (detail) {
    // A skyline of vertical masses — reads as port cranes, towers or ridgeline
    // depending on the palette, without asserting any specific place.
    const cols = 9 + Math.floor(r() * 9);
    const colW = W / cols;
    for (let i = 0; i < cols; i++) {
      if (r() < 0.24) continue;
      const h = 24 + r() * (horizon * 0.62);
      const w = colW * (0.32 + r() * 0.5);
      const x = i * colW + (colW - w) / 2;
      parts.push(
        `<rect x="${x.toFixed(0)}" y="${(horizon - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${dark}" opacity="${(0.42 + r() * 0.4).toFixed(3)}"/>`,
      );
    }
  }

  // Ground plane.
  parts.push(
    `<rect x="0" y="${horizon.toFixed(0)}" width="${W}" height="${(H - horizon).toFixed(0)}" fill="url(#ground-${id})"/>`,
  );

  // A single accent diagonal — the one graphic gesture per image.
  const dx = W * (0.1 + r() * 0.6);
  parts.push(
    `<path d="M${dx.toFixed(0)} ${H} L${(dx + W * 0.26).toFixed(0)} ${horizon.toFixed(0)} L${(dx + W * 0.33).toFixed(0)} ${horizon.toFixed(0)} L${(dx + W * 0.09).toFixed(0)} ${H} Z" fill="${light}" opacity="0.085"/>`,
  );

  // Reflection strokes below the horizon.
  const strokes = 4 + Math.floor(r() * 4);
  for (let i = 0; i < strokes; i++) {
    const y = horizon + (H - horizon) * ((i + 1) / (strokes + 1));
    const w = W * (0.12 + r() * 0.5);
    const x = r() * (W - w);
    parts.push(
      `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="2" fill="${light}" opacity="${(0.07 + r() * 0.13).toFixed(3)}"/>`,
    );
  }

  // Vignette keeps overlaid white type legible in the hero.
  parts.push(
    `<rect width="${W}" height="${H}" fill="#000" opacity="0.06"/>`,
    `</g>`,
  );

  return parts.join("");
}

export function editorialImageSvg(
  seed: string,
  category = "default",
  opts: { detail?: boolean } = {},
): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675" preserveAspectRatio="xMidYMid slice">` +
    editorialImageMarkup(seed, category, opts) +
    `</svg>`
  );
}
