import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DINH_THUY, PHUOC_HIEP, BINH_KHANH, GIONG_TROM } from "./terrain";

type Pt = [number, number];

// Đồng khởi Bến Tre — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["luat-10-59","mo-cay","toc-dai","mat-tran"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DINH_THUY, 24], [PHUOC_HIEP, 24], [BINH_KHANH, 24], [GIONG_TROM, 32]];

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
    seed: 1960,
  });

  // 1. "luat-10-59": các đồn của chính quyền (đốm xanh nhạt) khắp vùng; người (son) lặng lẽ đi giữa vườn dừa (diễn hoạ).
  const p0 = run("luat-10-59", 28);
  { const S: Pt[] = [[-90, -20], [10, 0], [100, -40], [0, 260], [-220, 40], [200, 50], [-150, -260], [150, -250]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luat-10-59") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1980, groups: [{ path: [[-300, 20], [-90, -20], [100, -40], [300, 20]], count: 20, spread: [4,14], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("luat-10-59") }));
  // 2. "mo-cay": theo thanh kéo, ba xã (đốm vàng) sáng lên, dân (son) tụ về; rồi các xã quanh (đốm ngà) sáng theo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["mo-cay"] ?? 0) / 0.9);
  { const S: Pt[] = [[-90, -20], [10, 0], [100, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cay") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2000, groups: [{ path: [[-72, -20], [-75, -9], [-84, -3], [-96, -3], [-105, -9], [-108, -20], [-105, -31], [-96, -37], [-84, -37], [-75, -31], [-72, -20]], count: 25, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[28, 0], [25, 11], [16, 17], [4, 17], [-5, 11], [-8, 0], [-5, -11], [4, -17], [16, -17], [25, -11], [28, 0]], count: 25, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[118, -40], [115, -29], [106, -23], [94, -23], [85, -29], [82, -40], [85, -51], [94, -57], [106, -57], [115, -51], [118, -40]], count: 25, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mo-cay") }));
  { const S: Pt[] = [[-220, 40], [200, 50], [-180, -80], [180, -90], [-40, 80], [80, 70], [-260, -40], [260, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.05, 0.6 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cay") })); }
  // 3. "toc-dai": đoàn phụ nữ (ngà) đông dần, kéo tới trước đồn (đốm xanh nhạt) ở Giồng Trôm (diễn hoạ).
  const p2 = run("toc-dai", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2020, groups: [{ path: [[111, 307], [0, 260]], count: 40, spread: [4,18], color: NGHIA, timing: [[0.02,0],[0.75,0.85]] }, { path: [[-47, 371], [0, 260]], count: 40, spread: [4,18], color: NGHIA, timing: [[0.02,0],[0.75,0.85]] }, { path: [[-111, 213], [0, 260]], count: 40, spread: [4,18], color: NGHIA, timing: [[0.02,0],[0.75,0.85]] }, { path: [[47, 149], [0, 260]], count: 40, spread: [4,18], color: NGHIA, timing: [[0.02,0],[0.75,0.85]] }], progress: p2, visible: () => clock.near("toc-dai") }));
  { const S: Pt[] = [[0, 270]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("toc-dai") })); }
  // 4. "mat-tran": các vùng (đốm ngà) khắp đồng bằng sáng lên; đốm vàng lớn (Mặt trận) sáng sau cùng (diễn hoạ).
  const p3 = run("mat-tran", 28);
  { const S: Pt[] = [[-300, 300], [-150, 250], [150, 280], [300, 260], [-300, -250], [-100, -300], [120, -280], [300, -260], [-300, 20], [300, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-tran") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-tran") })); }
};

export default setup;
