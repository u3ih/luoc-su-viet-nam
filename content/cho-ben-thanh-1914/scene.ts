import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHO_CU, CHO_MOI, GA } from "./terrain";

type Pt = [number, number];

// Chợ Bến Thành — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ben-thanh","cho-cu","xay-cho","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHO_MOI, 40]];

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
    seed: 1914,
  });

  // 1. "ben-thanh": ghe thuyền (chấm ngà) đậu dày bên bến; người (son) tụ ở chợ bên sông (diễn hoạ).
  const p0 = run("ben-thanh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1924, groups: [{ path: [[-300, -220], [100, -205]], count: 20, spread: [8,200], color: NGHIA, timing: [[0.02,0],[0.7,1]] }, { path: [[400, -200], [130, -210]], count: 12, spread: [8,120], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p0, visible: () => clock.near("ben-thanh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1934, groups: [{ path: [[100, -150], [100, -175]], count: 30, spread: [40,20], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("ben-thanh") }));
  // 2. "cho-cu": lửa ở chợ cũ (1870) rồi chợ dựng lại (năm đốm vàng = năm gian hàng); con kênh mờ dần (bị lấp) (diễn hoạ).
  const p1 = run("cho-cu", 28);
  world.add(createFires({ sites: [[90, -170], [105, -180]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("cho-cu") * smoothstep(0, 0.9, p1()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[80, -170], [90, -170], [100, -170], [110, -170], [120, -170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cho-cu") })); }
  { const S: Pt[] = [[60, -150], [61, -114], [61, -79], [62, -43], [63, -7], [64, 29], [64, 64], [65, 100]]; world.add(createGlows({ count: S.length, color: DICH, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cho-cu") })); }
  // 3. "xay-cho": theo thanh kéo, ao lầy (đốm xanh nhạt) tắt dần, người (son) lấp ao; các đốm vàng (chợ mới) xếp dần thành khối (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-cho"] ?? 0) / 0.9);
  { const S: Pt[] = [[-144, 2], [-132, 2], [-120, 2], [-108, 2], [-96, 2], [-144, 14], [-132, 14], [-120, 14], [-108, 14], [-96, 14], [-144, 26], [-132, 26], [-120, 26], [-108, 26], [-96, 26], [-144, 38], [-132, 38], [-120, 38], [-108, 38], [-96, 38]]; world.add(createGlows({ count: S.length, color: DICH, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.1, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-cho") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1984, groups: [{ path: [[-80, 20], [-85, 40], [-100, 55], [-120, 60], [-140, 55], [-155, 40], [-160, 20], [-155, 0], [-140, -15], [-120, -20], [-100, -15], [-85, 0], [-80, 20]], count: 24, spread: [4,40], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("xay-cho") }));
  { const S: Pt[] = [[-140, 4], [-132, 4], [-124, 4], [-116, 4], [-108, 4], [-100, 4], [-140, 12], [-132, 12], [-124, 12], [-116, 12], [-108, 12], [-100, 12], [-140, 20], [-132, 20], [-124, 20], [-116, 20], [-108, 20], [-100, 20], [-140, 28], [-132, 28], [-124, 28], [-116, 28], [-108, 28], [-100, 28], [-140, 36], [-132, 36], [-124, 36], [-116, 36], [-108, 36], [-100, 36]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.4 + i * 0.015, 0.55 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-cho") })); }
  // 4. "ve-sau": ba đêm hội: pháo bông (đốm sáng nhiều màu trên cao), người (son) đông nghịt quanh chợ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-90, 20], [-96, 38], [-111, 49], [-129, 49], [-144, 38], [-150, 20], [-144, 2], [-129, -9], [-111, -9], [-96, 2]]; world.add(createGlows({ count: S.length, color: "#ffd37a", size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.03, 0.25 + i * 0.03, k) * (1 - smoothstep(0.5, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-86, 31], [-98, 49], [-119, 56], [-141, 49], [-154, 32], [-154, 9], [-142, -9], [-121, -16], [-99, -9], [-86, 8]]; world.add(createGlows({ count: S.length, color: "#ff9a8a", size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.03, 0.7000000000000001 + i * 0.03, k) * (1 - smoothstep(0.85, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2024, groups: [{ path: [[-300, -100], [-120, -20]], count: 40, spread: [40,80], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[100, 150], [-90, 40]], count: 40, spread: [40,80], color: SON, timing: [[0.05,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
