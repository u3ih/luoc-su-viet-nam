import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHUA, KINH } from "./terrain";

type Pt = [number, number];

// Chùa Bút Tháp — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ninh-phuc","trung-tu","quan-am","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHUA, 48]];

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
    seed: 1647,
  });

  // 1. "ninh-phuc": đốm vàng mờ ở ngôi chùa cũ bên đê; vài người (son) qua lại (diễn hoạ).
  const p0 = run("ninh-phuc", 28);
  { const S: Pt[] = [CHUA]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.45 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ninh-phuc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1667, groups: [{ path: [[-120, 60], [0, 40]], count: 8, spread: [10,20], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p0, visible: () => clock.near("ninh-phuc") }));
  // 2. "trung-tu": một đốm ngà (bà hoàng) từ kinh thành về chùa; thợ (son) tụ về; các đốm vàng (gian nhà) sáng dần theo trục chùa theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["trung-tu"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1677, groups: [{ path: [KINH, [-150, 30], CHUA], count: 2, spread: [4,6], color: NGHIA, timing: [[0,0],[0.3,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("trung-tu") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1687, groups: [{ path: [[-200, -150], [10, 30]], count: 20, spread: [30,40], color: SON, timing: [[0.1,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("trung-tu") }));
  { const S: Pt[] = [[20, 10], [20, 20], [20, 30], [20, 40], [20, 50], [20, 60], [20, 70], [5, 40], [35, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.07, 0.44999999999999996 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trung-tu") })); }
  // 3. "quan-am": một vầng đốm vàng nhỏ xòe ra như nghìn tay quanh một đốm sáng giữa; các đốm ngà nhỏ (bức chạm đá) quanh lan can (diễn hoạ).
  const p2 = run("quan-am", 28);
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-am") })); }
  { const S: Pt[] = [[25, 40], [25, 42], [24, 44], [22, 45], [20, 45], [18, 45], [16, 44], [15, 42], [15, 40], [15, 38], [16, 36], [18, 35], [20, 35], [22, 35], [24, 36], [25, 38], [28, 41], [27, 43], [26, 45], [24, 47], [22, 48], [19, 48], [17, 47], [15, 46], [13, 44], [12, 42], [12, 39], [13, 37], [14, 35], [16, 33], [18, 32], [21, 32], [23, 33], [25, 34], [27, 36], [28, 38]]; world.add(createGlows({ count: S.length, color: GOLD, size: 4, minPx: 6, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.15 + i * 0.02, 0.3 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-am") })); }
  { const S: Pt[] = [[30, 70], [29, 75], [26, 78], [21, 80], [16, 79], [13, 77], [10, 72], [10, 68], [13, 63], [16, 61], [21, 60], [26, 62], [29, 65]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 5, minPx: 7, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1.5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.02, 0.65 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-am") })); }
  // 4. "ve-sau": người (son) về dự hội chùa; đốm vàng sáng ở chùa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1737, groups: [{ path: [[-250, -200], CHUA], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[250, -200], CHUA], count: 16, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [CHUA]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
