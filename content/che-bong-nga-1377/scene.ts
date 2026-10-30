import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DO_BAN, THANG_LONG, HAI_TRIEU, NGHE_AN } from "./terrain";

type Pt = [number, number];

// Chế Bồng Nga — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["che-bong-nga", "thang-long-1371", "do-ban-1377", "hai-trieu-1390"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DO_BAN, 55], [THANG_LONG, 55], [HAI_TRIEU, 55], [NGHE_AN, 55]];

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
    seed: 1377,
  });

  // 1. "che-bong-nga": các nhóm người (son) tụ về Đồ Bàn, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("che-bong-nga", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1377, groups: [{ path: [[-300, -150], [-150, -220], DO_BAN], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[200, -60], [190, -160], DO_BAN], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("che-bong-nga") }));
  { const S: Pt[] = [DO_BAN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("che-bong-nga") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(DO_BAN, 32, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("che-bong-nga") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "thang-long-1371": đoàn xanh nhạt từ phía nam tiến lên Thăng Long, đốm vàng sáng ở Thăng Long, lửa bật dần (diễn hoạ).
  const p1 = run("thang-long-1371", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1387, groups: [{ path: [DO_BAN, [100, -100], [20, 100], THANG_LONG], count: 28, spread: [30,70], color: DICH, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p1, visible: () => clock.near("thang-long-1371") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thang-long-1371") })); }
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring(THANG_LONG, 34, (i / 7) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("thang-long-1371") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "do-ban-1377": đoàn xanh nhạt từ phía bắc tiến về Đồ Bàn theo thanh kéo, người giữ thành (son) đứng ở Đồ Bàn (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1397, groups: [{ path: [THANG_LONG, [0, 200], [100, -60], DO_BAN], count: 34, spread: [30,70], color: DICH, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("do-ban-1377") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1398, groups: [{ path: [[170, -210], DO_BAN], count: 18, spread: [30,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("do-ban-1377") }));
  { const S: Pt[] = [DO_BAN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-ban-1377") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(DO_BAN, 36, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("do-ban-1377") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "hai-trieu-1390": một đoàn (son) đi dọc sông Hải Triều, đốm ngà sáng rồi tắt dần giữa sông, đốm vàng nhỏ ở hai bờ (diễn hoạ).
  const p3 = run("hai-trieu-1390", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1407, groups: [{ path: [[-250, 150], [-60, 120], HAI_TRIEU, [200, 40]], count: 22, spread: [40,60], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p3, visible: () => clock.near("hai-trieu-1390") }));
  { const S: Pt[] = [HAI_TRIEU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-trieu-1390") })); }
  { const S: Pt[] = [[60, 190], [150, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.2, 0.35 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-trieu-1390") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(HAI_TRIEU, 38, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("hai-trieu-1390") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
