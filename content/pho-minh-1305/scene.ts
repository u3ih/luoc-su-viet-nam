import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THIEN_TRUONG, CHUA } from "./terrain";

type Pt = [number, number];

// Tháp Phổ Minh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chua-pho-minh","dung-thap","xa-ly","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHUA, 48], [THIEN_TRUONG, 64]];

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
    seed: 1305,
  });

  // 1. "chua-pho-minh": đốm vàng (cung Trùng Quang) ở hành cung; người (son) dựng chùa phía tây cung (diễn hoạ).
  const p0 = run("chua-pho-minh", 28);
  { const S: Pt[] = [THIEN_TRUONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-pho-minh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1325, groups: [{ path: [[100, 120], [-10, 40]], count: 20, spread: [10,60], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("chua-pho-minh") }));
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-pho-minh") })); }
  // 2. "dung-thap": theo thanh kéo, cột 14 đốm vàng (14 tầng tháp) lên dần; hai tầng dưới màu ngà (đá), các tầng trên vàng (gạch) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dung-thap"] ?? 0) / 0.9);
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.07 + i * 0.12, 0.22 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.12 + i * 0.12, 0.27 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.185 + i * 0.12, 0.33499999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 13, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.315 + i * 0.12, 0.46499999999999997 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 19, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.38 + i * 0.12, 0.53 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.445 + i * 0.12, 0.595 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.51 + i * 0.12, 0.66 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 27, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.575 + i * 0.12, 0.725 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.64 + i * 0.12, 0.79 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 33, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.705 + i * 0.12, 0.855 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 35, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.77 + i * 0.12, 0.92 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8350000000000001 + i * 0.12, 0.9850000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-thap") })); }
  // 3. "xa-ly": đốm ngà (xá lỵ) theo đường từ xa về, nằm vào lòng tháp (diễn hoạ).
  const p2 = run("xa-ly", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 6, seed: 1485, groups: [{ path: [[-300, 300], [-100, 150], [-20, 45]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p2, visible: () => clock.near("xa-ly") }));
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.002 + i * 0.12, 0.152 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.004 + i * 0.12, 0.154 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.006 + i * 0.12, 0.156 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 27, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.008 + i * 0.12, 0.158 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.01 + i * 0.12, 0.16 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.012 + i * 0.12, 0.162 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xa-ly") })); }
  // 4. "ve-sau": đỉnh tháp (đốm trên cùng) lịm đi rồi sáng lại; người (son) sửa tháp (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.002 + i * 0.12, 0.152 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.004 + i * 0.12, 0.154 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.006 + i * 0.12, 0.156 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 26, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.008 + i * 0.12, 0.158 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.01 + i * 0.12, 0.16 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.15, 0.3, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1645, groups: [{ path: [[-4, 40], [-7, 49], [-15, 55], [-25, 55], [-33, 49], [-36, 40], [-33, 31], [-25, 25], [-15, 25], [-7, 31], [-4, 40]], count: 12, spread: [4,20], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
