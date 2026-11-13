import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG_A, LANG_B, LANG_C, BEN_DUOC } from "./terrain";

type Pt = [number, number];

// Địa đạo Củ Chi — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ham-dau","xuong-song","ba-tang","di-tich"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG_A, 32], [LANG_B, 32], [LANG_C, 32], [BEN_DUOC, 32]];

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
    seed: 1948,
  });

  // 1. "ham-dau": dân làng (son) đào những đoạn hầm ngắn quanh làng (đốm ngà sát mặt đất) (diễn hoạ).
  const p0 = run("ham-dau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1958, groups: [{ path: [[-126, 60], [-131, 74], [-143, 83], [-157, 83], [-169, 74], [-174, 60], [-169, 46], [-157, 37], [-143, 37], [-131, 46], [-126, 60]], count: 30, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("ham-dau") }));
  { const S: Pt[] = [[-121, 69], [-150, 90], [-178, 70], [-168, 36], [-133, 35]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ham-dau") })); }
  // 2. "xuong-song": theo thanh kéo, chuỗi đốm vàng (đường xương sống) nối các làng rồi toả nhánh ra tới sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xuong-song"] ?? 0) / 0.9);
  { const S: Pt[] = [[-150, 60], [-127, 63], [-104, 66], [-81, 69], [-58, 72], [-35, 75], [-12, 78], [11, 75], [32, 66], [54, 57], [75, 48], [97, 38], [118, 29], [140, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuong-song") })); }
  { const S: Pt[] = [[0, 80], [-10, 50], [-20, 20], [-30, -10], [-40, -40], [-50, -70], [-60, -100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.04, 0.6 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuong-song") })); }
  { const S: Pt[] = [[140, 20], [160, -7], [180, -33], [200, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.05, 0.85 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuong-song") })); }
  // 3. "ba-tang": ba tầng đốm sáng (ngà, vàng) chồng nhau dưới làng Bến Dược — cách điệu; người (son) lom khom đi trong hầm (diễn hoạ).
  const p2 = run("ba-tang", 28);
  { const S: Pt[] = [[110, 20], [120, 20], [130, 20], [140, 20], [150, 20], [160, 20], [170, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  { const S: Pt[] = [[110, 30], [120, 30], [130, 30], [140, 30], [150, 30], [160, 30], [170, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.03, 0.44999999999999996 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  { const S: Pt[] = [[110, 40], [120, 40], [130, 40], [140, 40], [150, 40], [160, 40], [170, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.03, 0.7000000000000001 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  world.add(createCrowd({ size: 3, height: ground, seed: 2038, groups: [{ path: [[110, 20], [170, 20]], count: 8, spread: [1,2], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p2, visible: () => clock.near("ba-tang") }));
  // 4. "di-tich": khách tham quan (ngà) từ bến sông vào khu di tích (đốm vàng) (diễn hoạ).
  const p3 = run("di-tich", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2048, groups: [{ path: [[200, -60], [140, 20]], count: 50, spread: [3,10], color: NGHIA, timing: [[0.02,0],[0.8,1]] }], progress: p3, visible: () => clock.near("di-tich") }));
  { const S: Pt[] = [[140, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-tich") })); }
};

export default setup;
