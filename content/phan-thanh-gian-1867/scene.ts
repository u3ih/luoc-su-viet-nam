import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GIA_DINH, BIEN_HOA, DINH_TUONG, VINH_LONG, AN_GIANG, HA_TIEN, RA_KHOI } from "./terrain";

type Pt = [number, number];

// Phan Thanh Giản và ba tỉnh miền Tây — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Vĩnh Long cách điệu: một vòng tường vuông nhỏ; không vẽ cổng.
const WALLS: Wall[] = [
  { at: square(-30, 30, 34, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 8 }, { at: 1.5707963267948966, width: 8 }, { at: 3.141592653589793, width: 8 }, { at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tien-si","hoa-uoc","su-bo","vinh-long"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VINH_LONG, 56], [GIA_DINH, 40]];

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
    counts: { trees: 380, bushes: 600, grass: 2600, reeds: 1000 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1867,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8d8577", top: "#76845a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "tien-si": đốm ngà rời Vĩnh Long đi về phía bắc dự thi; đốm vàng sáng ở Vĩnh Long (diễn hoạ).
  const p0 = run("tien-si", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1877, groups: [{ path: [VINH_LONG, [50, 200], [80, 395]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("tien-si") }));
  { const S: Pt[] = [VINH_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tien-si") })); }
  // 2. "hoa-uoc": ba đốm vàng ở ba tỉnh miền Đông lịm dần, thay bằng đốm xanh nhạt; một đốm vàng sáng lại ở Vĩnh Long (diễn hoạ).
  const p1 = run("hoa-uoc", 28);
  { const S: Pt[] = [GIA_DINH, BIEN_HOA, DINH_TUONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.02, 0.15 + i * 0.02, k) * (1 - smoothstep(0.3, 0.55, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-uoc") })); }
  { const S: Pt[] = [GIA_DINH, BIEN_HOA, DINH_TUONG]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.45 + i * 0.06, 0.6 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-uoc") })); }
  { const S: Pt[] = [VINH_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-uoc") })); }
  // 3. "su-bo": chấm ngà (sứ bộ) từ Gia Định theo đường biển ra khơi theo thanh kéo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["su-bo"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1927, groups: [{ path: [GIA_DINH, [250, 0], [300, -200], RA_KHOI], count: 3, spread: [6,12], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("su-bo") }));
  { const S: Pt[] = [GIA_DINH, BIEN_HOA, DINH_TUONG]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("su-bo") })); }
  // 4. "vinh-long": tàu (xanh nhạt) ngược sông lên Vĩnh Long; đốm ngà ở Vĩnh Long lịm dần; đốm vàng ở An Giang, Hà Tiên cũng tắt (diễn hoạ).
  const p3 = run("vinh-long", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1947, groups: [{ path: [[400, -260], [180, -150], [20, -20]], count: 6, spread: [10,40], color: DICH, timing: [[0.02,0],[0.45,1]] }], progress: p3, visible: () => clock.near("vinh-long") }));
  { const S: Pt[] = [VINH_LONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.5, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vinh-long") })); }
  { const S: Pt[] = [AN_GIANG, HA_TIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.02, 0.15 + i * 0.02, k) * (1 - smoothstep(0.4, 0.65, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vinh-long") })); }
};

export default setup;
