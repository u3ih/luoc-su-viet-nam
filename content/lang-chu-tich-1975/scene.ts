import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BA_DINH, LANG, VUON } from "./terrain";

type Pt = [number, number];

// Lăng Chủ tịch Hồ Chí Minh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Khối lăng (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(-30, 0, 20, 0), base: 9, top: 6, height: 9, gates: [{ at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["di-chuc","khoi-cong","ba-lop","vuon"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BA_DINH, 72], [VUON, 24]];

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
    seed: 19752,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("khoi-cong") + 0.5 ? 1 : ctx.t > world.beat("khoi-cong") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["khoi-cong"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8d8f8c", top: "#6f7270" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "di-chuc": ba đốm ngà (ba miền) mờ dần; một đốm vàng ở giữa quảng trường sáng lên; người (son) đứng lặng quanh (diễn hoạ).
  const p0 = run("di-chuc", 28);
  { const S: Pt[] = [[-60, 160], [-60, 0], [-60, -160]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.05, 0.16999999999999998 + i * 0.05, k) * (1 - smoothstep(0.4, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-chuc") })); }
  { const S: Pt[] = [[-30, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-chuc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 19782, groups: [{ path: [[20, 60], [100, 60], [100, -60], [20, -60], [20, 60]], count: 80, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("di-chuc") }));
  // 2. "khoi-cong": theo thanh kéo, khối lăng (tường thấp) đắp lên ở chỗ lễ đài cũ; thợ (son) làm việc quanh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoi-cong"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 19792, groups: [{ path: [[4, 0], [-2, 20], [-19, 32], [-41, 32], [-58, 20], [-64, 0], [-58, -20], [-41, -32], [-19, -32], [-2, -20], [4, 0]], count: 40, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoi-cong") }));
  { const S: Pt[] = [[-30, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.4, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  // 3. "ba-lop": ba lớp đốm sáng chồng lên trên khối lăng (thềm, thân, mái — cách điệu) (diễn hoạ).
  const p2 = run("ba-lop", 28);
  { const S: Pt[] = [[-6, 0], [-9, 12], [-18, 21], [-30, 24], [-42, 21], [-51, 12], [-54, 0], [-51, -12], [-42, -21], [-30, -24], [-18, -21], [-9, -12]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.01, 0.2 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-lop") })); }
  { const S: Pt[] = [[-13, 3], [-19, 13], [-28, 17], [-38, 15], [-45, 7], [-47, -3], [-41, -13], [-32, -17], [-22, -15], [-15, -7]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.01, 0.44999999999999996 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-lop") })); }
  { const S: Pt[] = [[-21, 4], [-26, 9], [-34, 9], [-39, 4], [-39, -4], [-34, -9], [-26, -9], [-21, -4]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.01, 0.7000000000000001 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-lop") })); }
  // 4. "vuon": vườn cây ba miền (đốm xanh nhạt nhỏ) quanh lăng; dòng người viếng (ngà) đi qua quảng trường (diễn hoạ).
  const p3 = run("vuon", 28);
  { const S: Pt[] = [[30, 6], [19, 35], [-5, 55], [-36, 60], [-65, 49], [-85, 25], [-90, -6], [-79, -35], [-55, -55], [-24, -60], [5, -49], [25, -25], [46, 24], [29, 54], [-1, 74], [-36, 80], [-70, 69], [-96, 45], [-109, 12], [-106, -24], [-89, -54], [-59, -74], [-24, -80], [10, -69], [36, -45], [49, -12]]; world.add(createGlows({ count: S.length, color: "#9be37a", size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 19852, groups: [{ path: [[120, -80], [60, -40], [20, -10], [10, 10], [60, 40], [120, 80]], count: 60, spread: [1,3], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: p3, visible: () => clock.near("vuon") }));
};

export default setup;
