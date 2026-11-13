import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NHA_TU_CD, HANG_DUONG } from "./terrain";

type Pt = [number, number];

// Nhà tù Côn Đảo — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Tường nhà tù (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(0, -30, 36, 0), base: 4, top: 3, height: 6, gates: [{ at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lap-nha-tu","tu-nhan","chuong-cop","hang-duong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NHA_TU_CD, 48], [HANG_DUONG, 24]];

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
    seed: 1862,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7c", top: "#6b675b" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "lap-nha-tu": thuyền (xanh nhạt) chở tù (son) từ đất liền ra đảo; tường nhà tù đứng giữa thị trấn (diễn hoạ).
  const p0 = run("lap-nha-tu", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1872, groups: [{ path: [[0, -390], [0, -200], [0, -140]], count: 3, spread: [3,8], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: p0, visible: () => clock.near("lap-nha-tu") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1882, groups: [{ path: [[0, -140], [0, -70], [0, -30]], count: 30, spread: [1,4], color: SON, timing: [[0.6,0],[0.95,1]] }], progress: p0, visible: () => clock.near("lap-nha-tu") }));
  // 2. "tu-nhan": nhiều nhóm tù (son) trong tường; các đốm ngà (những người tù nổi tiếng) lần lượt sáng (diễn hoạ).
  const p1 = run("tu-nhan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1892, groups: [{ path: [[-7, -45], [-9, -40], [-13, -37], [-17, -37], [-21, -40], [-23, -45], [-21, -50], [-17, -53], [-13, -53], [-9, -50], [-7, -45]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[23, -45], [21, -40], [17, -37], [13, -37], [9, -40], [7, -45], [9, -50], [13, -53], [17, -53], [21, -50], [23, -45]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-7, -15], [-9, -10], [-13, -7], [-17, -7], [-21, -10], [-23, -15], [-21, -20], [-17, -23], [-13, -23], [-9, -20], [-7, -15]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[23, -15], [21, -10], [17, -7], [13, -7], [9, -10], [7, -15], [9, -20], [13, -23], [17, -23], [21, -20], [23, -15]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("tu-nhan") }));
  { const S: Pt[] = [[-15, -45], [15, -45], [-15, -15], [15, -15], [0, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-nhan") })); }
  // 3. "chuong-cop": theo thanh kéo, một nhóm khách (xanh nhạt) rời lối đi chính, rẽ qua con hẻm giữa hai dãy nhà tù tới khu biệt giam (đốm vàng) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chuong-cop"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 1912, groups: [{ path: [[0, -120], [0, -75], [-20, -60], [-20, -30], [-5, -25]], count: 6, spread: [1,3], color: DICH, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chuong-cop") }));
  { const S: Pt[] = [[-5, -25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chuong-cop") })); }
  // 4. "hang-duong": những người tù (son) ra khỏi tường; nhiều đốm vàng nhỏ (những ngôi mộ) sáng ở nghĩa trang Hàng Dương (diễn hoạ).
  const p3 = run("hang-duong", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1932, groups: [{ path: [[0, -30], [0, -80], [60, -100]], count: 40, spread: [2,8], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("hang-duong") }));
  { const S: Pt[] = [[85, -75], [95, -75], [105, -75], [115, -75], [125, -75], [135, -75], [85, -65], [95, -65], [105, -65], [115, -65], [125, -65], [135, -65], [85, -55], [95, -55], [105, -55], [115, -55], [125, -55], [135, -55], [85, -45], [95, -45], [105, -45], [115, -45], [125, -45], [135, -45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 11, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.01, 0.44999999999999996 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hang-duong") })); }
};

export default setup;
