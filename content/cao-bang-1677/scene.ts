import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CAO_BANG, THANG_LONG } from "./terrain";

type Pt = [number, number];

// Thành Cao Bằng thất thủ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Cao Bằng cách điệu.
const WALLS: Wall[] = [
  { at: square(-20, 110, 32, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["roi-thang-long","cao-bang","that-thu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CAO_BANG, 48]];

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
    seed: 1677,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => smoothstep(world.beat("cao-bang") - 0.6, world.beat("cao-bang") - 0.1, ctx.t);
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "roi-thang-long": hoàng tộc nhà Mạc (ngà) rời phương nam, theo thung lũng lên miền núi Cao Bằng (diễn hoạ).
  const p0 = run("roi-thang-long", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1687, groups: [{ path: [[60, -380], [40, -150], [20, 0], [-10, 100]], count: 20, spread: [6,60], color: NGHIA, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("roi-thang-long") }));
  // 2. "cao-bang": thành Cao Bằng hiện lên; ba đời Mạc (đốm vàng) nối nhau; dân (son) quanh thành (diễn hoạ).
  const p1 = run("cao-bang", 28);
  { const S: Pt[] = [[-30, 110], [-20, 110], [-10, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.25, 0.25 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cao-bang") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1707, groups: [{ path: [[-80, 60], [-30, 100]], count: 24, spread: [10,50], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p1, visible: () => clock.near("cao-bang") }));
  // 3. "that-thu": theo thanh kéo, quân Lê – Trịnh (xanh nhạt) tiến lên thung lũng tới thành; vài chấm ngà chạy về phía bắc; lửa bùng ở thành (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["that-thu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1717, groups: [{ path: [[60, -380], [40, -100], [0, 80]], count: 60, spread: [16,100], color: DICH, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("that-thu") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1727, groups: [{ path: [[-20, 110], [-60, 260], [-80, 400]], count: 6, spread: [4,20], color: NGHIA, timing: [[0.6,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("that-thu") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring([-20, 110], 22, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("that-thu") * smoothstep(0.7, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": thành Cao Bằng dưới quyền triều Lê – Trịnh (đốm xanh nhạt); phương bắc xa (đốm ngà lịm dần) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-80, 380]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.5, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
