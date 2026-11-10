import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, SAI_GON, CAU_GIAY } from "./terrain";

type Pt = [number, number];

// Hoà ước Giáp Tuất 1874 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-ky","bac-ky","ky-ket","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [SAI_GON, 40]];

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
    seed: 1877,
  });

  // 1. "nam-ky": sáu tỉnh Nam Kỳ (đốm xanh nhạt) lần lượt dưới quyền Pháp: ba tỉnh miền đông rồi ba tỉnh miền tây (diễn hoạ).
  const p0 = run("nam-ky", 28);
  { const S: Pt[] = [[100, -260], [140, -310], [60, -330], [-20, -270], [-60, -320], [-100, -260]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-ky") })); }
  // 2. "bac-ky": quân Pháp (xanh nhạt) chiếm Hà Nội và các tỉnh Bắc Kỳ; quân triều và quân Cờ Đen (son) vây Hà Nội; Cầu Giấy (đốm ngà) (diễn hoạ).
  const p1 = run("bac-ky", 28);
  { const S: Pt[] = [[-60, 280], [0, 200], [-120, 200], [60, 240], [-30, 150]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bac-ky") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1907, groups: [{ path: [[-250, 350], [-110, 290]], count: 30, spread: [10,50], color: SON, timing: [[0.3,0],[0.8,1]] }, { path: [[-200, 150], [-90, 260]], count: 24, spread: [10,50], color: SON, timing: [[0.35,0],[0.85,1]] }], progress: p1, visible: () => clock.near("bac-ky") }));
  { const S: Pt[] = [[-110, 280]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bac-ky") })); }
  // 3. "ky-ket": theo thanh kéo, quân Pháp ở Bắc Kỳ (đốm xanh nhạt) tắt dần, tàu (chấm xanh nhạt) rút về nam; đốm vàng (hoà ước) ở Sài Gòn (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ky-ket"] ?? 0) / 0.9);
  { const S: Pt[] = [[-60, 280], [0, 200], [-120, 200], [60, 240], [-30, 150]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.3, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 1937, groups: [{ path: [[230, 240], [260, 0], [200, -270]], count: 4, spread: [8,60], color: DICH, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ky-ket") }));
  { const S: Pt[] = [[60, -290]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  { const S: Pt[] = [[100, -260], [140, -310], [60, -330], [-20, -270], [-60, -320], [-100, -260]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  // 4. "ve-sau": Bắc Kỳ trở lại (đốm ngà); sáu tỉnh Nam Kỳ (đốm xanh nhạt) vẫn thuộc Pháp (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-60, 280], [0, 200], [-120, 200], [60, 240], [-30, 150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[100, -260], [140, -310], [60, -330], [-20, -270], [-60, -320], [-100, -260]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
