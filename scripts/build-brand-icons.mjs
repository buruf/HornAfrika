/**
 * Generates the app icons from the brand silhouette.
 *
 *   src/app/icon.svg      — the vector icon browsers prefer
 *   src/app/favicon.ico   — a real multi-size ICO (48/32/16), rasterised here
 *                           by point-in-polygon testing the silhouette, so the
 *                           small sizes are pixel-fitted rather than a
 *                           downscaled blur.
 *
 * Run after scripts/build-horn-map.mjs.
 */

import fs from "node:fs";
import path from "node:path";

const geo = fs.readFileSync(
  path.join(process.cwd(), "src", "lib", "horn-geo.ts"),
  "utf8",
);

const pick = (name) => {
  const m = new RegExp(`export const ${name} = "([^"]*)"`).exec(geo);
  if (!m) throw new Error(`${name} not found — run build-horn-map.mjs first`);
  return m[1];
};

const FULL = pick("HORN_SILHOUETTE");
const SMALL = pick("HORN_SILHOUETTE_SMALL");

const INK = [0x0b, 0x1f, 0x33];
const RED = [0xc9, 0x18, 0x2b];

// ---------------------------------------------------------------- icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="#0b1f33"/>
  <g transform="translate(50 50) scale(0.8) translate(-50 -50)">
    <path d="${FULL}" fill="#c9182b"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(process.cwd(), "src", "app", "icon.svg"), svg, "utf8");

// -------------------------------------------------------------- rasteriser
/** Parse "M x y L x y ... Z" subpaths into rings. */
function parseRings(d) {
  return d
    .split("M")
    .filter(Boolean)
    .map((sub) =>
      sub
        .replace(/Z\s*$/, "")
        .split("L")
        .map((pair) => pair.trim().split(/\s+/).map(Number))
        .filter((p) => p.length === 2 && p.every(Number.isFinite)),
    )
    .filter((r) => r.length >= 3);
}

function inside(x, y, rings) {
  // Each ring is a separate landmass, so a point counts as land if it is
  // inside any of them.
  for (const ring of rings) {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    if (hit) return true;
  }
  return false;
}

/** Render one square icon as BGRA rows, top-down. */
function raster(size) {
  // Small sizes use the blunt cut and less padding, matching MarkCape.
  const small = size < 28;
  const rings = parseRings(small ? SMALL : FULL);
  const scale = small ? 0.9 : 0.8;

  const px = [];
  const SS = 3; // supersample for a cleaner edge
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = ((x + (sx + 0.5) / SS) / size - 0.5) / scale + 0.5;
          const v = ((y + (sy + 0.5) / SS) / size - 0.5) / scale + 0.5;
          if (inside(u * 100, v * 100, rings)) hits++;
        }
      }
      const a = hits / (SS * SS);
      const c = [
        Math.round(INK[2] + (RED[2] - INK[2]) * a),
        Math.round(INK[1] + (RED[1] - INK[1]) * a),
        Math.round(INK[0] + (RED[0] - INK[0]) * a),
        0xff,
      ];
      px.push(c);
    }
  }
  return px;
}

/** One ICO image entry: BITMAPINFOHEADER + bottom-up BGRA + AND mask. */
function icoImage(size) {
  const px = raster(size);
  const rows = [];
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) rows.push(Buffer.from(px[y * size + x]));
  }
  const pixels = Buffer.concat(rows);
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const andMask = Buffer.alloc(maskRowBytes * size, 0);

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(pixels.length + andMask.length, 20);

  return Buffer.concat([header, pixels, andMask]);
}

const SIZES = [48, 32, 16];
const images = SIZES.map(icoImage);

const dir = Buffer.alloc(6);
dir.writeUInt16LE(0, 0);
dir.writeUInt16LE(1, 2);
dir.writeUInt16LE(SIZES.length, 4);

let offset = 6 + 16 * SIZES.length;
const entries = SIZES.map((size, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0);
  e.writeUInt8(size === 256 ? 0 : size, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});

const ico = Buffer.concat([dir, ...entries, ...images]);
fs.writeFileSync(path.join(process.cwd(), "src", "app", "favicon.ico"), ico);

console.log(`icon.svg    ${svg.length} bytes`);
console.log(`favicon.ico ${ico.length} bytes (${SIZES.join(", ")}px)`);

// Coverage sanity: the mark must not be a solid block or nearly empty.
for (const size of SIZES) {
  const px = raster(size);
  const land = px.filter((c) => c[2] > (INK[0] + RED[0]) / 2).length;
  const pct = ((land / px.length) * 100).toFixed(1);
  console.log(`  ${size}px: ${pct}% land coverage`);
}
