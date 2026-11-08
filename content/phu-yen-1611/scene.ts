import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CU_MONG, TUY_HOA, DONG_XUAN, THANH_HO, LONG_PHUNG } from "./terrain";

type Pt = [number, number];

// Lập phủ Phú Yên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vao-nam","luu-dan","lap-phu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TUY_HOA, 48], [DONG_XUAN, 40], [THANH_HO, 32], [LONG_PHUNG, 36]];

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
    seed: 1611,
  });

  // 1. "vao-nam": một đoàn quân (son) từ phía bắc vượt đèo Cù Mông xuống sông Đà Diễn, lửa bật ở thành Hồ (diễn hoạ).
  const p0 = run("vao-nam", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1621, groups: [{ path: [[20, 400], CU_MONG, [60, 150], [130, 0], [160, -110]], count: 30, spread: [16,80], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("vao-nam") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(THANH_HO, 20, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("vao-nam") * smoothstep(0.7, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "luu-dan": ba đoàn lưu dân (son) vượt đèo vào châu thổ theo thanh kéo, các làng mới (vàng) sáng dần dọc hai bờ sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["luu-dan"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1641, groups: [{ path: [[20, 400], CU_MONG, [40, 180], [100, 130]], count: 30, spread: [20,80], color: SON, timing: [[0,0],[1,1]] }, { path: [[20, 400], CU_MONG, [0, 160], [-60, 40]], count: 26, spread: [20,70], color: SON, timing: [[0.1,0],[1,1]] }, { path: [[20, 400], CU_MONG, [80, 160], [120, 20]], count: 26, spread: [20,70], color: SON, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("luu-dan") }));
  { const S: Pt[] = [[100, 135], [20, 135], [-80, 140], [130, 10], [40, -40], [-60, -30], [170, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.07, 0.55 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luu-dan") })); }
  // 3. "lap-phu": hai đốm vàng lớn (hai huyện Đồng Xuân, Tuy Hòa) sáng lên; đốm ngà ở Long Phụng lịm dần, người (son) tụ về (diễn hoạ).
  const p2 = run("lap-phu", 28);
  { const S: Pt[] = [DONG_XUAN, TUY_HOA]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.2, 0.2 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lap-phu") })); }
  { const S: Pt[] = [LONG_PHUNG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.5, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lap-phu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1681, groups: [{ path: [[40, 120], LONG_PHUNG], count: 18, spread: [26,50], color: SON, timing: [[0.5,0],[1,1]] }], progress: p2, visible: () => clock.near("lap-phu") }));
  // 4. "ve-sau": các đốm vàng nhỏ (những lần truy phong) lần lượt sáng quanh đền Long Phụng; người (son) tụ về, lửa lễ bật dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-42, 20], [-46, 35], [-58, 45], [-74, 48], [-88, 41], [-97, 28], [-97, 12], [-88, -1], [-74, -8], [-58, -5], [-46, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1701, groups: [{ path: [[60, 80], LONG_PHUNG], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-200, -100], LONG_PHUNG], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(LONG_PHUNG, 16, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.5, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
