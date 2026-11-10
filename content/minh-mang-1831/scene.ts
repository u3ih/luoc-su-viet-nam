import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUE } from "./terrain";

type Pt = [number, number];

// Minh Mạng lập tỉnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","trieu-dinh","lap-tinh","ve-sau"]);
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
    seed: 1831,
  });

  // 1. "len-ngoi": đốm vàng (vua mới) sáng ở kinh đô; triều thần (chấm ngà) tụ về (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  { const S: Pt[] = [[30, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1851, groups: [{ path: [[-120, -80], [20, -10]], count: 24, spread: [8,30], color: NGHIA, timing: [[0.03,0],[0.6,1]] }, { path: [[-100, 100], [20, 10]], count: 24, spread: [8,30], color: NGHIA, timing: [[0.05,0],[0.65,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "trieu-dinh": Nội các, Cơ mật viện (hai đốm ngà) sáng cạnh đốm vàng; các quan (chấm ngà) xếp hàng theo phẩm trật (diễn hoạ).
  const p1 = run("trieu-dinh", 28);
  { const S: Pt[] = [[30, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trieu-dinh") })); }
  { const S: Pt[] = [[0, 20], [60, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.2, 0.35 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trieu-dinh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1881, groups: [{ path: [[30, -60], [30, -25]], count: 36, spread: [6,14], color: NGHIA, timing: [[0.4,0],[0.9,1]] }], progress: p1, visible: () => clock.near("trieu-dinh") }));
  // 3. "lap-tinh": theo thanh kéo, ba mươi tỉnh (đốm vàng) lần lượt sáng dọc dải đất từ bắc vào nam; quan lại (chấm ngà) từ kinh đô toả đi (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["lap-tinh"] ?? 0) / 0.9);
  { const S: Pt[] = [[-170, 360], [-158, 333], [-146, 307], [-134, 280], [-122, 254], [-103, 229], [-84, 205], [-65, 181], [-46, 157], [-31, 134], [-19, 113], [-7, 91], [5, 69], [14, 46], [21, 22], [29, -2], [36, -26], [40, -51], [40, -78], [40, -104], [40, -131], [37, -158], [28, -184], [18, -211], [8, -237], [-2, -263], [-17, -288], [-31, -312], [-46, -336], [-60, -360]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lap-tinh") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1901, groups: [{ path: [[30, 0], [-120, 250]], count: 10, spread: [6,30], color: NGHIA, timing: [[0.05,0],[0.6,1]] }, { path: [[30, 0], [20, -250]], count: 10, spread: [6,30], color: NGHIA, timing: [[0.1,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("lap-tinh") }));
  // 4. "ve-sau": các tỉnh (đốm vàng) sáng đều; dân (son) khẩn hoang ra vùng ven biển (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-170, 360], [-158, 333], [-146, 307], [-134, 280], [-122, 254], [-103, 229], [-84, 205], [-65, 181], [-46, 157], [-31, 134], [-19, 113], [-7, 91], [5, 69], [14, 46], [21, 22], [29, -2], [36, -26], [40, -51], [40, -78], [40, -104], [40, -131], [37, -158], [28, -184], [18, -211], [8, -237], [-2, -263], [-17, -288], [-31, -312], [-46, -336], [-60, -360]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1921, groups: [{ path: [[-60, 250], [60, 300]], count: 16, spread: [8,40], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-20, -250], [80, -280]], count: 16, spread: [8,40], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
