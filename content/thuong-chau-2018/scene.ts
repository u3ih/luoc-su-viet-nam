import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAN, NOI_BAI, HA_NOI } from "./terrain";

type Pt = [number, number];

// Thường Châu tuyết trắng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vong-bang","luan-luu","chung-ket","don-doi"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAN, 96], [NOI_BAI, 32], [HA_NOI, 40]];

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
    seed: 2045,
  });

  // 1. "vong-bang": ba trận vòng bảng (đốm xanh nhạt thua, vàng thắng, ngà hoà) sáng lần lượt; khán đài (son) quanh sân (diễn hoạ).
  const p0 = run("vong-bang", 28);
  { const S: Pt[] = [[20, 30]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vong-bang") })); }
  { const S: Pt[] = [[60, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vong-bang") })); }
  { const S: Pt[] = [[100, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vong-bang") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2085, groups: [{ path: [[140, 0], [135, 27], [121, 51], [100, 69], [74, 79], [46, 79], [20, 69], [-1, 51], [-15, 27], [-20, 0], [-15, -27], [-1, -51], [20, -69], [46, -79], [74, -79], [100, -69], [121, -51], [135, -27], [140, 0]], count: 60, spread: [2,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("vong-bang") }));
  // 2. "luan-luu": hai loạt luân lưu: hàng đốm vàng (quả thành công) và một đốm xanh nhạt (quả bị cản) sáng lần lượt (diễn hoạ).
  const p1 = run("luan-luu", 28);
  { const S: Pt[] = [[20, 20], [40, 20], [60, 20], [80, 20], [100, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luan-luu") })); }
  { const S: Pt[] = [[60, -5]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luan-luu") })); }
  { const S: Pt[] = [[20, -30], [47, -30], [73, -30], [100, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.55 + i * 0.07, 0.7000000000000001 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luan-luu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2125, groups: [{ path: [[140, 0], [135, 27], [121, 51], [100, 69], [74, 79], [46, 79], [20, 69], [-1, 51], [-15, 27], [-20, 0], [-15, -27], [-1, -51], [20, -69], [46, -79], [74, -79], [100, -69], [121, -51], [135, -27], [140, 0]], count: 60, spread: [2,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("luan-luu") }));
  // 3. "chung-ket": theo thanh kéo, quả bóng (chấm vàng) vẽ đường cong từ chấm đá phạt vào góc cao khung thành (vòng đốm ngà) giữa màn tuyết (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chung-ket"] ?? 0) / 0.9);
  { const S: Pt[] = [[126, 0], [124, 4], [120, 6], [116, 4], [114, 0], [116, -4], [120, -6], [124, -4]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.004, 0.15 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  { const S: Pt[] = [[132, 2], [129, 8], [124, 11], [118, 12], [112, 9], [109, 4], [108, -2], [111, -8], [116, -11], [122, -12], [128, -9], [131, -4]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.002 + i * 0.004, 0.152 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  { const S: Pt[] = [[30, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 12, seed: 2165, groups: [{ path: [[30, -20], [70, 15], [118, 2]], count: 1, spread: [1,1], color: GOLD, timing: [[0.3,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chung-ket") }));
  { const S: Pt[] = [[120, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.82 + i * 0.12, 0.97 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2185, groups: [{ path: [[140, 0], [135, 27], [121, 51], [100, 69], [74, 79], [46, 79], [20, 69], [-1, 51], [-15, 27], [-20, 0], [-15, -27], [-1, -51], [20, -69], [46, -79], [74, -79], [100, -69], [121, -51], [135, -27], [140, 0]], count: 60, spread: [2,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chung-ket") }));
  // 4. "don-doi": xe đón đội (chấm vàng) đi chậm từ Nội Bài về Hà Nội giữa biển người (son) hai bên đường (diễn hoạ).
  const p3 = run("don-doi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2195, groups: [{ path: [[-300, -200], [-250, 0], [-200, 200]], count: 140, spread: [8,22], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("don-doi") }));
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2205, groups: [{ path: [[-300, -200], [-250, 0], [-200, 195]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.95,1]] }], progress: p3, visible: () => clock.near("don-doi") }));
  { const S: Pt[] = [[-200, 200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("don-doi") })); }
};

export default setup;
