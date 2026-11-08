import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, DIEN } from "./terrain";

type Pt = [number, number];

// Nhã nhạc cung đình Huế — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành Huế cách điệu.
const WALLS: Wall[] = [
  { at: square(-20, 100, 90, 0), base: 14, top: 8, height: 6, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguon-coi","thoi-thinh","sa-sut","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 80]];

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
    seed: 2003,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "nguon-coi": vài đốm ngà (dàn nhạc trên bệ đá chùa Lý) sáng mờ từ xa; rồi đốm vàng (lễ nhạc chúa Nguyễn) ở Phú Xuân (diễn hoạ).
  const p0 = run("nguon-coi", 28);
  { const S: Pt[] = [[-300, 300], [-280, 310]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguon-coi") })); }
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguon-coi") })); }
  // 2. "thoi-thinh": theo thanh kéo, dàn nhạc (đốm vàng, đốm ngà = phe văn, phe võ) đông dần thành hai khối trước điện (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thoi-thinh"] ?? 0) / 0.9);
  { const S: Pt[] = [[-43, 81], [-39, 81], [-35, 81], [-31, 81], [-27, 81], [-43, 85], [-39, 85], [-35, 85], [-31, 85], [-27, 85], [-43, 89], [-39, 89], [-35, 89], [-31, 89], [-27, 89], [-43, 93], [-39, 93], [-35, 93], [-31, 93], [-27, 93], [-43, 97], [-39, 97], [-35, 97], [-31, 97], [-27, 97], [-43, 101], [-39, 101], [-35, 101], [-31, 101], [-27, 101], [-43, 105], [-39, 105], [-35, 105], [-31, 105], [-27, 105], [-43, 109], [-39, 109], [-35, 109], [-31, 109], [-27, 109]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.012, 0.16999999999999998 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thoi-thinh") })); }
  { const S: Pt[] = [[-13, 81], [-9, 81], [-5, 81], [-1, 81], [3, 81], [-13, 85], [-9, 85], [-5, 85], [-1, 85], [3, 85], [-13, 89], [-9, 89], [-5, 89], [-1, 89], [3, 89], [-13, 93], [-9, 93], [-5, 93], [-1, 93], [3, 93], [-13, 97], [-9, 97], [-5, 97], [-1, 97], [3, 97], [-13, 101], [-9, 101], [-5, 101], [-1, 101], [3, 101], [-13, 105], [-9, 105], [-5, 105], [-1, 105], [3, 105], [-13, 109], [-9, 109], [-5, 109], [-1, 109], [3, 109]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.012, 0.25 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thoi-thinh") })); }
  // 3. "sa-sut": lửa ở kinh thành (1885); các đốm nhạc lịm dần, chỉ còn vài đốm (diễn hoạ).
  const p2 = run("sa-sut", 28);
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(KINH, 50, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("sa-sut") * smoothstep(0.05, 0.9, p2()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-32.5, 87.5], [-27.5, 87.5], [-22.5, 87.5], [-17.5, 87.5], [-12.5, 87.5], [-7.5, 87.5], [-32.5, 92.5], [-27.5, 92.5], [-22.5, 92.5], [-17.5, 92.5], [-12.5, 92.5], [-7.5, 92.5], [-32.5, 97.5], [-27.5, 97.5], [-22.5, 97.5], [-17.5, 97.5], [-12.5, 97.5], [-7.5, 97.5], [-32.5, 102.5], [-27.5, 102.5], [-22.5, 102.5], [-17.5, 102.5], [-12.5, 102.5], [-7.5, 102.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.35, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sa-sut") })); }
  // 4. "ve-sau": dàn nhạc (đốm vàng) sáng lại đầy đủ; người xem (son) quanh điện (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-34, 87], [-30, 87], [-26, 87], [-22, 87], [-18, 87], [-14, 87], [-10, 87], [-6, 87], [-34, 91], [-30, 91], [-26, 91], [-22, 91], [-18, 91], [-14, 91], [-10, 91], [-6, 91], [-34, 95], [-30, 95], [-26, 95], [-22, 95], [-18, 95], [-14, 95], [-10, 95], [-6, 95], [-34, 99], [-30, 99], [-26, 99], [-22, 99], [-18, 99], [-14, 99], [-10, 99], [-6, 99], [-34, 103], [-30, 103], [-26, 103], [-22, 103], [-18, 103], [-14, 103], [-10, 103], [-6, 103]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.01, 0.2 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2083, groups: [{ path: [[20, 100], [16, 117], [5, 131], [-11, 139], [-29, 139], [-45, 131], [-56, 117], [-60, 100], [-56, 83], [-45, 69], [-29, 61], [-11, 61], [5, 69], [16, 83], [20, 100]], count: 40, spread: [4,120], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
