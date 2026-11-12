import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAI_BOI, LANG } from "./terrain";

type Pt = [number, number];

// Xuân Thủy, vùng Ramsar đầu tiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bai-boi","ramsar","chim-di-cu","lang-ven-bien"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAI_BOI, 56], [LANG, 36]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2c4a4a", shallow: "#8a9c7c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 300, bushes: 700, grass: 1400, reeds: 1200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1989,
  });

  // 1. "bai-boi": dải đốm ngà (bãi bồi mới) nối dài dần dọc bờ biển phía đông cửa sông (diễn hoạ).
  const p0 = run("bai-boi", 28);
  { const S: Pt[] = [[-10, -60], [15, -60], [39, -60], [64, -60], [88, -60], [113, -60], [137, -60], [162, -60], [186, -60], [211, -60], [235, -60], [260, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bai-boi") })); }
  { const S: Pt[] = [[20, -20], [46, -20], [71, -20], [97, -20], [123, -20], [149, -20], [174, -20], [200, -20]]; world.add(createGlows({ count: S.length, color: "#9be37a", size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bai-boi") })); }
  // 2. "ramsar": đốm vàng lớn (vùng Ramsar) sáng giữa bãi bồi, các vòng đốm tỏa ra (diễn hoạ).
  const p1 = run("ramsar", 28);
  { const S: Pt[] = [[70, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ramsar") })); }
  { const S: Pt[] = [[95, -30], [90, -15], [78, -6], [62, -6], [50, -15], [45, -30], [50, -45], [62, -54], [78, -54], [90, -45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.004, 0.44999999999999996 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ramsar") })); }
  { const S: Pt[] = [[114, -21], [107, -5], [95, 8], [79, 14], [61, 14], [45, 7], [32, -5], [26, -21], [26, -39], [33, -55], [45, -68], [61, -74], [79, -74], [95, -67], [108, -55], [114, -39]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.004, 0.65 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ramsar") })); }
  // 3. "chim-di-cu": theo thanh kéo, đàn chim di cư (chấm xanh nhạt) từ phương bắc bay về, hạ xuống bãi bồi (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chim-di-cu"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 14, seed: 2049, groups: [{ path: [[120, 380], [100, 150], [70, -30]], count: 70, spread: [20,50], color: DICH, timing: [[0,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chim-di-cu") }));
  { const S: Pt[] = [[70, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chim-di-cu") })); }
  // 4. "lang-ven-bien": người làng (son) ra đầm tôm, bãi ngao; ánh đèn làng (đốm vàng) sáng (diễn hoạ).
  const p3 = run("lang-ven-bien", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2069, groups: [{ path: [[-200, 110], [-40, -40]], count: 30, spread: [4,20], color: SON, drop: true, timing: [[0.05,0],[0.7,1]] }], progress: p3, visible: () => clock.near("lang-ven-bien") }));
  { const S: Pt[] = [[-170, 110], [-179, 131], [-200, 140], [-221, 131], [-230, 110], [-221, 89], [-200, 80], [-179, 89]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.05, 0.44999999999999996 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lang-ven-bien") })); }
};

export default setup;
