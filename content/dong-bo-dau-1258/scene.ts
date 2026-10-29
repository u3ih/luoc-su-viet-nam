import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SONG_THAO, BINH_LE, DONG_BO_DAU, THANG_LONG, THIEN_MAC } from "./terrain";

type Pt = [number, number];

// Đông Bộ Đầu 1258 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh", "binh-le", "dong-bo-dau", "sau-tran"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 55], [DONG_BO_DAU, 55], [BINH_LE, 55], [SONG_THAO, 55], [THIEN_MAC, 55]];

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
    seed: 1258,
  });

  // 1. "boi-canh": đoàn xanh nhạt (quân Mông Cổ) từ vùng đồi phía tây bắc xuống đồng bằng; một đốm ngà sáng ở Thăng Long (diễn hoạ).
  const p0 = run("boi-canh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1258, groups: [{ path: [SONG_THAO, [-190, 330], [-130, 270], BINH_LE], count: 30, spread: [30,70], color: DICH, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("boi-canh") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(THANG_LONG, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("boi-canh") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "binh-le": đoàn ngà (quân Trần) tập hợp ở Bình Lệ Nguyên, đoàn xanh nhạt tiến tới, đoàn ngà rút dần về phía Thăng Long rồi bỏ thành (diễn hoạ).
  const p1 = run("binh-le", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1268, groups: [{ path: [[-30, 260], BINH_LE, [-40, 170], THANG_LONG, [60, -30]], count: 30, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.05,0.1],[0.3,0.25],[0.9,1]] }], progress: p1, visible: () => clock.near("binh-le") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1269, groups: [{ path: [[-200, 330], [-120, 280], BINH_LE, [-20, 150], THANG_LONG], count: 30, spread: [30,70], color: DICH, size: 1.1, timing: [[0.2,0],[0.9,1]] }], progress: p1, visible: () => clock.near("binh-le") }));
  { const S: Pt[] = [BINH_LE]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-le") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(BINH_LE, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("binh-le") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "dong-bo-dau": đoàn thuyền ngà ngược sông tới bến Đông Bộ Đầu theo thanh kéo, đoàn xanh nhạt ở Thăng Long mờ dần rồi rút về phía tây bắc (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["phan-cong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1278, groups: [{ path: [THIEN_MAC, [190, -100], [150, -40], DONG_BO_DAU], count: 30, spread: [30,50], color: NGHIA, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dong-bo-dau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1279, groups: [{ path: [THANG_LONG, [-60, 130], [-170, 280]], count: 24, spread: [30,50], color: DICH, size: 1.1, timing: [[0.5,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dong-bo-dau") }));
  { const S: Pt[] = [DONG_BO_DAU]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.2 + i * 0, 0.35 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-bo-dau") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(DONG_BO_DAU, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("dong-bo-dau") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "sau-tran": quầng ngà dịu ở Thăng Long, các nhóm người (son) trở về đứng quanh, lửa bật dần (diễn hoạ).
  const p3 = run("sau-tran", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1288, groups: [{ path: [[-100, 150], [-40, 100], THANG_LONG], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[130, -60], [70, 20], THANG_LONG], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("sau-tran") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-tran") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(THANG_LONG, 38, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("sau-tran") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
