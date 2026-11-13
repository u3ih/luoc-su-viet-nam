import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHO, RUONG, CANG, HA_NOI } from "./terrain";

type Pt = [number, number];

// Đổi mới — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bao-cap","pha-rao","dai-hoi-vi","khoan-10"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHO, 32], [RUONG, 32], [CANG, 32], [HA_NOI, 40]];

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
    seed: 1986,
  });

  // 1. "bao-cap": người (son) xếp hàng dài trước cửa hàng (đốm ngà mờ) (diễn hoạ).
  const p0 = run("bao-cap", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1996, groups: [{ path: [[20, -40], [-30, -60], [-60, -40], [-90, -60]], count: 60, spread: [1,3], color: SON, timing: [[0.02,0],[0.5,1]] }], progress: p0, visible: () => clock.near("bao-cap") }));
  { const S: Pt[] = [[20, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.4 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bao-cap") })); }
  // 2. "pha-rao": trên ruộng, từng hộ (son) nhận thửa của mình (đốm vàng nhỏ sáng dần) (diễn hoạ).
  const p1 = run("pha-rao", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2016, groups: [{ path: [[-230, -105], [-180, -105], [-130, -105], [-230, -55], [-180, -55], [-130, -55], [-230, -105]], count: 40, spread: [2,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("pha-rao") }));
  { const S: Pt[] = [[-225, -110], [-195, -110], [-165, -110], [-135, -110], [-225, -80], [-195, -80], [-165, -80], [-135, -80], [-225, -50], [-195, -50], [-165, -50], [-135, -50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.04, 0.35 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pha-rao") })); }
  // 3. "dai-hoi-vi": theo thanh kéo, từ Hà Nội (đốm vàng) ánh sáng lan ra; chợ đông dần (son), ruộng (đốm vàng) và bến cảng (đốm ngà) sáng lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dai-hoi-vi"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-hoi-vi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2046, groups: [{ path: [[154, 1], [20, -40]], count: 16, spread: [4,16], color: SON, timing: [[0.15,0],[0.9,0.85]] }, { path: [[51, 97], [20, -40]], count: 16, spread: [4,16], color: SON, timing: [[0.15,0],[0.9,0.85]] }, { path: [[-83, 55], [20, -40]], count: 16, spread: [4,16], color: SON, timing: [[0.15,0],[0.9,0.85]] }, { path: [[-114, -81], [20, -40]], count: 16, spread: [4,16], color: SON, timing: [[0.15,0],[0.9,0.85]] }, { path: [[-11, -177], [20, -40]], count: 16, spread: [4,16], color: SON, timing: [[0.15,0],[0.9,0.85]] }, { path: [[123, -135], [20, -40]], count: 16, spread: [4,16], color: SON, timing: [[0.15,0],[0.9,0.85]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dai-hoi-vi") }));
  { const S: Pt[] = [[-225, -110], [-195, -110], [-165, -110], [-135, -110], [-225, -80], [-195, -80], [-165, -80], [-135, -80], [-225, -50], [-195, -50], [-165, -50], [-135, -50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.02, 0.44999999999999996 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-hoi-vi") })); }
  { const S: Pt[] = [[220, -20], [240, 20], [240, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.55 + i * 0.05, 0.7000000000000001 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-hoi-vi") })); }
  // 4. "khoan-10": những chuyến tàu (đốm vàng) chở gạo rời cảng ra biển; người (son) qua lại tấp nập (diễn hoạ).
  const p3 = run("khoan-10", 28);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2076, groups: [{ path: [[230, -20], [390, -60]], count: 4, spread: [4,12], color: GOLD, timing: [[0.02,0],[0.9,1]] }], progress: p3, visible: () => clock.near("khoan-10") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2086, groups: [{ path: [[-180, -80], [20, -40], [220, -20]], count: 60, spread: [3,10], color: SON, timing: [[0.02,0],[0.95,1]] }], progress: p3, visible: () => clock.near("khoan-10") }));
};

export default setup;
