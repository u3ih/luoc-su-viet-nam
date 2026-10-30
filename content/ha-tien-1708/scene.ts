import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NAM_VANG, CANG_KHAU, KAMPOT, CA_MAU } from "./terrain";

type Pt = [number, number];

// Hà Tiên 1708 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["mac-cuu", "lap-ha-tien", "quy-phuc", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CANG_KHAU, 55], [KAMPOT, 55], [CA_MAU, 55], [NAM_VANG, 55]];

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
    seed: 1708,
  });

  // 1. "mac-cuu": các nhóm người (son) tụ về Nam Vang quanh một đốm ngà (Mạc Cửu), lửa bật dần (diễn hoạ).
  const p0 = run("mac-cuu", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1708, groups: [{ path: [[-300, 260], [-250, 200], NAM_VANG], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-100, 60], [-150, 110], NAM_VANG], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p0, visible: () => clock.near("mac-cuu") }));
  { const S: Pt[] = [NAM_VANG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mac-cuu") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(NAM_VANG, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("mac-cuu") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "lap-ha-tien": đoàn ngà cùng các nhóm người (son) đi từ Nam Vang ra bờ biển tới Cảng Khẩu; đốm ngà sáng ở Cảng Khẩu (diễn hoạ).
  const p1 = run("lap-ha-tien", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1718, groups: [{ path: [NAM_VANG, [-60, 90], [100, 30], CANG_KHAU], count: 24, spread: [28,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [NAM_VANG, [-60, 90], [100, 30], CANG_KHAU], count: 6, spread: [16,20], color: NGHIA, timing: [[0.09,0],[0.85,1]] }], progress: p1, visible: () => clock.near("lap-ha-tien") }));
  { const S: Pt[] = [CANG_KHAU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lap-ha-tien") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(CANG_KHAU, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("lap-ha-tien") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "quy-phuc": bảy đốm vàng (bảy xã thôn) hiện dần dọc bờ biển theo thanh kéo, từ Kampot xuống Cà Mau (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["lap-xa"] ?? 0) / 0.9);
  { const S: Pt[] = [[200, 300], [220, 210], [225, 110], [225, 10], [225, -100], [210, -210], [195, -310]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quy-phuc") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1728, groups: [{ path: [[100, 250], CANG_KHAU], count: 12, spread: [24,30], color: SON, timing: [[0,0],[1,0.95]] }, { path: [[100, -250], CANG_KHAU], count: 12, spread: [24,30], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("quy-phuc") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(CANG_KHAU, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("quy-phuc") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": quầng vàng dịu ở Cảng Khẩu, các nhóm người (son) đến đứng lặng, lửa bật dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [CANG_KHAU]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1738, groups: [{ path: [[40, 90], [130, 40], CANG_KHAU], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[60, -80], [140, -30], CANG_KHAU], count: 12, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(CANG_KHAU, 38, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
