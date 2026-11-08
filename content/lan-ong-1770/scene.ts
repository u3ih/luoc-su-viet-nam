import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUONG_SON, KINH, HAI_DUONG } from "./terrain";

type Pt = [number, number];

// Hải Thượng Lãn Ông — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["be-ten","huong-son","thuong-kinh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUONG_SON, 56], [KINH, 48]];

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
    counts: { trees: 650, bushes: 700, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1770,
  });

  // 1. "be-ten": một đoàn quân (son) hành quân qua đồng; một đốm ngà rời đoàn đi về Hương Sơn (diễn hoạ).
  const p0 = run("be-ten", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1780, groups: [{ path: [[380, 0], [150, 120], [-100, 330]], count: 36, spread: [16,80], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: p0, visible: () => clock.near("be-ten") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1790, groups: [{ path: [[200, 80], [60, 20], HUONG_SON], count: 1, spread: [3,3], color: NGHIA, timing: [[0.4,0],[1,1]] }], progress: p0, visible: () => clock.near("be-ten") }));
  // 2. "huong-son": những vòng đốm vàng lan dần ra quanh Hương Sơn theo thanh kéo (tiếng thầy thuốc lan khắp vùng); người (son) từ các làng tìm đến (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lam-thuoc"] ?? 0) / 0.9);
  { const S: Pt[] = [[-90, -50], [-111, -21], [-144, -32], [-144, -68], [-111, -79], [-56, -23], [-94, 15], [-147, 14], [-185, -24], [-184, -77], [-146, -115], [-93, -114], [-55, -76], [-2, -26], [-39, 38], [-106, 69], [-179, 54], [-229, 0], [-238, -74], [-201, -138], [-134, -169], [-61, -154], [-11, -100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("huong-son") })); }
  { const S: Pt[] = [HUONG_SON]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("huong-son") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1820, groups: [{ path: [[100, -60], HUONG_SON], count: 14, spread: [26,50], color: SON, timing: [[0.2,0],[1,1]] }, { path: [[-60, 150], HUONG_SON], count: 12, spread: [26,50], color: SON, timing: [[0.3,0],[1,1]] }, { path: [[-50, -250], HUONG_SON], count: 12, spread: [26,50], color: SON, timing: [[0.4,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("huong-son") }));
  // 3. "thuong-kinh": đốm ngà đi từ Hương Sơn ra kinh đô, đốm vàng ở kinh đô sáng lên, rồi đốm ngà trở về Hương Sơn (diễn hoạ).
  const p2 = run("thuong-kinh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1830, groups: [{ path: [HUONG_SON, [60, 40], [180, 180], KINH, [180, 180], [60, 40], HUONG_SON], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.98,1]] }], progress: p2, visible: () => clock.near("thuong-kinh") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thuong-kinh") })); }
  // 4. "ve-sau": hai mươi tám đốm vàng nhỏ (hai mươi tám tập sách) sáng dần ở Hương Sơn; học trò (son) tụ lại (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-127, -53.5], [-118, -53.5], [-109, -53.5], [-100, -53.5], [-91, -53.5], [-82, -53.5], [-73, -53.5], [-127, -44.5], [-118, -44.5], [-109, -44.5], [-100, -44.5], [-91, -44.5], [-82, -44.5], [-73, -44.5], [-127, -35.5], [-118, -35.5], [-109, -35.5], [-100, -35.5], [-91, -35.5], [-82, -35.5], [-73, -35.5], [-127, -26.5], [-118, -26.5], [-109, -26.5], [-100, -26.5], [-91, -26.5], [-82, -26.5], [-73, -26.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.03, 0.18 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1860, groups: [{ path: [[-20, 40], [-90, -20]], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
