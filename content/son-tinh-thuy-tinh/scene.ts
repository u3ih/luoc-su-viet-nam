import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TAN_VIEN, KINH, BIEN, DE } from "./terrain";

type Pt = [number, number];

// Sơn Tinh, Thủy Tinh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ken-re","sinh-le","nuoc-dang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 44]];

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
    counts: { trees: 520, bushes: 700, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 660,
  });

  // 1. "ken-re": Sơn Tinh (đốm ngà) từ núi Tản Viên, Thủy Tinh (đốm xanh nhạt) từ biển cùng đến kinh đô (đốm vàng) (diễn hoạ).
  const p0 = run("ken-re", 28);
  { const S: Pt[] = [[40, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ken-re") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 680, groups: [{ path: [[-170, 20], [-60, -10], [20, -30]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p0, visible: () => clock.near("ken-re") }));
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 690, groups: [{ path: [[330, -60], [180, -60], [60, -45]], count: 1, spread: [3,3], color: DICH, timing: [[0.1,0],[0.8,1]] }], progress: p0, visible: () => clock.near("ken-re") }));
  // 2. "sinh-le": đoàn sính lễ (chấm ngà) đến kinh đô trước rồi rước Mỵ Nương (đốm vàng) về núi; đoàn của Thủy Tinh (xanh nhạt) đến sau (diễn hoạ).
  const p1 = run("sinh-le", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 700, groups: [{ path: [[-160, 20], [0, -30], [-150, 30]], count: 24, spread: [8,30], color: NGHIA, timing: [[0.02,0],[0.4,0.5],[0.85,1]] }], progress: p1, visible: () => clock.near("sinh-le") }));
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 710, groups: [{ path: [[40, -40], [-150, 30]], count: 1, spread: [3,3], color: GOLD, timing: [[0.4,0],[0.85,1]] }], progress: p1, visible: () => clock.near("sinh-le") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 720, groups: [{ path: [[330, -60], [70, -45]], count: 26, spread: [10,40], color: DICH, timing: [[0.45,0],[0.95,1]] }], progress: p1, visible: () => clock.near("sinh-le") }));
  // 3. "nuoc-dang": theo thanh kéo, quân của Thủy Tinh (xanh nhạt) dâng lên từ biển; cột đốm vàng trên núi Tản Viên cao dần; dân (son) đắp đê (chuỗi đốm ngà) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nuoc-dang"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 730, groups: [{ path: [[340, -60], [120, -30], [-80, 10]], count: 60, spread: [30,120], color: DICH, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nuoc-dang") }));
  { const S: Pt[] = [[-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  { const S: Pt[] = [[-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.19 + i * 0.12, 0.33999999999999997 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  { const S: Pt[] = [[-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 29, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.33 + i * 0.12, 0.48 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  { const S: Pt[] = [[-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 39, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.47000000000000003 + i * 0.12, 0.62 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  { const S: Pt[] = [[-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6100000000000001 + i * 0.12, 0.7600000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  { const S: Pt[] = [[-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.7500000000000001 + i * 0.12, 0.9000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  { const S: Pt[] = [[60, -150], [88, -130], [116, -110], [144, -86], [172, -58], [200, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.2 + i * 0.08, 0.35 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nuoc-dang") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 810, groups: [{ path: [[40, -40], [120, -100]], count: 24, spread: [10,50], color: SON, timing: [[0.1,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nuoc-dang") }));
  // 4. "ve-sau": quân Thủy Tinh (xanh nhạt) rút về biển; các làng (đốm vàng) sáng lại; đê (chuỗi đốm ngà) vẫn giữ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 820, groups: [{ path: [[-60, 10], [120, -40], [340, -60]], count: 60, spread: [30,120], color: DICH, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[60, -150], [88, -130], [116, -110], [144, -86], [172, -58], [200, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, -40], [-40, -120], [100, 60], [-80, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.08, 0.65 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
