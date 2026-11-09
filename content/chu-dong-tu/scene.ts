import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHU_XA, CHO, DAM, QUYNH_VIEN } from "./terrain";

type Pt = [number, number];

// Chử Đồng Tử và Tiên Dung — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chiec-kho","bai-cat","cho-ha-tham","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHU_XA, 48], [CHO, 56]];

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
    seed: 670,
  });

  // 1. "chiec-kho": một chấm ngà (Chử Đồng Tử) từ làng ra bờ sông; vài thuyền (chấm ngà) xuôi sông (diễn hoạ).
  const p0 = run("chiec-kho", 28);
  world.add(createCrowd({ size: 6, height: ground, seed: 680, groups: [{ path: [[215, -10], [262, -40]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.5,1]] }], progress: p0, visible: () => clock.near("chiec-kho") }));
  { const S: Pt[] = [[215, -10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.4, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chiec-kho") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 700, groups: [{ path: [[290, 380], [292, 100], [298, -150]], count: 4, spread: [8,220], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p0, visible: () => clock.near("chiec-kho") }));
  // 2. "bai-cat": theo thanh kéo, thuyền công chúa (đốm vàng) ghé bãi cát, người hầu (son) lên bờ; cuối cùng đốm ngà (người dưới cát) hiện ra (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bai-cat"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 710, groups: [{ path: [[292, 200], [290, 40], [272, -30]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.45,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("bai-cat") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 720, groups: [{ path: [[272, -30], [250, -20]], count: 14, spread: [6,24], color: SON, timing: [[0.4,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("bai-cat") }));
  { const S: Pt[] = [[255, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bai-cat") })); }
  // 3. "cho-ha-tham": dân (son) từ bốn phía đổ về chợ Hà Thám (đốm vàng); một đốm ngà theo thuyền buôn đi xa tới núi Quỳnh Viên (diễn hoạ).
  const p2 = run("cho-ha-tham", 28);
  { const S: Pt[] = [[-30, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cho-ha-tham") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 750, groups: [{ path: [[-250, -60], [-40, -115]], count: 18, spread: [8,60], color: SON, timing: [[0.03,0],[0.6,1]] }, { path: [[150, -250], [-25, -125]], count: 18, spread: [8,60], color: SON, timing: [[0.08,0],[0.65,1]] }, { path: [[60, 120], [-25, -110]], count: 16, spread: [8,60], color: SON, timing: [[0.12,0],[0.7,1]] }], progress: p2, visible: () => clock.near("cho-ha-tham") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 4, seed: 760, groups: [{ path: [[-30, -120], [-180, -220], [-300, -280]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.55,0],[0.95,1]] }], progress: p2, visible: () => clock.near("cho-ha-tham") }));
  { const S: Pt[] = [[-310, -290]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cho-ha-tham") })); }
  // 4. "ve-sau": cột đốm vàng (thành quách) nổi lên rồi bay lên trời và lịm; quân vua (xanh nhạt) dừng bên kia sông; đốm ngà (miếu thờ) bên đầm (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 27, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.11 + i * 0.12, 0.26 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 49, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 72, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.22999999999999998 + i * 0.12, 0.38 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 95, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 117, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-150, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 140, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.41 + i * 0.12, 0.5599999999999999 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 850, groups: [{ path: [[-150, 380], [-150, 250]], count: 30, spread: [30,40], color: DICH, timing: [[0.1,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-90, 100], [-200, 100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.85 + i * 0.04, 1 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
