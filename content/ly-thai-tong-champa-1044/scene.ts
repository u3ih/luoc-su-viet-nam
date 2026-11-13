import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, TU_KHACH, PHAT_THE } from "./terrain";

type Pt = [number, number];

// Cuộc chiến năm 1044 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khong-trieu-cong","ngu-bo","phat-the","my-e"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 24], [TU_KHACH, 16], [PHAT_THE, 32]];

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
    seed: 1044,
  });

  // 1. "khong-trieu-cong": thuyền (son) đóng ở bến gần Thăng Long; thuyền Chăm (ngà) ven biển phía nam (diễn hoạ).
  const p0 = run("khong-trieu-cong", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1054, groups: [{ path: [[60, 220], [140, 200]], count: 12, spread: [4,12], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("khong-trieu-cong") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1064, groups: [{ path: [[150, -40], [180, 60], [150, -40]], count: 4, spread: [4,10], color: NGHIA, timing: [[0.05,0],[0.9,1]] }], progress: p0, visible: () => clock.near("khong-trieu-cong") }));
  { const S: Pt[] = [[-100, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khong-trieu-cong") })); }
  // 2. "ngu-bo": theo thanh kéo, đoàn thuyền quân Lý (son) xuôi theo bờ biển vào nam tới cửa Tư Khách (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ngu-bo"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1084, groups: [{ path: [[80, 240], [180, 160], [190, 60], [100, 40]], count: 20, spread: [6,16], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ngu-bo") }));
  { const S: Pt[] = [[90, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngu-bo") })); }
  // 3. "phat-the": quân Lý (son) vượt sông Ngũ Bồ tiến về kinh đô Phật Thệ (đốm ngà); đốm ngà tắt, lửa (diễn hoạ).
  const p2 = run("phat-the", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1104, groups: [{ path: [[90, 40], [40, 20], [20, -10], [20, -140]], count: 60, spread: [6,20], color: SON, timing: [[0.02,0],[0.7,1]] }], progress: p2, visible: () => clock.near("phat-the") }));
  { const S: Pt[] = [[20, -150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.65, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phat-the") })); }
  world.add(createFires({ sites: [[20, -150], [35, -140]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("phat-the") * smoothstep(0.7, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "my-e": đoàn thuyền (son) trở ra bắc; một đốm ngà nhỏ (Mỵ Ê) rời đoàn thuyền chìm xuống sông rồi tắt (diễn hoạ).
  const p3 = run("my-e", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1134, groups: [{ path: [[100, 40], [190, 80], [180, 180], [80, 240]], count: 16, spread: [6,16], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: p3, visible: () => clock.near("my-e") }));
  { const S: Pt[] = [[150, 180]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (1 - smoothstep(0.75, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("my-e") })); }
};

export default setup;
