import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CO_LOA, LANG_A, LANG_B, LANG_C, LANG_D, TAY_AU } from "./terrain";

type Pt = [number, number];

// Người Lạc Việt — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lac-dien","dong-son","au-lac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CO_LOA, 40], [LANG_A, 32], [LANG_B, 32], [LANG_C, 32], [LANG_D, 32]];

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
    seed: 690,
  });

  // 1. "lac-dien": ruộng Lạc ven sông (chuỗi đốm vàng) sáng dần theo con nước; Lạc dân (son) ra đồng (diễn hoạ).
  const p0 = run("lac-dien", 28);
  { const S: Pt[] = [[-200, 160], [-153, 127], [-107, 93], [-60, 60], [-20, 20], [20, -20], [60, -60], [107, -107], [153, -153], [200, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lac-dien") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 710, groups: [{ path: [[-150, 90], [-110, 60]], count: 16, spread: [8,40], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[60, 40], [20, 0]], count: 16, spread: [8,40], color: SON, timing: [[0.1,0],[0.65,1]] }, { path: [[180, -60], [140, -110]], count: 16, spread: [8,40], color: SON, timing: [[0.15,0],[0.7,1]] }], progress: p0, visible: () => clock.near("lac-dien") }));
  // 2. "dong-son": các làng (đốm ngà) sáng lên; người Lạc (son) quây quần quanh làng (diễn hoạ).
  const p1 = run("dong-son", 28);
  { const S: Pt[] = [[-150, 90], [60, 40], [-60, -60], [180, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-son") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 730, groups: [{ path: [[-150, 90], [-150, 90]], count: 20, spread: [6,30], color: SON, timing: [[0,1],[1,1]] }, { path: [[60, 40], [60, 40]], count: 20, spread: [6,30], color: SON, timing: [[0,1],[1,1]] }, { path: [[-60, -60], [-60, -60]], count: 20, spread: [6,30], color: SON, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("dong-son") }));
  // 3. "au-lac": theo thanh kéo, người Âu (xanh nhạt) từ tây bắc tiến xuống; các Lạc tướng (chấm ngà) từ các làng quy về Cổ Loa (đốm vàng) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["au-lac"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 740, groups: [{ path: [[-300, 300], [-80, 230], [70, 200]], count: 40, spread: [16,60], color: DICH, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("au-lac") }));
  world.add(createCrowd({ size: 6, height: ground, seed: 750, groups: [{ path: [[-150, 90], [80, 190]], count: 6, spread: [4,16], color: NGHIA, timing: [[0.3,0],[0.9,1]] }, { path: [[60, 40], [90, 190]], count: 6, spread: [4,16], color: NGHIA, timing: [[0.35,0],[0.92,1]] }, { path: [[-60, -60], [80, 185]], count: 6, spread: [4,16], color: NGHIA, timing: [[0.4,0],[0.95,1]] }, { path: [[180, -60], [100, 190]], count: 6, spread: [4,16], color: NGHIA, timing: [[0.45,0],[0.97,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("au-lac") }));
  { const S: Pt[] = [[90, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("au-lac") })); }
  // 4. "ve-sau": các làng Lạc (đốm ngà) mờ dần theo thời gian; ruộng ven sông (chuỗi đốm vàng) vẫn còn (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-150, 90], [60, 40], [-60, -60], [180, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.4, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-200, 160], [-153, 127], [-107, 93], [-60, 60], [-20, 20], [20, -20], [60, -60], [107, -107], [153, -153], [200, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 790, groups: [{ path: [[-60, -60], [-20, -20]], count: 24, spread: [10,60], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
