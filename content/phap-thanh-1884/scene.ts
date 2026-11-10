import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, SON_TAY, BAC_NINH, BAC_LE, LANG_SON } from "./terrain";

type Pt = [number, number];

// Chiến tranh Pháp – Thanh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quan-thanh","son-tay","lang-son","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [SON_TAY, 32], [BAC_NINH, 32], [LANG_SON, 24]];

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
    seed: 1884,
  });

  // 1. "quan-thanh": quân Thanh (ngà) từ biên giới xuống đóng ở Lạng Sơn, Bắc Ninh, Sơn Tây; quân Pháp (đốm xanh nhạt) giữ Hà Nội (diễn hoạ).
  const p0 = run("quan-thanh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1894, groups: [{ path: [[110, 390], [110, 320], [160, 100]], count: 40, spread: [14,60], color: NGHIA, timing: [[0.03,0],[0.7,1]] }, { path: [[60, 390], [-60, 200], [-220, 0]], count: 30, spread: [14,60], color: NGHIA, timing: [[0.1,0],[0.8,1]] }], progress: p0, visible: () => clock.near("quan-thanh") }));
  { const S: Pt[] = [[60, -60]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-thanh") })); }
  // 2. "son-tay": quân Pháp (xanh nhạt) từ Hà Nội đánh Sơn Tây rồi Bắc Ninh; quân Thanh và Cờ Đen (ngà) lui lên phía bắc (diễn hoạ).
  const p1 = run("son-tay", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1914, groups: [{ path: [[60, -60], [-200, -10], [60, -60], [160, 70]], count: 50, spread: [14,60], color: DICH, timing: [[0.03,0],[0.4,0.4],[0.9,1]] }], progress: p1, visible: () => clock.near("son-tay") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1924, groups: [{ path: [[-220, 0], [-100, 200], [80, 320]], count: 26, spread: [10,50], color: NGHIA, timing: [[0.3,0],[0.8,1]] }, { path: [[170, 80], [140, 250]], count: 30, spread: [10,50], color: NGHIA, timing: [[0.7,0],[1,1]] }], progress: p1, visible: () => clock.near("son-tay") }));
  // 3. "lang-son": theo thanh kéo, quân Pháp (xanh nhạt) bỏ Lạng Sơn rút về đồng bằng; quân Thanh (ngà) trở lại Lạng Sơn (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["lang-son"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1934, groups: [{ path: [[110, 320], [150, 200], [80, -40]], count: 50, spread: [14,60], color: DICH, timing: [[0,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("lang-son") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1944, groups: [{ path: [[110, 400], [110, 330]], count: 40, spread: [14,60], color: NGHIA, timing: [[0.3,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("lang-son") }));
  { const S: Pt[] = [[110, 320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lang-son") })); }
  // 4. "ve-sau": quân Thanh (ngà) rút qua biên giới; đốm xanh nhạt sáng ở Hà Nội và Lạng Sơn (Pháp nắm Bắc Kỳ) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1964, groups: [{ path: [[110, 320], [110, 400]], count: 40, spread: [14,60], color: NGHIA, timing: [[0.2,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[60, -60], [170, 80], [110, 320]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.1, 0.65 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
