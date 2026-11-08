import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TAM_KHE, RACH_GIA, NUI_SAP } from "./terrain";

type Pt = [number, number];

// Kênh Thoại Hà — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguyen-do","dao-kenh","dat-ten","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TAM_KHE, 40], [RACH_GIA, 40]];

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
    counts: { trees: 300, bushes: 500, grass: 2600, reeds: 1200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1818,
  });

  // 1. "nguyen-do": thuyền (ngà) phải đi vòng đường biển từ Rạch Giá; mùa lũ nước dâng (đốm xanh nhạt) trên đồng (diễn hoạ).
  const p0 = run("nguyen-do", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1828, groups: [{ path: [RACH_GIA, [-330, -150], [-350, 200], [-200, 390]], count: 4, spread: [10,40], color: NGHIA, timing: [[0.03,0],[1,1]] }], progress: p0, visible: () => clock.near("nguyen-do") }));
  { const S: Pt[] = [[0, 0], [100, 80], [-80, -60], [150, -50], [50, 150]]; world.add(createGlows({ count: S.length, color: DICH, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.07, 0.44999999999999996 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-do") })); }
  // 2. "dao-kenh": các toán dân phu (son) dàn hàng đào dọc tuyến từ Tam Khê về Rạch Giá theo thanh kéo; đốm vàng sáng dần dọc tuyến (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dao-kenh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1848, groups: [{ path: [TAM_KHE, [120, 80], [0, -20], [-120, -110], RACH_GIA], count: 60, spread: [8,8], color: SON, drop: true, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dao-kenh") }));
  { const S: Pt[] = [[200, 150], [164, 119], [129, 88], [80, 47], [27, 2], [-27, -40], [-80, -80], [-133, -120], [-187, -160], [-240, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.08, 0.25 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-kenh") })); }
  // 3. "dat-ten": đốm vàng lớn trên núi Sập (Thoại Sơn); đốm ngà (bia) ở triền núi; người (son) đến dự lễ (diễn hoạ).
  const p2 = run("dat-ten", 28);
  { const S: Pt[] = [[40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dat-ten") })); }
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dat-ten") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1888, groups: [{ path: [[150, 0], [30, 35]], count: 16, spread: [26,50], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p2, visible: () => clock.near("dat-ten") }));
  // 4. "ve-sau": thuyền (ngà) qua lại tấp nập trên tuyến kênh mới (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[200, 150], [164, 119], [129, 88], [80, 47], [27, 2], [-27, -40], [-80, -80], [-133, -120], [-187, -160], [-240, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.005, 0.15 + i * 0.005, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1908, groups: [{ path: [TAM_KHE, [120, 80], [0, -20], [-120, -110], RACH_GIA], count: 8, spread: [6,240], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
