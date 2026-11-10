import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, PHU_CHUA, THANH_HOA, BO_BAC } from "./terrain";

type Pt = [number, number];

// Trịnh Tùng mở phủ chúa — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành Thăng Long cách điệu.
const WALLS: Wall[] = [
  { at: square(110, 170, 46, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-trieu","thang-long","binh-an-vuong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 72], [THANH_HOA, 44]];

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
    seed: 1599,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "nam-trieu": quân Mạc (xanh nhạt) từ phía bắc đánh vào Thanh Hóa rồi lui; quân Nam triều (son) giữ quanh doanh trại (đốm ngà) (diễn hoạ).
  const p0 = run("nam-trieu", 28);
  { const S: Pt[] = [[-170, -260]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-trieu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1619, groups: [{ path: [[-170, -260], [-170, -260]], count: 40, spread: [14,60], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("nam-trieu") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1629, groups: [{ path: [[50, 0], [-120, -180], [50, 0]], count: 40, spread: [16,60], color: DICH, timing: [[0.05,0],[0.5,0.5],[0.9,1]] }], progress: p0, visible: () => clock.near("nam-trieu") }));
  // 2. "thang-long": quân Lê – Trịnh (son) từ Thanh Hóa tiến ra Thăng Long; quân Mạc (xanh nhạt) lui qua sông về bờ bắc (diễn hoạ).
  const p1 = run("thang-long", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1639, groups: [{ path: [[-170, -260], [-20, -40], [100, 140]], count: 70, spread: [16,80], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p1, visible: () => clock.near("thang-long") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1649, groups: [{ path: [[120, 170], [240, 230], [350, 300]], count: 40, spread: [14,60], color: DICH, timing: [[0.3,0],[0.9,1]] }], progress: p1, visible: () => clock.near("thang-long") }));
  { const S: Pt[] = [[110, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thang-long") })); }
  // 3. "binh-an-vuong": theo thanh kéo, phủ chúa (cột đốm ngà) dựng lên cạnh cung vua (đốm vàng); trăm quan (chấm ngà) về phủ chúa (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["binh-an-vuong"] ?? 0) / 0.9);
  { const S: Pt[] = [[110, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-an-vuong") })); }
  { const S: Pt[] = [[190, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-an-vuong") })); }
  { const S: Pt[] = [[190, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-an-vuong") })); }
  { const S: Pt[] = [[190, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 26, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-an-vuong") })); }
  { const S: Pt[] = [[190, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 36, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.41 + i * 0.12, 0.5599999999999999 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-an-vuong") })); }
  { const S: Pt[] = [[190, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.53 + i * 0.12, 0.68 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-an-vuong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1729, groups: [{ path: [[110, 165], [180, 125]], count: 30, spread: [8,30], color: NGHIA, timing: [[0.4,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("binh-an-vuong") }));
  // 4. "ve-sau": lửa cháy trong kinh thành; dân (son) tản ra; đốm ngà ở phủ chúa vẫn sáng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: [[80, 140], [150, 200], [60, 210], [170, 150], [100, 120]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ve-sau") * smoothstep(0.1, 0.9, p3()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1749, groups: [{ path: [[120, 160], [20, 60]], count: 30, spread: [10,60], color: SON, timing: [[0.2,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[190, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
