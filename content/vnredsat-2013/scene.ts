import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KOUROU, TRAM } from "./terrain";

type Pt = [number, number];

// Vệ tinh VNREDSat-1 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["du-an","kourou","phong","anh-ve-tinh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KOUROU, 32], [TRAM, 32]];

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
    seed: 2024,
  });

  // 1. "du-an": trạm thu mặt đất (đốm vàng) và các kỹ sư (son) ở Việt Nam; đốm ngà (vệ tinh đang chế tạo) ở xa (diễn hoạ).
  const p0 = run("du-an", 28);
  { const S: Pt[] = [[-150, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("du-an") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2044, groups: [{ path: [[-260, -20], [-155, 55]], count: 20, spread: [3,10], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("du-an") }));
  { const S: Pt[] = [[200, 200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("du-an") })); }
  // 2. "kourou": đốm ngà (vệ tinh trong công-ten-nơ) được chở tới bãi phóng; một đốm xanh nhạt (mây xấu) che rồi tan (diễn hoạ).
  const p1 = run("kourou", 28);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2064, groups: [{ path: [[200, 200], [160, 60], [152, -35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.5,1]] }], progress: p1, visible: () => clock.near("kourou") }));
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: DICH, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (1 - smoothstep(0.85, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kourou") })); }
  // 3. "phong": theo thanh kéo, cột đốm vàng (tên lửa Vega) bay lên từ bãi phóng Kourou, đưa vệ tinh lên cao (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["phong"] ?? 0) / 0.9);
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.15000000000000002 + i * 0.12, 0.30000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 29, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 39, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.35000000000000003 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 49, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 59, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6500000000000001 + i * 0.12, 0.8000000000000002 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.7500000000000001 + i * 0.12, 0.9000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong") })); }
  // 4. "anh-ve-tinh": vệ tinh (đốm vàng trên cao) bay ngang trời; vùng ảnh chụp (vòng đốm xanh nhạt) quét qua mặt đất, dữ liệu về trạm thu (diễn hoạ).
  const p3 = run("anh-ve-tinh", 28);
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 70, seed: 2174, groups: [{ path: [[-300, 220], [0, 40], [300, -140]], count: 1, spread: [1,1], color: GOLD, timing: [[0,0],[1,1]] }], progress: p3, visible: () => clock.near("anh-ve-tinh") }));
  { const S: Pt[] = [[-300, 220], [-245, 187], [-191, 155], [-136, 122], [-82, 89], [-27, 56], [27, 24], [82, -9], [136, -42], [191, -75], [245, -107], [300, -140]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("anh-ve-tinh") })); }
  { const S: Pt[] = [[-150, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("anh-ve-tinh") })); }
};

export default setup;
