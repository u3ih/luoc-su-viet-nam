import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHO_HIEN, THANG_LONG, CHAU_CAU, NINH_HAI } from "./terrain";

type Pt = [number, number];

// Phố Hiến — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["pho-hien", "thuong-dien", "kinh-ky", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHO_HIEN, 55], [THANG_LONG, 55], [CHAU_CAU, 55], [NINH_HAI, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1637,
  });

  // 1. "pho-hien": các nhóm người (son) từ ven sông tụ về Phố Hiến, một đốm ngà sáng dần (diễn hoạ).
  const p0 = run("pho-hien", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1637, groups: [{ path: [[-200, 120], [-60, 60], PHO_HIEN], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[160, -120], [120, -50], PHO_HIEN], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("pho-hien") }));
  { const S: Pt[] = [PHO_HIEN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pho-hien") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHO_HIEN, 32, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("pho-hien") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "thuong-dien": các đoàn khách buôn từ ba ngả tụ về bến theo thanh kéo, đốm vàng sáng ở Phố Hiến (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["buon-ban"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1647, groups: [{ path: [THANG_LONG, [-60, 130], PHO_HIEN], count: 16, spread: [28,40], color: SON, timing: [[0,0],[1,0.95]] }, { path: [NINH_HAI, [150, -120], PHO_HIEN], count: 16, spread: [28,40], color: NGHIA, timing: [[0,0],[1,0.95]] }, { path: [CHAU_CAU, [-70, -90], PHO_HIEN], count: 14, spread: [28,40], color: DICH, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thuong-dien") }));
  { const S: Pt[] = [PHO_HIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thuong-dien") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(PHO_HIEN, 34, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: (ctx) => clock.near("thuong-dien") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "kinh-ky": hai đốm sáng: Thăng Long (vàng) sáng trước, Phố Hiến (ngà) sáng sau; vài nhóm người (son) đi giữa hai nơi (diễn hoạ).
  const p2 = run("kinh-ky", 28);
  { const S: Pt[] = [THANG_LONG, PHO_HIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.35, 0.25 + i * 0.35, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kinh-ky") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1657, groups: [{ path: [PHO_HIEN, [-30, 110], THANG_LONG], count: 18, spread: [30,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [THANG_LONG, [-30, 110], PHO_HIEN], count: 14, spread: [30,50], color: SON, timing: [[0.19,0],[0.85,1]] }], progress: p2, visible: () => clock.near("kinh-ky") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(THANG_LONG, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("kinh-ky") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": các nhóm người (son) rời Phố Hiến về Châu Cầu và Ninh Hải, ánh sáng ở Phố Hiến dịu dần, hai đốm vàng sáng ở nơi mới (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1667, groups: [{ path: [PHO_HIEN, [-60, -90], CHAU_CAU], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [PHO_HIEN, [140, -120], NINH_HAI], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [CHAU_CAU, NINH_HAI]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.2, 0.44999999999999996 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [PHO_HIEN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
