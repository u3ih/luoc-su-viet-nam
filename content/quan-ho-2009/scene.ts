import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG_A, LANG_B, LANG_C } from "./terrain";

type Pt = [number, number];

// Dân ca Quan họ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["song-cau","lang-quan-ho","lan-dieu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG_A, 24], [LANG_B, 24], [LANG_C, 24]];

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

  // 1. "song-cau": thuyền (chấm ngà) xuôi sông Cầu; người (son) hai bờ (diễn hoạ).
  const p0 = run("song-cau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2019, groups: [{ path: [[-400, 60], [-200, 120], [0, 40], [200, -40], [400, 20]], count: 6, spread: [6,300], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("song-cau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2029, groups: [{ path: [[-160, 170], [-100, 160]], count: 14, spread: [60,20], color: SON, timing: [[0,1],[1,1]] }, { path: [[40, 110], [100, 100]], count: 14, spread: [60,20], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("song-cau") }));
  // 2. "lang-quan-ho": theo thanh kéo, 49 đốm vàng (49 làng quan họ) lần lượt sáng dọc hai bờ sông Cầu (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lang-quan-ho"] ?? 0) / 0.9);
  { const S: Pt[] = [[-380, 110], [-350, 120], [-320, 130], [-290, 140], [-260, 150], [-230, 160], [-200, 170], [-167, 157], [-133, 143], [-100, 130], [-67, 117], [-33, 103], [0, 90], [33, 77], [67, 63], [100, 50], [133, 37], [167, 23], [200, 10], [230, 20], [260, 30], [290, 40], [320, 50], [350, 60], [380, 70], [-380, 10], [-349, 20], [-317, 31], [-286, 41], [-255, 52], [-223, 62], [-191, 67], [-157, 53], [-122, 39], [-87, 25], [-52, 11], [-17, -3], [17, -17], [52, -31], [87, -45], [122, -59], [157, -73], [191, -87], [223, -82], [255, -72], [286, -61], [317, -51], [349, -40], [380, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.018, 0.16999999999999998 + i * 0.018, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lang-quan-ho") })); }
  // 3. "lan-dieu": hai hàng chấm đối nhau (liền anh ngà, liền chị son) hát đối; đốm vàng nhỏ (câu hát) bay qua lại (diễn hoạ).
  const p2 = run("lan-dieu", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2049, groups: [{ path: [[45, 95], [75, 95]], count: 4, spread: [24,4], color: NGHIA, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("lan-dieu") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 2059, groups: [{ path: [[45, 80], [75, 80]], count: 4, spread: [24,4], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("lan-dieu") }));
  world.add(createCrowd({ glow: true, size: 3, height: (x, z) => ground(x, z) + 4, seed: 2069, groups: [{ path: [[60, 94], [60, 82], [60, 94], [60, 82], [60, 94]], count: 3, spread: [10,4], color: GOLD, timing: [[0.05,0],[1,1]] }], progress: p2, visible: () => clock.near("lan-dieu") }));
  // 4. "ve-sau": cả dải làng sáng; một đốm vàng lớn (ghi danh) trên sông (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-380, 110], [-350, 120], [-320, 130], [-290, 140], [-260, 150], [-230, 160], [-200, 170], [-167, 157], [-133, 143], [-100, 130], [-67, 117], [-33, 103], [0, 90], [33, 77], [67, 63], [100, 50], [133, 37], [167, 23], [200, 10], [230, 20], [260, 30], [290, 40], [320, 50], [350, 60], [380, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 42, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
