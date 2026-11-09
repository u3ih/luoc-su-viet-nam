import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_SAM, BE_THO, MIEU, DONG_A, DONG_B } from "./terrain";

type Pt = [number, number];

// Lễ hội Vía Bà Chúa Xứ núi Sam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["pho-tuong","ruoc-tuong","le-hoi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[MIEU, 36]];

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
    ranges: { radius: 560, height: 0.5 },
    seed: 2029,
  });

  // 1. "pho-tuong": pho tượng trên đỉnh núi Sam (đốm vàng); dân quanh vùng (son) nhìn lên (diễn hoạ).
  const p0 = run("pho-tuong", 28);
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pho-tuong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2049, groups: [{ path: [[150, -100], [110, -50]], count: 16, spread: [10,40], color: SON, timing: [[0.1,0],[0.7,1]] }], progress: p0, visible: () => clock.near("pho-tuong") }));
  // 2. "ruoc-tuong": theo thanh kéo, đoàn rước (chín chấm ngà) cùng kiệu (đốm vàng) từ đỉnh núi xuống chân núi; miếu (đốm vàng) sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ruoc-tuong"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 2059, groups: [{ path: [[0, 60], [40, 20], [85, -35]], count: 9, spread: [3,10], color: NGHIA, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ruoc-tuong") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 3, seed: 2069, groups: [{ path: [[0, 60], [40, 20], [88, -38]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ruoc-tuong") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2079, groups: [{ path: [[180, -150], [110, -60]], count: 20, spread: [10,40], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ruoc-tuong") }));
  { const S: Pt[] = [[90, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ruoc-tuong") })); }
  // 3. "le-hoi": khách hành hương (son) từ bốn phía về miếu; múa lân, nhạc ngũ âm (đốm ngà) quanh sân miếu (diễn hoạ).
  const p2 = run("le-hoi", 28);
  { const S: Pt[] = [[90, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("le-hoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2109, groups: [{ path: [[-200, -100], [70, -40]], count: 18, spread: [10,50], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[300, -200], [100, -60]], count: 18, spread: [10,50], color: SON, timing: [[0.08,0],[0.75,1]] }, { path: [[250, 80], [110, -25]], count: 18, spread: [10,50], color: SON, timing: [[0.14,0],[0.8,1]] }], progress: p2, visible: () => clock.near("le-hoi") }));
  { const S: Pt[] = [[120, -40], [105, -14], [75, -14], [60, -40], [75, -66], [105, -66]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("le-hoi") })); }
  // 4. "ve-sau": bốn cộng đồng (son, ngà, xanh nhạt, vàng) cùng dự lễ quanh miếu (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[90, -40], [0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.1, 0.16999999999999998 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2139, groups: [{ path: [[-100, -150], [70, -60]], count: 14, spread: [8,40], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[250, -150], [110, -60]], count: 14, spread: [8,40], color: NGHIA, timing: [[0.1,0],[0.75,1]] }, { path: [[260, 60], [120, -30]], count: 14, spread: [8,40], color: DICH, timing: [[0.15,0],[0.8,1]] }, { path: [[-50, -250], [80, -70]], count: 14, spread: [8,40], color: GOLD, timing: [[0.2,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
