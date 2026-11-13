import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VINH_MOC, CON_CO } from "./terrain";

type Pt = [number, number];

// Địa đạo Vịnh Mốc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["gioi-tuyen","dao-ham","ba-tang","su-song"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VINH_MOC, 40]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#1f4a52", shallow: "#5f9a92" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1965,
  });

  // 1. "gioi-tuyen": dọc sông Bến Hải (giới tuyến), đốm ngà; máy bay (đốm xanh nhạt) bay qua; lửa trên đồi (diễn hoạ).
  const p0 = run("gioi-tuyen", 28);
  { const S: Pt[] = [[-300, -160], [-229, -164], [-157, -167], [-86, -171], [-14, -174], [57, -178], [129, -181], [200, -185]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gioi-tuyen") })); }
  { const S: Pt[] = [[-300, 100], [-100, 67], [100, 33], [300, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.08, 0.35 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gioi-tuyen") })); }
  world.add(createFires({ sites: [[-60, 80], [100, 120], [-120, -40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("gioi-tuyen") * smoothstep(0.4, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "dao-ham": theo thanh kéo, dân làng (son) từ mặt đất xuống các cửa hầm; đốm ngà (đường hầm) hiện dần dưới làng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dao-ham"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2005, groups: [{ path: [[116, 64], [40, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[58, 118], [40, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[-19, 94], [40, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[-36, 16], [40, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[22, -38], [40, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[99, -14], [40, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dao-ham") }));
  { const S: Pt[] = [[-20, 40], [-3, 40], [13, 40], [30, 40], [47, 40], [63, 40], [80, 40], [97, 40], [113, 40], [130, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-ham") })); }
  // 3. "ba-tang": ba tầng đốm sáng (cách điệu) dưới làng; các cửa hầm (đốm vàng) mở ra biển và lên đồi; thuyền (chấm ngà) ra Cồn Cỏ (diễn hoạ).
  const p2 = run("ba-tang", 28);
  { const S: Pt[] = [[0, 30], [19, 30], [37, 30], [56, 30], [74, 30], [93, 30], [111, 30], [130, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  { const S: Pt[] = [[0, 45], [19, 45], [37, 45], [56, 45], [74, 45], [93, 45], [111, 45], [130, 45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.02, 0.35 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  { const S: Pt[] = [[0, 60], [19, 60], [37, 60], [56, 60], [74, 60], [93, 60], [111, 60], [130, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.02, 0.55 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  { const S: Pt[] = [[140, 20], [140, 50], [140, 80], [-10, 90], [10, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.05, 0.7000000000000001 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tang") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2065, groups: [{ path: [[160, 50], [310, 60]], count: 3, spread: [2,6], color: NGHIA, timing: [[0.6,0],[0.98,1]] }], progress: p2, visible: () => clock.near("ba-tang") }));
  // 4. "su-song": trong lòng đất, các hốc gia đình (đốm vàng nhỏ) sáng lên khi có việc; 17 đốm ngà nhỏ (17 em bé) lần lượt hiện (diễn hoạ).
  const p3 = run("su-song", 28);
  { const S: Pt[] = [[0, 40], [12, 40], [24, 40], [35, 40], [47, 40], [59, 40], [71, 40], [83, 40], [95, 40], [106, 40], [118, 40], [130, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("su-song") })); }
  { const S: Pt[] = [[10, 52], [17, 52], [24, 52], [31, 52], [38, 52], [44, 52], [51, 52], [58, 52], [65, 52], [72, 52], [79, 52], [86, 52], [93, 52], [99, 52], [106, 52], [113, 52], [120, 52]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.035, 0.4 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("su-song") })); }
};

export default setup;
