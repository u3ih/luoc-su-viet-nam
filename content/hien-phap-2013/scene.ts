import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI } from "./terrain";

type Pt = [number, number];

// Hiến pháp năm 2013 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-hien-phap","lay-y-kien","tranh-luan","thong-qua"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 48]];

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
    seed: 2013,
  });

  // 1. "nam-hien-phap": năm đốm vàng lần lượt sáng theo hàng (1946, 1959, 1980, 1992, 2013) (diễn hoạ).
  const p0 = run("nam-hien-phap", 28);
  { const S: Pt[] = [[-80, 40], [-30, 40], [20, 40], [70, 40], [120, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.15, 0.2 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-hien-phap") })); }
  // 2. "lay-y-kien": theo thanh kéo, đốm ngà (ý kiến) từ khắp nơi bay về Hà Nội (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lay-y-kien"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 6, seed: 2033, groups: [{ path: [[348, 73], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[266, 260], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[90, 362], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[-113, 342], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[-265, 206], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[-308, 7], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[-226, -180], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[-50, -282], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[153, -262], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }, { path: [[305, -126], [20, 40]], count: 8, spread: [6,30], color: NGHIA, timing: [[0.02,0],[0.9,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lay-y-kien") }));
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lay-y-kien") })); }
  // 3. "tranh-luan": nhiều nhóm (ngà, xanh nhạt, son) đứng riêng quanh Hà Nội — những ý kiến khác nhau (diễn hoạ).
  const p2 = run("tranh-luan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2053, groups: [{ path: [[-58, 120], [-62, 133], [-73, 141], [-87, 141], [-98, 133], [-102, 120], [-98, 107], [-87, 99], [-73, 99], [-62, 107], [-58, 120]], count: 30, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }, { path: [[142, 120], [138, 133], [127, 141], [113, 141], [102, 133], [98, 120], [102, 107], [113, 99], [127, 99], [138, 107], [142, 120]], count: 30, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }, { path: [[-58, -40], [-62, -27], [-73, -19], [-87, -19], [-98, -27], [-102, -40], [-98, -53], [-87, -61], [-73, -61], [-62, -53], [-58, -40]], count: 30, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[142, -40], [138, -27], [127, -19], [113, -19], [102, -27], [98, -40], [102, -53], [113, -61], [127, -61], [138, -53], [142, -40]], count: 30, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("tranh-luan") }));
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tranh-luan") })); }
  // 4. "thong-qua": đại biểu (ngà) về hội trường (đốm vàng); 120 đốm nhỏ (120 điều) sáng thành vòng (diễn hoạ).
  const p3 = run("thong-qua", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2073, groups: [{ path: [[149, 95], [20, 40]], count: 12, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.6,0.85]] }, { path: [[37, 179], [20, 40]], count: 12, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.6,0.85]] }, { path: [[-92, 124], [20, 40]], count: 12, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.6,0.85]] }, { path: [[-109, -15], [20, 40]], count: 12, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.6,0.85]] }, { path: [[3, -99], [20, 40]], count: 12, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.6,0.85]] }, { path: [[132, -44], [20, 40]], count: 12, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.6,0.85]] }], progress: p3, visible: () => clock.near("thong-qua") }));
  { const S: Pt[] = [[60, 40], [60, 46], [58, 52], [56, 58], [52, 64], [48, 68], [44, 72], [38, 76], [32, 78], [26, 80], [20, 80], [14, 80], [8, 78], [2, 76], [-4, 72], [-8, 68], [-12, 64], [-16, 58], [-18, 52], [-20, 46], [-20, 40], [-20, 34], [-18, 28], [-16, 22], [-12, 16], [-8, 12], [-4, 8], [2, 4], [8, 2], [14, 0], [20, 0], [26, 0], [32, 2], [38, 4], [44, 8], [48, 12], [52, 16], [56, 22], [58, 28], [60, 34], [72, 43], [71, 51], [69, 59], [65, 66], [60, 73], [55, 79], [48, 84], [41, 87], [34, 90], [26, 92], [17, 92], [9, 91], [1, 89], [-6, 85], [-13, 80], [-19, 75], [-24, 68], [-27, 61], [-30, 54], [-32, 46], [-32, 37], [-31, 29], [-29, 21], [-25, 14], [-20, 7], [-15, 1], [-8, -4], [-1, -7], [6, -10], [14, -12], [23, -12], [31, -11], [39, -9], [46, -5], [53, 0], [59, 5], [64, 12], [67, 19], [70, 26], [72, 34], [84, 46], [82, 56], [79, 66], [74, 75], [68, 83], [61, 90], [52, 95], [43, 100], [34, 103], [24, 104], [14, 104], [4, 102], [-6, 99], [-15, 94], [-23, 88], [-30, 81], [-35, 72], [-40, 63], [-43, 54], [-44, 44], [-44, 34], [-42, 24], [-39, 14], [-34, 5], [-28, -3], [-21, -10], [-12, -15], [-3, -20], [6, -23], [16, -24], [26, -24], [36, -22], [46, -19], [55, -14], [63, -8], [70, -1], [75, 8], [80, 17], [83, 26], [84, 36]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.003, 0.65 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-qua") })); }
};

export default setup;
