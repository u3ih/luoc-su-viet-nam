import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_LU, BEN } from "./terrain";

type Pt = [number, number];

// Tiền Thái Bình hưng bảo — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nien-hieu","duc-tien","luu-hanh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_LU, 48]];

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
    counts: { trees: 700, bushes: 600, grass: 1800, reeds: 500 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 970,
  });

  // 1. "nien-hieu": đốm vàng lớn (vua, niên hiệu Thái Bình) sáng ở Hoa Lư; người (son) tụ về (diễn hoạ).
  const p0 = run("nien-hieu", 28);
  { const S: Pt[] = [[0, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nien-hieu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 990, groups: [{ path: [[-200, 120], [-20, -50]], count: 20, spread: [10,80], color: SON, timing: [[0.1,0],[0.9,1]] }, { path: [[200, 120], [20, -50]], count: 20, spread: [10,80], color: SON, timing: [[0.15,0],[0.95,1]] }], progress: p0, visible: () => clock.near("nien-hieu") }));
  // 2. "duc-tien": theo thanh kéo, lò đúc (lửa) đỏ lên; từng đốm vàng nhỏ (đồng tiền) ra lò xếp thành hàng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["duc-tien"] ?? 0) / 0.9);
  world.add(createFires({ sites: [[-20, -40], [-10, -40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("duc-tien") * smoothstep(0.02, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[7.5, -49.5], [10.5, -49.5], [13.5, -49.5], [16.5, -49.5], [19.5, -49.5], [22.5, -49.5], [7.5, -46.5], [10.5, -46.5], [13.5, -46.5], [16.5, -46.5], [19.5, -46.5], [22.5, -46.5], [7.5, -43.5], [10.5, -43.5], [13.5, -43.5], [16.5, -43.5], [19.5, -43.5], [22.5, -43.5], [7.5, -40.5], [10.5, -40.5], [13.5, -40.5], [16.5, -40.5], [19.5, -40.5], [22.5, -40.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 5, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.15 + i * 0.03, 0.3 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("duc-tien") })); }
  // 3. "luu-hanh": thuyền buôn (chấm ngà) cập bến sông Hoàng Long; đốm vàng nhỏ (tiền) theo người ra bến (diễn hoạ).
  const p2 = run("luu-hanh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1020, groups: [{ path: [[400, 120], [150, 170], [45, 125]], count: 6, spread: [8,60], color: NGHIA, timing: [[0.02,0],[0.7,1]] }, { path: [[-400, 160], [35, 125]], count: 5, spread: [8,60], color: DICH, timing: [[0.05,0],[0.75,1]] }], progress: p2, visible: () => clock.near("luu-hanh") }));
  world.add(createCrowd({ glow: true, size: 3, height: (x, z) => ground(x, z) + 2, seed: 1030, groups: [{ path: [[0, -60], [30, 40], [40, 115]], count: 10, spread: [4,30], color: GOLD, timing: [[0.2,0],[0.8,1]] }], progress: p2, visible: () => clock.near("luu-hanh") }));
  // 4. "ve-sau": đốm vàng (tiền Thái Bình) lịm dần, đốm vàng nhạt mới (tiền Thiên Phúc) sáng thay (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[7.5, -49.5], [10.5, -49.5], [13.5, -49.5], [16.5, -49.5], [19.5, -49.5], [22.5, -49.5], [7.5, -46.5], [10.5, -46.5], [13.5, -46.5], [16.5, -46.5], [19.5, -46.5], [22.5, -46.5], [7.5, -43.5], [10.5, -43.5], [13.5, -43.5], [16.5, -43.5], [19.5, -43.5], [22.5, -43.5], [7.5, -40.5], [10.5, -40.5], [13.5, -40.5], [16.5, -40.5], [19.5, -40.5], [22.5, -40.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 5, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.3, 0.55, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[7.5, -49.5], [10.5, -49.5], [13.5, -49.5], [16.5, -49.5], [19.5, -49.5], [22.5, -49.5], [7.5, -46.5], [10.5, -46.5], [13.5, -46.5], [16.5, -46.5], [19.5, -46.5], [22.5, -46.5], [7.5, -43.5], [10.5, -43.5], [13.5, -43.5], [16.5, -43.5], [19.5, -43.5], [22.5, -43.5], [7.5, -40.5], [10.5, -40.5], [13.5, -40.5], [16.5, -40.5], [19.5, -40.5], [22.5, -40.5]]; world.add(createGlows({ count: S.length, color: "#ffe9a8", size: 5, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.01, 0.7000000000000001 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
