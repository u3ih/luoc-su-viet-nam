import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUE, THUAN_AN, TAN_SO, DEO_NGANG, BINH_THUAN } from "./terrain";

type Pt = [number, number];

// Hoà ước Quý Mùi — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
  { at: square(20, 40, 48, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tu-duc","thuan-an","ky-ket","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUE, 64], [THUAN_AN, 24]];

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
    seed: 1886,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "tu-duc": đốm vàng (vua Tự Đức) trong kinh thành tắt; hai đốm ngà (Dục Đức, Hiệp Hoà) nối nhau sáng rồi một đốm mờ đi (diễn hoạ).
  const p0 = run("tu-duc", 28);
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.2, 0.35, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-duc") })); }
  { const S: Pt[] = [[10, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (1 - smoothstep(0.5, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-duc") })); }
  { const S: Pt[] = [[30, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-duc") })); }
  // 2. "thuan-an": tàu Pháp (chấm sáng xanh nhạt) từ biển vào cửa Thuận An; lửa cháy ở các đồn (diễn hoạ).
  const p1 = run("thuan-an", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1926, groups: [{ path: [[300, 330], [220, 220], [185, 170]], count: 8, spread: [10,60], color: DICH, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("thuan-an") }));
  world.add(createFires({ sites: [[170, 150], [200, 170], [160, 175], [190, 140]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("thuan-an") * smoothstep(0.4, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "ky-ket": theo thanh kéo, quân Pháp (xanh nhạt) đóng đồn ở Thuận An và Đèo Ngang; đốm ngà ở kinh thành vẫn sáng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ky-ket"] ?? 0) / 0.9);
  { const S: Pt[] = [[30, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1956, groups: [{ path: [[180, 165], [180, 165]], count: 20, spread: [8,30], color: DICH, timing: [[0,0],[0.4,1]] }, { path: [[150, 200], [-80, 300], [-240, 330]], count: 20, spread: [8,30], color: DICH, timing: [[0.3,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ky-ket") }));
  { const S: Pt[] = [[180, 160], [-250, 340]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.4 + i * 0.4, 0.55 + i * 0.4, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  // 4. "ve-sau": súng đạn, lương thực (chấm son) lặng lẽ chuyển từ kinh thành lên căn cứ Tân Sở (đốm ngà) trong núi (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1976, groups: [{ path: [[20, 30], [-120, 0], [-280, -30]], count: 30, spread: [6,30], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-290, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
