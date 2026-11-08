import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GIA_DINH, CAN_GIUOC, BA_TRI, DUONG_RA_KINH } from "./terrain";

type Pt = [number, number];

// Nguyễn Đình Chiểu và Lục Vân Tiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ra-kinh","mu-loa","ba-tri","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[GIA_DINH, 48], [CAN_GIUOC, 40], [BA_TRI, 48]];

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
    seed: 1850,
  });

  // 1. "ra-kinh": đốm ngà đi từ Gia Định ra kinh rồi trở về; đốm vàng nhỏ ở Gia Định (đỗ Tú tài) (diễn hoạ).
  const p0 = run("ra-kinh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1860, groups: [{ path: [GIA_DINH, [140, 300], DUONG_RA_KINH, [140, 300], GIA_DINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: p0, visible: () => clock.near("ra-kinh") }));
  { const S: Pt[] = [GIA_DINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.3, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ra-kinh") })); }
  // 2. "mu-loa": đốm ngà (cụ đồ) ở Gia Định; học trò (son) từ khắp nơi tìm đến theo thanh kéo; các đốm vàng lan ra quanh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["day-hoc"] ?? 0) / 0.9);
  { const S: Pt[] = [GIA_DINH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mu-loa") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1890, groups: [{ path: [[-50, 300], GIA_DINH], count: 14, spread: [26,50], color: SON, timing: [[0,0],[0.9,1]] }, { path: [[380, 300], GIA_DINH], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[1,1]] }, { path: [[0, 50], GIA_DINH], count: 12, spread: [26,50], color: SON, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mu-loa") }));
  { const S: Pt[] = [[250, 170], [239, 205], [209, 227], [171, 227], [141, 205], [130, 170], [141, 135], [171, 113], [209, 113], [239, 135]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.05, 0.44999999999999996 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mu-loa") })); }
  // 3. "ba-tri": quân Pháp (xanh nhạt) vào Gia Định; đốm ngà rời Gia Định qua Cần Giuộc về Ba Tri (diễn hoạ).
  const p2 = run("ba-tri", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1910, groups: [{ path: [[390, 250], GIA_DINH], count: 30, spread: [30,60], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p2, visible: () => clock.near("ba-tri") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1920, groups: [{ path: [GIA_DINH, CAN_GIUOC, [50, -150], BA_TRI], count: 1, spread: [3,3], color: NGHIA, timing: [[0.25,0],[1,1]] }], progress: p2, visible: () => clock.near("ba-tri") }));
  { const S: Pt[] = [CAN_GIUOC]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-tri") })); }
  // 4. "ve-sau": những đốm vàng (thơ Vân Tiên) lan dần khắp đồng bằng; người (son) tụ về Ba Tri (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-170, -200], [-80, -100], [-250, -50], [0, 0], [-100, 80], [100, 50], [200, -50], [-300, 150], [50, 200], [250, 250], [-200, 250], [150, -250]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1950, groups: [{ path: [[-50, 50], BA_TRI], count: 18, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
