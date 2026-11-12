import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TUY_HOA, TPHCM, SAN } from "./terrain";

type Pt = [number, number];

// Tấm huy chương Olympic đầu tiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tuy-hoa","thanh-tich","sydney","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TUY_HOA, 32], [TPHCM, 32], [SAN, 96]];

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
    seed: 2009,
  });

  // 1. "tuy-hoa": đốm vàng nhỏ (cô bé) ở Tuy Hoà; một nhóm trẻ (son) tập võ quanh (diễn hoạ).
  const p0 = run("tuy-hoa", 28);
  { const S: Pt[] = [[-250, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuy-hoa") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2029, groups: [{ path: [[-232, 200], [-235, 211], [-244, 217], [-256, 217], [-265, 211], [-268, 200], [-265, 189], [-256, 183], [-244, 183], [-235, 189], [-232, 200]], count: 14, spread: [1,3], color: SON, drop: true, timing: [[0.1,0],[0.7,1]] }], progress: p0, visible: () => clock.near("tuy-hoa") }));
  // 2. "thanh-tich": chấm ngà rời Tuy Hoà vào TP.HCM; những huy chương (cột đốm ngà rồi vàng) cao dần (diễn hoạ).
  const p1 = run("thanh-tich", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2039, groups: [{ path: [[-250, 200], [-200, -55]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.4,1]] }], progress: p1, visible: () => clock.near("thanh-tich") }));
  { const S: Pt[] = [[-140, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-140, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.48000000000000004 + i * 0.12, 0.63 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-140, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.56 + i * 0.12, 0.7100000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-140, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.64 + i * 0.12, 0.79 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6699999999999999 + i * 0.12, 0.82 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.74 + i * 0.12, 0.89 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.81 + i * 0.12, 0.9600000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.88 + i * 0.12, 1.03 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-tich") })); }
  // 3. "sydney": theo thanh kéo, chấm ngà đi qua các trận (đốm xanh nhạt) tới bục nhận huy chương; đốm ngà (huy chương bạc) sáng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["sydney"] ?? 0) / 0.9);
  { const S: Pt[] = [[-20, -30], [20, -10], [60, 10]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sydney") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 6, seed: 2149, groups: [{ path: [[-60, -40], [-20, -30], [20, -10], [60, 10], [95, 20]], count: 1, spread: [1,1], color: NGHIA, timing: [[0.05,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("sydney") }));
  { const S: Pt[] = [[100, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.86 + i * 0.12, 1.01 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sydney") })); }
  { const S: Pt[] = [[100, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.89 + i * 0.12, 1.04 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sydney") })); }
  { const S: Pt[] = [[100, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.9199999999999999 + i * 0.12, 1.0699999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sydney") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2189, groups: [{ path: [[-80, -90], [120, -90]], count: 40, spread: [2,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("sydney") }));
  // 4. "ve-sau": đốm ngà (bạc 2000) sáng; mười sáu năm sau đốm vàng (vàng 2016) sáng bên cạnh; vòng khán giả (son) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[20, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[60, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2219, groups: [{ path: [[110, 0], [105, 27], [89, 49], [67, 65], [40, 70], [13, 65], [-9, 49], [-25, 27], [-30, 0], [-25, -27], [-9, -49], [13, -65], [40, -70], [67, -65], [89, -49], [105, -27], [110, 0]], count: 50, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
