import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHO, TOA_BAO } from "./terrain";

type Pt = [number, number];

// Phong trào Thơ mới — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tinh-gia","tranh-luan","thi-nhan","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHO, 96]];

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
    seed: 1932,
  });

  // 1. "tinh-gia": toà báo (đốm ngà) sáng; người đọc (son) khắp phố tìm đến (diễn hoạ).
  const p0 = run("tinh-gia", 28);
  { const S: Pt[] = [[40, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tinh-gia") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1952, groups: [{ path: [[-80, -60], [20, 20]], count: 20, spread: [6,30], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [[160, 130], [60, 60]], count: 20, spread: [6,30], color: SON, timing: [[0.15,0],[0.85,1]] }, { path: [[-60, 160], [20, 60]], count: 20, spread: [6,30], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("tinh-gia") }));
  // 2. "tranh-luan": hai đốm (ngà: thơ mới; xanh nhạt: thơ cũ) sáng thay nhau; người đọc (son) tụ hai phía (diễn hoạ).
  const p1 = run("tranh-luan", 28);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tranh-luan") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tranh-luan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1982, groups: [{ path: [[0, -80], [0, 20]], count: 20, spread: [6,24], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[80, -80], [80, 20]], count: 20, spread: [6,24], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: p1, visible: () => clock.near("tranh-luan") }));
  // 3. "thi-nhan": theo thanh kéo, các nhà thơ (đốm vàng) lần lượt sáng lên quanh phố (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["thi-nhan"] ?? 0) / 0.9);
  { const S: Pt[] = [[110, 40], [89, 89], [40, 110], [-9, 89], [-30, 40], [-9, -9], [40, -30], [89, -9], [174, 81], [135, 143], [71, 177], [-1, 174], [-63, 135], [-97, 71], [-94, -1], [-55, -63], [9, -97], [81, -94], [143, -55], [177, 9]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.03 + i * 0.045, 0.18 + i * 0.045, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-nhan") })); }
  { const S: Pt[] = [[40, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-nhan") })); }
  // 4. "ve-sau": ánh sáng của các nhà thơ (chấm sáng vàng) tụ về một chỗ (tuyển tập Thi nhân Việt Nam) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 2012, groups: [{ path: [[180, 40], [50, 40]], count: 6, spread: [10,40], color: GOLD, timing: [[0.05,0],[0.7,1]] }, { path: [[-100, 40], [30, 40]], count: 6, spread: [10,40], color: GOLD, timing: [[0.1,0],[0.75,1]] }, { path: [[40, 180], [40, 50]], count: 6, spread: [10,40], color: GOLD, timing: [[0.15,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
