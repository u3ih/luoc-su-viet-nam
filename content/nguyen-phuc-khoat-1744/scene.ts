import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_XUAN } from "./terrain";

type Pt = [number, number];

// Võ vương Nguyễn Phúc Khoát — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Đô thành Phú Xuân cách điệu.
const WALLS: Wall[] = [
  { at: square(20, 50, 44, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phu-xuan","xung-vuong","y-phuc","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_XUAN, 60]];

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
    seed: 1744,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => smoothstep(world.beat("phu-xuan") - 0.6, world.beat("phu-xuan") - 0.1, ctx.t);
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "phu-xuan": đô thành Phú Xuân (khối tường) dựng lên; đốm vàng (phủ chúa) sáng giữa thành (diễn hoạ).
  const p0 = run("phu-xuan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1754, groups: [{ path: [[-150, -40], [0, 30]], count: 30, spread: [10,50], color: SON, timing: [[0.03,0],[0.5,1]] }], progress: p0, visible: () => clock.near("phu-xuan") }));
  { const S: Pt[] = [[20, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phu-xuan") })); }
  // 2. "xung-vuong": quần thần (chấm ngà) tụ về; sáu bộ (sáu đốm ngà) lần lượt sáng quanh điện (diễn hoạ).
  const p1 = run("xung-vuong", 28);
  { const S: Pt[] = [[20, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xung-vuong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1784, groups: [{ path: [[20, -60], [20, 20]], count: 30, spread: [8,30], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("xung-vuong") }));
  { const S: Pt[] = [[20, 22], [44, 36], [44, 64], [20, 78], [-4, 64], [-4, 36]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.07, 0.55 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xung-vuong") })); }
  // 3. "y-phuc": theo thanh kéo, các dinh (đốm vàng) dọc ven biển sáng dần từ Phú Xuân ra hai đầu; dân (son) các dinh đổi sang màu ngà khi tới nơi (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["y-phuc"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 300], [-30, 200], [10, 130], [40, -60], [10, -170], [-30, -280], [-60, -370]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.1, 0.25 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("y-phuc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1814, groups: [{ path: [[-60, 290], [-20, 300]], count: 12, spread: [8,30], color: SON, arrive: NGHIA, timing: [[0.1,0],[0.5,1]] }, { path: [[-60, -160], [0, -170]], count: 12, spread: [8,30], color: SON, arrive: NGHIA, timing: [[0.3,0],[0.7,1]] }, { path: [[-90, -270], [-30, -280]], count: 12, spread: [8,30], color: SON, arrive: NGHIA, timing: [[0.5,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("y-phuc") }));
  // 4. "ve-sau": đốm vàng ở Phú Xuân lịm dần; quan lại (chấm ngà) tụ quanh điện (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[20, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.6, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1834, groups: [{ path: [[20, 30], [20, 30]], count: 30, spread: [8,40], color: NGHIA, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
