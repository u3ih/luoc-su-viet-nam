import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THAP, DAP, KINH } from "./terrain";

type Pt = [number, number];

// Vua Po Rome và tháp Po Rome — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","dap-kenh","ngoc-khoa","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 48]];

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
    seed: 1627,
  });

  // 1. "len-ngoi": đốm ngà (Po Rome) từ cao nguyên phía tây xuống đồng bằng; người (son) đón ở kinh (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 4, seed: 1637, groups: [{ path: [[-340, 0], [-200, 10], [-10, 20]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1647, groups: [{ path: [[150, -50], [10, 20]], count: 26, spread: [8,60], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "dap-kenh": theo thanh kéo, nước (đốm vàng) từ đập theo kênh chảy vào các cánh đồng; người (son) làm thủy lợi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-kenh"] ?? 0) / 0.9);
  { const S: Pt[] = [[-120, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dap-kenh") })); }
  { const S: Pt[] = [[-120, 110], [-107, 87], [-93, 63], [-80, 40], [-60, 20], [-40, 0], [-20, -20], [7, -33], [33, -47], [60, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.06, 0.25 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dap-kenh") })); }
  { const S: Pt[] = [[-80, 40], [-40, 40], [0, 40], [40, 40], [77, 37], [111, 31], [146, 26], [180, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.06, 0.5 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dap-kenh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1687, groups: [{ path: [[-150, 60], [-90, 50]], count: 20, spread: [10,120], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dap-kenh") }));
  // 3. "ngoc-khoa": đoàn đưa dâu (xanh nhạt, chấm ngà) từ phía bắc tới kinh (diễn hoạ).
  const p2 = run("ngoc-khoa", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1697, groups: [{ path: [[100, 390], [80, 200], [10, 40]], count: 24, spread: [8,50], color: DICH, timing: [[0.05,0],[0.75,1]] }], progress: p2, visible: () => clock.near("ngoc-khoa") }));
  { const S: Pt[] = [[0, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngoc-khoa") })); }
  // 4. "ve-sau": cột đốm vàng (tháp Po Rome) trên đồi Hậu Sanh; người (son) lên tháp làm lễ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[60, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[60, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.11 + i * 0.12, 0.26 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[60, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[60, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 13, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.22999999999999998 + i * 0.12, 0.38 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[60, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1767, groups: [{ path: [[40, 50], [55, -100]], count: 30, spread: [8,60], color: SON, timing: [[0.15,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
