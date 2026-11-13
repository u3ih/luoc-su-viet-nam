import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, MIEN_TRUNG, SAI_GON } from "./terrain";

type Pt = [number, number];

// Quốc hội thống nhất — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hai-mien","bau-cu","ten-nuoc","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [MIEN_TRUNG, 24], [SAI_GON, 40]];

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
    seed: 1976,
  });

  // 1. "hai-mien": hai đốm lớn — ngà ở bắc, xanh nhạt ở nam — hai chính quyền; người (son) đi lại hai miền (diễn hoạ).
  const p0 = run("hai-mien", 28);
  { const S: Pt[] = [[60, 250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-mien") })); }
  { const S: Pt[] = [[20, -260]]; world.add(createGlows({ count: S.length, color: DICH, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-mien") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2006, groups: [{ path: [[60, 230], [60, 20], [20, -240]], count: 30, spread: [4,14], color: SON, timing: [[0.1,0],[0.95,1]] }, { path: [[20, -240], [60, 20], [60, 230]], count: 30, spread: [4,14], color: SON, timing: [[0.1,0],[0.95,1]] }], progress: p0, visible: () => clock.near("hai-mien") }));
  // 2. "bau-cu": theo thanh kéo, điểm bỏ phiếu (đốm vàng) hai miền sáng dần (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bau-cu"] ?? 0) / 0.9);
  { const S: Pt[] = [[60, 250], [-40, 180], [140, 160], [60, 20], [-60, 60], [140, -40], [20, -260], [-80, -200], [120, -180], [-20, -340], [100, 320], [-60, -100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.06, 0.16999999999999998 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bau-cu") })); }
  // 3. "ten-nuoc": các đại biểu (ngà) hai miền tụ về Hà Nội (đốm vàng lớn) (diễn hoạ).
  const p2 = run("ten-nuoc", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2026, groups: [{ path: [[20, -260], [60, 20], [60, 230]], count: 40, spread: [3,10], color: NGHIA, timing: [[0.02,0],[0.75,1]] }, { path: [[157, 303], [60, 250]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.75,1]] }, { path: [[7, 347], [60, 250]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.75,1]] }, { path: [[-37, 197], [60, 250]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.75,1]] }, { path: [[113, 153], [60, 250]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.75,1]] }], progress: p2, visible: () => clock.near("ten-nuoc") }));
  { const S: Pt[] = [[60, 250]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ten-nuoc") })); }
  // 4. "ve-sau": ruộng đồng, nhà máy (đốm ngà) chỉ sáng lờ mờ; ánh lửa ở biên giới phía bắc và tây nam (1979) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[60, 250], [60, 20], [20, -260], [-60, 60], [140, -40], [-80, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.45 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createFires({ sites: [[0, 380], [-120, 360], [-300, -300], [-340, -200]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ve-sau") * smoothstep(0.5, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
