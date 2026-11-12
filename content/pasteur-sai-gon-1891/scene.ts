import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VIEN, PARIS } from "./terrain";

type Pt = [number, number];

// Viện Pasteur Sài Gòn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["calmette","thanh-lap","vac-xin","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VIEN, 48]];

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
    seed: 1891,
  });

  // 1. "calmette": đốm ngà (Calmette) rời Paris sang Sài Gòn (diễn hoạ).
  const p0 = run("calmette", 28);
  { const S: Pt[] = [[-340, 340]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("calmette") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 1911, groups: [{ path: [[-330, 330], [-150, 160], [-5, 25]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.15,0],[0.85,1]] }], progress: p0, visible: () => clock.near("calmette") }));
  // 2. "thanh-lap": đốm vàng (viện) sáng ở Sài Gòn, các phòng thí nghiệm (lưới đốm ngà) quanh (diễn hoạ).
  const p1 = run("thanh-lap", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  { const S: Pt[] = [[-18, 8], [-6, 8], [6, 8], [18, 8], [-18, 20], [-6, 20], [6, 20], [18, 20], [-18, 32], [-6, 32], [6, 32], [18, 32]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.04, 0.44999999999999996 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  // 3. "vac-xin": theo thanh kéo, những liều vắc-xin (chấm vàng) từ viện toả đi các tỉnh Nam Kỳ (đốm ngà) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["vac-xin"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vac-xin") })); }
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1951, groups: [{ path: [[0, 20], [216, 64]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [122, 203]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [-44, 236]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [-183, 142]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [-216, -24]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [-122, -163]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [44, -196]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[0, 20], [183, -102]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("vac-xin") }));
  { const S: Pt[] = [[216, 64], [122, 203], [-44, 236], [-183, 142], [-216, -24], [-122, -163], [44, -196], [183, -102]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.75 + i * 0.02, 0.9 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vac-xin") })); }
  // 4. "ngay-nay": vùng phụ trách của viện (20 đốm từ Lâm Đồng tới Cà Mau) sáng; người dân (son) đến tiêm chủng (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[200, 300], [158, 268], [116, 237], [74, 205], [32, 174], [-5, 142], [-26, 111], [-47, 79], [-68, 47], [-89, 16], [-105, -21], [-116, -63], [-126, -105], [-137, -147], [-147, -189], [-166, -221], [-187, -248], [-208, -275], [-229, -303], [-250, -330]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1981, groups: [{ path: [[30, 20], [26, 35], [15, 46], [0, 50], [-15, 46], [-26, 35], [-30, 20], [-26, 5], [-15, -6], [0, -10], [15, -6], [26, 5], [30, 20]], count: 40, spread: [2,6], color: SON, drop: true, timing: [[0.1,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
