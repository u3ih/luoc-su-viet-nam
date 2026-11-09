import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH_THANH, QUOC_HOC, DONG_BA, TRANG_TIEN, CUA_BIEN } from "./terrain";

type Pt = [number, number];

// Vua Thành Thái — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
  const clock = createBeatClock(world, ["len-ngoi","gan-dan","thoai-vi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH_THANH, 96]];

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
    seed: 1889,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "len-ngoi": triều thần (ngà) tụ về giữa kinh thành; đốm vàng (vua mới) sáng lên (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1899, groups: [{ path: [[-20, 30], [-20, 90]], count: 30, spread: [8,50], color: NGHIA, timing: [[0.03,0],[0.6,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  // 2. "gan-dan": theo thanh kéo, nhà vua (đốm vàng) rời Đại Nội đi vi hành; dân (son) tụ quanh; các công trình mới (đốm ngà) sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["gan-dan"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 3, seed: 1919, groups: [{ path: [[-20, 100], [-20, 10], [70, -30], [130, 40]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("gan-dan") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1929, groups: [{ path: [[200, 0], [120, 30]], count: 20, spread: [8,40], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("gan-dan") }));
  { const S: Pt[] = [[40, -130], [130, 50], [70, -50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.2, 0.35 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gan-dan") })); }
  // 3. "thoai-vi": quan Pháp (xanh nhạt) vào kinh thành; đốm vàng lịm dần (diễn hoạ).
  const p2 = run("thoai-vi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1949, groups: [{ path: [[150, -30], [40, 20], [-10, 90]], count: 20, spread: [6,30], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("thoai-vi") }));
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.55, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thoai-vi") })); }
  // 4. "ve-sau": tàu (đốm ngà) đưa cựu hoàng ra biển, đi rất xa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1969, groups: [{ path: [[80, -45], [250, 20], [380, 150], [450, 300]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
