import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CUNG, LE_CHI, PHU_LS } from "./terrain";

type Pt = [number, number];

// Lê Nghi Dân và tám tháng Thiên Hưng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hoàng thành cách điệu.
const WALLS: Wall[] = [
  { at: square(20, 40, 62, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thai-tu","dien-ninh","sau-bo","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CUNG, 80], [PHU_LS, 24]];

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
    seed: 1459,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "thai-tu": đốm ngà (Nghi Dân) trong cung mờ đi và dời ra phủ riêng phía tây bắc; đốm vàng (Bang Cơ) sáng lên giữa cung (diễn hoạ).
  const p0 = run("thai-tu", 28);
  { const S: Pt[] = [[30, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.35, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thai-tu") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1479, groups: [{ path: [[30, 50], [-80, 120], [-190, 195]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.4,0],[0.8,1]] }], progress: p0, visible: () => clock.near("thai-tu") }));
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thai-tu") })); }
  // 2. "dien-ninh": đêm, quân của Nghi Dân (xanh nhạt) từ phủ riêng chia ba đường vào cung; đốm vàng tắt (diễn hoạ).
  const p1 = run("dien-ninh", 28);
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.6, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dien-ninh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1509, groups: [{ path: [[-190, 195], [-60, 120], [-20, 70]], count: 14, spread: [6,20], color: DICH, timing: [[0.05,0],[0.6,1]] }, { path: [[-190, 190], [-110, 40], [-30, 40]], count: 14, spread: [6,20], color: DICH, timing: [[0.1,0],[0.65,1]] }, { path: [[-185, 185], [20, 160], [20, 90]], count: 14, spread: [6,20], color: DICH, timing: [[0.15,0],[0.7,1]] }], progress: p1, visible: () => clock.near("dien-ninh") }));
  // 3. "sau-bo": theo thanh kéo, sáu bộ (sáu đốm ngà) lần lượt được lập trong cung (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["sau-bo"] ?? 0) / 0.9);
  { const S: Pt[] = [[-25, 30], [-7, 30], [11, 30], [29, 30], [47, 30], [65, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.14, 0.2 + i * 0.14, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-bo") })); }
  { const S: Pt[] = [[20, 70]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-bo") })); }
  // 4. "ve-sau": các đại thần (son) tụ ở cửa rồi vào cung; quân thân tín (xanh nhạt) ngã; đốm vàng (Lê Tư Thành) sáng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1539, groups: [{ path: [[20, -120], [20, -30], [20, 30]], count: 40, spread: [10,40], color: SON, timing: [[0.03,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1549, groups: [{ path: [[20, 60], [20, 60]], count: 24, spread: [8,30], color: DICH, mortal: true, timing: [[0,1],[1,1]] }], progress: p3, fall: (ctx) => smoothstep(0.05, 0.9, p3()), visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
