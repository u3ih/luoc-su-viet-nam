import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRUONG, LANG_SON, MAT } from "./terrain";

type Pt = [number, number];

// Trường Đại học Bách khoa Hà Nội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thanh-lap","khoa-1","so-tan","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUONG, 48], [LANG_SON, 32], [MAT, 48]];

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
    seed: 1956,
  });

  // 1. "thanh-lap": đốm vàng (nghị định thành lập) sáng; bốn đốm ngà (bốn liên khoa) xếp quanh (diễn hoạ).
  const p0 = run("thanh-lap", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  { const S: Pt[] = [[-150, 80], [-110, 80], [-150, 40], [-110, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.35 + i * 0.1, 0.5 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  // 2. "khoa-1": theo thanh kéo, 848 sinh viên (son) vào trường; năm năm sau 633 kỹ sư (đốm vàng) ra trường (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoa-1"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1986, groups: [{ path: [[-300, -60], [-130, 55]], count: 80, spread: [4,26], color: SON, drop: true, timing: [[0,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoa-1") }));
  { const S: Pt[] = [[-161.5, 42], [-152.5, 42], [-143.5, 42], [-134.5, 42], [-125.5, 42], [-116.5, 42], [-107.5, 42], [-98.5, 42], [-161.5, 51], [-152.5, 51], [-143.5, 51], [-134.5, 51], [-125.5, 51], [-116.5, 51], [-107.5, 51], [-98.5, 51], [-161.5, 60], [-152.5, 60], [-143.5, 60], [-134.5, 60], [-125.5, 60], [-116.5, 60], [-107.5, 60], [-98.5, 60], [-161.5, 69], [-152.5, 69], [-143.5, 69], [-134.5, 69], [-125.5, 69], [-116.5, 69], [-107.5, 69], [-98.5, 69], [-161.5, 78], [-152.5, 78], [-143.5, 78], [-134.5, 78], [-125.5, 78], [-116.5, 78], [-107.5, 78], [-98.5, 78]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.008, 0.7000000000000001 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoa-1") })); }
  // 3. "so-tan": đoàn người (son) cùng thiết bị (chấm ngà) rời Hà Nội lên vùng núi Lạng Sơn; lớp học (đốm vàng) sáng giữa núi (diễn hoạ).
  const p2 = run("so-tan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2006, groups: [{ path: [[0, 20], [120, 130], [225, 225]], count: 70, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }], progress: p2, visible: () => clock.near("so-tan") }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2016, groups: [{ path: [[0, 20], [120, 130], [225, 225]], count: 6, spread: [3,8], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p2, visible: () => clock.near("so-tan") }));
  { const S: Pt[] = [[230, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("so-tan") })); }
  // 4. "ngay-nay": trường (đốm vàng) toả cán bộ đi lập các trường khác (đốm ngà ở xa); cột đốm (thư viện mười tầng) (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2046, groups: [{ path: [[0, 20], [-250, -250]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.1,0],[0.6,1]] }, { path: [[0, 20], [250, -200]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.2,0],[0.7,1]] }, { path: [[0, 20], [-280, 200]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.3,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.54 + i * 0.12, 0.6900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.58 + i * 0.12, 0.73 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.62 + i * 0.12, 0.77 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 28, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.66 + i * 0.12, 0.81 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 34, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.74 + i * 0.12, 0.89 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.78 + i * 0.12, 0.93 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 52, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8200000000000001 + i * 0.12, 0.9700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[30, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 58, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.86 + i * 0.12, 1.01 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
};

export default setup;
