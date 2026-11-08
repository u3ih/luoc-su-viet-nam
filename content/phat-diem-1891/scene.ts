import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, QUAN_THE, HO } from "./terrain";

type Pt = [number, number];

// Nhà thờ đá Phát Diệm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dat-moi-boi","xay-dung","kien-truc","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUAN_THE, 64]];

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
    seed: 1891,
  });

  // 1. "dat-moi-boi": đất bồi ven biển; người (son) chở đá đắp một khối núi đá (cụm đốm ngà) để thử độ lún (diễn hoạ).
  const p0 = run("dat-moi-boi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1901, groups: [{ path: [[250, -300], [100, -100], [-40, 75]], count: 30, spread: [8,120], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("dat-moi-boi") }));
  { const S: Pt[] = [[-45, 75], [-40, 75], [-35, 75], [-45, 80], [-40, 80], [-35, 80], [-45, 85], [-40, 85], [-35, 85]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.04, 0.55 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dat-moi-boi") })); }
  // 2. "xay-dung": theo thanh kéo: nhà thờ đá (đốm ngà) trước, rồi nhà thờ lớn (hàng đốm vàng dài), bốn nhà nguyện, cuối cùng phương đình (cột đốm cao) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-dung"] ?? 0) / 0.9);
  { const S: Pt[] = [[-50, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[-6, 29], [0, 29], [6, 29], [-6, 35], [0, 35], [6, 35], [-6, 41], [0, 41], [6, 41], [-6, 47], [0, 47], [6, 47], [-6, 53], [0, 53], [6, 53], [-6, 59], [0, 59], [6, 59], [-6, 65], [0, 65], [6, 65], [-6, 71], [0, 71], [6, 71]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.01, 0.35 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[-30, 20], [30, 20], [-30, 80], [30, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.05, 0.65 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 13, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8400000000000001 + i * 0.12, 0.9900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.88 + i * 0.12, 1.03 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  // 3. "kien-truc": các hàng đốm vàng (48 cột gỗ lim) sáng dọc lòng nhà thờ lớn (diễn hoạ).
  const p2 = run("kien-truc", 28);
  { const S: Pt[] = [[-7.5, 39.5], [-4.5, 39.5], [-1.5, 39.5], [1.5, 39.5], [4.5, 39.5], [7.5, 39.5], [-7.5, 42.5], [-4.5, 42.5], [-1.5, 42.5], [1.5, 42.5], [4.5, 42.5], [7.5, 42.5], [-7.5, 45.5], [-4.5, 45.5], [-1.5, 45.5], [1.5, 45.5], [4.5, 45.5], [7.5, 45.5], [-7.5, 48.5], [-4.5, 48.5], [-1.5, 48.5], [1.5, 48.5], [4.5, 48.5], [7.5, 48.5], [-7.5, 51.5], [-4.5, 51.5], [-1.5, 51.5], [1.5, 51.5], [4.5, 51.5], [7.5, 51.5], [-7.5, 54.5], [-4.5, 54.5], [-1.5, 54.5], [1.5, 54.5], [4.5, 54.5], [7.5, 54.5], [-7.5, 57.5], [-4.5, 57.5], [-1.5, 57.5], [1.5, 57.5], [4.5, 57.5], [7.5, 57.5], [-7.5, 60.5], [-4.5, 60.5], [-1.5, 60.5], [1.5, 60.5], [4.5, 60.5], [7.5, 60.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.008, 0.2 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kien-truc") })); }
  // 4. "ve-sau": nhiều đốm vàng ấm (đèn) sáng khắp quần thể và soi xuống hồ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-42, -5], [-28, -5], [-14, -5], [0, -5], [14, -5], [28, -5], [42, -5], [-42, 9], [-28, 9], [-14, 9], [0, 9], [14, 9], [28, 9], [42, 9], [-42, 23], [-28, 23], [-14, 23], [0, 23], [14, 23], [28, 23], [42, 23], [-42, 37], [-28, 37], [-14, 37], [0, 37], [14, 37], [28, 37], [42, 37], [-42, 51], [-28, 51], [-14, 51], [0, 51], [14, 51], [28, 51], [42, 51], [-42, 65], [-28, 65], [-14, 65], [0, 65], [14, 65], [28, 65], [42, 65], [34, -60], [29, -43], [17, -31], [0, -26], [-17, -31], [-29, -43], [-34, -60], [-29, -77], [-17, -89], [0, -94], [17, -89], [29, -77]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.008, 0.18 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2001, groups: [{ path: [[0, -200], [0, -100]], count: 24, spread: [60,30], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
