/**
 * Generates src/lib/horn-geo.ts from Natural Earth 50m admin-0 boundaries.
 *
 * The first version of the map was hand-drawn polygons, which were not
 * remotely accurate — Somalia had no Cape Guardafui, Eritrea no Dahlak coast,
 * and Djibouti sat in the wrong place relative to the Bab el-Mandeb. For a
 * publication whose whole subject is this region, that is not acceptable, so
 * the outlines now come from real boundary data.
 *
 * Run: node scripts/build-horn-map.mjs
 * Requires network access. The output is committed, so the site itself never
 * fetches anything at runtime.
 */

import fs from "node:fs";
import path from "node:path";

const SRC =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

// The four countries we cover, plus neighbours drawn as muted context so the
// Horn reads as a place rather than four shapes floating in a void.
const FOCUS = ["SOM", "ETH", "DJI", "ERI"];
const CONTEXT = ["KEN", "SDN", "SDS", "YEM", "SAU", "UGA", "EGY", "OMN", "ERI"];

// Somaliland is a separate feature in Natural Earth. Mogadishu regards the
// territory as part of Somalia and it is not internationally recognised, so it
// is merged into Somalia's outline rather than drawn as its own state.
const MERGE_INTO_SOMALIA = ["SOL"];

const DEG = 180 / Math.PI;
const mercatorY = (lat) => DEG * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Perpendicular distance from p to segment ab. */
function segDist(p, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

/** Ramer–Douglas–Peucker. */
function simplify(points, tolerance) {
  if (points.length <= 3) return points;
  const sqTol = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = segDist(points[i], points[first], points[last]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (maxDist > sqTol && index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const ringsOf = (geom) =>
  geom.type === "Polygon" ? geom.coordinates : geom.coordinates.flat();

function code(props) {
  for (const k of ["ADM0_A3", "ISO_A3", "SOV_A3", "ADM0_A3_US"]) {
    const v = props[k];
    if (typeof v === "string" && v !== "-99") return v;
  }
  return "";
}

console.log("Downloading Natural Earth 50m admin-0…");
const geo = await (await fetch(SRC)).json();
console.log(`  ${geo.features.length} features`);

// ---------------------------------------------------------------- collect
const wanted = new Set([...FOCUS, ...CONTEXT, ...MERGE_INTO_SOMALIA]);
const byCode = new Map();
for (const f of geo.features) {
  const c = code(f.properties);
  if (!wanted.has(c)) continue;
  const target = MERGE_INTO_SOMALIA.includes(c) ? "SOM" : c;
  if (!byCode.has(target)) byCode.set(target, []);
  byCode.get(target).push(...ringsOf(f.geometry));
}

for (const c of FOCUS) {
  if (!byCode.has(c)) throw new Error(`Missing required country: ${c}`);
}
console.log("  matched:", [...byCode.keys()].join(", "));

// ------------------------------------------------------------- project
// Mercator, then fit the four focus countries to the viewBox. Context
// countries use the same transform and simply run off the edges.
const project = (lon, lat) => [lon, -mercatorY(lat)];

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const c of FOCUS) {
  for (const ring of byCode.get(c)) {
    for (const [lon, lat] of ring) {
      const [x, y] = project(lon, lat);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const PAD = 0.35;
minX -= PAD;
maxX += PAD;
minY -= PAD;
maxY += PAD;

const W = 1000;
const scale = W / (maxX - minX);
const H = Math.round((maxY - minY) * scale);

const toSvg = ([lon, lat]) => {
  const [x, y] = project(lon, lat);
  return [(x - minX) * scale, (y - minY) * scale];
};

// Tolerance in SVG units — about a third of a pixel at render size.
const TOL = 0.9;

function pathFor(code) {
  const parts = [];
  for (const ring of byCode.get(code)) {
    const pts = simplify(ring.map(toSvg), TOL);
    // Drop slivers: tiny offshore islands add bytes and read as dirt.
    if (pts.length < 4) continue;
    let area = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
    }
    if (Math.abs(area / 2) < 6) continue;
    parts.push(
      "M" +
        pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") +
        "Z",
    );
  }
  return parts.join("");
}

/** Signed distance from a point to a ring; negative outside. */
function pointToRingDist(x, y, ring) {
  let inside = false;
  let minSq = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
    minSq = Math.min(minSq, segDist([x, y], ring[i], ring[j]));
  }
  return (inside ? 1 : -1) * Math.sqrt(minSq);
}

/**
 * Pole of inaccessibility — the interior point furthest from any edge.
 *
 * A plain centroid is wrong for these shapes: Somalia is a concave horn, so
 * the average of its vertices lands in Ethiopia or out at sea. This finds the
 * point deepest inside the country, which is where a label belongs.
 */
function labelFor(code) {
  let ring = null;
  let bestArea = 0;
  for (const r of byCode.get(code)) {
    const pts = r.map(toSvg);
    let area = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
    }
    area = Math.abs(area / 2);
    if (area > bestArea) {
      bestArea = area;
      ring = pts;
    }
  }

  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const cellSize = Math.min(maxX - minX, maxY - minY) / 2;

  const cells = [];
  const makeCell = (x, y, h) => ({
    x, y, h,
    d: pointToRingDist(x, y, ring),
    get max() { return this.d + this.h * Math.SQRT2; },
  });

  let h = cellSize / 2;
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      cells.push(makeCell(x + h, y + h, h));
    }
  }

  let best = makeCell((minX + maxX) / 2, (minY + maxY) / 2, 0);
  const PRECISION = 1;

  while (cells.length) {
    cells.sort((a, b) => a.max - b.max);
    const cell = cells.pop();
    if (cell.d > best.d) best = cell;
    if (cell.max - best.d <= PRECISION) continue;
    h = cell.h / 2;
    cells.push(
      makeCell(cell.x - h, cell.y - h, h),
      makeCell(cell.x + h, cell.y - h, h),
      makeCell(cell.x - h, cell.y + h, h),
      makeCell(cell.x + h, cell.y + h, h),
    );
  }

  // `d` is also the radius of the largest circle that fits: useful for
  // deciding whether a label can sit inside at all.
  return { at: [Math.round(best.x), Math.round(best.y)], room: Math.round(best.d) };
}

const focus = FOCUS.map((c) => {
  const { at, room } = labelFor(c);
  return { code: c, d: pathFor(c), label: at, room };
});
const context = CONTEXT.filter((c) => !FOCUS.includes(c) && byCode.has(c)).map((c) => ({
  code: c,
  d: pathFor(c),
}));

// ------------------------------------------------------------- silhouette
// A heavily simplified outline of the four countries together, fitted to a
// 100x100 box, for use as a brand mark. Drawn as one path in one colour the
// four adjacent shapes read as a single landmass.
function silhouette({ tolerance = 0.8, minArea = 500 } = {}) {
  const rings = [];
  for (const c of FOCUS) {
    for (const ring of byCode.get(c)) {
      const pts = ring.map(toSvg);
      let area = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
      }
      // Keep only substantial landmasses; islands become noise at 20px.
      if (Math.abs(area / 2) > minArea) rings.push(pts);
    }
  }

  let sMinX = Infinity, sMinY = Infinity, sMaxX = -Infinity, sMaxY = -Infinity;
  for (const r of rings) {
    for (const [x, y] of r) {
      if (x < sMinX) sMinX = x;
      if (x > sMaxX) sMaxX = x;
      if (y < sMinY) sMinY = y;
      if (y > sMaxY) sMaxY = y;
    }
  }
  const span = Math.max(sMaxX - sMinX, sMaxY - sMinY);
  const k = 100 / span;
  const offX = (100 - (sMaxX - sMinX) * k) / 2;
  const offY = (100 - (sMaxY - sMinY) * k) / 2;

  return rings
    .map((r) => {
      const pts = simplify(
        r.map(([x, y]) => [(x - sMinX) * k + offX, (y - sMinY) * k + offY]),
        tolerance,
      );
      if (pts.length < 4) return "";
      return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
    })
    .filter(Boolean)
    .join("");
}

