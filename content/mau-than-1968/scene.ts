import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUE_M, DA_NANG_M, SAI_GON_M, THI_XA, KHE_SANH_M } from "./terrain";

type Pt = [number, number];

// Tết Mậu Thân — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ke-hoach","giao-thua","hue","buoc-ngoat"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUE_M, 32], [DA_NANG_M, 24], [SAI_GON_M, 40], [THI_XA, 24]];

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
    seed: 1968,
  });

  // 1. "ke-hoach": ba đốm ngà (Sài Gòn, Huế, Đà Nẵng) sáng — mục tiêu chính; đốm son ở Khe Sanh (hướng nghi binh) sáng trước (diễn hoạ).
  const p0 = run("ke-hoach", 28);
  { const S: Pt[] = [[-150, 170]]; world.add(createGlows({ count: S.length, color: SON, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-hoach") })); }
  { const S: Pt[] = [[40, -150], [-40, 140], [40, 90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-hoach") })); }
  // 2. "giao-thua": theo thanh kéo, đêm giao thừa, hơn một trăm đốm son lần lượt bừng lên khắp các đô thị; lửa ở vài nơi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["giao-thua"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 140], [40, 90], [40, -150], [-20, -20], [60, 20], [-90, 60], [100, -60], [-60, -100], [0, 60], [-110, -40], [80, -110], [-30, -170], [120, 40], [-80, 100], [20, -80], [-130, 0], [90, -10], [-50, 20], [10, 160], [60, -200]]; world.add(createGlows({ count: S.length, color: SON, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giao-thua") })); }
  world.add(createFires({ sites: [[40, -150], [-40, 140], [-20, -20], [100, -60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("giao-thua") * smoothstep(0.5, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "hue": lửa khắp Huế; dòng người (ngà) rời thành phố về phía nam; đốm vàng (kinh thành) mờ dần (diễn hoạ).
  const p2 = run("hue", 28);
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring([-40, 140], 30, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("hue") * smoothstep(0.05, 0.9, p2()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2028, groups: [{ path: [[-40, 140], [-20, 60], [0, -40]], count: 70, spread: [4,16], color: NGHIA, timing: [[0.1,0],[0.95,1]] }], progress: p2, visible: () => clock.near("hue") }));
  { const S: Pt[] = [[-40, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.5, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hue") })); }
  // 4. "buoc-ngoat": các nhóm (son) rút khỏi đô thị về phía tây; đốm vàng (hoà đàm Paris, ký hiệu) sáng ngoài khơi (diễn hoạ).
  const p3 = run("buoc-ngoat", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2048, groups: [{ path: [[40, -150], [-80, -120], [-220, -100]], count: 30, spread: [4,12], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [[-40, 140], [-140, 120], [-240, 110]], count: 30, spread: [4,12], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p3, visible: () => clock.near("buoc-ngoat") }));
  { const S: Pt[] = [[220, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("buoc-ngoat") })); }
};

export default setup;
