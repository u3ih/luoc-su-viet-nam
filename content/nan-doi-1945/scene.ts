import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG_A, LANG_B, LANG_C, LANG_D, KHO, THI_XA } from "./terrain";

type Pt = [number, number];

// Nạn đói năm Ất Dậu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguyen-nhan","mat-mua","nan-doi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG_A, 36], [LANG_B, 36], [LANG_C, 36], [LANG_D, 36], [THI_XA, 48]];

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
    seed: 1954,
  });

  // 1. "nguyen-nhan": thóc từ các làng (son) bị gom về kho (đốm xanh nhạt) (diễn hoạ).
  const p0 = run("nguyen-nhan", 28);
  { const S: Pt[] = [[200, 160]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-nhan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1974, groups: [{ path: [[-200, -60], [190, 150]], count: 8, spread: [4,20], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [[-40, -160], [190, 150]], count: 8, spread: [4,20], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [[100, -40], [195, 150]], count: 8, spread: [4,20], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: p0, visible: () => clock.near("nguyen-nhan") }));
  // 2. "mat-mua": ruộng lúa (đốm vàng nhỏ) lụi dần; dân các làng (son) đứng giữa đồng (diễn hoạ).
  const p1 = run("mat-mua", 28);
  { const S: Pt[] = [[-160, -100], [-120, -100], [-80, -100], [-40, -100], [0, -100], [40, -100], [-160, -60], [-120, -60], [-80, -60], [-40, -60], [0, -60], [40, -60], [-160, -20], [-120, -20], [-80, -20], [-40, -20], [0, -20], [40, -20], [-160, 20], [-120, 20], [-80, 20], [-40, 20], [0, 20], [40, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.2, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-mua") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1994, groups: [{ path: [[-200, -60], [-180, -40]], count: 16, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }, { path: [[-40, -160], [-30, -140]], count: 16, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("mat-mua") }));
  // 3. "nan-doi": theo thanh kéo, ánh lửa các làng (đốm ngà) tắt dần; người đói (son) lê bước về phía thị xã (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nan-doi"] ?? 0) / 0.9);
  { const S: Pt[] = [[-200, -60], [-40, -160], [100, -40], [-150, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.2, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-doi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2014, groups: [{ path: [[-200, -60], [0, 100], [190, 230]], count: 14, spread: [8,60], color: SON, timing: [[0.1,0],[1,1]] }, { path: [[-40, -160], [80, 60], [195, 230]], count: 14, spread: [8,60], color: SON, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nan-doi") }));
  // 4. "ve-sau": nơi phát chẩn, ruộng tăng gia (đốm vàng) sáng dần; người (son) trở lại đồng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-165, -115], [-115, -115], [-65, -115], [-15, -115], [35, -115], [85, -115], [-165, -65], [-115, -65], [-65, -65], [-15, -65], [35, -65], [85, -65], [-165, -15], [-115, -15], [-65, -15], [-15, -15], [35, -15], [85, -15], [-165, 35], [-115, 35], [-65, 35], [-15, 35], [35, 35], [85, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.03, 0.25 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2034, groups: [{ path: [[200, 240], [0, -20]], count: 20, spread: [10,120], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
