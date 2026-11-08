import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_DOI, RUONG, BAN_HAI, HOA_LU } from "./terrain";

type Pt = [number, number];

// Lê Hoàn cày ruộng tịch điền — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hoa-binh","cay-ruong","le-tich-dien","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[RUONG, 64]];

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
    seed: 987,
  });

  // 1. "hoa-binh": đoàn người (son) từ Hoa Lư theo đường về núi Đọi; ruộng đồng yên ả (diễn hoạ).
  const p0 = run("hoa-binh", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 997, groups: [{ path: [HOA_LU, [-200, -150], [-40, 0]], count: 30, spread: [14,80], color: SON, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("hoa-binh") }));
  { const S: Pt[] = [HOA_LU]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-binh") })); }
  // 2. "cay-ruong": theo thanh kéo, đốm vàng (vua) cùng người (son) cày từng luống dưới chân núi, để lại vệt; cuối cùng một đốm vàng (hũ vàng) lóe lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["cay-ruong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1017, groups: [{ path: [[-60, -10], [60, -10], [60, 10], [-60, 10], [-60, 30], [60, 30]], count: 1, spread: [2,2], color: GOLD, drop: true, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("cay-ruong") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1027, groups: [{ path: [[-60, -30], [60, -30], [60, -50], [-60, -50]], count: 6, spread: [4,10], color: SON, drop: true, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("cay-ruong") }));
  { const S: Pt[] = [[10, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cay-ruong") })); }
  // 3. "le-tich-dien": đốm bạc (hũ bạc) lóe ở núi Bàn Hải; rồi nhiều đốm vàng (các triều sau làm lễ) lần lượt sáng thành hàng (diễn hoạ).
  const p2 = run("le-tich-dien", 28);
  { const S: Pt[] = [[240, 60]]; world.add(createGlows({ count: S.length, color: "#e8eef4", size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("le-tich-dien") })); }
  { const S: Pt[] = [[-200, -120], [-143, -120], [-86, -120], [-29, -120], [29, -120], [86, -120], [143, -120], [200, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.07, 0.44999999999999996 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("le-tich-dien") })); }
  // 4. "ve-sau": hội tịch điền: người (son) đông vui quanh ruộng; ba, năm, bảy, chín đốm vàng (số sá cày) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1067, groups: [{ path: [[60, 20], [55, 43], [42, 62], [23, 75], [0, 80], [-23, 75], [-42, 62], [-55, 43], [-60, 20], [-55, -3], [-42, -22], [-23, -35], [0, -40], [23, -35], [42, -22], [55, -3], [60, 20]], count: 50, spread: [6,60], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-40, 0], [-40, 20], [-40, 40], [-15, 0], [-15, 10], [-15, 20], [-15, 30], [-15, 40], [15, 0], [15, 7], [15, 13], [15, 20], [15, 27], [15, 33], [15, 40], [40, 0], [40, 5], [40, 10], [40, 15], [40, 20], [40, 25], [40, 30], [40, 35], [40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.02, 0.25 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
