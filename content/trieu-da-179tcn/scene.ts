import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NAM_HAI, PHIEN_NGUNG, CO_LOA, CUU_CHAN } from "./terrain";

type Pt = [number, number];

// Triệu Đà và Âu Lạc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["trieu-da", "nam-viet", "chiem-au-lac", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NAM_HAI, 55], [PHIEN_NGUNG, 55], [CO_LOA, 55], [CUU_CHAN, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 179,
  });

  // 1. "trieu-da": các nhóm người (son) tụ về Nam Hải, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("trieu-da", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 179, groups: [{ path: [[-330, 330], [-300, 280], NAM_HAI], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-150, 150], [-220, 180], NAM_HAI], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("trieu-da") }));
  { const S: Pt[] = [NAM_HAI]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trieu-da") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(NAM_HAI, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("trieu-da") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "nam-viet": đoàn người (son) đi từ Nam Hải về Phiên Ngung, đốm vàng sáng ở Phiên Ngung, lửa bật dần (diễn hoạ).
  const p1 = run("nam-viet", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 189, groups: [{ path: [NAM_HAI, [-170, 270], PHIEN_NGUNG], count: 26, spread: [28,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p1, visible: () => clock.near("nam-viet") }));
  { const S: Pt[] = [PHIEN_NGUNG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-viet") })); }
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring(PHIEN_NGUNG, 34, (i / 7) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("nam-viet") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "chiem-au-lac": đoàn xanh nhạt (quân từ phía bắc) tiến từ Phiên Ngung xuống Cổ Loa theo thanh kéo, người ở Cổ Loa (son) đứng yên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 199, groups: [{ path: [PHIEN_NGUNG, [-20, 170], [50, 70], CO_LOA], count: 32, spread: [30,70], color: DICH, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chiem-au-lac") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 200, groups: [{ path: [[60, -30], CO_LOA], count: 16, spread: [30,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chiem-au-lac") }));
  { const S: Pt[] = [CO_LOA]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chiem-au-lac") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(CO_LOA, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("chiem-au-lac") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": quầng vàng dịu ở Cổ Loa, các nhóm người (son) đến đứng lặng, lửa bật dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [CO_LOA]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 209, groups: [{ path: [[-60, 60], [30, 10], CO_LOA], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [CUU_CHAN, [0, -130], CO_LOA], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(CO_LOA, 38, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
