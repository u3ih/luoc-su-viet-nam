import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, NAM_DU, VI_HOANG, PHU_XUAN } from "./terrain";

type Pt = [number, number];

// Tây Sơn ra Bắc Hà — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Thành Phú Xuân cách điệu: một vòng tường vuông; không vẽ cổng.
const WALLS: Wall[] = [
  { at: square(40, -280, 45, 0), base: 8, top: 5, height: 5, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh","phu-xuan","ra-bac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 56], [VI_HOANG, 32], [PHU_XUAN, 48]];

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
    seed: 1786,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "boi-canh": hai nhóm (xanh nhạt) giằng co trong kinh thành Thăng Long; một đốm ngà rời đi về phương nam; người đói (son) lang thang (diễn hoạ).
  const p0 = run("boi-canh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1796, groups: [{ path: [[-250, 330], [-210, 320]], count: 16, spread: [30,20], color: DICH, timing: [[0,1],[1,1]] }, { path: [[-150, 330], [-190, 320]], count: 14, spread: [30,20], color: DICH, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1806, groups: [{ path: [THANG_LONG, [-100, 100], [0, -100], PHU_XUAN], count: 1, spread: [3,3], color: NGHIA, timing: [[0.2,0],[0.95,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1816, groups: [{ path: [[-300, 150], [-200, 220], [-280, 260]], count: 14, spread: [40,30], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  // 2. "phu-xuan": đêm nước lên, thuyền Tây Sơn (ngà) áp sát thành Phú Xuân, lửa bùng; quân trong thành (xanh nhạt) mở cửa ra đánh rồi tan (diễn hoạ).
  const p1 = run("phu-xuan", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1826, groups: [{ path: [[260, -260], [120, -250], [80, -260]], count: 18, spread: [20,50], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("phu-xuan") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1836, groups: [{ path: [[40, -280], [40, -220], [20, -160]], count: 24, spread: [30,50], color: DICH, timing: [[0.45,0],[1,1]] }], progress: p1, visible: () => clock.near("phu-xuan") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(PHU_XUAN, 45, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("phu-xuan") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "ra-bac": đoàn thuyền Tây Sơn (ngà) theo đường biển tiến ra bắc theo thanh kéo, vào Vị Hoàng rồi bến Nam Dư; quân Trịnh (xanh nhạt) tan; lửa bùng ở Vị Hoàng, Nam Dư (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ra-bac"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1856, groups: [{ path: [PHU_XUAN, [250, -200], [300, 50], [250, 150], VI_HOANG, [-60, 200], NAM_DU], count: 30, spread: [20,120], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ra-bac") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1866, groups: [{ path: [VI_HOANG, [0, 250]], count: 16, spread: [30,30], color: DICH, timing: [[0.4,0],[0.7,1]] }, { path: [NAM_DU, [-250, 380]], count: 16, spread: [30,30], color: DICH, timing: [[0.75,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ra-bac") }));
  world.add(createFires({ sites: [VI_HOANG, NAM_DU].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("ra-bac") * smoothstep(0.45, 0.9, inp2(ctx)), size: 4, glow: () => 0.8 }));
  // 4. "ve-sau": đốm ngà (Nguyễn Huệ) vào kinh thành gặp đốm vàng (vua Lê); rồi đoàn thuyền (ngà) rút về phương nam (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-200, 330]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1896, groups: [{ path: [NAM_DU, [-200, 310]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1906, groups: [{ path: [NAM_DU, [0, 180], [250, 150], [300, -100], [250, -250]], count: 20, spread: [20,100], color: NGHIA, timing: [[0.55,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
