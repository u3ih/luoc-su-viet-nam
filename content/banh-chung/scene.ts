import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, LANG_LIEU, RUONG } from "./terrain";

type Pt = [number, number];

// Lang Liêu và bánh chưng, bánh giầy — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["truyen-ngoi","lam-banh","dang-le","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 56], [LANG_LIEU, 32]];

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
    seed: 685,
  });

  // 1. "truyen-ngoi": đốm vàng (vua) giữa vòng 22 đốm ngà (các lang); các lang tỏa đi khắp nơi (lên rừng săn, ra sông chài lưới) (diễn hoạ).
  const p0 = run("truyen-ngoi", 28);
  { const S: Pt[] = [[0, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truyen-ngoi") })); }
  { const S: Pt[] = [[30, 120], [29, 128], [25, 136], [20, 143], [12, 147], [4, 150], [-4, 150], [-12, 147], [-20, 143], [-25, 136], [-29, 128], [-30, 120], [-29, 112], [-25, 104], [-20, 97], [-12, 93], [-4, 90], [4, 90], [12, 93], [20, 97], [25, 104], [29, 112]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.01, 0.2 + i * 0.01, k) * (1 - smoothstep(0.45, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truyen-ngoi") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 715, groups: [{ path: [[0, 120], [-250, 280]], count: 8, spread: [6,60], color: NGHIA, timing: [[0.5,0],[1,1]] }, { path: [[0, 120], [150, 300]], count: 7, spread: [6,60], color: NGHIA, timing: [[0.5,0],[1,1]] }, { path: [[0, 120], [300, 40]], count: 6, spread: [6,60], color: NGHIA, timing: [[0.5,0],[1,1]] }], progress: p0, visible: () => clock.near("truyen-ngoi") }));
  // 2. "lam-banh": theo thanh kéo: hạt nếp (đốm trắng) từ đồng lúa về nhà Lang Liêu; một ô vuông đốm xanh (bánh chưng) và một vòng đốm trắng (bánh giầy) thành hình (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lam-banh"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 725, groups: [{ path: [RUONG, [60, -150]], count: 12, spread: [6,40], color: "#f4f2ea", timing: [[0,0],[0.4,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lam-banh") }));
  { const S: Pt[] = [[44, -156], [48, -156], [52, -156], [56, -156], [44, -152], [48, -152], [52, -152], [56, -152], [44, -148], [48, -148], [52, -148], [56, -148], [44, -144], [48, -144], [52, -144], [56, -144]]; world.add(createGlows({ count: S.length, color: "#7fbf6a", size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.015, 0.55 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lam-banh") })); }
  { const S: Pt[] = [[83, -150], [81, -145], [77, -142], [73, -142], [69, -145], [67, -150], [69, -155], [73, -158], [77, -158], [81, -155]]; world.add(createGlows({ count: S.length, color: "#f4f2ea", size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.015, 0.85 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lam-banh") })); }
  world.add(createFires({ sites: [[62, -135]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("lam-banh") * smoothstep(0.5, 0.9, inp1(ctx)), size: 2, glow: () => 0.8 }));
  // 3. "dang-le": các lang (chấm ngà) mang lễ vật về kinh; đốm xanh và đốm trắng (bánh của Lang Liêu) sáng rực trước vua (diễn hoạ).
  const p2 = run("dang-le", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 765, groups: [{ path: [[-250, 280], [-20, 130]], count: 8, spread: [6,40], color: NGHIA, timing: [[0.02,0],[0.6,1]] }, { path: [[150, 300], [20, 130]], count: 7, spread: [6,40], color: NGHIA, timing: [[0.05,0],[0.6,1]] }, { path: [[60, -150], [0, 40], [5, 110]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.1,0],[0.7,1]] }], progress: p2, visible: () => clock.near("dang-le") }));
  { const S: Pt[] = [[-6, 105], [6, 105]]; world.add(createGlows({ count: S.length, color: "#7fbf6a", size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7 + i * 0.04, 0.85 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dang-le") })); }
  { const S: Pt[] = [[0, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dang-le") })); }
  // 4. "ve-sau": Tết: lửa nồi bánh chưng đỏ ở khắp các làng; đốm vàng ấm (bàn thờ) trong từng nhà (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: [[160, -40], [129, 54], [49, 112], [-49, 112], [-129, 54], [-160, -40], [-129, -134], [-49, -192], [49, -192], [129, -134], [255, 12], [195, 132], [83, 207], [-52, 215], [-172, 155], [-247, 43], [-255, -92], [-195, -212], [-83, -287], [52, -295], [172, -235], [247, -123]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ve-sau") * smoothstep(0.05, 0.9, p3()), size: 2, glow: () => 0.8 }));
  { const S: Pt[] = [[149, -25], [112, 60], [32, 107], [-60, 97], [-130, 36], [-149, -55], [-112, -140], [-32, -187], [60, -177], [130, -116]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.03, 0.44999999999999996 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