const silhouettePath = silhouette();
// A blunter cut for favicon sizes: at 16px the coastal detail turns to noise,
// so the small mark keeps only the major landmasses and a coarse outline.
const silhouetteSmallPath = silhouette({ tolerance: 3.2, minArea: 4000 });

const out = `// GENERATED by scripts/build-horn-map.mjs — do not edit by hand.
// Source: Natural Earth 50m admin-0 boundaries (public domain).
// Mercator projection, fitted to Somalia, Ethiopia, Djibouti and Eritrea.
//
// Somaliland is merged into Somalia's outline: it is not internationally
// recognised and Mogadishu regards the territory as part of Somalia.

export const HORN_VIEWBOX = { width: ${W}, height: ${H} };

export type GeoShape = {
  code: string;
  d: string;
  /** Pole of inaccessibility — the point deepest inside the country. */
  label?: [number, number];
  /** Radius of the largest circle that fits there, in viewBox units. */
  room?: number;
};

/** The four countries we cover. */
export const HORN_COUNTRIES: GeoShape[] = ${JSON.stringify(focus, null, 2)};

/** Neighbours, drawn muted so the Horn reads in context. */
export const HORN_CONTEXT: GeoShape[] = ${JSON.stringify(context, null, 2)};

/**
 * The four countries as one simplified silhouette on a 0 0 100 100 viewBox,
 * for use as a brand mark.
 */
export const HORN_SILHOUETTE = ${JSON.stringify(silhouettePath)};

/**
 * The same silhouette cut much blunter, for favicon and app-icon sizes where
 * coastal detail reads as noise rather than coastline.
 */
export const HORN_SILHOUETTE_SMALL = ${JSON.stringify(silhouetteSmallPath)};
`;

const dest = path.join(process.cwd(), "src", "lib", "horn-geo.ts");
fs.writeFileSync(dest, out, "utf8");

console.log(`\nviewBox 0 0 ${W} ${H}`);
for (const f of focus) {
  console.log(`  ${f.code}: ${f.d.length}b, label ${f.label} (room ${f.room})`);
}
console.log(`  context: ${context.map((c) => c.code).join(", ")}`);
console.log(`Wrote ${dest} (${(out.length / 1024).toFixed(1)} kB)`);
