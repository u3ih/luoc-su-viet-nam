import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SONG_GIANH, LUY, DAU_MAU, DONG_HOI, NHAT_LE } from "./terrain";

type Pt = [number, number];

// Trận Trấn Ninh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vuot-song","ba-mui","luy-tran-ninh","nhat-le"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DONG_HOI, 40]];

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
    seed: 1802,
  });

  // 1. "vuot-song": quân Tây Sơn (xanh nhạt) từ phía bắc vượt sông Gianh vào; thuyền Tây Sơn (xanh nhạt) theo bờ biển xuống cửa Nhật Lệ (diễn hoạ).
  const p0 = run("vuot-song", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1812, groups: [{ path: [[-40, 400], [0, 260], [10, 150]], count: 40, spread: [40,80], color: DICH, timing: [[0.03,0],[0.85,1]] }], progress: p0, visible: () => clock.near("vuot-song") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1822, groups: [{ path: [[330, 400], [320, 100], [300, -95], NHAT_LE], count: 16, spread: [20,50], color: DICH, timing: [[0.05,0],[0.9,1]] }], progress: p0, visible: () => clock.near("vuot-song") }));
  // 2. "ba-mui": ba cánh quân Tây Sơn (xanh nhạt) chia về lũy Trấn Ninh, thành Đâu Mâu và cửa sông Gianh; quân Nguyễn (ngà) giữ sông Gianh lui về Đồng Hới (diễn hoạ).
  const p1 = run("ba-mui", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1832, groups: [{ path: [[10, 150], [-10, 60]], count: 24, spread: [40,30], color: DICH, timing: [[0.05,0],[0.8,1]] }, { path: [[10, 150], [-100, 60], [-130, 20]], count: 20, spread: [30,30], color: DICH, timing: [[0.1,0],[0.85,1]] }], progress: p1, visible: () => clock.near("ba-mui") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1842, groups: [{ path: [[330, 250], [250, 245]], count: 14, spread: [20,40], color: DICH, timing: [[0.05,0],[0.7,1]] }], progress: p1, visible: () => clock.near("ba-mui") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1852, groups: [{ path: [SONG_GIANH, [80, 100], DONG_HOI], count: 20, spread: [30,40], color: NGHIA, timing: [[0.2,0],[1,1]] }], progress: p1, visible: () => clock.near("ba-mui") }));
  // 3. "luy-tran-ninh": theo thanh kéo (sáng → chiều tối): quân Nguyễn (ngà) giữ dọc lũy; quân Tây Sơn (xanh nhạt) dồn lên, một đốm vàng đi trước đốc quân; lửa bùng dần dọc lũy (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tran-ninh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1862, groups: [{ path: [[-180, 15], [160, 15]], count: 40, spread: [6,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("luy-tran-ninh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1872, groups: [{ path: [[-20, 120], [-20, 45]], count: 40, spread: [200,40], color: DICH, timing: [[0,0],[0.3,0.8],[0.6,0.5],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("luy-tran-ninh") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1882, groups: [{ path: [[-20, 110], [-20, 40]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.3,0.8],[0.6,0.6],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("luy-tran-ninh") }));
  world.add(createFires({ sites: [[-150, 18], [-90, 18], [-30, 18], [30, 18], [90, 18], [140, 18]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("luy-tran-ninh") * smoothstep(0.2, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "nhat-le": ở cửa Nhật Lệ, thuyền Nguyễn (ngà) đánh tan thuyền Tây Sơn, lửa bùng; quân Tây Sơn (xanh nhạt) rút lên phía bắc (diễn hoạ).
  const p3 = run("nhat-le", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1902, groups: [{ path: [[330, -200], [270, -110], NHAT_LE], count: 16, spread: [20,40], color: NGHIA, timing: [[0.02,0],[0.5,1]] }, { path: [[220, -95], [200, -95]], count: 12, spread: [30,20], color: DICH, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("nhat-le") }));
  world.add(createFires({ sites: [[230, -95], [210, -92], [200, -100], [220, -100]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nhat-le") * smoothstep(0.35, 0.9, p3()), size: 4, glow: () => 0.8 }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1922, groups: [{ path: [[-20, 45], [0, 200], [-40, 400]], count: 36, spread: [60,80], color: DICH, timing: [[0.55,0],[1,1]] }], progress: p3, visible: () => clock.near("nhat-le") }));
};

export default setup;
