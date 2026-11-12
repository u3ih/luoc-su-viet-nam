import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, MAT, HUE, SAI_GON } from "./terrain";

type Pt = [number, number];

// Áo dài Lemur — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ngu-than","phong-hoa","xuyen-viet","le-pho"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 32], [MAT, 48], [HUE, 28], [SAI_GON, 32]];

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
    seed: 1934,
  });

  // 1. "ngu-than": năm đốm ngà (năm vạt áo ngũ thân, cách điệu) xếp cạnh nhau; phụ nữ (son) đi chợ (diễn hoạ).
  const p0 = run("ngu-than", 28);
  { const S: Pt[] = [[16, 130], [28, 130], [40, 130], [52, 130], [64, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngu-than") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1954, groups: [{ path: [[-150, 60], [150, 60]], count: 30, spread: [3,10], color: SON, timing: [[0,0],[0.9,1]] }], progress: p0, visible: () => clock.near("ngu-than") }));
  // 2. "phong-hoa": theo thanh kéo, năm đốm thu về thành hai cột dài (hai tà áo); cột phía trước dài chấm đất (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["phong-hoa"] ?? 0) / 0.9);
  { const S: Pt[] = [[16, 130], [28, 130], [52, 130], [64, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.15, 0.35, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 7, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 25, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[34, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6000000000000001 + i * 0.12, 0.7500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[46, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[46, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[46, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[46, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 25, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6000000000000001 + i * 0.12, 0.7500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  { const S: Pt[] = [[46, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  // 3. "xuyen-viet": một chấm vàng (hoạ sĩ) đi từ Hà Nội vào Huế, Sài Gòn; ở mỗi nơi, phụ nữ (son) ra phố, đốm ngà (áo dài) sáng (diễn hoạ).
  const p2 = run("xuyen-viet", 28);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2094, groups: [{ path: [[-40, 270], [100, -55], [158, -295]], count: 1, spread: [2,2], color: GOLD, timing: [[0.05,0],[0.85,1]] }], progress: p2, visible: () => clock.near("xuyen-viet") }));
  { const S: Pt[] = [[100, -60], [160, -300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.35, 0.55 + i * 0.35, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuyen-viet") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2114, groups: [{ path: [[130, -60], [126, -45], [115, -34], [100, -30], [85, -34], [74, -45], [70, -60], [74, -75], [85, -86], [100, -90], [115, -86], [126, -75], [130, -60]], count: 30, spread: [2,6], color: SON, drop: true, timing: [[0.35,0],[0.7,1]] }], progress: p2, visible: () => clock.near("xuyen-viet") }));
  // 4. "le-pho": hai đốm (Cát Tường: vàng; Lê Phổ: ngà) ở Hà Nội; đốm ngà rời đi phương xa (1937) (diễn hoạ).
  const p3 = run("le-pho", 28);
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("le-pho") })); }
  { const S: Pt[] = [[-20, 260]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (1 - smoothstep(0.6, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("le-pho") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2144, groups: [{ path: [[-20, 260], [-300, 380]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.6,0],[0.95,1]] }], progress: p3, visible: () => clock.near("le-pho") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2154, groups: [{ path: [[-150, 220], [-60, 255]], count: 20, spread: [3,10], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("le-pho") }));
};

export default setup;
