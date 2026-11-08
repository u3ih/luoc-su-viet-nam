import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_KHE, BEN, HUE, THAP } from "./terrain";

type Pt = [number, number];

// Chùa Thiên Mụ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ha-khe","khoi-lap","hong-chung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUE, 40]];

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
    seed: 1601,
  });

  // 1. "ha-khe": đốm vàng xa xưa (ngôi chùa cũ) trên đồi; một đốm ngà (bà lão trong truyền thuyết) hiện rồi tắt; đoàn người (son) ngược bờ sông (diễn hoạ).
  const p0 = run("ha-khe", 28);
  { const S: Pt[] = [[-40, 15]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.5, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ha-khe") })); }
  { const S: Pt[] = [[-30, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ha-khe") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1631, groups: [{ path: [[300, 40], [100, -20], [0, -20]], count: 14, spread: [10,40], color: SON, timing: [[0.4,0],[1,1]] }], progress: p0, visible: () => clock.near("ha-khe") }));
  // 2. "khoi-lap": người (son) từ bến sông lên đồi Hà Khê theo thanh kéo; đốm vàng (chùa mới) sáng dần trên đồi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoi-lap"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1641, groups: [{ path: [BEN, [-40, -15], [-40, 5]], count: 24, spread: [30,40], color: SON, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoi-lap") }));
  { const S: Pt[] = [[-40, 15]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-lap") })); }
  // 3. "hong-chung": đốm vàng lớn (Đại Hồng Chung) sáng; nhiều đốm vàng nhỏ (các điện, lầu trùng tu) sáng dần quanh đồi (diễn hoạ).
  const p2 = run("hong-chung", 28);
  { const S: Pt[] = [[-50, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hong-chung") })); }
  { const S: Pt[] = [[-14, 10], [-22, 28], [-40, 36], [-58, 28], [-66, 10], [-58, -8], [-40, -16], [-22, -8]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.06, 0.5 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hong-chung") })); }
  // 4. "ve-sau": một cột đốm vàng xếp chồng bảy tầng (tháp Phước Duyên) sáng dần từ dưới lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 25, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 28, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 31, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 34, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 37, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-30, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
