// Tải ranh giới 34 tỉnh/thành và 3.321 xã/phường (sau sắp xếp 01/7/2025) từ OpenStreetMap qua Overpass API,
// ghép thành vòng khép kín, rút gọn, xuất cho bản đồ trang /lo-trinh:
//   public/geo/tinh.json        ranh giới tỉnh (rút gọn mạnh, tải ngay khi mở bản đồ)
//   public/geo/xa/<tinh>.json   ranh giới + tâm các xã/phường của một tỉnh (tải khi phóng to vào tỉnh đó)
//
//   node scripts/geo-osm.mjs            # tải (dùng lại bản đã tải trong .geo-cache/) rồi xử lý
//   node scripts/geo-osm.mjs --refresh  # bỏ cache, tải lại toàn bộ
//
// Dữ liệu © OpenStreetMap contributors, giấy phép ODbL — ghi công ở public/geo/README.md và chân trang /lo-trinh.
// Overpass là dịch vụ cộng đồng: script đợi giữa các lần gọi và thử lại khi máy chủ bận. Đừng chạy liên tục.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CACHE = join(ROOT, ".geo-cache");
const OUT = join(ROOT, "public/geo");
const API = "https://overpass-api.de/api/interpreter";
const UA = "luoc-su-viet-nam (open-source history project; https://github.com/u3ih/luoc-su-viet-nam)";

if (process.argv.includes("--refresh")) rmSync(CACHE, { recursive: true, force: true });
mkdirSync(CACHE, { recursive: true });
mkdirSync(join(OUT, "xa"), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function overpass(query, file) {
  const path = join(CACHE, file);
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(API, { method: "POST", headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(query) });
    const text = await res.text();
    if (res.ok && text.startsWith("{")) {
      writeFileSync(path, text);
      return JSON.parse(text);
    }
    console.warn(`  máy chủ bận (${res.status}), thử lại sau ${i * 15}s…`);
    await sleep(i * 15000);
  }
  throw new Error(`Overpass không trả lời: ${file}`);
}

