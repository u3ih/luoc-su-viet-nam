import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH_BD, DAM, CUA, TAM_TOA, NHAN_CHAU, HO_CO, NGOAI } from "./terrain";

type Pt = [number, number];

// Trận Thị Nại — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dam","vay-thanh","hoa-cong","thiet-hai","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH_BD, 48]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2a4652", shallow: "#86997a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 450, bushes: 600, grass: 2200, reeds: 900 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1801,
  });

  // 1. "dam": các đốm vàng sáng dần quanh bờ đầm, vài chấm ngà (thuyền nhỏ) đi trong đầm (diễn hoạ).
  const p0 = run("dam", 28);
  { const S: Pt[] = [[-120, 100], [0, 95], [120, 80], [-120, -30], [0, -45], [120, -55], CUA]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dam") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1821, groups: [{ path: [[-100, 30], [60, 20], [200, 0]], count: 4, spread: [20,40], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("dam") }));
  // 2. "vay-thanh": quân vây (son) quanh thành Bình Định, đốm ngà giữ thành; thuyền Tây Sơn (xanh nhạt) đậu trong đầm chặn cửa, lửa bảo Tam Tòa, Nhạn Châu; thuyền Nguyễn (ngà) đậu ngoài cửa (diễn hoạ).
  const p1 = run("vay-thanh", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1831, groups: [{ path: [[-120, -40], [-160, -20]], count: 30, spread: [80,20], color: SON, timing: [[0.03,0],[0.6,1]] }, { path: [[-300, -150], [-260, -140]], count: 24, spread: [70,20], color: SON, timing: [[0.06,0],[0.6,1]] }], progress: p1, visible: () => clock.near("vay-thanh") }));
  { const S: Pt[] = [THANH_BD]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vay-thanh") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1851, groups: [{ path: [[40, 20], [170, 5]], count: 36, spread: [70,60], color: DICH, timing: [[0.02,0],[0.6,1]] }, { path: [[400, -40], NGOAI], count: 24, spread: [60,40], color: NGHIA, timing: [[0.1,0],[0.8,1]] }], progress: p1, visible: () => clock.near("vay-thanh") }));
  world.add(createFires({ sites: [TAM_TOA, NHAN_CHAU].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("vay-thanh") * smoothstep(0.3, 0.9, p1()), size: 4, glow: () => 0.8 }));
  // 3. "hoa-cong": thuyền nhỏ (ngà) lẻn vào Hổ Cơ, rồi đoàn thuyền Nguyễn (ngà) từ ngoài cửa tiến vào đầm theo thanh kéo; lửa bùng dần trên thuyền Tây Sơn (xanh nhạt) đậu trong đầm (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["hoa-cong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1871, groups: [{ path: [[60, 25], [170, 5]], count: 30, spread: [70,60], color: DICH, timing: [[0,1],[1,1]] }, { path: [NGOAI, CUA, [180, -30], HO_CO], count: 6, spread: [12,20], color: NGHIA, timing: [[0,0],[0.4,1]] }, { path: [NGOAI, CUA, [150, 10], [80, 20]], count: 26, spread: [30,70], color: NGHIA, timing: [[0.3,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("hoa-cong") }));
  world.add(createFires({ sites: [HO_CO, [160, 10], [140, -10], [120, 30], [100, 5], [80, 30], [60, 10], [180, 25], [110, -25]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("hoa-cong") * smoothstep(0.15, 0.9, inp2(ctx)), size: 4, glow: () => 0.8 }));
  world.add(createFires({ sites: [TAM_TOA, NHAN_CHAU].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("hoa-cong") * smoothstep(0, 0.9, inp2(ctx)), size: 4, glow: () => 0.8 }));
  // 4. "thiet-hai": trời rạng, lửa còn âm ỉ trong đầm; đốm vàng nhạt mờ dần trên mặt nước (diễn hoạ).
  const p3 = run("thiet-hai", 28);
  world.add(createFires({ sites: [[160, 10], [140, -10], [120, 30], [100, 5], [80, 30]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("thiet-hai") * smoothstep(0, 0.9, p3()), size: 2, glow: () => 0.8 }));
  { const S: Pt[] = [[160, 10], [120, 30], [80, 30], [100, 5], [140, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.04, 0.15 + i * 0.04, k) * (1 - smoothstep(0.4, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thiet-hai") })); }
  // 5. "ve-sau": đoàn thuyền Nguyễn (ngà) rời cửa Thị Nại đi lên phía bắc; đốm ngà ở thành Bình Định (diễn hoạ).
  const p4 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1921, groups: [{ path: [[120, 10], CUA, NGOAI, [360, 150], [340, 380]], count: 30, spread: [40,80], color: NGHIA, timing: [[0.05,0],[0.95,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [THANH_BD]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p4(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
