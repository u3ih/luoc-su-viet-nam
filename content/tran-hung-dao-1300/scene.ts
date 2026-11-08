import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VAN_KIEP, AN_LAC, KINH } from "./terrain";

type Pt = [number, number];

// Lời dặn cuối của Hưng Đạo vương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["van-kiep","vua-den","khoan-thu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VAN_KIEP, 48]];

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
    seed: 1300,
  });

  // 1. "van-kiep": thái ấp Vạn Kiếp: đốm ngà (Hưng Đạo vương) giữa thái ấp, người (son) làm ruộng quanh đó (diễn hoạ).
  const p0 = run("van-kiep", 28);
  { const S: Pt[] = [VAN_KIEP]; world.add(createGlows({ count: S.length, color: NGHIA, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-kiep") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1320, groups: [{ path: [[0, 100], [40, 60]], count: 14, spread: [60,40], color: SON, timing: [[0.05,0],[0.9,1]] }, { path: [[180, 0], [120, 30]], count: 12, spread: [50,30], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("van-kiep") }));
  // 2. "vua-den": đoàn ngự giá (son, đốm vàng dẫn đầu) đi từ kinh đô đến Vạn Kiếp theo thanh kéo; đốm ngà ở thái ấp mờ yếu (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["vua-den"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1330, groups: [{ path: [KINH, [-150, 20], [0, 20], VAN_KIEP], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("vua-den") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1340, groups: [{ path: [KINH, [-150, 20], [0, 20], [70, 35]], count: 26, spread: [14,60], color: SON, timing: [[0,0],[1,0.97]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("vua-den") }));
  { const S: Pt[] = [VAN_KIEP]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.45 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vua-den") })); }
  // 3. "khoan-thu": đốm vàng (vua) bên đốm ngà; các đốm vàng nhỏ (lời dặn) tỏa ra khắp vùng làng quê (diễn hoạ).
  const p2 = run("khoan-thu", 28);
  { const S: Pt[] = [[70, 45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoan-thu") })); }
  { const S: Pt[] = [[90, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.5 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoan-thu") })); }
  { const S: Pt[] = [[200, 40], [184, 100], [140, 144], [80, 160], [20, 144], [-24, 100], [-40, 40], [-24, -20], [20, -64], [80, -80], [140, -64], [184, -20], [296, 84], [255, 173], [180, 236], [85, 260], [-11, 240], [-89, 181], [-133, 94], [-136, -4], [-95, -93], [-20, -156], [75, -180], [171, -160], [249, -101], [293, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.025, 0.44999999999999996 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoan-thu") })); }
  // 4. "ve-sau": đốm ngà lịm dần ở vườn An Lạc; người khắp nơi (son) tụ về; các đốm vàng (đền thờ) sáng dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [AN_LAC]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1400, groups: [{ path: [[-200, 200], VAN_KIEP], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[300, -200], VAN_KIEP], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[80, 60], [-250, -200], [250, 250], [-300, 250], [300, -300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.08, 0.65 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
