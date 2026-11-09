import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_UNG, VEN_DUONG, NHA_TIEC } from "./terrain";

type Pt = [number, number];

// Phạm Ngũ Lão ngồi đan sọt — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phu-ung","dan-sot","danh-nguyen","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_UNG, 56]];

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
    seed: 1283,
  });

  // 1. "phu-ung": dân làng (son) kéo tới nhà mở tiệc (đốm vàng); một chấm ngà (Ngũ Lão) ở lại ven đường (diễn hoạ).
  const p0 = run("phu-ung", 28);
  { const S: Pt[] = [[-60, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phu-ung") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1303, groups: [{ path: [[150, 100], [-55, 60]], count: 22, spread: [8,50], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[-200, -50], [-62, 55]], count: 18, spread: [8,50], color: SON, timing: [[0.08,0],[0.75,1]] }], progress: p0, visible: () => clock.near("phu-ung") }));
  world.add(createCrowd({ size: 6, height: ground, seed: 1313, groups: [{ path: [[40, -30], [41, -30]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("phu-ung") }));
  // 2. "dan-sot": theo thanh kéo, đoàn quân (son) theo đường quan tiến lại gần chấm ngà ngồi đan sọt; đốm vàng (Hưng Đạo Vương) dừng bên cạnh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dan-sot"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 1323, groups: [{ path: [[40, -30], [41, -30]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dan-sot") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1333, groups: [{ path: [[-390, -40], [-150, -35], [20, -32]], count: 40, spread: [8,120], color: SON, timing: [[0,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dan-sot") }));
  { const S: Pt[] = [[25, -25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dan-sot") })); }
  // 3. "danh-nguyen": thuyền giặc (xanh nhạt) trên sông; quân (son) phục hai bên bờ đánh ra; quân giặc ngã (diễn hoạ).
  const p2 = run("danh-nguyen", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1353, groups: [{ path: [[300, 300], [285, 50], [295, -150]], count: 8, spread: [12,160], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p2, visible: () => clock.near("danh-nguyen") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1363, groups: [{ path: [[180, 150], [255, 20]], count: 30, spread: [10,120], color: SON, timing: [[0.3,0],[0.7,1]] }], progress: p2, visible: () => clock.near("danh-nguyen") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1373, groups: [{ path: [[300, -50], [300, -40]], count: 24, spread: [20,120], color: DICH, mortal: true, timing: [[0,1],[1,1]] }], progress: p2, fall: (ctx) => smoothstep(0.05, 0.9, p2()), visible: () => clock.near("danh-nguyen") }));
  // 4. "ve-sau": đền thờ (đốm vàng) trên nền nhà cũ ở Phù Ủng; dân (son) về lễ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1393, groups: [{ path: [[20, 40], [15, 60], [0, 75], [-20, 80], [-40, 75], [-55, 60], [-60, 40], [-55, 20], [-40, 5], [-20, 0], [0, 5], [15, 20], [20, 40]], count: 50, spread: [4,150], color: SON, timing: [[0.05,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