// ---- hình học ----
const key = ([x, y]) => `${x.toFixed(7)},${y.toFixed(7)}`;
function rings(rel) {
  const segs = rel.members.filter((m) => m.type === "way" && m.geometry && m.role !== "inner").map((m) => m.geometry.map((n) => [n.lon, n.lat]));
  const out = [];
  while (segs.length) {
    let ring = segs.shift();
    let changed = true;
    while (key(ring[0]) !== key(ring.at(-1)) && changed) {
      changed = false;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        if (key(s[0]) === key(ring.at(-1))) ring = ring.concat(s.slice(1));
        else if (key(s.at(-1)) === key(ring.at(-1))) ring = ring.concat(s.slice().reverse().slice(1));
        else if (key(s.at(-1)) === key(ring[0])) ring = s.slice(0, -1).concat(ring);
        else if (key(s[0]) === key(ring[0])) ring = s.slice().reverse().slice(0, -1).concat(ring);
        else continue;
        segs.splice(i, 1);
        changed = true;
        break;
      }
    }
    if (ring.length >= 4) out.push(key(ring[0]) === key(ring.at(-1)) ? ring : ring.concat([ring[0]]));
  }
  return out;
}
function simplify(pts, tol) {
  if (pts.length < 5) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const dx = pts[b][0] - ax;
    const dy = pts[b][1] - ay;
    const L = dx * dx + dy * dy || 1e-18;
    let best = 0;
    let bi = -1;
    for (let i = a + 1; i < b; i++) {
      const t = Math.max(0, Math.min(1, ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / L));
      const d = (pts[i][0] - ax - t * dx) ** 2 + (pts[i][1] - ay - t * dy) ** 2;
      if (d > best) [best, bi] = [d, i];
    }
    if (best > tol * tol) {
      keep[bi] = 1;
      stack.push([a, bi], [bi, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}
const area = (r) => r.slice(0, -1).reduce((s, p, i) => s + p[0] * r[i + 1][1] - r[i + 1][0] * p[1], 0) / 2;
function centroid(rs) {
  const big = rs.reduce((a, b) => (Math.abs(area(b)) > Math.abs(area(a)) ? b : a));
  const A = area(big) || 1e-12;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < big.length - 1; i++) {
    const f = big[i][0] * big[i + 1][1] - big[i + 1][0] * big[i][1];
    cx += (big[i][0] + big[i + 1][0]) * f;
    cy += (big[i][1] + big[i + 1][1]) * f;
  }
  return [cy / (6 * A), cx / (6 * A)];
}
/** Vòng → mảng phẳng [lon, lat, lon, lat…] đã rút gọn, làm tròn. */
const pack = (rs, tol, dec) =>
  rs
    .map((r) => simplify(r, tol))
    .filter((r) => r.length >= 4)
    .map((r) => r.flatMap(([x, y]) => [+x.toFixed(dec), +y.toFixed(dec)]));
function inside([lat, lon], rs) {
  let hit = false;
  for (const r of rs)
    for (let i = 0, j = r.length - 1; i < r.length; j = i++)
      if (r[i][1] > lat !== r[j][1] > lat && lon < ((r[j][0] - r[i][0]) * (lat - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) hit = !hit;
  return hit;
}
const slug = (s) =>
  s
    .replace(/^(Tỉnh|Thành phố)\s+/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ---- tải & xuất ----
const VN = 'area["ISO3166-1"="VN"][admin_level=2]->.vn;';
const provinces = (await overpass(`[out:json][timeout:170];${VN}relation["boundary"="administrative"]["admin_level"="4"](area.vn);out tags;`, "tinh.json")).elements;
console.log(`✓ ${provinces.length} tỉnh/thành`);
// Đơn vị hành chính OSM chưa có ranh giới (đặc khu trên các quần đảo): dựng từ các đảo trong dữ liệu
// Natural Earth góc nhìn Việt Nam (public/geo/ne-10m-vn.json), gắn vào đúng tỉnh/thành quản lý.
// Chỉ dùng khi OSM thiếu — OSM có thì ưu tiên OSM.
const SUPPLEMENTS = [
  { tinh: "Thành phố Đà Nẵng", ten: "Đặc khu Hoàng Sa", bbox: [15.4, 110.8, 17.4, 113.2], c: [16.4, 112.0] },
  { tinh: "Tỉnh Khánh Hòa", ten: "Đặc khu Trường Sa", bbox: [6.0, 110.8, 12.2, 117.5], c: [9.9, 113.6] },
];

const index = [];
/** Theo id quan hệ xã: tỉnh nhận xã này (tỉnh chứa nhiều đỉnh của xã nhất) — xã giáp ranh có trong nhiều truy vấn. */
const best = new Map();
const perProvince = [];
for (const p of provinces) {
  const query = `[out:json][timeout:600];rel(${p.id});map_to_area->.p;rel(${p.id});out geom;relation["boundary"="administrative"]["admin_level"="6"](area.p);out geom;`;
  let data = await overpass(query, `p_${p.id}.json`);
  if (!data.elements.some((e) => e.id === p.id)) {
    // file cache hỏng (lẫn dữ liệu tỉnh khác): tải lại
    rmSync(join(CACHE, `p_${p.id}.json`));
    data = await overpass(query, `p_${p.id}.json`);
  }
  const prov = data.elements.find((e) => e.id === p.id);
  const pr = rings(prov);
  const xa = data.elements
    .filter((e) => e.tags?.admin_level === "6")
    .map((e) => ({ id: e.id, ten: e.tags.name, rs: rings(e) }))
    .filter((c) => c.rs.length);
  for (const x of xa) {
    const pts = x.rs.flat();
    const step = Math.max(1, Math.floor(pts.length / 60));
    let hit = 0;
    let n = 0;
    for (let i = 0; i < pts.length; i += step, n++) if (inside([pts[i][1], pts[i][0]], pr)) hit++;
    const ratio = hit / Math.max(1, n);
    const cur = best.get(x.id);
    if (!cur || ratio > cur.ratio) best.set(x.id, { ratio, prov: p.id });
  }
  perProvince.push({ id: p.id, name: prov.tags.name, pr, xa });
  console.log(`  ${prov.tags.name}: ${xa.length} quan hệ`);
  await sleep(300);
}

const ne = JSON.parse(readFileSync(join(OUT, "ne-10m-vn.json"), "utf8")).VNM;
let total = 0;
for (const { id, name, pr, xa } of perProvince) {
  const mine = xa
    .filter((x) => best.get(x.id)?.prov === id)
    .map((x) => ({ ten: x.ten, c: centroid(x.rs).map((v) => +v.toFixed(4)), r: pack(x.rs, 0.0006, 4) }));
  for (const sup of SUPPLEMENTS.filter((q) => q.tinh === name && !mine.some((x) => x.ten === q.ten))) {
    const [la0, lo0, la1, lo1] = sup.bbox;
    const islands = ne.filter((r) => r.every(([lo, la]) => la >= la0 && la <= la1 && lo >= lo0 && lo <= lo1));
    mine.push({ ten: sup.ten, c: sup.c, r: islands.map((r) => r.flat()), bosung: "Natural Earth (góc nhìn Việt Nam)" });
    console.log(`  + ${sup.ten} (${name}): ${islands.length} đảo từ Natural Earth`);
  }
  const xs = pr.flat().map((q) => q[0]);
  const ys = pr.flat().map((q) => q[1]);
  // khung bao của tỉnh tính cả xã/đặc khu ngoài khơi (Trường Sa, Hoàng Sa…)
  for (const x of mine) for (const r of x.r) for (let i = 0; i < r.length; i += 2) xs.push(r[i]), ys.push(r[i + 1]);
  const s = slug(name);
  writeFileSync(join(OUT, "xa", `${s}.json`), JSON.stringify({ tinh: name, xa: mine }));
  index.push({ ten: name, slug: s, bbox: [Math.min(...ys), Math.min(...xs), Math.max(...ys), Math.max(...xs)].map((v) => +v.toFixed(3)), r: pack(pr, 0.004, 3) });
  total += mine.length;
}
writeFileSync(join(OUT, "tinh.json"), JSON.stringify(index));
console.log(`✓ ${total} xã/phường/đặc khu → public/geo/xa/, ranh giới tỉnh → public/geo/tinh.json`);
