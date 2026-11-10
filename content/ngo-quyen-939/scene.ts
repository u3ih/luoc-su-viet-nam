import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CO_LOA, DAI_LA, BACH_DANG, TRA_HUONG, AI_CHAU, HOAN_CHAU } from "./terrain";

type Pt = [number, number];

// Ngô Quyền xưng vương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
  { at: poly(60, 200, 46, 9, 0.2), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 12 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bach-dang","co-loa","trieu-dinh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CO_LOA, 48], [DAI_LA, 44]];

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
    seed: 939,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "bach-dang": quân Ngô Quyền (son) từ cửa Bạch Đằng trở về; đốm vàng sáng ở Đại La (diễn hoạ).
  const p0 = run("bach-dang", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 949, groups: [{ path: [[360, 60], [250, 10], [160, -30]], count: 50, spread: [16,70], color: SON, timing: [[0.03,0],[0.75,1]] }], progress: p0, visible: () => clock.near("bach-dang") }));
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bach-dang") })); }
  // 2. "co-loa": đoàn người (son) rời Đại La (đốm vàng mờ dần) lên Cổ Loa (đốm vàng sáng lên) (diễn hoạ).
  const p1 = run("co-loa", 28);
  { const S: Pt[] = [[150, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.45, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("co-loa") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 979, groups: [{ path: [[150, -40], [110, 80], [60, 180]], count: 50, spread: [16,70], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: p1, visible: () => clock.near("co-loa") }));
  { const S: Pt[] = [[60, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("co-loa") })); }
  // 3. "trieu-dinh": theo thanh kéo, các hào trưởng (chấm ngà) từ Trà Hương, Ái châu, Hoan châu về Cổ Loa; trăm quan (đốm ngà) quanh đốm vàng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["trieu-dinh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 999, groups: [{ path: [[300, -230], [150, 0], [70, 180]], count: 8, spread: [4,20], color: NGHIA, timing: [[0,0],[0.8,1]] }, { path: [[-160, -360], [-40, -60], [50, 180]], count: 8, spread: [4,20], color: NGHIA, timing: [[0.05,0],[0.85,1]] }, { path: [[-20, -390], [40, -100], [60, 175]], count: 8, spread: [4,20], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("trieu-dinh") }));
  { const S: Pt[] = [[60, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trieu-dinh") })); }
  { const S: Pt[] = [[86, 200], [78, 218], [60, 226], [42, 218], [34, 200], [42, 182], [60, 174], [78, 182]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.04, 0.75 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trieu-dinh") })); }
  // 4. "ve-sau": đốm vàng ở Cổ Loa lịm dần (Ngô Quyền mất); một đốm ngà (Dương Tam Kha) sáng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[60, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 190]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
