import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DOI } from "./terrain";

type Pt = [number, number];

// Tháp Bánh Ít — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ngon-doi","bon-thap","trang-tri","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

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
    seed: 1100,
  });

  // 1. "ngon-doi": người (son) lên đồi từ phía đông; đốm vàng trên đỉnh đồi (diễn hoạ).
  const p0 = run("ngon-doi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1110, groups: [{ path: [[200, 0], [60, 30], [10, 40]], count: 20, spread: [8,60], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("ngon-doi") }));
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngon-doi") })); }
  // 2. "bon-thap": theo thanh kéo, từ chân đồi lên: tháp cổng, tháp đông nam, rồi tháp chính và tháp mái yên ngựa (cột đốm vàng) lần lượt sáng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bon-thap"] ?? 0) / 0.9);
  { const S: Pt[] = [[60, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[60, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.06 + i * 0.12, 0.21 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[60, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[50, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[50, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[50, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.33 + i * 0.12, 0.48 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.54 + i * 0.12, 0.6900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.58 + i * 0.12, 0.73 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 19, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.62 + i * 0.12, 0.77 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.66 + i * 0.12, 0.81 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[-5, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[-5, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.79 + i * 0.12, 0.9400000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  { const S: Pt[] = [[-5, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.83 + i * 0.12, 0.98 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bon-thap") })); }
  // 3. "trang-tri": những đốm ngà nhỏ (hình người, thú, chim) quanh chân tháp mái yên ngựa (diễn hoạ).
  const p2 = run("trang-tri", 28);
  { const S: Pt[] = [[3, 30], [2, 34], [-1, 37], [-5, 38], [-9, 37], [-12, 34], [-13, 30], [-12, 26], [-9, 23], [-5, 22], [-1, 23], [2, 26]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-tri") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-tri") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.002 + i * 0.12, 0.152 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-tri") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.004 + i * 0.12, 0.154 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-tri") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 19, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.006 + i * 0.12, 0.156 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-tri") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.008 + i * 0.12, 0.158 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-tri") })); }
  // 4. "ve-sau": bốn cột đốm vàng trên đồi trong ánh chiều (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[60, 30], [50, 0], [0, 50], [-5, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
