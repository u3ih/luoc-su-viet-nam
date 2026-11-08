import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, CHAN_GIAO, LONG_HUNG } from "./terrain";

type Pt = [number, number];

// Nhà Trần thay nhà Lý — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Một vòng tường cách điệu quanh hoàng thành; không vẽ cung điện, cổng.
const WALLS: Wall[] = [
  { at: square(0, 30, 60, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ho-tran","chieu-hoang","nhuong-ngoi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 80], [LONG_HUNG, 40]];

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
    seed: 1225,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "ho-tran": một đốm ngà (thái tử) rời kinh về Long Hưng, rồi đoàn quân họ Trần (son) từ Long Hưng kéo về kinh (diễn hoạ).
  const p0 = run("ho-tran", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1235, groups: [{ path: [KINH, [100, -120], LONG_HUNG], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.4,1]] }], progress: p0, visible: () => clock.near("ho-tran") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1245, groups: [{ path: [LONG_HUNG, [100, -120], [20, -20]], count: 40, spread: [30,80], color: SON, timing: [[0.4,0],[1,1]] }], progress: p0, visible: () => clock.near("ho-tran") }));
  { const S: Pt[] = [LONG_HUNG]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-tran") })); }
  // 2. "chieu-hoang": đốm vàng (ngai) giữa hoàng thành; đốm ngà (Huệ Tông) đi về chùa Chân Giáo; người họ Trần (son) vào hầu quanh điện (diễn hoạ).
  const p1 = run("chieu-hoang", 28);
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chieu-hoang") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1275, groups: [{ path: [[10, 20], CHAN_GIAO], count: 1, spread: [2,2], color: NGHIA, timing: [[0.1,0],[0.6,1]] }], progress: p1, visible: () => clock.near("chieu-hoang") }));
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1285, groups: [{ path: [[0, -30], [0, 10]], count: 16, spread: [30,16], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: p1, visible: () => clock.near("chieu-hoang") }));
  // 3. "nhuong-ngoi": triều thần (son) từ bốn cửa tụ về điện theo thanh kéo, đốm vàng sáng dần ở giữa (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nhuong-ngoi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1295, groups: [{ path: [[0, -30], [0, 15]], count: 14, spread: [24,20], color: SON, timing: [[0,0],[1,1]] }, { path: [[60, 30], [15, 30]], count: 12, spread: [20,20], color: SON, timing: [[0,0],[1,1]] }, { path: [[-60, 30], [-15, 30]], count: 12, spread: [20,20], color: SON, timing: [[0,0],[1,1]] }, { path: [[0, 90], [0, 45]], count: 12, spread: [20,20], color: SON, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nhuong-ngoi") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhuong-ngoi") })); }
  // 4. "ve-sau": đốm vàng giữa hoàng thành; các toán quân (son) tỏa đi các nơi dẹp loạn (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1325, groups: [{ path: [[0, 30], [-250, 250]], count: 16, spread: [20,40], color: SON, timing: [[0.05,0],[0.9,1]] }, { path: [[0, 30], [-280, -200]], count: 16, spread: [20,40], color: SON, timing: [[0.1,0],[0.95,1]] }, { path: [[0, 30], [200, 300]], count: 16, spread: [20,40], color: SON, timing: [[0.15,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
