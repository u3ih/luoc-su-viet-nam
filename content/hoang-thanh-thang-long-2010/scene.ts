import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOANG_THANH, NUI_NUNG, KHAI_QUAT } from "./terrain";

type Pt = [number, number];

// Hoàng thành Thăng Long — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Hoàng thành cách điệu.
const WALLS: Wall[] = [
  { at: square(0, 20, 90, 0), base: 10, top: 6, height: 5, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nghin-nam","khai-quat","xep-hang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KHAI_QUAT, 24]];

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
    seed: 2010,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "nghin-nam": đốm vàng (điện Kính Thiên) trên núi Nùng; các đốm theo thời gian lần lượt sáng (Lý, Trần, Lê, Nguyễn) (diễn hoạ).
  const p0 = run("nghin-nam", 28);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghin-nam") })); }
  { const S: Pt[] = [[60, 20], [0, 80], [-60, 20], [0, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.15, 0.35 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghin-nam") })); }
  // 2. "khai-quat": theo thanh kéo, các lớp đốm (tầng văn hóa) lộ ra trong hố khai quật: mỗi lớp một màu, chồng lên nhau (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khai-quat"] ?? 0) / 0.9);
  { const S: Pt[] = [[-65, -29], [-59, -29], [-53, -29], [-47, -29], [-41, -29], [-35, -29], [-65, -23], [-59, -23], [-53, -23], [-47, -23], [-41, -23], [-35, -23], [-65, -17], [-59, -17], [-53, -17], [-47, -17], [-41, -17], [-35, -17], [-65, -11], [-59, -11], [-53, -11], [-47, -11], [-41, -11], [-35, -11]]; world.add(createGlows({ count: S.length, color: "#c8b8a0", size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.008, 0.16999999999999998 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[-65, -29], [-59, -29], [-53, -29], [-47, -29], [-41, -29], [-35, -29], [-65, -23], [-59, -23], [-53, -23], [-47, -23], [-41, -23], [-35, -23], [-65, -17], [-59, -17], [-53, -17], [-47, -17], [-41, -17], [-35, -17], [-65, -11], [-59, -11], [-53, -11], [-47, -11], [-41, -11], [-35, -11]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.008, 0.4 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[-65, -29], [-59, -29], [-53, -29], [-47, -29], [-41, -29], [-35, -29], [-65, -23], [-59, -23], [-53, -23], [-47, -23], [-41, -23], [-35, -23], [-65, -17], [-59, -17], [-53, -17], [-47, -17], [-41, -17], [-35, -17], [-65, -11], [-59, -11], [-53, -11], [-47, -11], [-41, -11], [-35, -11]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 7, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.008, 0.65 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[-65, -29], [-59, -29], [-53, -29], [-47, -29], [-41, -29], [-35, -29], [-65, -23], [-59, -23], [-53, -23], [-47, -23], [-41, -23], [-35, -23], [-65, -17], [-59, -17], [-53, -17], [-47, -17], [-41, -17], [-35, -17], [-65, -11], [-59, -11], [-53, -11], [-47, -11], [-41, -11], [-35, -11]]; world.add(createGlows({ count: S.length, color: SON, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.008, 0.9 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2080, groups: [{ path: [[-24, -20], [-29, -5], [-42, 5], [-58, 5], [-71, -5], [-76, -20], [-71, -35], [-58, -45], [-42, -45], [-29, -35], [-24, -20]], count: 12, spread: [4,30], color: NGHIA, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khai-quat") }));
  // 3. "xep-hang": đốm ngà lớn (xếp hạng di tích quốc gia đặc biệt) sáng giữa hoàng thành (diễn hoạ).
  const p2 = run("xep-hang", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xep-hang") })); }
  // 4. "ve-sau": đêm: vòng đốm vàng quanh hoàng thành (nghìn năm Thăng Long); đốm vàng lớn trên cao (ghi danh) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[95, 20], [92, 45], [82, 68], [67, 87], [48, 102], [25, 112], [0, 115], [-25, 112], [-47, 102], [-67, 87], [-82, 68], [-92, 45], [-95, 20], [-92, -5], [-82, -28], [-67, -47], [-48, -62], [-25, -72], [0, -75], [25, -72], [48, -62], [67, -47], [82, -28], [92, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 45, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
