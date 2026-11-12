import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HON_LAO, CUA_DAI } from "./terrain";

type Pt = [number, number];

// Cù Lao Chàm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tam-hon","champello","san-ho","jeju"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CUA_DAI, 32]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#1d4c5c", shallow: "#5fa8a8" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2014,
  });

  // 1. "tam-hon": tám hòn đảo lần lượt sáng (đốm ngà); thuyền (chấm ngà) từ Cửa Đại ra đảo (diễn hoạ).
  const p0 = run("tam-hon", 28);
  { const S: Pt[] = [[30, 0], [180, 90], [190, -60], [-80, 130], [-60, -120], [120, 180], [110, -170], [240, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 25, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tam-hon") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2034, groups: [{ path: [[-330, 0], [-60, -20]], count: 3, spread: [3,8], color: NGHIA, timing: [[0.4,0],[0.95,1]] }], progress: p0, visible: () => clock.near("tam-hon") }));
  // 2. "champello": các dấu tích nhiều thời (đốm xanh nhạt Sa Huỳnh, đốm vàng Chămpa, đốm ngà Đại Việt) sáng trên đảo lớn (diễn hoạ).
  const p1 = run("champello", 28);
  { const S: Pt[] = [[0, -30], [-20, 10]]; world.add(createGlows({ count: S.length, color: DICH, size: 17, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("champello") })); }
  { const S: Pt[] = [[40, -20], [60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 17, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.35 + i * 0.1, 0.5 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("champello") })); }
  { const S: Pt[] = [[10, 40], [70, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 17, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.65 + i * 0.1, 0.8 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("champello") })); }
  // 3. "san-ho": theo thanh kéo, các rạn san hô (vòng đốm xanh nhạt, vàng) lần lượt hiện quanh các đảo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["san-ho"] ?? 0) / 0.9);
  { const S: Pt[] = [[150, 0], [143, 41], [122, 77], [90, 104], [51, 118], [9, 118], [-30, 104], [-62, 77], [-83, 41], [-90, 0], [-83, -41], [-62, -77], [-30, -104], [9, -118], [51, -118], [90, -104], [122, -77], [143, -41]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("san-ho") })); }
  { const S: Pt[] = [[220, 90], [200, 125], [160, 125], [140, 90], [160, 55], [200, 55], [226, -60], [208, -29], [172, -29], [154, -60], [172, -91], [208, -91], [-26, -120], [-43, -91], [-77, -91], [-94, -120], [-77, -149], [-43, -149]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45 + i * 0.02, 0.6 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("san-ho") })); }
  // 4. "jeju": đốm vàng lớn (khu dự trữ sinh quyển) sáng giữa quần đảo; các đảo cùng sáng (diễn hoạ).
  const p3 = run("jeju", 28);
  { const S: Pt[] = [[30, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 28, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("jeju") })); }
  { const S: Pt[] = [[180, 90], [190, -60], [-80, 130], [-60, -120], [120, 180], [110, -170], [240, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("jeju") })); }
};

export default setup;
