import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_LU, NHAT_TRU } from "./terrain";

type Pt = [number, number];

// Những cột kinh Phật ở Hoa Lư — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-viet-vuong","sam-hoi","tim-thay","bao-vat"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_LU, 40], [NHAT_TRU, 16]];

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
    seed: 973,
  });

  // 1. "nam-viet-vuong": đốm vàng (kinh đô Hoa Lư); đoàn sứ (ngà) rời kinh đô đi về phương bắc rồi trở về (diễn hoạ).
  const p0 = run("nam-viet-vuong", 28);
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-viet-vuong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 993, groups: [{ path: [[0, 0], [60, 180], [100, 380], [60, 180], [0, 0]], count: 12, spread: [2,5], color: NGHIA, timing: [[0.1,0],[0.95,1]] }], progress: p0, visible: () => clock.near("nam-viet-vuong") }));
  // 2. "sam-hoi": đốm vàng (kinh đô) mờ đi; vòng đốm ngà nhỏ (những cột kinh) lần lượt sáng quanh kinh đô (diễn hoạ).
  const p1 = run("sam-hoi", 28);
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sam-hoi") })); }
  { const S: Pt[] = [[60, 6], [53, 28], [38, 46], [17, 57], [-6, 60], [-28, 53], [-46, 38], [-57, 17], [-60, -6], [-53, -28], [-38, -46], [-17, -57], [6, -60], [28, -53], [46, -38], [57, -17]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.04, 0.35 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sam-hoi") })); }
  // 3. "tim-thay": theo thanh kéo, các cột kinh (đốm vàng) lần lượt hiện ra dọc bờ sông Hoàng Long; người đắp đê (ngà) làm việc (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tim-thay"] ?? 0) / 0.9);
  { const S: Pt[] = [[-150, 100], [-132, 100], [-115, 100], [-97, 100], [-79, 100], [-62, 100], [-44, 100], [-26, 100], [-9, 100], [9, 100], [26, 100], [44, 100], [62, 100], [79, 100], [97, 100], [115, 100], [132, 100], [150, 100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.05, 0.16999999999999998 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tim-thay") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1033, groups: [{ path: [[-160, 92], [-53, 92], [53, 92], [160, 92]], count: 40, spread: [1,4], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("tim-thay") }));
  // 4. "bao-vat": một cột sáng lớn (cột kinh chùa Nhất Trụ, đốm vàng xếp chồng) ở phía nam; các cột nhỏ (đốm ngà) quây quanh bảo tàng (diễn hoạ).
  const p3 = run("bao-vat", 28);
  { const S: Pt[] = [[40, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
  { const S: Pt[] = [[40, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
  { const S: Pt[] = [[40, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15000000000000002 + i * 0.12, 0.30000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
  { const S: Pt[] = [[40, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
  { const S: Pt[] = [[40, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
  { const S: Pt[] = [[40, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
  { const S: Pt[] = [[29, 6], [22, 20], [10, 28], [-6, 29], [-20, 22], [-28, 10], [-29, -6], [-22, -20], [-10, -28], [6, -29], [20, -22], [28, -10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.02, 0.55 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-vat") })); }
};

export default setup;
