import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, NHU_NGUYET, THANH_HOA, DIEN_CHAU } from "./terrain";

type Pt = [number, number];

// Lý Thường Kiệt — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["xuat-than","ba-trieu","thanh-hoa","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 48], [THANH_HOA, 44]];

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
    seed: 1105,
  });

  // 1. "xuat-than": Lý Thường Kiệt (chấm ngà) từ Thăng Long vào Thanh Hóa, Nghệ An; các châu, động (đốm ngà) lần lượt yên (diễn hoạ).
  const p0 = run("xuat-than", 28);
  { const S: Pt[] = [[60, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-than") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1125, groups: [{ path: [[60, 200], [0, 0], [-60, -220]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("xuat-than") }));
  { const S: Pt[] = [[-150, -200], [20, -280], [-120, -300], [40, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.08, 0.75 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-than") })); }
  // 2. "ba-trieu": đạo quân (son) từ Thăng Long lên giữ phòng tuyến sông Như Nguyệt (chuỗi đốm vàng) (diễn hoạ).
  const p1 = run("ba-trieu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1145, groups: [{ path: [[60, 200], [160, 240], [230, 255]], count: 50, spread: [14,60], color: SON, timing: [[0.03,0],[0.6,1]] }], progress: p1, visible: () => clock.near("ba-trieu") }));
  { const S: Pt[] = [[120, 290], [168, 276], [216, 262], [264, 250], [312, 240], [360, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.06, 0.65 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-trieu") })); }
  // 3. "thanh-hoa": theo thanh kéo, các làng quanh trấn Thanh Hóa (đốm vàng) lần lượt sáng; dân (son) ra đồng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["thanh-hoa"] ?? 0) / 0.9);
  { const S: Pt[] = [[-60, -230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-hoa") })); }
  { const S: Pt[] = [[26, -203], [-11, -154], [-71, -141], [-126, -169], [-150, -226], [-132, -284], [-80, -318], [-19, -310], [23, -265]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.08 + i * 0.08, 0.22999999999999998 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-hoa") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1185, groups: [{ path: [[-140, -260], [-110, -230]], count: 14, spread: [8,40], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[20, -200], [-10, -220]], count: 14, spread: [8,40], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("thanh-hoa") }));
  // 4. "ve-sau": Lý Thường Kiệt (chấm ngà) về Thăng Long; quân (son) xuống Diễn Châu rồi trở về; đốm vàng ở Thăng Long lịm dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1195, groups: [{ path: [[-60, -230], [0, 0], [60, 190]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.35,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1205, groups: [{ path: [[60, 190], [-40, -150], [-110, -360], [-40, -150]], count: 40, spread: [14,60], color: SON, timing: [[0.35,0],[0.8,0.8],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[60, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.8, 0.98, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
