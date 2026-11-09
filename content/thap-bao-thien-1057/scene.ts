import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHUA, HO } from "./terrain";

type Pt = [number, number];

// Tháp Báo Thiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chua","xay-thap","pha-thap","ve-sau"]);
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
    seed: 1057,
  });

  // 1. "chua": người (son) đi lễ về chùa Báo Thiên (đốm vàng) bên hồ (diễn hoạ).
  const p0 = run("chua", 28);
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1077, groups: [{ path: [[-250, -100], [-50, 0]], count: 20, spread: [8,60], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[-100, 250], [-45, 20]], count: 16, spread: [8,60], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("chua") }));
  // 2. "xay-thap": theo thanh kéo, cột đốm vàng (tháp mười hai tầng) cao dần; thợ (son) quanh chân tháp (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-thap"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.095 + i * 0.12, 0.245 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.24499999999999997 + i * 0.12, 0.39499999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 31, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.32 + i * 0.12, 0.47 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.395 + i * 0.12, 0.545 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 45, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.47 + i * 0.12, 0.62 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 52, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.545 + i * 0.12, 0.6950000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 59, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.62 + i * 0.12, 0.77 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 66, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.695 + i * 0.12, 0.845 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 73, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.77 + i * 0.12, 0.92 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.845 + i * 0.12, 0.995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thap") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1207, groups: [{ path: [[-18, 10], [-22, 23], [-33, 31], [-47, 31], [-58, 23], [-62, 10], [-58, -3], [-47, -11], [-33, -11], [-22, -3]], count: 24, spread: [3,140], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-thap") }));
  // 3. "pha-thap": quân Minh (xanh nhạt) tới; cột đốm vàng (tháp) lịm dần (diễn hoạ).
  const p2 = run("pha-thap", 28);
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.002 + i * 0.12, 0.152 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.004 + i * 0.12, 0.154 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.006 + i * 0.12, 0.156 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 31, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.008 + i * 0.12, 0.158 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.01 + i * 0.12, 0.16 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 45, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.012 + i * 0.12, 0.162 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 52, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.014 + i * 0.12, 0.164 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 59, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.016 + i * 0.12, 0.16599999999999998 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 66, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.018000000000000002 + i * 0.12, 0.16799999999999998 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 73, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.022 + i * 0.12, 0.172 + i * 0.12, k) * (1 - smoothstep(0.35, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-thap") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1337, groups: [{ path: [[150, 300], [0, 60], [-30, 25]], count: 30, spread: [10,60], color: DICH, timing: [[0.05,0],[0.5,1]] }], progress: p2, visible: () => clock.near("pha-thap") }));
  // 4. "ve-sau": người (son) đào nền tháp cũ; tám đốm ngà (tượng Kim Cương) hiện ra ở bốn cửa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1347, groups: [{ path: [[-200, -150], [-40, 0]], count: 18, spread: [6,30], color: SON, timing: [[0.03,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-29, 15], [-35, 21], [-45, 21], [-51, 15], [-51, 5], [-45, -1], [-35, -1], [-29, 5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.06, 0.55 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
