import { HORN_SILHOUETTE, HORN_SILHOUETTE_SMALL } from "@/lib/horn-geo";

/**
 * Candidate brand marks for HORNAFRIKA.
 *
 * The wordmark is rendered as HTML text rather than outlines, because the site
 * ships a system font stack — so what you see here is exactly what a browser
 * will draw, not an approximation. The icons are SVG so they stay sharp at
 * favicon size.
 *
 * Palette is the one already in the design system: ink #0B1F33, brand red
 * #C9182B. Spec §27 asks for one strong colour, so no option introduces a
 * second hue.
 */

export type Tone = "light" | "dark" | "mono";

const INK = "#0b1f33";
const RED = "#c9182b";

// ---------------------------------------------------------------- wordmark

export function Wordmark({
  tone = "light",
  size = 34,
  tagline = false,
  rule = false,
}: {
  tone?: Tone;
  size?: number;
  tagline?: boolean;
  rule?: boolean;
}) {
  // In mono the two halves must still separate, so AFRIKA drops to a lighter
  // weight instead of relying on colour.
  const ink = tone === "dark" ? "#ffffff" : INK;
  const red = tone === "mono" ? ink : RED;

  return (
    <span className="inline-block leading-none">
      <span
        className="block font-extrabold tracking-[-0.035em]"
        style={{ fontSize: size, lineHeight: 1 }}
      >
        <span style={{ color: ink }}>HORN</span>
        <span style={{ color: red, fontWeight: tone === "mono" ? 500 : 800 }}>
          AFRIKA
        </span>
      </span>
      {rule && (
        <span
          className="mt-[0.18em] block"
          style={{ height: Math.max(2, size * 0.075), background: red }}
        />
      )}
      {tagline && (
        <span
          className="mt-[0.3em] block font-semibold uppercase"
          style={{
            fontSize: size * 0.185,
            letterSpacing: "0.14em",
            color: tone === "dark" ? "rgba(255,255,255,0.65)" : "#6b7c8c",
          }}
        >
          The Horn of Africa, Connected.
        </span>
      )}
    </span>
  );
}

// -------------------------------------------------------------------- marks

/**
 * THE HORNAFRIKA MARK — the region's real outline, from the same Natural Earth
 * data as the site map.
 *
 * Two cuts of the same shape. Below ~28px the full coastline collapses into a
 * smudge, so the mark switches to a blunter silhouette and opens up the
 * padding. This is the standard responsive-logo trick and it is the only
 * reason this mark survives a browser tab.
 *
 * Note on borders: the silhouette merges Somaliland into Somalia, matching the
 * position already stated in the editorial policy — the mark and the newsroom
 * say the same thing.
 */
export function MarkCape({
  tone = "light",
  size = 44,
  /** Force a cut instead of choosing by size. */
  detail,
  /** Draw the containing square. Off gives a bare silhouette for dark panels. */
  plate = true,
}: {
  tone?: Tone;
  size?: number;
  detail?: "full" | "small";
  plate?: boolean;
}) {
  const bg = tone === "dark" ? "#ffffff" : INK;
  const plated = tone === "dark" ? INK : tone === "mono" ? "#ffffff" : RED;
  // Without the plate the silhouette carries the colour itself.
  const bare = tone === "dark" ? RED : tone === "mono" ? INK : RED;
  const fg = plate ? plated : bare;
  const small = detail ? detail === "small" : size < 28;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Hornafrika"
    >
      {plate && <rect width="100" height="100" fill={bg} />}
      <g
        transform={
          small
            ? "translate(50 50) scale(0.9) translate(-50 -50)"
            : "translate(50 50) scale(0.74) translate(-50 -50)"
        }
      >
        <path d={small ? HORN_SILHOUETTE_SMALL : HORN_SILHOUETTE} fill={fg} />
      </g>
    </svg>
  );
}

/** C — two landmasses joined by a strait. Reads as an H. */
export function MarkStrait({ tone = "light", size = 44 }: { tone?: Tone; size?: number }) {
  const ink = tone === "dark" ? "#ffffff" : INK;
  const red = tone === "mono" ? ink : RED;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <rect x="12" y="10" width="24" height="80" fill={ink} />
      <rect x="64" y="10" width="24" height="80" fill={ink} />
      <rect x="36" y="40" width="28" height="20" fill={red} />
    </svg>
  );
}

/** D — four countries, one platform. */
export function MarkQuarters({ tone = "light", size = 44 }: { tone?: Tone; size?: number }) {
  const ink = tone === "dark" ? "#ffffff" : INK;
  const red = tone === "mono" ? ink : RED;
  const g = 6;
  const s = (100 - g * 3) / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <rect x={g} y={g} width={s} height={s} fill={ink} />
      <rect x={g * 2 + s} y={g} width={s} height={s} fill={red} />
      <rect x={g} y={g * 2 + s} width={s} height={s} fill={ink} />
      <rect x={g * 2 + s} y={g * 2 + s} width={s} height={s} fill={ink} />
    </svg>
  );
}

/** A — the masthead option's icon: initial plus the rule. */
export function MarkMasthead({ tone = "light", size = 44 }: { tone?: Tone; size?: number }) {
  const bg = tone === "dark" ? "#ffffff" : INK;
  const fg = tone === "dark" ? INK : "#ffffff";
  const red = tone === "mono" ? fg : RED;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <rect width="100" height="100" fill={bg} />
      <path d="M22 22h13v20h30V22h13v46H65V54H35v14H22V22Z" fill={fg} />
      <rect x="22" y="76" width="56" height="8" fill={red} />
    </svg>
  );
}
