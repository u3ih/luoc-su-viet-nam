import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_XUAN, LUY_NHAT_LE, PHIA_BAC, LUY_TRUONG_DUC } from "./terrain";

type Pt = [number, number];

// Luỹ Thầy — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dao-duy-tu", "ke-sach", "khay-day-kep", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LUY_TRUONG_DUC, 55], [LUY_NHAT_LE, 55], [PHU_XUAN, 55], [PHIA_BAC, 55]];

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
    seed: 1631,
  });

  // 1. "dao-duy-tu": các nhóm người (son) từ phía bắc đi vào Phú Xuân, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("dao-duy-tu", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1631, groups: [{ path: [[-250, -120], [-150, -230], PHU_XUAN], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[250, -120], [150, -240], PHU_XUAN], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("dao-duy-tu") }));
  { const S: Pt[] = [PHU_XUAN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-duy-tu") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHU_XUAN, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("dao-duy-tu") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "ke-sach": các toán dân binh (son) đi dọc tuyến luỹ từ chân núi ra gần biển theo thanh kéo, hai đốm ngà sáng lần lượt ở hai đầu luỹ (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-luy"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1641, groups: [{ path: [[-250, -40], LUY_TRUONG_DUC, [10, -40], LUY_NHAT_LE, [250, -40]], count: 34, spread: [26,40], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ke-sach") }));
  { const S: Pt[] = [LUY_TRUONG_DUC, LUY_NHAT_LE]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.35, 0.25 + i * 0.35, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-sach") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(LUY_NHAT_LE, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("ke-sach") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "khay-day-kep": một đoàn xanh nhạt từ phía bắc tiến về phía tuyến luỹ rồi dừng lại phía trước luỹ (diễn hoạ).
  const p2 = run("khay-day-kep", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1651, groups: [{ path: [PHIA_BAC, [0, 200], [20, 40]], count: 30, spread: [30,60], color: DICH, size: 1.1, timing: [[0.05,0],[0.9,1]] }], progress: p2, visible: () => clock.near("khay-day-kep") }));
  { const S: Pt[] = [LUY_TRUONG_DUC, LUY_NHAT_LE]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khay-day-kep") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(LUY_NHAT_LE, 32, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("khay-day-kep") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": quầng vàng dịu dọc tuyến luỹ, các nhóm người (son) đến đứng lặng, lửa bật dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [LUY_TRUONG_DUC, LUY_NHAT_LE]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.2, 0.25 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1661, groups: [{ path: [[-60, -100], [60, -70], LUY_NHAT_LE], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[180, -150], LUY_NHAT_LE], count: 12, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(LUY_NHAT_LE, 38, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
