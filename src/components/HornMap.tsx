import Link from "next/link";
import { HORN_CONTEXT, HORN_COUNTRIES, HORN_VIEWBOX } from "@/lib/horn-geo";

/**
 * Regional map (spec §15).
 *
 * Outlines come from Natural Earth 50m boundary data via
 * scripts/build-horn-map.mjs — the earlier hand-drawn polygons were not
 * accurate, which is indefensible for a publication about this region. The
 * data is generated at build time and committed, so nothing is fetched at
 * runtime.
 *
 * Neighbouring countries are drawn muted for context: without them the Horn
 * floats in a void and the Bab el-Mandeb — the strait that explains most of
 * the region's economics — is invisible.
 */

const FILL: Record<string, { base: string; hover: string }> = {
  SOM: { base: "#3d7fc4", hover: "#6aa6e2" },
  ETH: { base: "#2f9c52", hover: "#4fc078" },
  DJI: { base: "#8e6fc4", hover: "#ab90e2" },
  ERI: { base: "#c9384a", hover: "#e5606f" },
};

const META: Record<string, { slug: string; name: string }> = {
  SOM: { slug: "somalia", name: "Somalia" },
  ETH: { slug: "ethiopia", name: "Ethiopia" },
  DJI: { slug: "djibouti", name: "Djibouti" },
  ERI: { slug: "eritrea", name: "Eritrea" },
};

/**
 * Djibouti has room for a circle of only ~21 viewBox units, nowhere near
 * enough for its name, so it gets an external label on a leader line out over
 * the Gulf of Aden. Every other country carries its label on its own landmass
 * at the pole of inaccessibility computed by the generator.
 */
const LABEL_OVERRIDE: Record<
  string,
  { at: [number, number]; leaderFrom: [number, number]; anchor: "start" | "end" }
> = {
  DJI: { at: [666, 372], leaderFrom: [524, 379], anchor: "start" },
};

export function HornMap() {
  const { width, height } = HORN_VIEWBOX;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="group"
      aria-label="Map of the Horn of Africa. Select a country to see its news."
    >
      {/* Sea */}
      <rect width={width} height={height} fill="#0a1c2e" />

      {/* Neighbours — present but recessive. */}
      <g stroke="#0a1c2e" strokeWidth="1.5">
        {HORN_CONTEXT.map((s) => (
          <path key={s.code} d={s.d} fill="#16304a" />
        ))}
      </g>

      {/* The four countries. */}
      {HORN_COUNTRIES.map((shape) => {
        const meta = META[shape.code];
        const fill = FILL[shape.code];
        if (!meta || !fill) return null;

        const override = LABEL_OVERRIDE[shape.code];
        const [lx, ly] = override ? override.at : (shape.label ?? [0, 0]);

        return (
          <Link key={shape.code} href={`/${meta.slug}`} aria-label={`${meta.name} news`}>
            <g className="group cursor-pointer">
              <path
                d={shape.d}
                fill={fill.base}
                stroke="#0a1c2e"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d={shape.d}
                fill={fill.hover}
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinejoin="round"
                className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
              />

              {override && (
                <line
                  x1={override.leaderFrom[0]}
                  y1={override.leaderFrom[1]}
                  x2={lx - 8}
                  y2={ly - 5}
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity="0.55"
                />
              )}

              <text
                x={lx}
                y={ly}
                textAnchor={override ? override.anchor : "middle"}
                className="pointer-events-none select-none"
                fill="#ffffff"
                fontSize="30"
                fontWeight="800"
                letterSpacing="1.2"
                style={{ paintOrder: "stroke", stroke: "#0a1c2e", strokeWidth: 7 }}
              >
                {meta.name.toUpperCase()}
              </text>
            </g>
          </Link>
        );
      })}
    </svg>
  );
}
