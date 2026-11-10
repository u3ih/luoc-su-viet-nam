import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUE, DA_LAT, HCM, HA_NOI } from "./terrain";

type Pt = [number, number];

// Châu bản triều Nguyễn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Kinh thành Huế cách điệu.
const WALLS: Wall[] = [
  { at: square(0, 80, 40, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["van-ban","but-son","luu-tru","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUE, 56]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2f4a48", shallow: "#86997a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2031,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "van-ban": văn bản tấu trình (chấm sáng ngà) từ các nơi về kinh thành; đốm vàng (nhà vua) giữa thành (diễn hoạ).
  const p0 = run("van-ban", 28);
  { const S: Pt[] = [[0, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-ban") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2051, groups: [{ path: [[-300, 200], [0, 80]], count: 3, spread: [6,20], color: NGHIA, timing: [[0.05,0],[0.6,1]] }, { path: [[200, -200], [10, 70]], count: 3, spread: [6,20], color: NGHIA, timing: [[0.1,0],[0.65,1]] }, { path: [[-250, -100], [-10, 75]], count: 3, spread: [6,20], color: NGHIA, timing: [[0.15,0],[0.7,1]] }], progress: p0, visible: () => clock.near("van-ban") }));
  // 2. "but-son": theo thanh kéo, các đốm son (những nét bút phê: chấm, khuyên, gạch, sửa) lần lượt hiện lên trên văn bản (lưới đốm ngà) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["but-son"] ?? 0) / 0.9);
  { const S: Pt[] = [[-22.5, 46.5], [-13.5, 46.5], [-4.5, 46.5], [4.5, 46.5], [13.5, 46.5], [22.5, 46.5], [-22.5, 55.5], [-13.5, 55.5], [-4.5, 55.5], [4.5, 55.5], [13.5, 55.5], [22.5, 55.5], [-22.5, 64.5], [-13.5, 64.5], [-4.5, 64.5], [4.5, 64.5], [13.5, 64.5], [22.5, 64.5], [-22.5, 73.5], [-13.5, 73.5], [-4.5, 73.5], [4.5, 73.5], [13.5, 73.5], [22.5, 73.5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.45 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("but-son") })); }
  { const S: Pt[] = [[-13.5, 46.5], [13.5, 46.5], [-13.5, 55.5], [13.5, 55.5], [-13.5, 64.5], [13.5, 64.5], [-13.5, 73.5], [13.5, 73.5]]; world.add(createGlows({ count: S.length, color: "#e2563a", size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("but-son") })); }
  // 3. "luu-tru": châu bản (chấm vàng) chuyển từ Huế lên Đà Lạt, xuống Thành phố Hồ Chí Minh, rồi ra Hà Nội (diễn hoạ).
  const p2 = run("luu-tru", 28);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2081, groups: [{ path: [[0, 70], [-80, -190], [80, -330], [0, 0], [-80, 320]], count: 1, spread: [3,3], color: GOLD, timing: [[0.03,0],[0.25,0.25],[0.45,0.5],[0.95,1]] }], progress: p2, visible: () => clock.near("luu-tru") }));
  { const S: Pt[] = [[-80, -200], [80, -340]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.2, 0.35 + i * 0.2, k) * (1 - smoothstep(0.7, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luu-tru") })); }
  // 4. "ve-sau": đốm vàng ở Hà Nội (nơi lưu giữ hiện nay) sáng; vòng đốm ngà quanh (Ký ức Thế giới) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-80, 330]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-40, 330], [-45, 350], [-60, 365], [-80, 370], [-100, 365], [-115, 350], [-120, 330], [-115, 310], [-100, 295], [-80, 290], [-60, 295], [-45, 310]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.03, 0.65 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
