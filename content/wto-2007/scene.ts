import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CANG, GENEVA } from "./terrain";

type Pt = [number, number];

// Việt Nam gia nhập WTO — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ket-nap","thanh-vien","xuat-khau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

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
    counts: { trees: 260, bushes: 360, grass: 1200, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.3 },
    seed: 2007,
  });

  // 1. "ket-nap": đoàn đàm phán (chấm sáng ngà) từ bến cảng sang Geneva (đốm xanh nhạt) (diễn hoạ).
  const p0 = run("ket-nap", 28);
  { const S: Pt[] = [[260, 280]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ket-nap") })); }
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2027, groups: [{ path: [[-150, 20], [60, 150], [240, 270]], count: 3, spread: [6,20], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p0, visible: () => clock.near("ket-nap") }));
  { const S: Pt[] = [[-170, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ket-nap") })); }
  // 2. "thanh-vien": vòng các thành viên (đốm xanh nhạt) quanh Geneva; đốm vàng (thành viên thứ 150) nối vào vòng (diễn hoạ).
  const p1 = run("thanh-vien", 28);
  { const S: Pt[] = [[315, 280], [306, 310], [283, 330], [252, 334], [224, 322], [207, 295], [207, 265], [224, 238], [252, 226], [283, 230], [306, 250]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-vien") })); }
  { const S: Pt[] = [[308, 252]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-vien") })); }
  // 3. "xuat-khau": theo thanh kéo, tàu hàng (chấm sáng vàng) từ bến cảng toả đi các đảo xa (thị trường, đốm ngà) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["xuat-khau"] ?? 0) / 0.9);
  { const S: Pt[] = [[-170, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-khau") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2077, groups: [{ path: [[-150, 0], [300, 60]], count: 3, spread: [6,20], color: GOLD, timing: [[0,0],[0.6,1]] }, { path: [[-150, -10], [250, -150]], count: 3, spread: [6,20], color: GOLD, timing: [[0.1,0],[0.7,1]] }, { path: [[-150, 10], [100, 260]], count: 3, spread: [6,20], color: GOLD, timing: [[0.2,0],[0.8,1]] }, { path: [[-150, -20], [120, -300]], count: 3, spread: [6,20], color: GOLD, timing: [[0.3,0],[0.9,1]] }, { path: [[-150, -20], [330, -320]], count: 3, spread: [6,20], color: GOLD, timing: [[0.4,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("xuat-khau") }));
  { const S: Pt[] = [[300, 60], [250, -150], [100, 260], [120, -300], [330, -320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.5 + i * 0.08, 0.65 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-khau") })); }
  // 4. "ve-sau": nhiều tuyến hàng (chấm sáng) qua lại hai chiều giữa bến cảng và các đảo (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-170, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[300, 60], [250, -150], [100, 260], [120, -300], [330, -320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 2117, groups: [{ path: [[-150, 0], [300, 60], [-150, 0]], count: 4, spread: [6,30], color: GOLD, timing: [[0.03,0],[1,1]] }, { path: [[250, -150], [-150, -10], [250, -150]], count: 4, spread: [6,30], color: NGHIA, timing: [[0.06,0],[1,1]] }, { path: [[100, 260], [-150, 10], [100, 260]], count: 4, spread: [6,30], color: NGHIA, timing: [[0.1,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
