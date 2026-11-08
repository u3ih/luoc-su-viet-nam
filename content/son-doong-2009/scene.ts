import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CUA_HANG, BIA_RUNG, GIENG_A, GIENG_B } from "./terrain";

type Pt = [number, number];

// Hang Sơn Đoòng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ho-khanh","tham-hiem","kich-thuoc","ve-sau"]);
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
    counts: { trees: 1300, bushes: 900, grass: 1400, reeds: 200 },
    forestAt: 0.22,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2010,
  });

  // 1. "ho-khanh": mưa (đốm xanh nhạt rơi) trên rừng; một chấm (người đi rừng) trú vào cửa hang (diễn hoạ).
  const p0 = run("ho-khanh", 28);
  { const S: Pt[] = [[-15, -65], [15, -65], [45, -65], [75, -65], [105, -65], [135, -65], [-15, -35], [15, -35], [45, -35], [75, -35], [105, -35], [135, -35], [-15, -5], [15, -5], [45, -5], [75, -5], [105, -5], [135, -5], [-15, 25], [15, 25], [45, 25], [75, 25], [105, 25], [135, 25]]; world.add(createGlows({ count: S.length, color: DICH, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.008, 0.16999999999999998 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-khanh") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2030, groups: [{ path: [[-80, -100], [95, 5]], count: 1, spread: [2,2], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("ho-khanh") }));
  // 2. "tham-hiem": theo thanh kéo, đoàn thám hiểm (chấm ngà, có đèn) băng rừng từ bìa rừng tới cửa hang (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tham-hiem"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 2040, groups: [{ path: [BIA_RUNG, [-150, -180], [20, -100], [95, 5]], count: 10, spread: [4,40], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tham-hiem") }));
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tham-hiem") })); }
  // 3. "kich-thuoc": cột đốm sáng cao vọt (vòm hang hơn 200 m) ở cửa hang; đốm xanh dài (sông ngầm) (diễn hoạ).
  const p2 = run("kich-thuoc", 28);
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 28, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.09 + i * 0.12, 0.24 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 49, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 71, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.21 + i * 0.12, 0.36 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 92, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.27 + i * 0.12, 0.42000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 114, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.32999999999999996 + i * 0.12, 0.48 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 135, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.39 + i * 0.12, 0.54 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 157, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.44999999999999996 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 178, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.51 + i * 0.12, 0.66 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 200, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5700000000000001 + i * 0.12, 0.7200000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  { const S: Pt[] = [[100, 10], [96, 39], [91, 68], [87, 97], [82, 126], [76, 150], [67, 170], [58, 190], [49, 210], [40, 230]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.03, 0.75 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kich-thuoc") })); }
  // 4. "ve-sau": hai luồng sáng (giếng trời) rọi xuống rừng trong hang (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[80, 140]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 140]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 35, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.08 + i * 0.12, 0.22999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 140]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 66, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.11 + i * 0.12, 0.26 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 140]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 98, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.14 + i * 0.12, 0.29000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 140]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 129, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 140]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 160, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 230]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 230]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 35, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.32999999999999996 + i * 0.12, 0.48 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 230]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 66, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.36 + i * 0.12, 0.51 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 230]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 98, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.39 + i * 0.12, 0.54 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 230]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 129, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.42 + i * 0.12, 0.57 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 230]]; world.add(createGlows({ count: S.length, color: "#fff1c4", size: 26, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 160, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.44999999999999996 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
