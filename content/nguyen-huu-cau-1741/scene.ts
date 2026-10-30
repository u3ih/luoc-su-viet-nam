import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LOI_DONG, DO_SON, KINH_BAC, THANG_LONG, VAN_DON, SON_NAM } from "./terrain";

type Pt = [number, number];

// Nguyễn Hữu Cầu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quan-he", "nguyen-cu", "do-son", "bi-bat"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LOI_DONG, 55], [DO_SON, 55], [VAN_DON, 55], [THANG_LONG, 55], [KINH_BAC, 55], [SON_NAM, 55]];

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
    seed: 1741,
  });

  // 1. "quan-he": các nhóm người (son) tụ về Lôi Động, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("quan-he", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1741, groups: [{ path: [[-160, 120], [-70, 80], LOI_DONG], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[120, -80], [70, -20], LOI_DONG], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("quan-he") }));
  { const S: Pt[] = [LOI_DONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-he") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(LOI_DONG, 28, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("quan-he") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "nguyen-cu": đoàn ngà đi từ Lôi Động ra Đồ Sơn, đốm vàng sáng ở Đồ Sơn (diễn hoạ).
  const p1 = run("nguyen-cu", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1751, groups: [{ path: [LOI_DONG, [100, -10], DO_SON], count: 28, spread: [28,50], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p1, visible: () => clock.near("nguyen-cu") }));
  { const S: Pt[] = [DO_SON]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-cu") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(DO_SON, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("nguyen-cu") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "do-son": đốm ngà lan dần từ Đồ Sơn sang Vân Đồn, Kinh Bắc, Thăng Long, Sơn Nam theo thanh kéo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["lan-rong"] ?? 0) / 0.9);
  { const S: Pt[] = [DO_SON, VAN_DON, KINH_BAC, THANG_LONG, SON_NAM]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.17, 0.16999999999999998 + i * 0.17, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-son") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1761, groups: [{ path: [DO_SON, [120, 100], VAN_DON], count: 14, spread: [26,40], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }, { path: [DO_SON, [40, 100], KINH_BAC], count: 14, spread: [26,40], color: NGHIA, size: 1.1, timing: [[0.14,0],[0.85,1]] }, { path: [DO_SON, [40, -100], SON_NAM], count: 14, spread: [26,40], color: NGHIA, size: 1.1, timing: [[0.24000000000000002,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("do-son") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(DO_SON, 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("do-son") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "bi-bat": một đoàn đi từ Đồ Sơn tới Thăng Long, đốm ngà mờ dần, đốm vàng sáng ở Thăng Long (diễn hoạ).
  const p3 = run("bi-bat", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1771, groups: [{ path: [DO_SON, [30, 10], THANG_LONG], count: 20, spread: [26,40], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }, { path: [[-100, 150], THANG_LONG], count: 14, spread: [26,40], color: DICH, size: 1.1, timing: [[0.14,0],[0.85,1]] }], progress: p3, visible: () => clock.near("bi-bat") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bi-bat") })); }
  { const S: Pt[] = [DO_SON]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bi-bat") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(THANG_LONG, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("bi-bat") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
