import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GAC_MA, CO_LIN, LEN_DAO } from "./terrain";

type Pt = [number, number];

// Gạc Ma — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cq-88","sang-14-3","ba-bai-da","tuong-niem"]);
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
    water: { deep: "#1d4a58", shallow: "#5f9aa0" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1988,
  });

  // 1. "cq-88": ba tàu vận tải (ngà) từ phía tây nam tới ba bãi đá; các tàu (xanh nhạt) từ phía đông bắc tới gần (diễn hoạ).
  const p0 = run("cq-88", 28);
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 2, seed: 1998, groups: [{ path: [[-380, -300], [-100, -60], [-10, -10]], count: 1, spread: [0,1], color: NGHIA, timing: [[0.02,0],[0.8,1]] }, { path: [[-380, -260], [-60, 40], [25, 100]], count: 1, spread: [0,1], color: NGHIA, timing: [[0.05,0],[0.85,1]] }, { path: [[-380, -340], [0, -60], [80, -20]], count: 1, spread: [0,1], color: NGHIA, timing: [[0.08,0],[0.9,1]] }], progress: p0, visible: () => clock.near("cq-88") }));
  world.add(createCrowd({ glow: true, size: 11, height: (x, z) => ground(x, z) + 2, seed: 2008, groups: [{ path: [[380, 300], [150, 80], [60, 30]], count: 4, spread: [8,20], color: DICH, timing: [[0.3,0],[0.95,1]] }], progress: p0, visible: () => clock.near("cq-88") }));
  // 2. "sang-14-3": theo thanh kéo, các chiến sĩ (son) từ tàu xuống bãi đá Gạc Ma, đứng thành vòng quanh đốm vàng (lá cờ) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["sang-14-3"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 2018, groups: [{ path: [[-30, -20], [-5, -5], [7, 0], [6, 4], [2, 7], [-2, 7], [-6, 4], [-7, 0], [-6, -4], [-2, -7], [2, -7], [6, -4], [7, 0]], count: 12, spread: [0,1], color: SON, timing: [[0.02,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("sang-14-3") }));
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sang-14-3") })); }
  // 3. "ba-bai-da": lửa trên các tàu vận tải; đốm vàng ở Gạc Ma tắt, đốm xanh nhạt sáng; đốm ngà vẫn sáng ở các bãi đá khác (diễn hoạ).
  const p2 = run("ba-bai-da", 28);
  world.add(createFires({ sites: [[-10, -10], [25, 100], [80, -20]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ba-bai-da") * smoothstep(0.05, 0.9, p2()), size: 4, glow: () => 0.8 }));
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.3, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-bai-da") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-bai-da") })); }
  { const S: Pt[] = [[90, -10], [30, 110]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.1, 0.75 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-bai-da") })); }
  // 4. "tuong-niem": sáu mươi tư đốm vàng nhỏ (hoa đăng) toả thành vòng trên mặt biển quanh Gạc Ma (diễn hoạ).
  const p3 = run("tuong-niem", 28);
  { const S: Pt[] = [[30, 0], [29, 8], [25, 16], [20, 23], [12, 27], [4, 30], [-4, 30], [-12, 27], [-20, 23], [-25, 16], [-29, 8], [-30, 0], [-29, -8], [-25, -16], [-20, -23], [-12, -27], [-4, -30], [4, -30], [12, -27], [20, -23], [25, -16], [29, -8], [44, 7], [40, 19], [33, 29], [24, 37], [12, 42], [0, 44], [-13, 42], [-24, 37], [-33, 29], [-40, 18], [-44, 6], [-44, -7], [-40, -19], [-33, -29], [-24, -37], [-12, -42], [0, -44], [13, -42], [24, -37], [33, -29], [40, -18], [44, -6], [55, 17], [47, 33], [35, 46], [19, 55], [1, 58], [-17, 55], [-33, 47], [-46, 35], [-55, 19], [-58, 1], [-55, -17], [-47, -33], [-35, -46], [-19, -55], [-1, -58], [17, -55], [33, -47], [46, -35], [55, -19], [58, -1]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.012, 0.2 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuong-niem") })); }
};

export default setup;
