import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, SAI_GON, MY_THO, VI_TUYEN } from "./terrain";

type Pt = [number, number];

// Đường sắt xuyên Việt — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["doan-dau","noi-lien","gian-doan","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [SAI_GON, 40]];

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
    seed: 1936,
  });

  // 1. "doan-dau": những đốm vàng nhỏ (đoạn đường đầu tiên) sáng dần giữa Sài Gòn và Mỹ Tho; người làm đường (son) dàn hàng (diễn hoạ).
  const p0 = run("doan-dau", 28);
  { const S: Pt[] = [[240, -320], [224, -330], [208, -340], [192, -350], [176, -360], [160, -370]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.1, 0.25 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doan-dau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1956, groups: [{ path: [SAI_GON, [200, -345], MY_THO], count: 30, spread: [6,6], color: SON, drop: true, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("doan-dau") }));
  // 2. "noi-lien": các đốm vàng dọc tuyến sáng dần từ hai đầu Hà Nội và Sài Gòn vào giữa theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["noi-lien"] ?? 0) / 0.9);
  { const S: Pt[] = [[-260, 330], [-235, 297], [-211, 265], [-186, 232], [-162, 200], [-137, 170], [-113, 140], [-88, 110], [-64, 87], [-39, 68], [-15, 49], [10, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.07, 0.16999999999999998 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-lien") })); }
  { const S: Pt[] = [[240, -320], [221, -287], [202, -255], [183, -222], [163, -189], [141, -156], [119, -124], [97, -91], [75, -60], [54, -30], [32, 0], [10, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.07, 0.16999999999999998 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-lien") })); }
  // 3. "gian-doan": các đốm vàng nửa phía nam tuyến lịm dần (đường bị hư hại), rồi sáng lại dần (diễn hoạ).
  const p2 = run("gian-doan", 28);
  { const S: Pt[] = [[10, 30], [32, 0], [54, -30], [75, -60], [97, -91], [119, -124], [141, -156], [163, -189], [183, -222], [202, -255], [221, -287], [240, -320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.005, 0.15 + i * 0.005, k) * (1 - smoothstep(0.15, 0.35, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gian-doan") })); }
  { const S: Pt[] = [[240, -320], [221, -287], [202, -255], [183, -222], [163, -189], [141, -156], [119, -124], [97, -91], [75, -60], [54, -30], [32, 0], [10, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.035, 0.65 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gian-doan") })); }
  // 4. "ve-sau": một chấm ngà (đoàn tàu Thống Nhất) chạy suốt tuyến từ Hà Nội vào Sài Gòn; các đốm vàng dọc tuyến (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-260, 330], [-232, 292], [-203, 254], [-175, 216], [-146, 181], [-118, 146], [-89, 112], [-61, 85], [-33, 63], [-4, 41], [23, 13], [48, -22], [73, -57], [98, -93], [124, -131], [149, -168], [174, -206], [196, -244], [218, -282], [240, -320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.01, 0.15 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 4, seed: 2016, groups: [{ path: [HA_NOI, [-170, 210], [-80, 100], VI_TUYEN, [90, -80], [170, -200], SAI_GON], count: 4, spread: [3,14], color: NGHIA, timing: [[0.03,0],[0.97,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
