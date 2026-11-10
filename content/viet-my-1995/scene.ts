import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, WASHINGTON } from "./terrain";

type Pt = [number, number];

// Bình thường hoá quan hệ Việt – Mỹ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cam-van","do-cam-van","binh-thuong-hoa","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 32]];

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
    counts: { trees: 300, bushes: 400, grass: 1200, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.3 },
    seed: 2002,
  });

  // 1. "cam-van": hai bờ (đốm ngà, đốm xanh nhạt) mờ; tàu (chấm sáng) ra giữa biển rồi quay về (diễn hoạ).
  const p0 = run("cam-van", 28);
  { const S: Pt[] = [[-260, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.5 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cam-van") })); }
  { const S: Pt[] = [[290, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p0(); return 0.5 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cam-van") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2032, groups: [{ path: [[-150, 20], [0, 20], [-150, 20]], count: 2, spread: [6,20], color: NGHIA, timing: [[0.1,0],[0.5,0.5],[0.9,1]] }], progress: p0, visible: () => clock.near("cam-van") }));
  // 2. "do-cam-van": đốm ngà ở Hà Nội sáng hơn; một đốm xanh nhạt nhỏ (văn phòng liên lạc) xuất hiện cạnh đó (diễn hoạ).
  const p1 = run("do-cam-van", 28);
  { const S: Pt[] = [[-260, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-cam-van") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2052, groups: [{ path: [[290, -20], [0, -40], [-240, -20]], count: 1, spread: [3,3], color: DICH, timing: [[0.1,0],[0.7,1]] }], progress: p1, visible: () => clock.near("do-cam-van") }));
  { const S: Pt[] = [[-230, -20]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-cam-van") })); }
  // 3. "binh-thuong-hoa": theo thanh kéo, chuỗi đốm vàng nối hai bờ đại dương; hai đốm (đại sứ quán) sáng lên hai bên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["binh-thuong-hoa"] ?? 0) / 0.9);
  { const S: Pt[] = [[-230, 0], [-185, 0], [-139, 0], [-94, 0], [-48, 0], [-3, 0], [43, 0], [88, 0], [134, 0], [179, 0], [225, 0], [270, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.03 + i * 0.05, 0.18 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-thuong-hoa") })); }
  { const S: Pt[] = [[-250, 10], [280, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.75 + i * 0.08, 0.9 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-thuong-hoa") })); }
  // 4. "ve-sau": tàu thuyền, hàng hoá (chấm sáng) qua lại hai chiều (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-250, 10], [280, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2102, groups: [{ path: [[-150, 30], [180, 30]], count: 4, spread: [10,60], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[180, -30], [-150, -30]], count: 4, spread: [10,60], color: DICH, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
