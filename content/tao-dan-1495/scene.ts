import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, DONG } from "./terrain";

type Pt = [number, number];

// Hội Tao Đàn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Hoàng thành cách điệu.
const WALLS: Wall[] = [
  { at: square(0, 30, 60, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["duoc-mua","xuong-hoa","noi-dung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 80]];

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
    seed: 1495,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "duoc-mua": người (son) gặt lúa trên đồng; chín đốm vàng (chín bài thơ của vua) sáng ở kinh thành (diễn hoạ).
  const p0 = run("duoc-mua", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1505, groups: [{ path: [[-300, -200], [-150, -100]], count: 24, spread: [80,40], color: SON, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("duoc-mua") }));
  { const S: Pt[] = [[20, 30], [15, 43], [3, 50], [-10, 47], [-19, 37], [-19, 23], [-10, 13], [3, 10], [15, 17]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("duoc-mua") })); }
  // 2. "xuong-hoa": đốm vàng (vua) giữa vòng 28 đốm ngà (28 vị); các đốm vàng nhỏ (bài họa) lần lượt sáng quanh theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xuong-hoa"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuong-hoa") })); }
  { const S: Pt[] = [[24, 30], [23, 35], [22, 40], [19, 45], [15, 49], [10, 52], [5, 53], [0, 54], [-5, 53], [-10, 52], [-15, 49], [-19, 45], [-22, 40], [-23, 35], [-24, 30], [-23, 25], [-22, 20], [-19, 15], [-15, 11], [-10, 8], [-5, 7], [0, 6], [5, 7], [10, 8], [15, 11], [19, 15], [22, 20], [23, 25]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.008, 0.15 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuong-hoa") })); }
  { const S: Pt[] = [[34, 33], [31, 44], [25, 53], [17, 59], [7, 63], [-3, 64], [-14, 61], [-23, 55], [-29, 47], [-33, 37], [-34, 27], [-31, 16], [-25, 7], [-17, 1], [-7, -3], [3, -4], [14, -1], [23, 5], [29, 13], [33, 23], [43, 39], [39, 50], [33, 59], [24, 67], [14, 72], [3, 74], [-9, 73], [-20, 69], [-29, 63], [-37, 54], [-42, 44], [-44, 33], [-43, 21], [-39, 10], [-33, 1], [-24, -7], [-14, -12], [-3, -14], [9, -13], [20, -9], [29, -3], [37, 6], [42, 16], [44, 27]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.15 + i * 0.018, 0.3 + i * 0.018, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuong-hoa") })); }
  // 3. "noi-dung": bốn đốm màu (bốn mùa) và mười hai đốm nhỏ (mười hai tháng) xoay vòng quanh kinh thành (diễn hoạ).
  const p2 = run("noi-dung", 28);
  { const S: Pt[] = [[80, 30], [0, 110], [-80, 30], [0, -50]]; world.add(createGlows({ count: S.length, color: "#c8e07a", size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-dung") })); }
  { const S: Pt[] = [[109, 44], [87, 97], [42, 132], [-14, 139], [-67, 117], [-102, 72], [-109, 16], [-87, -37], [-42, -72], [14, -79], [67, -57], [102, -12]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.04, 0.55 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-dung") })); }
  // 4. "ve-sau": các đốm vàng nhỏ (các tập thơ) gom lại thành một khối lớn (bộ Thiên Nam dư hạ tập) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-18, 12], [-14, 12], [-10, 12], [-6, 12], [-2, 12], [2, 12], [6, 12], [10, 12], [14, 12], [18, 12], [-18, 16], [-14, 16], [-10, 16], [-6, 16], [-2, 16], [2, 16], [6, 16], [10, 16], [14, 16], [18, 16], [-18, 20], [-14, 20], [-10, 20], [-6, 20], [-2, 20], [2, 20], [6, 20], [10, 20], [14, 20], [18, 20], [-18, 24], [-14, 24], [-10, 24], [-6, 24], [-2, 24], [2, 24], [6, 24], [10, 24], [14, 24], [18, 24], [-18, 28], [-14, 28], [-10, 28], [-6, 28], [-2, 28], [2, 28], [6, 28], [10, 28], [14, 28], [18, 28], [-18, 32], [-14, 32], [-10, 32], [-6, 32], [-2, 32], [2, 32], [6, 32], [10, 32], [14, 32], [18, 32], [-18, 36], [-14, 36], [-10, 36], [-6, 36], [-2, 36], [2, 36], [6, 36], [10, 36], [14, 36], [18, 36], [-18, 40], [-14, 40], [-10, 40], [-6, 40], [-2, 40], [2, 40], [6, 40], [10, 40], [14, 40], [18, 40], [-18, 44], [-14, 44], [-10, 44], [-6, 44], [-2, 44], [2, 44], [6, 44], [10, 44], [14, 44], [18, 44], [-18, 48], [-14, 48], [-10, 48], [-6, 48], [-2, 48], [2, 48], [6, 48], [10, 48], [14, 48], [18, 48]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.007, 0.2 + i * 0.007, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
