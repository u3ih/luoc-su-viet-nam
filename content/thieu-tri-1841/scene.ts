import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUE, THO, DA_NANG } from "./terrain";

type Pt = [number, number];

// Vua Thiệu Trị — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành Huế cách điệu.
const WALLS: Wall[] = [
  { at: square(-20, 100, 44, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","kho-khan","tho","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUE, 56], [THO, 32]];

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
    seed: 1841,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "len-ngoi": đốm vàng (vua mới) sáng ở điện Thái Hòa; các quan (chấm ngà) xếp hàng chầu (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1861, groups: [{ path: [[-20, 40], [-20, 90]], count: 36, spread: [6,14], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "kho-khan": quân (son) từ phương nam xa rút về; các đốm xanh nhạt phía nam mờ dần (diễn hoạ).
  const p1 = run("kho-khan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1871, groups: [{ path: [[-200, -400], [-150, -250], [-60, -120]], count: 40, spread: [12,50], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p1, visible: () => clock.near("kho-khan") }));
  { const S: Pt[] = [[-260, -360], [-120, -380]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.05, 0.16999999999999998 + i * 0.05, k) * (1 - smoothstep(0.5, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kho-khan") })); }
  // 3. "tho": theo thanh kéo, năm vòng đốm vàng đồng tâm (bài thơ hồi văn) lần lượt sáng từ trong ra ngoài (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tho"] ?? 0) / 0.9);
  { const S: Pt[] = [[-13, -40], [-15, -35], [-20, -33], [-25, -35], [-27, -40], [-25, -45], [-20, -47], [-15, -45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.004, 0.2 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tho") })); }
  { const S: Pt[] = [[-6, -37], [-10, -31], [-16, -27], [-23, -26], [-29, -30], [-33, -36], [-34, -43], [-30, -49], [-24, -53], [-17, -54], [-11, -50], [-7, -44]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.21000000000000002 + i * 0.004, 0.36 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tho") })); }
  { const S: Pt[] = [[-1, -32], [-5, -25], [-12, -21], [-20, -19], [-28, -21], [-35, -25], [-39, -32], [-41, -40], [-39, -48], [-35, -55], [-28, -59], [-20, -61], [-12, -59], [-5, -55], [-1, -48], [1, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.37 + i * 0.004, 0.52 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tho") })); }
  { const S: Pt[] = [[3, -24], [-3, -18], [-11, -14], [-19, -12], [-28, -13], [-36, -17], [-42, -23], [-46, -31], [-48, -39], [-47, -48], [-43, -56], [-37, -62], [-29, -66], [-21, -68], [-12, -67], [-4, -63], [2, -57], [6, -49], [8, -41], [7, -32]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.53 + i * 0.004, 0.68 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tho") })); }
  { const S: Pt[] = [[4, -15], [-3, -9], [-11, -6], [-21, -5], [-30, -6], [-38, -10], [-45, -16], [-51, -23], [-54, -31], [-55, -41], [-54, -50], [-50, -58], [-44, -65], [-37, -71], [-29, -74], [-19, -75], [-10, -74], [-2, -70], [5, -64], [11, -57], [14, -49], [15, -39], [14, -30], [10, -22]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6900000000000001 + i * 0.004, 0.8400000000000001 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tho") })); }
  // 4. "ve-sau": hai tàu Pháp (chấm sáng xanh nhạt) vào cửa biển Đà Nẵng; lửa cháy trên năm thuyền đồng; đốm vàng ở Huế lịm dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1941, groups: [{ path: [[380, -360], [230, -250]], count: 2, spread: [6,20], color: DICH, timing: [[0.03,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: [[190, -220], [205, -235], [180, -240], [215, -215], [195, -250]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ve-sau") * smoothstep(0.45, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.75, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
