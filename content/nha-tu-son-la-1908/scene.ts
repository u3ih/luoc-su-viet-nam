import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KHAU_CA, DUONG_NUI } from "./terrain";

type Pt = [number, number];

// Nhà tù Sơn La — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Tường nhà tù trên đỉnh đồi (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(0, 0, 22, 0), base: 4, top: 3, height: 5, gates: [{ at: 0, width: 7 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khau-ca","doan-tu","to-hieu","di-tich"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DUONG_NUI, 16]];

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
    seed: 1908,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8b8576", top: "#6a6556" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "khau-ca": tường nhà tù trên đỉnh đồi; đốm vàng nhỏ (tháp canh) ở hai góc; suối dưới chân đồi (diễn hoạ).
  const p0 = run("khau-ca", 28);
  { const S: Pt[] = [[-22, -22], [22, 22]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.2, 0.25 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khau-ca") })); }
  // 2. "doan-tu": theo thanh kéo, đoàn tù (son) có lính áp giải (xanh nhạt) đi theo đường núi từ phía đông lên đỉnh đồi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["doan-tu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1928, groups: [{ path: [[390, -80], [200, -40], [80, -10], [0, 0]], count: 40, spread: [1,4], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("doan-tu") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1938, groups: [{ path: [[390, -70], [200, -30], [80, 0], [10, 5]], count: 10, spread: [4,8], color: DICH, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("doan-tu") }));
  // 3. "to-hieu": những người tù (son) ngồi thành vòng trong sân (học tập); một đốm hồng (cây đào) sáng giữa sân (diễn hoạ).
  const p2 = run("to-hieu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1948, groups: [{ path: [[10, 0], [8, 6], [3, 10], [-3, 10], [-8, 6], [-10, 0], [-8, -6], [-3, -10], [3, -10], [8, -6], [10, 0]], count: 24, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("to-hieu") }));
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#f29bb3", size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("to-hieu") })); }
  // 4. "di-tich": lửa (bom) phá tường; về sau đốm vàng (khu di tích) sáng; dòng khách (ngà) lên đồi (diễn hoạ).
  const p3 = run("di-tich", 28);
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring([0, 0], 22, (i / 4) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: () => clock.near("di-tich") * smoothstep(0.02, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-tich") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1988, groups: [{ path: [[200, -40], [80, -10], [10, 0]], count: 30, spread: [1,4], color: NGHIA, timing: [[0.55,0],[0.98,1]] }], progress: p3, visible: () => clock.near("di-tich") }));
};

export default setup;
