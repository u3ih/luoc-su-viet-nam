import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BO_BAC, BO_NAM, THAP_BAC, THAP_NAM, CAU2 } from "./terrain";

type Pt = [number, number];

// Cầu Mỹ Thuận — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["du-dinh","thi-cong","thong-xe","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BO_BAC, 48], [BO_NAM, 48]];

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
    ranges: { radius: 560, height: 0.4 },
    seed: 2003,
  });

  // 1. "du-dinh": những chuyến đò, phà (chấm ngà) qua lại trên sông Tiền; người, xe (son) chờ hai bên bờ (diễn hoạ).
  const p0 = run("du-dinh", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2013, groups: [{ path: [[30, 130], [30, -130]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.45,1]] }, { path: [[60, -130], [60, 130]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.4,0],[0.85,1]] }], progress: p0, visible: () => clock.near("du-dinh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2023, groups: [{ path: [[40, 170], [30, 140]], count: 16, spread: [8,30], color: SON, timing: [[0,1],[1,1]] }, { path: [[60, -170], [60, -140]], count: 16, spread: [8,30], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("du-dinh") }));
  // 2. "thi-cong": theo thanh kéo, hai tháp (cột đốm vàng) mọc lên, rồi hai nửa nhịp cầu (chuỗi đốm ngà) vươn ra gặp nhau giữa sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thi-cong"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.09000000000000001 + i * 0.12, 0.24 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.16 + i * 0.12, 0.31 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.23 + i * 0.12, 0.38 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.30000000000000004 + i * 0.12, 0.45000000000000007 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.09000000000000001 + i * 0.12, 0.24 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.16 + i * 0.12, 0.31 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.23 + i * 0.12, 0.38 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.30000000000000004 + i * 0.12, 0.45000000000000007 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, 55], [0, 41], [0, 28], [0, 14], [0, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.09, 0.6 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -55], [0, -41], [0, -27], [0, -14], [0, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.09, 0.6 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, 170], [0, 133], [0, 97], [0, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.03, 0.5 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  { const S: Pt[] = [[0, -170], [0, -133], [0, -97], [0, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.03, 0.5 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  // 3. "thong-xe": cầu sáng trọn (đốm vàng); xe (chấm xanh nhạt) nối nhau qua cầu; tàu qua gầm cầu (diễn hoạ).
  const p2 = run("thong-xe", 28);
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, -55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[0, -60], [0, -45], [0, -30], [0, -15], [0, 0], [0, 15], [0, 30], [0, 45], [0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 22, seed: 2283, groups: [{ path: [[0, -250], [0, -60], [0, 60], [0, 250]], count: 10, spread: [3,400], color: DICH, timing: [[0.05,0],[1,1]] }], progress: p2, visible: () => clock.near("thong-xe") }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2293, groups: [{ path: [[-380, -20], [380, 30]], count: 2, spread: [6,160], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("thong-xe") }));
  // 4. "ve-sau": cầu thứ hai (chuỗi đốm ngà) sáng lên phía thượng lưu, song song cầu cũ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, -60], [0, -45], [0, -30], [0, -15], [0, 0], [0, 15], [0, 30], [0, 45], [0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-70, -120], [-70, -98], [-70, -76], [-70, -55], [-70, -33], [-70, -11], [-70, 11], [-70, 33], [-70, 55], [-70, 76], [-70, 98], [-70, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15 + i * 0.04, 0.3 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
