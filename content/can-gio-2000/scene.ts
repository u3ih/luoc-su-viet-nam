import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, RUNG, THANH_PHO } from "./terrain";

type Pt = [number, number];

// Rừng ngập mặn Cần Giờ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["rung-sac","trong-lai","sinh-quyen","la-phoi"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH_PHO, 40]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2b4740", shallow: "#7f9478" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 700, bushes: 900, grass: 1200, reeds: 1000 },
    forestAt: 0.4,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2003,
  });

  // 1. "rung-sac": ba vòng đốm (vùng lõi vàng, vùng đệm ngà, vùng chuyển tiếp xanh nhạt) vẽ ranh khu dự trữ sinh quyển (diễn hoạ).
  const p0 = run("rung-sac", 28);
  { const S: Pt[] = [[70, 0], [62, 24], [42, 38], [18, 38], [-2, 24], [-10, 0], [-2, -24], [18, -38], [42, -38], [62, -24]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rung-sac") })); }
  { const S: Pt[] = [[130, 10], [120, 43], [100, 72], [71, 91], [37, 100], [3, 96], [-28, 81], [-53, 56], [-67, 25], [-70, -10], [-60, -43], [-40, -72], [-11, -91], [23, -100], [57, -96], [88, -81], [113, -56], [127, -25]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.015, 0.44999999999999996 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rung-sac") })); }
  { const S: Pt[] = [[187, 32], [173, 71], [150, 106], [118, 133], [81, 152], [40, 160], [-2, 157], [-41, 143], [-76, 120], [-103, 88], [-122, 51], [-130, 10], [-127, -32], [-113, -71], [-90, -106], [-58, -133], [-21, -152], [20, -160], [62, -157], [101, -143], [136, -120], [163, -88], [182, -51], [190, -10]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.01, 0.7000000000000001 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rung-sac") })); }
  // 2. "trong-lai": theo thanh kéo, người trồng rừng (son) tỏa khắp bãi bùn; cây non (đốm xanh lá) mọc lên thành lưới (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["trong-lai"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2043, groups: [{ path: [[-160, -20], [200, -20]], count: 60, spread: [6,60], color: SON, drop: true, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("trong-lai") }));
  { const S: Pt[] = [[-75, -80], [-45, -80], [-15, -80], [15, -80], [45, -80], [75, -80], [105, -80], [135, -80], [-75, -50], [-45, -50], [-15, -50], [15, -50], [45, -50], [75, -50], [105, -50], [135, -50], [-75, -20], [-45, -20], [-15, -20], [15, -20], [45, -20], [75, -20], [105, -20], [135, -20], [-75, 10], [-45, 10], [-15, 10], [15, 10], [45, 10], [75, 10], [105, 10], [135, 10], [-75, 40], [-45, 40], [-15, 40], [15, 40], [45, 40], [75, 40], [105, 40], [135, 40]]; world.add(createGlows({ count: S.length, color: "#9be37a", size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trong-lai") })); }
  // 3. "sinh-quyen": đốm vàng lớn (khu dự trữ sinh quyển) sáng; đàn chim (chấm xanh nhạt) bay vòng; muông thú (đốm ngà) rải khắp rừng (diễn hoạ).
  const p2 = run("sinh-quyen", 28);
  { const S: Pt[] = [[30, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sinh-quyen") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 18, seed: 2073, groups: [{ path: [[150, 0], [134, 60], [90, 104], [30, 120], [-30, 104], [-74, 60], [-90, 0], [-74, -60], [-30, -104], [30, -120], [90, -104], [134, -60], [150, 0]], count: 30, spread: [10,30], color: DICH, timing: [[0,0],[1,1]] }], progress: p2, visible: () => clock.near("sinh-quyen") }));
  { const S: Pt[] = [[-93.5, -76.5], [-34.5, -61.5], [1.5, -65.5], [60.5, -69.5], [96.5, -73.5], [132.5, -58.5], [-78.5, -17.5], [-42.5, -21.5], [16.5, -25.5], [52.5, -29.5], [88.5, -14.5], [147.5, -18.5], [-86.5, 22.5], [-27.5, 18.5], [8.5, 14.5], [44.5, 29.5], [103.5, 25.5], [139.5, 21.5], [-71.5, 62.5], [-35.5, 58.5], [0.5, 73.5], [59.5, 69.5], [95.5, 65.5], [131.5, 61.5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.02, 0.44999999999999996 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sinh-quyen") })); }
  // 4. "la-phoi": dòng đốm xanh nhạt (nước, không khí) từ thành phố chảy về rừng và hoá vàng khi ra biển (diễn hoạ).
  const p3 = run("la-phoi", 28);
  { const S: Pt[] = [[0, 320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-phoi") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2103, groups: [{ path: [[0, 310], [20, 150], [30, 0], [40, -200]], count: 40, spread: [10,30], color: DICH, timing: [[0,0],[0.9,1]] }], progress: p3, visible: () => clock.near("la-phoi") }));
  { const S: Pt[] = [[30, -100], [30, -130], [30, -160], [30, -190], [30, -220]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.06, 0.65 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-phoi") })); }
};

export default setup;
