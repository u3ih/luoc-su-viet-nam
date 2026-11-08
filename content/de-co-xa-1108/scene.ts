import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, DE } from "./terrain";

type Pt = [number, number];

// Đê Cơ Xá và đê sông Hồng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Con đê cách điệu: một dải đất đắp cao dọc bờ tây sông Hồng (vòng tường rất hẹp, hai mặt sát nhau); không phải vị trí, chiều dài có tư liệu.
const WALLS: Wall[] = [
  { at: square(110, 0, 5, 1.5707963267948966, 62), base: 9, top: 5, height: 5, gates: [] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["mua-lu","dap-de","de-quai-vac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 88]];

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
    seed: 1108,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("dap-de") + 0.5 ? 1 : ctx.t > world.beat("dap-de") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["dap-de"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a5c", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "mua-lu": nước lũ (đốm xanh nhạt) tràn từ sông vào đồng ruộng và phố phường bờ tây (diễn hoạ).
  const p0 = run("mua-lu", 28);
  { const S: Pt[] = [[-20, -140], [20, -140], [60, -140], [100, -140], [-20, -100], [20, -100], [60, -100], [100, -100], [-20, -60], [20, -60], [60, -60], [100, -60], [-20, -20], [20, -20], [60, -20], [100, -20], [-20, 20], [20, 20], [60, 20], [100, 20], [-20, 60], [20, 60], [60, 60], [100, 60], [-20, 100], [20, 100], [60, 100], [100, 100], [-20, 140], [20, 140], [60, 140], [100, 140]]; world.add(createGlows({ count: S.length, color: DICH, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mua-lu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1128, groups: [{ path: [[-60, 20], [-200, 20]], count: 20, spread: [30,100], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("mua-lu") }));
  // 2. "dap-de": theo thanh kéo, người (son) dàn hàng dọc bờ tây đắp đê; con đê cao dần dọc bờ sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-de"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1138, groups: [{ path: [[95, -300], [95, 300]], count: 60, spread: [6,20], color: SON, drop: true, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dap-de") }));
  // 3. "de-quai-vac": những hàng đốm vàng (đê quai vạc) chạy dài hai bờ sông từ đầu nguồn ra biển; hai đốm ngà (Hà đê chánh phó sứ) (diễn hoạ).
  const p2 = run("de-quai-vac", 28);
  { const S: Pt[] = [[120, 395], [120, 349], [120, 302], [120, 256], [120, 209], [120, 163], [120, 116], [120, 70], [120, 23], [120, -23], [120, -70], [120, -116], [120, -163], [120, -209], [120, -256], [120, -302], [120, -349], [120, -395]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("de-quai-vac") })); }
  { const S: Pt[] = [[250, 395], [252, 349], [255, 302], [257, 256], [259, 209], [262, 163], [264, 116], [266, 70], [269, 23], [271, -23], [274, -70], [276, -116], [278, -163], [281, -209], [283, -256], [285, -302], [288, -349], [290, -395]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.03, 0.35 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("de-quai-vac") })); }
  { const S: Pt[] = [[-110, 30], [-130, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7 + i * 0.05, 0.85 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("de-quai-vac") })); }
  // 4. "ve-sau": người (son) đắp thêm sau mùa lũ; các đốm ngà (quan khám đê) đi dọc đê (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 8, seed: 1178, groups: [{ path: [[95, 300], [95, -300]], count: 3, spread: [4,200], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1188, groups: [{ path: [[70, -200], [70, 200]], count: 30, spread: [10,400], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
