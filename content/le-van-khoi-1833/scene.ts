import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHIEN_AN, HUE, BIEN_HOA, DINH_TUONG } from "./terrain";

type Pt = [number, number];

// Thành Phiên An — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh", "dem-khoi-su", "phan-cong", "thanh-that-thu"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHIEN_AN, 55], [HUE, 55], [BIEN_HOA, 55], [DINH_TUONG, 55]];

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
    seed: 1833,
  });

  // 1. "boi-canh": một đoàn xanh nhạt từ phía bắc đi vào Phiên An, các nhóm người (son) đứng quanh, lửa bật dần (diễn hoạ).
  const p0 = run("boi-canh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1833, groups: [{ path: [HUE, [-30, 200], [10, 80], PHIEN_AN], count: 16, spread: [28,40], color: DICH, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1834, groups: [{ path: [[-100, 40], [-30, -10], PHIEN_AN], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[130, 60], [70, 10], PHIEN_AN], count: 12, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  { const S: Pt[] = [PHIEN_AN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("boi-canh") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(PHIEN_AN, 32, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("boi-canh") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "dem-khoi-su": các nhóm người (son) tụ về quanh thành Phiên An theo thanh kéo, lửa bật dần (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["vay-thanh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1843, groups: [{ path: [[-200, 100], [-90, 40], PHIEN_AN], count: 20, spread: [26,50], color: SON, timing: [[0,0],[1,0.95]] }, { path: [[200, -100], [100, -50], PHIEN_AN], count: 16, spread: [26,50], color: SON, timing: [[0,0],[1,0.95]] }, { path: [[60, 200], [40, 90], PHIEN_AN], count: 14, spread: [26,50], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dem-khoi-su") }));
  { const S: Pt[] = [PHIEN_AN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-khoi-su") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(PHIEN_AN, 32, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: (ctx) => clock.near("dem-khoi-su") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "phan-cong": các đốm ngà sáng ở Biên Hoà, Định Tường, rồi các đoàn xanh nhạt từ phía bắc và tây tiến về Phiên An (diễn hoạ).
  const p2 = run("phan-cong", 28);
  { const S: Pt[] = [BIEN_HOA, DINH_TUONG, PHIEN_AN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phan-cong") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1853, groups: [{ path: [HUE, [10, 200], [30, 70], PHIEN_AN], count: 28, spread: [30,60], color: DICH, size: 1.1, timing: [[0.2,0],[1,0.95]] }, { path: [DINH_TUONG, [-80, -130], PHIEN_AN], count: 16, spread: [30,50], color: DICH, size: 1.1, timing: [[0.3,0],[1,0.95]] }], progress: p2, visible: () => clock.near("phan-cong") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHIEN_AN, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("phan-cong") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "thanh-that-thu": đoàn xanh nhạt vây quanh Phiên An, ánh sáng ngà ở thành mờ dần, rồi một quầng vàng dịu (diễn hoạ).
  const p3 = run("thanh-that-thu", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1863, groups: [{ path: [[-100, 120], [-30, 50], PHIEN_AN], count: 20, spread: [34,50], color: DICH, size: 1.1, timing: [[0.04,0],[0.85,1]] }, { path: [[160, -120], [80, -60], PHIEN_AN], count: 16, spread: [34,50], color: DICH, size: 1.1, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("thanh-that-thu") }));
  { const S: Pt[] = [PHIEN_AN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-that-thu") })); }
  { const S: Pt[] = [PHIEN_AN]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0, 0.85 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-that-thu") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHIEN_AN, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("thanh-that-thu") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
