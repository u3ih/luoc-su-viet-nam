import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DINH, TSN, XUAN_LOC } from "./terrain";

type Pt = [number, number];

// Ngày 30 tháng 4 năm 1975 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["xuan-loc","nam-canh","di-tan","dinh-doc-lap"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DINH, 48], [TSN, 32], [XUAN_LOC, 32]];

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
    seed: 1975,
  });

  // 1. "xuan-loc": tuyến phòng thủ Xuân Lộc (đốm xanh nhạt) giữ một thời gian rồi tắt; các đơn vị (son) từ phía bắc tiến tới (diễn hoạ).
  const p0 = run("xuan-loc", 28);
  { const S: Pt[] = [[339, 268], [313, 298], [274, 290], [261, 252], [287, 222], [326, 230]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuan-loc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1995, groups: [{ path: [[250, 390], [300, 300]], count: 40, spread: [4,14], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: p0, visible: () => clock.near("xuan-loc") }));
  // 2. "nam-canh": theo thanh kéo, năm cánh quân (son) từ năm hướng tiến vào trung tâm; năm mục tiêu (đốm xanh nhạt) giữa thành phố (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-canh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2005, groups: [{ path: [[310, 133], [0, 20]], count: 30, spread: [4,14], color: SON, timing: [[0.02,0],[0.92,0.85]] }, { path: [[-12, 350], [0, 20]], count: 30, spread: [4,14], color: SON, timing: [[0.02,0],[0.92,0.85]] }, { path: [[-317, 111], [0, 20]], count: 30, spread: [4,14], color: SON, timing: [[0.02,0],[0.92,0.85]] }, { path: [[-184, -254], [0, 20]], count: 30, spread: [4,14], color: SON, timing: [[0.02,0],[0.92,0.85]] }, { path: [[203, -240], [0, 20]], count: 30, spread: [4,14], color: SON, timing: [[0.02,0],[0.92,0.85]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-canh") }));
  { const S: Pt[] = [[0, 20], [-120, 150], [-60, 60], [60, -30], [40, 90]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-canh") })); }
  // 3. "di-tan": trực thăng (đốm xanh nhạt) bay từ thành phố ra biển phía đông; đoàn người (ngà) tụ ở các điểm đón (diễn hoạ).
  const p2 = run("di-tan", 28);
  { const S: Pt[] = [[20, 60], [94, 56], [168, 52], [242, 48], [316, 44], [390, 40]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (1 - smoothstep(0.45, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-tan") })); }
  { const S: Pt[] = [[50, 40], [118, 32], [186, 24], [254, 16], [322, 8], [390, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.25 + i * 0.04, 0.4 + i * 0.04, k) * (1 - smoothstep(0.65, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-tan") })); }
  { const S: Pt[] = [[80, 20], [142, 8], [204, -4], [266, -16], [328, -28], [390, -40]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.45 + i * 0.04, 0.6 + i * 0.04, k) * (1 - smoothstep(0.8500000000000001, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-tan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2055, groups: [{ path: [[40, 60], [36, 72], [26, 79], [14, 79], [4, 72], [0, 60], [4, 48], [14, 41], [26, 41], [36, 48], [40, 60]], count: 40, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }, { path: [[-90, 150], [-96, 168], [-111, 179], [-129, 179], [-144, 168], [-150, 150], [-144, 132], [-129, 121], [-111, 121], [-96, 132], [-90, 150]], count: 50, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("di-tan") }));
  // 4. "dinh-doc-lap": các đơn vị (son) đến trước Dinh Độc Lập (đốm xanh nhạt tắt); đốm vàng sáng trên nóc dinh (diễn hoạ).
  const p3 = run("dinh-doc-lap", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2065, groups: [{ path: [[150, 60], [60, 30], [15, 20]], count: 20, spread: [3,8], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("dinh-doc-lap") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.5, 0.65, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dinh-doc-lap") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dinh-doc-lap") })); }
};

export default setup;
