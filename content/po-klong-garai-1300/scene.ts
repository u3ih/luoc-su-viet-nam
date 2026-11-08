import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DOI_TRAU, TANG_DA } from "./terrain";

type Pt = [number, number];

// Tháp Po Klong Garai — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["truyen-thuyet","dung-thap","tuong-vua","ve-sau"]);
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
    counts: { trees: 220, bushes: 700, grass: 2200, reeds: 300 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1300,
  });

  // 1. "truyen-thuyet": một chấm (Jatol) nghỉ bên tảng đá; hai đốm trắng (hai con rồng trắng — truyền thuyết) lượn quanh rồi biến mất (diễn hoạ).
  const p0 = run("truyen-thuyet", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1310, groups: [{ path: [[-260, 20], [-205, 58]], count: 1, spread: [2,2], color: SON, timing: [[0.02,0],[0.3,1]] }], progress: p0, visible: () => clock.near("truyen-thuyet") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 6, seed: 1320, groups: [{ path: [[-200, 80], [-180, 60], [-200, 40], [-220, 60], [-200, 80], [-180, 60]], count: 2, spread: [4,10], color: "#f4f2ea", timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("truyen-thuyet") }));
  // 2. "dung-thap": theo thanh kéo, ba cột đốm vàng (tháp chính cao, tháp lửa, tháp cổng thấp hơn) mọc lên trên đồi Trầu (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dung-thap"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.06 + i * 0.12, 0.21 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.13999999999999999 + i * 0.12, 0.29 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 29, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.18 + i * 0.12, 0.32999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 35, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.22 + i * 0.12, 0.37 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 41, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.26 + i * 0.12, 0.41000000000000003 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-30, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-30, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-30, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 19, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  // 3. "tuong-vua": đốm vàng dịu (tượng thờ vua) sáng trong lòng tháp chính; đốm ngà (bia) bên cạnh (diễn hoạ).
  const p2 = run("tuong-vua", 28);
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuong-vua") })); }
  { const S: Pt[] = [[20, 35]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuong-vua") })); }
  // 4. "ve-sau": người (son) từ các làng xa lên đồi hành lễ; ba đốm vàng (ba tháp) sáng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1480, groups: [{ path: [[-300, -150], [0, 20]], count: 18, spread: [10,60], color: SON, timing: [[0.05,0],[0.9,1]] }, { path: [[250, -150], [10, 20]], count: 16, spread: [10,60], color: SON, timing: [[0.15,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[0, 50], [-30, 30], [30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
