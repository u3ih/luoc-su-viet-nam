import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, SU_QUAN, CHUONG_DUC } from "./terrain";

type Pt = [number, number];

// Đại Việt sử ký toàn thư — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ngo-si-lien","muoi-lam-quyen","bo-sung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 72]];

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
    seed: 1479,
  });

  // 1. "ngo-si-lien": đốm ngà đi từ Chương Đức lên kinh đô; các đốm vàng (bia tiến sĩ) dựng lên ở kinh (diễn hoạ).
  const p0 = run("ngo-si-lien", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1489, groups: [{ path: [CHUONG_DUC, [-120, -80], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.55,1]] }], progress: p0, visible: () => clock.near("ngo-si-lien") }));
  { const S: Pt[] = [[-30, 110], [-15, 110], [0, 110], [15, 110], [30, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.06, 0.7000000000000001 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngo-si-lien") })); }
  // 2. "muoi-lam-quyen": mười lăm đốm vàng (mười lăm quyển) lần lượt sáng ở Sử quán theo thanh kéo — năm quyển ngoại kỷ, mười quyển bản kỷ (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["muoi-lam-quyen"] ?? 0) / 0.9);
  { const S: Pt[] = [[2, 68], [11, 68], [20, 68], [29, 68], [38, 68]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.06, 0.16999999999999998 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muoi-lam-quyen") })); }
  { const S: Pt[] = [[2, 47.5], [11, 47.5], [20, 47.5], [29, 47.5], [38, 47.5], [2, 56.5], [11, 56.5], [20, 56.5], [29, 56.5], [38, 56.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.32 + i * 0.06, 0.47 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muoi-lam-quyen") })); }
  // 3. "bo-sung": các đốm vàng mới nối thêm vào hàng (những lần bổ sung qua nhiều đời); sử quan (son) đến rồi đi (diễn hoạ).
  const p2 = run("bo-sung", 28);
  { const S: Pt[] = [[2, 51], [11, 51], [20, 51], [29, 51], [38, 51], [2, 60], [11, 60], [20, 60], [29, 60], [38, 60], [2, 69], [11, 69], [20, 69], [29, 69], [38, 69]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.005, 0.15 + i * 0.005, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bo-sung") })); }
  { const S: Pt[] = [[-11.5, 21], [-2.5, 21], [6.5, 21], [15.5, 21], [24.5, 21], [33.5, 21], [42.5, 21], [51.5, 21], [-11.5, 30], [-2.5, 30], [6.5, 30], [15.5, 30], [24.5, 30], [33.5, 30], [42.5, 30], [51.5, 30], [-11.5, 39], [-2.5, 39], [6.5, 39], [15.5, 39], [24.5, 39], [33.5, 39], [42.5, 39], [51.5, 39]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.03, 0.25 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bo-sung") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1549, groups: [{ path: [[-60, 20], [0, 40], [60, 20]], count: 8, spread: [10,30], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p2, visible: () => clock.near("bo-sung") }));
  // 4. "ve-sau": rất nhiều đốm vàng nhỏ (ván khắc, trang in năm 1697) sáng rực ở Sử quán (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-11.5, 32.5], [-4.5, 32.5], [2.5, 32.5], [9.5, 32.5], [16.5, 32.5], [23.5, 32.5], [30.5, 32.5], [37.5, 32.5], [44.5, 32.5], [51.5, 32.5], [-11.5, 39.5], [-4.5, 39.5], [2.5, 39.5], [9.5, 39.5], [16.5, 39.5], [23.5, 39.5], [30.5, 39.5], [37.5, 39.5], [44.5, 39.5], [51.5, 39.5], [-11.5, 46.5], [-4.5, 46.5], [2.5, 46.5], [9.5, 46.5], [16.5, 46.5], [23.5, 46.5], [30.5, 46.5], [37.5, 46.5], [44.5, 46.5], [51.5, 46.5], [-11.5, 53.5], [-4.5, 53.5], [2.5, 53.5], [9.5, 53.5], [16.5, 53.5], [23.5, 53.5], [30.5, 53.5], [37.5, 53.5], [44.5, 53.5], [51.5, 53.5], [-11.5, 60.5], [-4.5, 60.5], [2.5, 60.5], [9.5, 60.5], [16.5, 60.5], [23.5, 60.5], [30.5, 60.5], [37.5, 60.5], [44.5, 60.5], [51.5, 60.5], [-11.5, 67.5], [-4.5, 67.5], [2.5, 67.5], [9.5, 67.5], [16.5, 67.5], [23.5, 67.5], [30.5, 67.5], [37.5, 67.5], [44.5, 67.5], [51.5, 67.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 8, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.012, 0.18 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
