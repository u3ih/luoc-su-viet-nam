import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHUA, KHO, YEN_TU } from "./terrain";

type Pt = [number, number];

// Mộc bản chùa Vĩnh Nghiêm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chua-la","van-kinh","bangkok","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHUA, 32], [KHO, 24]];

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
    seed: 2021,
  });

  // 1. "chua-la": đốm vàng (chùa) sáng bên ngã ba sông; tăng ni (chấm ngà) từ nhiều nơi tụ về học (diễn hoạ).
  const p0 = run("chua-la", 28);
  { const S: Pt[] = [[40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-la") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2041, groups: [{ path: [[-200, 200], [35, 45]], count: 30, spread: [3,12], color: NGHIA, timing: [[0.1,0],[0.8,1]] }, { path: [[250, -150], [45, 35]], count: 30, spread: [3,12], color: NGHIA, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("chua-la") }));
  // 2. "van-kinh": theo thanh kéo, các bộ ván kinh (lưới đốm vàng) lần lượt xếp đầy kho rộng mười gian (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["van-kinh"] ?? 0) / 0.9);
  { const S: Pt[] = [[73, 41], [79, 41], [85, 41], [91, 41], [97, 41], [103, 41], [109, 41], [115, 41], [121, 41], [127, 41], [73, 47], [79, 47], [85, 47], [91, 47], [97, 47], [103, 47], [109, 47], [115, 47], [121, 47], [127, 47], [73, 53], [79, 53], [85, 53], [91, 53], [97, 53], [103, 53], [109, 53], [115, 53], [121, 53], [127, 53], [73, 59], [79, 59], [85, 59], [91, 59], [97, 59], [103, 59], [109, 59], [115, 59], [121, 59], [127, 59]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.022, 0.16999999999999998 + i * 0.022, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-kinh") })); }
  // 3. "bangkok": một chấm ngà (hồ sơ) đi xa rồi trở về; đốm vàng lớn (di sản tư liệu) sáng trên kho ván (diễn hoạ).
  const p2 = run("bangkok", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2061, groups: [{ path: [[100, 50], [300, -300], [110, 45]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p2, visible: () => clock.near("bangkok") }));
  { const S: Pt[] = [[73, 41], [79, 41], [85, 41], [91, 41], [97, 41], [103, 41], [109, 41], [115, 41], [121, 41], [127, 41], [73, 47], [79, 47], [85, 47], [91, 47], [97, 47], [103, 47], [109, 47], [115, 47], [121, 47], [127, 47], [73, 53], [79, 53], [85, 53], [91, 53], [97, 53], [103, 53], [109, 53], [115, 53], [121, 53], [127, 53], [73, 59], [79, 59], [85, 59], [91, 59], [97, 59], [103, 59], [109, 59], [115, 59], [121, 59], [127, 59]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bangkok") })); }
  { const S: Pt[] = [[100, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.72 + i * 0.12, 0.87 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bangkok") })); }
  // 4. "ve-sau": các cụm di tích Trúc Lâm (đốm vàng: Vĩnh Nghiêm, Yên Tử, các nơi khác) cùng sáng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[40, 40], [270, 250], [180, 120], [-120, 160], [120, -120], [220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2101, groups: [{ path: [[40, 40], [260, 240]], count: 30, spread: [3,10], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
