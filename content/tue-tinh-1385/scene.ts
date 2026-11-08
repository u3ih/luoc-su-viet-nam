import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUONG_XUA, HAI_TRIEU, HO_XA, PHUONG_BAC } from "./terrain";

type Pt = [number, number];

// Tuệ Tĩnh và thuốc Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["o-chua","nam-duoc","di-cong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUONG_XUA, 40], [HAI_TRIEU, 40], [HO_XA, 48]];

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
    seed: 1385,
  });

  // 1. "o-chua": một đốm ngà nhỏ đi từ hương Xưa về chùa Hải Triều; các nhà sư (son) ở chùa; đốm vàng sáng ở chùa (diễn hoạ).
  const p0 = run("o-chua", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1395, groups: [{ path: [HUONG_XUA, [-80, -40], HAI_TRIEU], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("o-chua") }));
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1405, groups: [{ path: [[60, -230], [40, -210]], count: 10, spread: [26,14], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("o-chua") }));
  { const S: Pt[] = [HAI_TRIEU]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("o-chua") })); }
  // 2. "nam-duoc": những đốm xanh vàng (vườn thuốc) lan dần ra quanh chùa Hộ Xá theo thanh kéo; người (son) từ các làng tìm đến (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-duoc"] ?? 0) / 0.9);
  { const S: Pt[] = [[175, 80], [163, 102], [138, 102], [125, 80], [138, 58], [163, 58], [203, 96], [176, 129], [134, 133], [101, 106], [97, 64], [124, 31], [166, 27], [199, 54], [240, 89], [217, 140], [169, 168], [114, 162], [72, 125], [60, 71], [83, 20], [131, -8], [186, -2], [228, 35]]; world.add(createGlows({ count: S.length, color: "#c8e07a", size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-duoc") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1435, groups: [{ path: [[-50, 200], HO_XA], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[1,1]] }, { path: [[350, 250], HO_XA], count: 12, spread: [26,50], color: SON, timing: [[0.2,0],[1,1]] }, { path: [[300, -150], HO_XA], count: 12, spread: [26,50], color: SON, timing: [[0.3,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-duoc") }));
  // 3. "di-cong": đốm ngà (Tuệ Tĩnh) bị đưa đi về phương bắc cùng một đoàn chấm xanh nhạt; người (son) đứng lặng ở Hộ Xá (diễn hoạ).
  const p2 = run("di-cong", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1445, groups: [{ path: [HO_XA, [140, 220], PHUONG_BAC], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.95,1]] }, { path: [HO_XA, [140, 220], PHUONG_BAC], count: 8, spread: [12,30], color: DICH, timing: [[0.05,0],[0.95,1]] }], progress: p2, visible: () => clock.near("di-cong") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1455, groups: [{ path: [[100, 40], [130, 70]], count: 16, spread: [40,20], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("di-cong") }));
  // 4. "ve-sau": một đốm ngà (tấm bia chép lại) theo đường từ phương bắc về hương Xưa; đốm vàng sáng ở hương Xưa, người (son) tụ lại (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1465, groups: [{ path: [PHUONG_BAC, [0, 250], HUONG_XUA], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [HUONG_XUA]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1485, groups: [{ path: [[-300, 200], HUONG_XUA], count: 14, spread: [26,50], color: SON, timing: [[0.4,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
