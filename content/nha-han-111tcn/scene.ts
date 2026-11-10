import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHIEN_NGUNG, GIAO_CHI, CUU_CHAN, NHAT_NAM } from "./terrain";

type Pt = [number, number];

// Nhà Hán diệt Nam Việt — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Phiên Ngung cách điệu.
const WALLS: Wall[] = [
  { at: square(40, 200, 44, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chia-re","nam-dao","phien-ngung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHIEN_NGUNG, 56]];

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
    seed: 1111,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "chia-re": sứ Hán (chấm xanh nhạt) vào thành; đốm vàng (vua Nam Việt) tắt; quân Lữ Gia (son) chiếm giữ trong thành (diễn hoạ).
  const p0 = run("chia-re", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1121, groups: [{ path: [[-150, 330], [-40, 260], [30, 210]], count: 3, spread: [6,20], color: DICH, timing: [[0.03,0],[0.4,1]] }], progress: p0, visible: () => clock.near("chia-re") }));
  { const S: Pt[] = [[50, 210]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.5, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-re") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1141, groups: [{ path: [[40, 170], [40, 200]], count: 40, spread: [8,30], color: SON, timing: [[0.5,0],[0.9,1]] }], progress: p0, visible: () => clock.near("chia-re") }));
  // 2. "nam-dao": năm đạo quân Hán (xanh nhạt) từ phía bắc và tây bắc kéo xuống, dừng ngoài thành (diễn hoạ).
  const p1 = run("nam-dao", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1151, groups: [{ path: [[-380, 380], [-120, 280], [-20, 240]], count: 30, spread: [12,50], color: DICH, timing: [[0.03,0],[0.8,1]] }, { path: [[-100, 400], [0, 300], [20, 260]], count: 30, spread: [12,50], color: DICH, timing: [[0.08,0],[0.85,1]] }, { path: [[200, 400], [120, 300], [90, 250]], count: 30, spread: [12,50], color: DICH, timing: [[0.13,0],[0.9,1]] }], progress: p1, visible: () => clock.near("nam-dao") }));
  // 3. "phien-ngung": theo thanh kéo, hai cánh quân Hán (xanh nhạt) khép vòng đông nam và tây bắc thành; lửa cháy trong thành; nhóm nhỏ (son) chạy ra biển (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["phien-ngung"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1161, groups: [{ path: [[150, 100], [80, 160]], count: 40, spread: [10,40], color: DICH, timing: [[0,0],[0.6,1]] }, { path: [[-80, 300], [0, 240]], count: 40, spread: [10,40], color: DICH, timing: [[0.05,0],[0.65,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("phien-ngung") }));
  world.add(createFires({ sites: [[30, 190], [55, 210], [40, 225], [20, 205], [60, 185]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("phien-ngung") * smoothstep(0.3, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1181, groups: [{ path: [[50, 200], [200, 170], [330, 140]], count: 10, spread: [4,16], color: SON, timing: [[0.6,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("phien-ngung") }));
  // 4. "ve-sau": ba đốm xanh nhạt (Giao Chỉ, Cửu Chân, Nhật Nam) sáng ở phía nam; người dụ hàng (chấm ngà) đi từ thành xuống (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1191, groups: [{ path: [[40, 160], [-40, 0], [-110, -220]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-120, -230], [-60, -320], [60, -370]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1211, groups: [{ path: [[-120, -230], [-120, -230]], count: 30, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
