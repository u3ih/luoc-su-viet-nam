import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_LO, LANG_GOM, HO_GUOM } from "./terrain";

type Pt = [number, number];

// Nhà tù Hoả Lò — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Tường bao nhà tù (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(0, 0, 34, 0), base: 4, top: 3, height: 7, gates: [{ at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["maison-centrale","tu-chinh-tri","vuot-nguc","hanoi-hilton"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_LO, 56], [LANG_GOM, 16], [HO_GUOM, 16]];

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
    seed: 1896,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8e8778", top: "#6b665a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "maison-centrale": các đốm ngà (lò gốm làng Hoả Lò) mờ dần; tường nhà tù đứng giữa khu phố; đốm vàng ở cổng (diễn hoạ).
  const p0 = run("maison-centrale", 28);
  { const S: Pt[] = [[70, 7], [52, 47], [15, 68], [-28, 64], [-60, 35], [-70, -7], [-52, -47], [-15, -68], [28, -64], [60, -35]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0.01, 0.15 + i * 0.01, k) * (1 - smoothstep(0.35, 0.55, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("maison-centrale") })); }
  { const S: Pt[] = [[0, -36]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("maison-centrale") })); }
  // 2. "tu-chinh-tri": bốn nhóm người (son) trong bốn khu giam; bốn đốm ngà mờ (diễn hoạ).
  const p1 = run("tu-chinh-tri", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1926, groups: [{ path: [[-7, -14], [-8, -10], [-12, -7], [-16, -7], [-20, -10], [-21, -14], [-20, -18], [-16, -21], [-12, -21], [-8, -18], [-7, -14]], count: 12, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[21, -14], [20, -10], [16, -7], [12, -7], [8, -10], [7, -14], [8, -18], [12, -21], [16, -21], [20, -18], [21, -14]], count: 12, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-7, 14], [-8, 18], [-12, 21], [-16, 21], [-20, 18], [-21, 14], [-20, 10], [-16, 7], [-12, 7], [-8, 10], [-7, 14]], count: 12, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[21, 14], [20, 18], [16, 21], [12, 21], [8, 18], [7, 14], [8, 10], [12, 7], [16, 7], [20, 10], [21, 14]], count: 12, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("tu-chinh-tri") }));
  { const S: Pt[] = [[-14, -14], [14, -14], [-14, 14], [14, 14]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.05, 0.25 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-chinh-tri") })); }
  // 3. "vuot-nguc": theo thanh kéo, người tù (son) thoát ra: một dòng theo đường cống ngầm phía nam, một dòng qua tường phía đông, một dòng lẫn vào người thăm nuôi qua cổng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["vuot-nguc"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1946, groups: [{ path: [[0, 0], [0, -70], [-20, -160]], count: 30, spread: [1,4], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[10, 10], [60, 30], [150, 60]], count: 25, spread: [1,4], color: SON, timing: [[0.05,0],[0.9,1]] }, { path: [[0, -20], [0, -40], [60, -120]], count: 20, spread: [1,4], color: SON, timing: [[0.1,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("vuot-nguc") }));
  // 4. "hanoi-hilton": một nhóm nhỏ (xanh nhạt) trong tường (tù binh phi công); về sau đốm vàng ở cổng (khu di tích) và đốm ngà khu phố quanh (diễn hoạ).
  const p3 = run("hanoi-hilton", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1956, groups: [{ path: [[10, 10], [8, 16], [3, 20], [-3, 20], [-8, 16], [-10, 10], [-8, 4], [-3, 0], [3, 0], [8, 4], [10, 10]], count: 20, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("hanoi-hilton") }));
  { const S: Pt[] = [[0, -36]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hanoi-hilton") })); }
  { const S: Pt[] = [[-60, 40], [60, 50], [-50, -60], [70, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.04, 0.75 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hanoi-hilton") })); }
};

export default setup;
