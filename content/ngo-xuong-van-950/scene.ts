import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CO_LOA, NAM_SACH, TU_LIEM, THAI_BINH, HOA_LU } from "./terrain";

type Pt = [number, number];

// Ngô Xương Văn khôi phục nhà Ngô — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Đa giác đều n cạnh, bán kính đỉnh r
const poly = (cx: number, cz: number, r: number, n: number, rot: number) => (a: number): [number, number] => {
  const k = (2 * Math.PI) / n;
  const t = (((a - rot) % k) + k) % k;
  const d = (r * Math.cos(Math.PI / n)) / Math.cos(t - Math.PI / n);
  return [cx + Math.cos(a) * d, cz + Math.sin(a) * d];
};
// Cổ Loa cách điệu thành một vòng tường.
const WALLS: Wall[] = [
  { at: poly(80, 180, 44, 9, 0.2), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 12 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cuop-ngoi","tu-liem","quay-ve","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CO_LOA, 48], [TU_LIEM, 32], [THAI_BINH, 32]];

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
    seed: 950,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "cuop-ngoi": Ngô Xương Ngập (chấm ngà) chạy từ Cổ Loa về Nam Sách; ba lần quân (xanh nhạt) đuổi theo rồi quay về (diễn hoạ).
  const p0 = run("cuop-ngoi", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 960, groups: [{ path: [[80, 180], [200, 120], [320, 60]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.4,1]] }], progress: p0, visible: () => clock.near("cuop-ngoi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 970, groups: [{ path: [[80, 170], [250, 90], [80, 170]], count: 20, spread: [8,40], color: DICH, timing: [[0.2,0],[0.45,0.5],[0.6,1]] }, { path: [[80, 170], [260, 80], [80, 170]], count: 20, spread: [8,40], color: DICH, timing: [[0.55,0],[0.75,0.5],[0.95,1]] }], progress: p0, visible: () => clock.near("cuop-ngoi") }));
  { const S: Pt[] = [[330, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cuop-ngoi") })); }
  // 2. "tu-liem": quân (son) do Ngô Xương Văn dẫn rời Cổ Loa đi về phía Thái Bình, dừng ở Từ Liêm (đốm ngà) (diễn hoạ).
  const p1 = run("tu-liem", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 990, groups: [{ path: [[80, 170], [0, 80], [-60, 30]], count: 50, spread: [14,60], color: SON, timing: [[0.03,0],[0.7,1]] }], progress: p1, visible: () => clock.near("tu-liem") }));
  { const S: Pt[] = [[-60, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-liem") })); }
  { const S: Pt[] = [[-260, 70]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-liem") })); }
  // 3. "quay-ve": theo thanh kéo, đoàn quân (son) quay về Cổ Loa; đốm vàng sáng ở Cổ Loa; Xương Ngập (chấm ngà) từ Nam Sách được đón về (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["quay-ve"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1020, groups: [{ path: [[-60, 30], [0, 100], [70, 170]], count: 50, spread: [14,60], color: SON, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("quay-ve") }));
  { const S: Pt[] = [[80, 180]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quay-ve") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1040, groups: [{ path: [[330, 60], [200, 130], [90, 180]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.6,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("quay-ve") }));
  // 4. "ve-sau": quân (son) đánh Hoa Lư rồi quay về; sau cùng đi đánh Thái Bình, nhiều người ngã; đốm vàng ở Cổ Loa lịm dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1050, groups: [{ path: [[70, 170], [-60, -100], [-100, -280], [-40, -100], [70, 170]], count: 40, spread: [14,60], color: SON, timing: [[0.03,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1060, groups: [{ path: [[-200, 70], [-250, 70]], count: 24, spread: [10,40], color: SON, mortal: true, timing: [[0.55,0],[0.8,1]] }], progress: p3, fall: (ctx) => smoothstep(0.05, 0.9, p3()), visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[80, 180]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.7, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
