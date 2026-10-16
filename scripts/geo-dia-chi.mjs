// Ghi địa chỉ hành chính hiện nay (`nay: Xã/Phường …, Tỉnh/Thành phố …`) cho từng sự kiện có toạ độ trong
// content/lo-trinh.md, bằng cách tìm xã/phường chứa toạ độ trong public/geo (sinh bởi scripts/geo-osm.mjs).
//
//   node scripts/geo-dia-chi.mjs
//
// Sự kiện có `truoc-2025` (gắn với một di tích, địa điểm cụ thể) được ghi tới cấp xã/phường; sự kiện chỉ gắn
// với cả một kinh đô, thành phố (vd. "Thăng Long (Hà Nội)") chỉ ghi cấp tỉnh/thành để khỏi gây hiểu nhầm.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const FILE = join(ROOT, "content/lo-trinh.md");
const GEO = join(ROOT, "public/geo");

const provinces = JSON.parse(readFileSync(join(GEO, "tinh.json"), "utf8"));
const communes = new Map();
const load = (slug) => communes.get(slug) ?? communes.set(slug, JSON.parse(readFileSync(join(GEO, "xa", `${slug}.json`), "utf8"))).get(slug);

/** Điểm trong đa giác (vòng phẳng [lon, lat, …]), quy tắc chẵn – lẻ. */
function inside(lat, lon, flatRings) {
  let hit = false;
  for (const r of flatRings) {
    const n = r.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = r[i * 2], yi = r[i * 2 + 1], xj = r[j * 2], yj = r[j * 2 + 1];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
    }
  }
  return hit;
}

function locate(lat, lon) {
  const p = provinces.find((q) => lat >= q.bbox[0] && lat <= q.bbox[2] && lon >= q.bbox[1] && lon <= q.bbox[3] && inside(lat, lon, q.r));
  if (!p) return null;
  const xa = load(p.slug).xa;
  // điểm trên sông, sát ranh giới: không rơi vào xã nào thì lấy xã có tâm gần nhất
  const c = xa.find((x) => inside(lat, lon, x.r)) ?? xa.reduce((a, b) => ((b.c[0] - lat) ** 2 + (b.c[1] - lon) ** 2 < (a.c[0] - lat) ** 2 + (a.c[1] - lon) ** 2 ? b : a));
  return { tinh: p.ten, xa: c?.ten };
}

let n = 0;
const out = readFileSync(FILE, "utf8").replace(/^(- \*\*.*?)<!--([^>]*)-->$/gm, (line, head, meta) => {
  const td = meta.match(/toa-do:\s*([\d.]+),\s*([\d.]+)/);
  const cleaned = meta.replace(/\s*\|\s*nay:[^|]*/g, "").trimEnd();
  if (!td) return `${head}<!--${cleaned} -->`;
  const loc = locate(Number(td[1]), Number(td[2]));
  if (!loc) {
    console.warn(`! không tìm được tỉnh cho: ${head.slice(0, 60)}`);
    return `${head}<!--${cleaned} -->`;
  }
  const specific = /truoc-2025:/.test(meta) && loc.xa;
  n++;
  return `${head}<!--${cleaned} | nay: ${specific ? `${loc.xa}, ${loc.tinh}` : loc.tinh} -->`;
});
writeFileSync(FILE, out);
console.log(`✓ đã ghi địa chỉ hiện nay cho ${n} sự kiện`);
