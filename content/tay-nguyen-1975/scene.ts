import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHUOC_LONG, BMT, PLEIKU, CHEO_REO, CUNG_SON, HUE_T, DA_NANG_T } from "./terrain";

type Pt = [number, number];

// Từ Buôn Ma Thuột đến Đà Nẵng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phuoc-long","buon-ma-thuot","duong-so-7","hue-da-nang"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHUOC_LONG, 24], [BMT, 32], [PLEIKU, 24], [HUE_T, 20], [DA_NANG_T, 20]];

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
    seed: 1975,
  });

  // 1. "phuoc-long": các mũi quân (son) vây tỉnh lỵ Phước Long (đốm xanh nhạt); đốm xanh nhạt tắt (diễn hoạ).
  const p0 = run("phuoc-long", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1985, groups: [{ path: [[-35, -117], [-140, -150]], count: 16, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-138, -40], [-140, -150]], count: 16, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-244, -115], [-140, -150]], count: 16, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-206, -238], [-140, -150]], count: 16, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-77, -240], [-140, -150]], count: 16, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }], progress: p0, visible: () => clock.near("phuoc-long") }));
  { const S: Pt[] = [[-140, -150]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.7, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phuoc-long") })); }
  // 2. "buon-ma-thuot": theo thanh kéo, một nhóm nhỏ (son) nghi binh ở Pleiku; các mũi quân (son) từ nhiều hướng tiến vào Buôn Ma Thuột; lửa trong thị xã (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["buon-ma-thuot"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2005, groups: [{ path: [[-160, 200], [-70, 140]], count: 20, spread: [3,10], color: SON, timing: [[0.02,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("buon-ma-thuot") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2015, groups: [{ path: [[79, -12], [-20, -80]], count: 18, spread: [4,16], color: SON, timing: [[0.2,0],[0.9,1]] }, { path: [[-54, 35], [-20, -80]], count: 18, spread: [4,16], color: SON, timing: [[0.2,0],[0.9,1]] }, { path: [[-140, -77], [-20, -80]], count: 18, spread: [4,16], color: SON, timing: [[0.2,0],[0.9,1]] }, { path: [[-60, -193], [-20, -80]], count: 18, spread: [4,16], color: SON, timing: [[0.2,0],[0.9,1]] }, { path: [[75, -153], [-20, -80]], count: 18, spread: [4,16], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("buon-ma-thuot") }));
  world.add(createFires({ sites: [[-20, -80], [-5, -90], [-30, -65]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("buon-ma-thuot") * smoothstep(0.7, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "duong-so-7": đoàn xe, đoàn người (ngà) dài dằng dặc theo đường số 7 từ Pleiku xuống Cheo Reo, Củng Sơn; lửa dọc đường; các nhóm (son) bên đường (diễn hoạ).
  const p2 = run("duong-so-7", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2035, groups: [{ path: [[-60, 140], [40, 40], [120, -20], [250, -40]], count: 120, spread: [3,10], color: NGHIA, timing: [[0.02,0],[0.95,0.75]] }], progress: p2, visible: () => clock.near("duong-so-7") }));
  world.add(createFires({ sites: [[0, 90], [40, 40], [80, 10], [120, -20]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("duong-so-7") * smoothstep(0.35, 0.9, p2()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2055, groups: [{ path: [[22, 60], [20, 67], [14, 71], [6, 71], [0, 67], [-2, 60], [0, 53], [6, 49], [14, 49], [20, 53], [22, 60]], count: 12, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[112, 10], [110, 17], [104, 21], [96, 21], [90, 17], [88, 10], [90, 3], [96, -1], [104, -1], [110, 3], [112, 10]], count: 12, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("duong-so-7") }));
  // 4. "hue-da-nang": đốm son sáng ở Huế rồi Đà Nẵng; thuyền (ngà) từ bờ Đà Nẵng ra biển (diễn hoạ).
  const p3 = run("hue-da-nang", 28);
  { const S: Pt[] = [[110, 180], [160, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.4, 0.25 + i * 0.4, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hue-da-nang") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2075, groups: [{ path: [[170, 120], [260, 140], [380, 160]], count: 8, spread: [6,16], color: NGHIA, timing: [[0.3,0],[0.95,1]] }], progress: p3, visible: () => clock.near("hue-da-nang") }));
};

export default setup;
