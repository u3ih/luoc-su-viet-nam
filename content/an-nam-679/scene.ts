import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TONG_BINH, CANG } from "./terrain";

type Pt = [number, number];

// An Nam đô hộ phủ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Tống Bình cách điệu.
const WALLS: Wall[] = [
  { at: square(60, 60, 42, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["muoi-hai-chau","ly-tu-tien","noi-day","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TONG_BINH, 60]];

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
    seed: 679,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "muoi-hai-chau": đốm xanh nhạt ở Tống Bình; mười hai đốm (các châu) lần lượt sáng quanh đồng bằng (diễn hoạ).
  const p0 = run("muoi-hai-chau", 28);
  { const S: Pt[] = [[60, 60]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muoi-hai-chau") })); }
  { const S: Pt[] = [[222, 96], [169, 179], [82, 225], [-16, 222], [-99, 169], [-145, 82], [-142, -16], [-89, -99], [-2, -145], [96, -142], [179, -89], [225, -2]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.05, 0.25 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muoi-hai-chau") })); }
  // 2. "ly-tu-tien": thuyền buôn (chấm sáng ngà) từ biển vào thương cảng; một nhóm người nổi dậy (son) tiến về thành rồi ngã (diễn hoạ).
  const p1 = run("ly-tu-tien", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 709, groups: [{ path: [[400, -150], [330, -60]], count: 5, spread: [10,40], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("ly-tu-tien") }));
  { const S: Pt[] = [[330, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ly-tu-tien") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 729, groups: [{ path: [[-150, -220], [0, -60], [40, 10]], count: 30, spread: [10,40], color: SON, mortal: true, timing: [[0.2,0],[0.7,1]] }], progress: p1, fall: (ctx) => smoothstep(0.05, 0.9, p1()), visible: () => clock.near("ly-tu-tien") }));
  // 3. "noi-day": theo thanh kéo, ba lần người nổi dậy (son) từ ba phía kéo về thành Tống Bình, mỗi lần một đốm lửa bùng lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["noi-day"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 739, groups: [{ path: [[-250, -150], [40, 40]], count: 30, spread: [10,40], color: SON, timing: [[0,0],[0.3,1]] }, { path: [[-260, 200], [40, 60]], count: 30, spread: [10,40], color: SON, timing: [[0.3,0],[0.6,1]] }, { path: [[200, 260], [70, 70]], count: 30, spread: [10,40], color: SON, timing: [[0.6,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("noi-day") }));
  world.add(createFires({ sites: [[40, 40], [60, 80], [80, 60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("noi-day") * smoothstep(0.2, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": quân từ xa (xanh nhạt) đến từ tây bắc rồi rút; thành Tống Bình (đốm vàng) sáng — thành Tĩnh Hải quân (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 759, groups: [{ path: [[-380, 380], [-100, 160], [-380, 380]], count: 40, spread: [14,60], color: DICH, timing: [[0.03,0],[0.4,0.5],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[60, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
