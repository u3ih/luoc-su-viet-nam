import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAI_DON, PHONG_TUYEN, BIEN_HOA, GO_CONG } from "./terrain";

type Pt = [number, number];

// Đại đồn Chí Hòa — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Đại đồn cách điệu: một vòng lũy lớn; thật là hệ thống chiến lũy và pháo đài.
const WALLS: Wall[] = [
  { at: square(-120, 80, 90, 0.2), base: 10, top: 6, height: 4, gates: [{ at: 0, width: 14 }, { at: -1.5707963267948966, width: 14 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh","dap-luy","tan-cong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DAI_DON, 104]];

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
    seed: 1861,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("dap-luy") + 0.5 ? 1 : ctx.t > world.beat("dap-luy") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["dap-luy"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a60", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "boi-canh": toán quân Pháp nhỏ (xanh nhạt) giữ phòng tuyến các chùa; tàu (xanh nhạt) rời đi xa rồi trở lại đông hơn (diễn hoạ).
  const p0 = run("boi-canh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1871, groups: [{ path: [[40, -140], [80, -100]], count: 16, spread: [60,20], color: DICH, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1881, groups: [{ path: [[220, -100], [300, -400], [220, -100]], count: 8, spread: [10,60], color: DICH, timing: [[0.05,0],[0.95,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  // 2. "dap-luy": quân Việt (son) đắp lũy quanh đại đồn; vòng lũy cao dần (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-luy"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1891, groups: [{ path: [[-220, 0], [-20, 0]], count: 30, spread: [8,180], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[-20, 170], [-220, 170]], count: 30, spread: [8,180], color: SON, timing: [[0,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dap-luy") }));
  // 3. "tan-cong": theo thanh kéo (rạng sáng 24 → tối 25): đại bác từ phòng tuyến và tàu bắn (lửa); quân Pháp (xanh nhạt) tiến vào; quân trong đồn (son) giữ rồi lui về Biên Hòa (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tan-cong"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1901, groups: [{ path: [PHONG_TUYEN, [-20, -20], [-100, 60]], count: 40, spread: [40,60], color: DICH, timing: [[0.2,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("tan-cong") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1911, groups: [{ path: [[-120, 80], [0, 200], BIEN_HOA], count: 30, spread: [30,60], color: SON, timing: [[0.7,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("tan-cong") }));
  world.add(createFires({ sites: [[-30, 0], [-60, 20], [-100, 0], [-140, 30], [-180, 60], [-90, 120]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("tan-cong") * smoothstep(0.15, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": lửa âm ỉ trong đồn; quân Pháp (xanh nhạt) tỏa đi các tỉnh; một toán (son) rút về Gò Công (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(DAI_DON, 50, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0, 0.9, p3()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1941, groups: [{ path: [DAI_DON, [-300, -200]], count: 20, spread: [30,40], color: DICH, timing: [[0.1,0],[0.8,1]] }, { path: [DAI_DON, BIEN_HOA], count: 20, spread: [30,40], color: DICH, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1951, groups: [{ path: [DAI_DON, [-100, -200], GO_CONG], count: 12, spread: [10,30], color: SON, timing: [[0.3,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
