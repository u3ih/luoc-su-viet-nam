import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BENH_VIEN, HA_NOI } from "./terrain";

type Pt = [number, number];

// Bệnh viện Bạch Mai — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cong-vong","bach-mai","nam-1972","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BENH_VIEN, 72], [HA_NOI, 40]];

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
    seed: 1911,
  });

  // 1. "cong-vong": nhà thương nhỏ (vài đốm ngà) sáng; về sau tuyến tàu điện (chuỗi đốm, chấm vàng) nối từ trung tâm tới cửa nhà thương (diễn hoạ).
  const p0 = run("cong-vong", 28);
  { const S: Pt[] = [[-14, -27], [0, -27], [14, -27], [-14, -13], [0, -13], [14, -13]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-vong") })); }
  { const S: Pt[] = [[20, 250], [18, 219], [15, 188], [13, 156], [10, 125], [8, 94], [5, 63], [3, 31], [0, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.45 + i * 0.02, 0.6 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-vong") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 5, seed: 1941, groups: [{ path: [[20, 250], [0, 5]], count: 1, spread: [1,1], color: GOLD, timing: [[0.6,0],[0.95,1]] }], progress: p0, visible: () => clock.near("cong-vong") }));
  // 2. "bach-mai": bệnh viện mở rộng (lưới đốm ngà lớn dần); thầy thuốc và người bệnh (son) ra vào (diễn hoạ).
  const p1 = run("bach-mai", 28);
  { const S: Pt[] = [[-35, -41], [-21, -41], [-7, -41], [7, -41], [21, -41], [35, -41], [-35, -27], [-21, -27], [-7, -27], [7, -27], [21, -27], [35, -27], [-35, -13], [-21, -13], [-7, -13], [7, -13], [21, -13], [35, -13], [-35, 1], [-21, 1], [-7, 1], [7, 1], [21, 1], [35, 1]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bach-mai") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1961, groups: [{ path: [[-150, -150], [-10, -25]], count: 30, spread: [3,14], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[150, 120], [10, -15]], count: 30, spread: [3,14], color: SON, timing: [[0.2,0],[0.85,1]] }], progress: p1, visible: () => clock.near("bach-mai") }));
  // 3. "nam-1972": theo thanh kéo, các khoa phòng (đốm vàng) lần lượt sáng đèn trở lại; người (son) quây quần (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-1972"] ?? 0) / 0.9);
  { const S: Pt[] = [[-35, -41], [-21, -41], [-7, -41], [7, -41], [21, -41], [35, -41], [-35, -27], [-21, -27], [-7, -27], [7, -27], [21, -27], [35, -27], [-35, -13], [-21, -13], [-7, -13], [7, -13], [21, -13], [35, -13], [-35, 1], [-21, 1], [-7, 1], [7, 1], [21, 1], [35, 1]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.035, 0.2 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1972") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1981, groups: [{ path: [[60, -20], [55, 3], [42, 22], [23, 35], [0, 40], [-23, 35], [-42, 22], [-55, 3], [-60, -20], [-55, -43], [-42, -62], [-23, -75], [0, -80], [23, -75], [42, -62], [55, -43], [60, -20]], count: 50, spread: [2,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nam-1972") }));
  // 4. "ngay-nay": bệnh viện lớn (lưới đốm vàng rộng, cột đốm — các toà nhà cao); dòng người bệnh (son) từ nhiều nơi đổ về (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[-49, -48], [-35, -48], [-21, -48], [-7, -48], [7, -48], [21, -48], [35, -48], [49, -48], [-49, -34], [-35, -34], [-21, -34], [-7, -34], [7, -34], [21, -34], [35, -34], [49, -34], [-49, -20], [-35, -20], [-21, -20], [-7, -20], [7, -20], [21, -20], [35, -20], [49, -20], [-49, -6], [-35, -6], [-21, -6], [-7, -6], [7, -6], [21, -6], [35, -6], [49, -6], [-49, 8], [-35, 8], [-21, 8], [-7, 8], [7, 8], [21, 8], [35, 8], [49, 8]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.01, 0.15 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[-30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[-30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.28 + i * 0.12, 0.43000000000000005 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[-30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 28, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.36 + i * 0.12, 0.51 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[-30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.44 + i * 0.12, 0.59 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[-30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 48, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.52 + i * 0.12, 0.67 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.38 + i * 0.12, 0.53 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 28, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45999999999999996 + i * 0.12, 0.61 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.54 + i * 0.12, 0.6900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 48, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.62 + i * 0.12, 0.77 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2101, groups: [{ path: [[-300, 200], [-20, -10]], count: 30, spread: [3,12], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [[300, -250], [20, -30]], count: 30, spread: [3,12], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
