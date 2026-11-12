import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, AO, THUY_DINH, LANG } from "./terrain";

type Pt = [number, number];

// Múa rối nước — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lua-nuoc","bia-1121","thuy-dinh","phuong-roi"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THUY_DINH, 20], [LANG, 40]];

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
    seed: 1121,
  });

  // 1. "lua-nuoc": dân làng (son) từ ruộng kéo về quanh ao xem hội; đốm vàng (thuỷ đình) sáng ở bờ ao (diễn hoạ).
  const p0 = run("lua-nuoc", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1131, groups: [{ path: [[-200, 80], [-40, -50]], count: 30, spread: [4,24], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[200, 80], [40, -50]], count: 30, spread: [4,24], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("lua-nuoc") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lua-nuoc") })); }
  // 2. "bia-1121": theo thanh kéo, rùa vàng (đốm vàng) nổi lên giữa ao, đội ba ngọn núi (ba cột đốm); cửa động mở, tiên (đốm ngà) và chim thú (đốm xanh nhạt) hiện ra (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bia-1121"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[-12, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[-12, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.24000000000000002 + i * 0.12, 0.39 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[-12, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.28 + i * 0.12, 0.43000000000000005 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[0, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[0, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[0, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.33 + i * 0.12, 0.48 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[0, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.37 + i * 0.12, 0.52 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[12, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[12, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.33999999999999997 + i * 0.12, 0.49 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[12, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.38 + i * 0.12, 0.53 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[21, -3], [5, 11], [-16, 5], [-21, -17], [-5, -31], [16, -25]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.04, 0.7000000000000001 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  { const S: Pt[] = [[36, -6], [27, 14], [8, 25], [-14, 23], [-31, 8], [-36, -14], [-27, -34], [-8, -45], [14, -43], [31, -28]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.72 + i * 0.025, 0.87 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bia-1121") })); }
  // 3. "thuy-dinh": thuỷ đình (hàng đốm vàng) sáng ở bờ ao; các con rối (chấm ngà) đi ra mặt nước; khán giả (son) quanh ao (diễn hoạ).
  const p2 = run("thuy-dinh", 28);
  { const S: Pt[] = [[-24, 40], [-16, 40], [-8, 40], [0, 40], [8, 40], [16, 40], [24, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thuy-dinh") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 1, seed: 1291, groups: [{ path: [[0, 34], [-30, -10], [30, -15], [0, 30]], count: 8, spread: [3,10], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("thuy-dinh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1301, groups: [{ path: [[-70, -40], [70, -40], [80, 10], [-80, 10], [-70, -40]], count: 70, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("thuy-dinh") }));
  // 4. "phuong-roi": các phường rối (đốm ngà) quanh vùng sáng lần lượt; một đốm vàng lớn (nhà hát phục hồi 17 trò) sáng sau cùng (diễn hoạ).
  const p3 = run("phuong-roi", 28);
  { const S: Pt[] = [[-200, 80], [-120, 180], [60, 200], [180, 120], [-260, -60], [160, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.09, 0.2 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phuong-roi") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phuong-roi") })); }
};

export default setup;
