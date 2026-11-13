import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH_CO, MY_CHANH } from "./terrain";

type Pt = [number, number];

// Thành cổ Quảng Trị — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Thành cổ Quảng Trị (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(0, -10, 28, 0), base: 7, top: 5, height: 5, gates: [{ at: 0, width: 8 }, { at: 1.5707963267948966, width: 8 }, { at: 3.141592653589793, width: 8 }, { at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["xuan-he","lam-son-72","81-ngay","thach-han"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH_CO, 40], [MY_CHANH, 24]];

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
    seed: 1972,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#7d6f5c", top: "#5f5a48" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "xuan-he": các đoàn quân (son) từ phía bắc vượt sông vào thành cổ rồi xuống phía nam; dòng người dân (ngà) chạy loạn về phía nam (diễn hoạ).
  const p0 = run("xuan-he", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1982, groups: [{ path: [[0, 380], [0, 60], [0, -10], [0, -140]], count: 70, spread: [6,22], color: SON, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("xuan-he") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1992, groups: [{ path: [[20, -20], [30, -150], [40, -380]], count: 70, spread: [6,20], color: NGHIA, timing: [[0.2,0],[0.95,1]] }], progress: p0, visible: () => clock.near("xuan-he") }));
  // 2. "lam-son-72": hai sư đoàn (xanh nhạt) từ tuyến Mỹ Chánh tiến lên phía bắc, hai bên quốc lộ; đốm vàng ở thành cổ (diễn hoạ).
  const p1 = run("lam-son-72", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2002, groups: [{ path: [[-60, -200], [-50, -60]], count: 50, spread: [4,16], color: DICH, timing: [[0.05,0],[0.85,1]] }, { path: [[60, -200], [50, -60]], count: 50, spread: [4,16], color: DICH, timing: [[0.1,0],[0.9,1]] }], progress: p1, visible: () => clock.near("lam-son-72") }));
  { const S: Pt[] = [[0, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lam-son-72") })); }
  // 3. "81-ngay": theo thanh kéo, lửa bom pháo bùng khắp quanh thành cổ; người giữ thành (son) trong thành; quân phản công (xanh nhạt) tiến dần tới chân tường (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["81-ngay"] ?? 0) / 0.9);
  world.add(createFires({ sites: Array.from({ length: 10 }, (_, i) => { const [x, z] = ring([0, -10], 45, (i / 10) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 10, size: 1.1 }; }), lit: (ctx) => clock.near("81-ngay") * smoothstep(0.05, 0.9, inp2(ctx)), size: 4, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2032, groups: [{ path: [[14, -10], [11, -2], [4, 3], [-4, 3], [-11, -2], [-14, -10], [-11, -18], [-4, -23], [4, -23], [11, -18], [14, -10]], count: 30, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("81-ngay") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2042, groups: [{ path: [[0, -140], [0, -45]], count: 50, spread: [6,20], color: DICH, timing: [[0.05,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("81-ngay") }));
  // 4. "thach-han": hoa đăng (đốm vàng) trôi trên sông Thạch Hãn; người dân (ngà) đứng dọc bờ (diễn hoạ).
  const p3 = run("thach-han", 28);
  { const S: Pt[] = [[-120, 55], [-102, 55], [-83, 55], [-65, 55], [-46, 55], [-28, 55], [-9, 55], [9, 55], [28, 55], [46, 55], [65, 55], [83, 55], [102, 55], [120, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thach-han") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2062, groups: [{ path: [[-100, 30], [-33, 30], [33, 30], [100, 30]], count: 50, spread: [1,4], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("thach-han") }));
};

export default setup;
