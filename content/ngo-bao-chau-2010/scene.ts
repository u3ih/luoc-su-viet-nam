import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, PARIS, HYDERABAD } from "./terrain";

type Pt = [number, number];

// Ngô Bảo Châu nhận Huy chương Fields — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ha-noi","paris","fields","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [PARIS, 40], [HYDERABAD, 48]];

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
    seed: 2018,
  });

  // 1. "ha-noi": Hà Nội (đốm ngà); cậu bé (chấm ngà) đi học; hai huy chương vàng (đốm vàng) (diễn hoạ).
  const p0 = run("ha-noi", 28);
  { const S: Pt[] = [[-220, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ha-noi") })); }
  world.add(createCrowd({ size: 7, height: ground, seed: 2038, groups: [{ path: [[-260, -230], [-220, -190], [-190, -220]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("ha-noi") }));
  { const S: Pt[] = [[-210, -170], [-190, -175]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.15, 0.7000000000000001 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ha-noi") })); }
  // 2. "paris": chấm ngà đi từ Hà Nội tới Paris; công trình (cột đốm vàng) cao dần (diễn hoạ).
  const p1 = run("paris", 28);
  world.add(createCrowd({ size: 7, height: ground, seed: 2058, groups: [{ path: [[-220, -200], [-80, 60], [70, 285]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.02,0],[0.55,1]] }], progress: p1, visible: () => clock.near("paris") }));
  { const S: Pt[] = [[80, 300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[95, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[95, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6699999999999999 + i * 0.12, 0.82 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[95, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.74 + i * 0.12, 0.89 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[95, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.81 + i * 0.12, 0.9600000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[95, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.88 + i * 0.12, 1.03 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  // 3. "fields": theo thanh kéo, các nhà toán học (xanh nhạt) từ khắp nơi tụ về Hyderabad; chấm ngà từ Paris tới; đốm vàng (huy chương) sáng lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["fields"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2128, groups: [{ path: [[400, 100], [210, -220]], count: 16, spread: [8,40], color: DICH, timing: [[0,0],[0.7,1]] }, { path: [[380, -380], [215, -240]], count: 16, spread: [8,40], color: DICH, timing: [[0.05,0],[0.75,1]] }, { path: [[0, -380], [190, -240]], count: 16, spread: [8,40], color: DICH, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("fields") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 2138, groups: [{ path: [[80, 300], [150, 0], [195, -220]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("fields") }));
  { const S: Pt[] = [[200, -230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("fields") })); }
  // 4. "ve-sau": Viện Nghiên cứu cao cấp về Toán ở Hà Nội (đốm vàng); học trò (son) tụ về (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-220, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2168, groups: [{ path: [[-50, -100], [-210, -195]], count: 20, spread: [8,40], color: SON, timing: [[0.2,0],[0.8,1]] }, { path: [[-300, -50], [-225, -190]], count: 16, spread: [8,40], color: SON, timing: [[0.25,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
