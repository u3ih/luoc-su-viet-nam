import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, HCM } from "./terrain";

type Pt = [number, number];

// Năm APEC Việt Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chuan-bi","hoi-nghi","cap-cao","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 56], [HCM, 32]];

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
    seed: 2006,
  });

  // 1. "chuan-bi": tình nguyện viên (son) tụ về Hà Nội; đốm vàng sáng giữa thành phố (diễn hoạ).
  const p0 = run("chuan-bi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2016, groups: [{ path: [[-150, -60], [-10, 50]], count: 30, spread: [8,30], color: SON, timing: [[0.03,0],[0.6,1]] }, { path: [[150, 180], [10, 70]], count: 30, spread: [8,30], color: SON, timing: [[0.06,0],[0.65,1]] }], progress: p0, visible: () => clock.near("chuan-bi") }));
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chuan-bi") })); }
  // 2. "hoi-nghi": hội nghị đầu năm ở Hà Nội (đốm ngà) rồi giữa năm ở Thành phố Hồ Chí Minh (đốm ngà); đoàn đại biểu (chấm sáng) đi lại giữa hai nơi (diễn hoạ).
  const p1 = run("hoi-nghi", 28);
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-nghi") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2046, groups: [{ path: [[0, 50], [40, -100], [60, -240]], count: 4, spread: [6,20], color: NGHIA, timing: [[0.2,0],[0.7,1]] }], progress: p1, visible: () => clock.near("hoi-nghi") }));
  { const S: Pt[] = [[60, -250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-nghi") })); }
  // 3. "cap-cao": theo thanh kéo, đoàn đại biểu (chấm sáng) từ vòng 21 đốm (các nền kinh tế thành viên) về Hà Nội (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["cap-cao"] ?? 0) / 0.9);
  { const S: Pt[] = [[250, 40], [239, 114], [207, 181], [156, 235], [91, 273], [19, 289], [-56, 284], [-125, 257], [-183, 210], [-225, 148], [-247, 77], [-247, 3], [-225, -68], [-183, -130], [-125, -177], [-56, -204], [19, -209], [91, -193], [156, -155], [207, -101], [239, -34]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.003, 0.15 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cap-cao") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2076, groups: [{ path: [[250, 40], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0,0],[0.4,1]] }, { path: [[156, 235], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0.08,0],[0.48000000000000004,1]] }, { path: [[-56, 284], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0.16,0],[0.56,1]] }, { path: [[-225, 148], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0.24,0],[0.64,1]] }, { path: [[-225, -68], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0.32,0],[0.72,1]] }, { path: [[-56, -204], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0.4,0],[0.8,1]] }, { path: [[156, -155], [0, 60]], count: 2, spread: [4,10], color: NGHIA, timing: [[0.48,0],[0.88,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("cap-cao") }));
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cap-cao") })); }
  // 4. "ve-sau": chuỗi đốm vàng nối Hà Nội với vòng các thành viên (Kế hoạch hành động Hà Nội) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[250, 40], [239, 114], [207, 181], [156, 235], [91, 273], [19, 289], [-56, 284], [-125, 257], [-183, 210], [-225, 148], [-247, 77], [-247, 3], [-225, -68], [-183, -130], [-125, -177], [-56, -204], [19, -209], [91, -193], [156, -155], [207, -101], [239, -34]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[124, 52], [107, 105], [68, 145], [16, 164], [-40, 158], [-87, 129], [-117, 83], [-124, 28], [-107, -25], [-68, -65], [-16, -84], [40, -78], [87, -49], [117, -3]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15 + i * 0.04, 0.3 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
