import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAI_LA, DEN, HOA_LU } from "./terrain";

type Pt = [number, number];

// Thành Đại La — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Đại La và vòng đê ngoài, cách điệu thành hình vuông (thành thật không vuông).
const WALLS: Wall[] = [
  { at: square(20, 40, 85, 0), base: 12, top: 7, height: 7, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
  { at: square(20, 40, 122, 0), base: 9, top: 6, height: 4, gates: [{ at: 0.3, width: 10 }, { at: 2.8415926535897933, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tong-binh","dap-thanh","long-do","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DAI_LA, 112]];

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
    seed: 866,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("dap-thanh") + 0.5 ? 1 : ctx.t > world.beat("dap-thanh") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["dap-thanh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8572", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 2 - k * 0.6), wear: () => 0 }));

  // 1. "tong-binh": quân Nam Chiếu (xanh nhạt) giữ thành; quân Đường (son) kéo tới từ phía đông; lửa bùng trong thành (diễn hoạ).
  const p0 = run("tong-binh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 876, groups: [{ path: [[0, 20], [40, 60]], count: 30, spread: [20,60], color: DICH, timing: [[0,1],[1,1]] }], progress: p0, fall: (ctx) => smoothstep(0.05, 0.9, p0()), visible: () => clock.near("tong-binh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 886, groups: [{ path: [[360, -100], [200, -20], [80, 30]], count: 36, spread: [16,60], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("tong-binh") }));
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring([20, 40], 40, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("tong-binh") * smoothstep(0.5, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "dap-thanh": theo thanh kéo, vòng thành rồi vòng đê ngoài đắp dần lên; người đắp thành (son) quanh bốn phía (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-thanh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 906, groups: [{ path: [[20, -45], [20, -40]], count: 16, spread: [8,90], color: SON, timing: [[0,1],[1,1]] }, { path: [[105, 40], [100, 40]], count: 16, spread: [8,90], color: SON, timing: [[0,1],[1,1]] }, { path: [[20, 125], [20, 120]], count: 16, spread: [8,90], color: SON, timing: [[0,1],[1,1]] }, { path: [[-65, 40], [-60, 40]], count: 16, spread: [8,90], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dap-thanh") }));
  // 3. "long-do": truyền thuyết: cột đốm vàng (đám mây ngũ sắc, thần Long Đỗ) bốc lên rồi tan; đốm ngà (đền thờ thần) sáng lên (diễn hoạ).
  const p2 = run("long-do", 28);
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.11 + i * 0.12, 0.26 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 31, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 43, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.22999999999999998 + i * 0.12, 0.38 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 55, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 68, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.41 + i * 0.12, 0.5599999999999999 + i * 0.12, k) * (1 - smoothstep(0.55, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-do") })); }
  // 4. "ve-sau": đoàn người (ngà) từ Hoa Lư phía nam kéo về thành (dời đô năm 1010); đốm vàng giữa thành (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 996, groups: [{ path: [[-60, -380], [0, -150], [20, 20]], count: 30, spread: [10,50], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-40, 90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
