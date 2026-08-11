/**
 * Writes public/logo-sizes.html — a one-screen sheet showing the mark at the
 * sizes it actually has to survive, plus the header lockup. Useful for judging
 * the small-size cut without hunting through the full /brand page.
 */
import fs from "node:fs";
import path from "node:path";

const geo = fs.readFileSync(path.join(process.cwd(), "src", "lib", "horn-geo.ts"), "utf8");
const pick = (n) => new RegExp(`export const ${n} = "([^"]*)"`).exec(geo)[1];
const FULL = pick("HORN_SILHOUETTE");
const SMALL = pick("HORN_SILHOUETTE_SMALL");

const mark = (size) => {
  const small = size < 28;
  const scale = small ? 0.9 : 0.74;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#0b1f33"/>
    <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
      <path d="${small ? SMALL : FULL}" fill="#c9182b"/>
    </g></svg>`;
};

const SIZES = [16, 20, 24, 32, 44, 64, 96];

const html = `<!doctype html>
<meta charset="utf-8">
<title>HORNAFRIKA mark — sizes</title>
<style>
  body{margin:0;padding:28px 32px;background:#f4f6f8;
       font:15px/1.5 system-ui,Segoe UI,Arial,sans-serif;color:#0b1f33}
  h1{font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:#6b7c8c;margin:0 0 18px}
  .row{display:flex;align-items:flex-end;gap:26px;background:#fff;
       border:1px solid #e3e6ea;padding:22px 26px;margin-bottom:20px}
  .cell{text-align:center}
  .cell span{display:block;margin-top:8px;font-size:11px;color:#6b7c8c}
  .lockup{display:flex;align-items:center;gap:10px;background:#fff;
          border:1px solid #e3e6ea;padding:20px 26px;margin-bottom:20px}
  .wm{font-weight:800;letter-spacing:-.035em;line-height:1}
  .tag{margin-top:5px;font-size:9.5px;font-weight:600;letter-spacing:.14em;
       text-transform:uppercase;color:#6b7c8c}
  .note{font-size:12.5px;color:#6b7c8c;max-width:62ch}
  .dark{background:#0a1c2e;border-color:#0a1c2e}
  .dark .wm span:first-child{color:#fff}
</style>

<h1>Header lockup</h1>
<div class="lockup">
  ${mark(44)}
  <div>
    <div class="wm" style="font-size:32px"><span>HORN</span><span style="color:#c9182b">AFRIKA</span></div>
    <div class="tag">The Horn of Africa, Connected.</div>
  </div>
</div>

<div class="lockup dark">
  ${mark(44)}
  <div>
    <div class="wm" style="font-size:32px"><span style="color:#fff">HORN</span><span style="color:#c9182b">AFRIKA</span></div>
  </div>
</div>

<h1>The mark at real sizes</h1>
<div class="row">
  ${SIZES.map((s) => `<div class="cell">${mark(s)}<span>${s}px</span></div>`).join("")}
</div>

<p class="note">
  16px and 20px use the blunt cut with wider padding; 24px and up use the full
  coastline. The favicon is rasterised at these sizes rather than downscaled.
</p>
`;

const out = path.join(process.cwd(), "public", "logo-sizes.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html, "utf8");
console.log("wrote public/logo-sizes.html", html.length, "bytes");
