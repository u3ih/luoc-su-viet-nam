import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TA_CON, LANG_VAY, LANG_BRU } from "./terrain";

type Pt = [number, number];

// Khe Sanh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Chu vi căn cứ (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(0, 0, 45, 0), base: 7, top: 5, height: 4, gates: [{ at: 0, width: 12 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ta-con","vay-can-cu","niagara","pha-bo"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TA_CON, 56], [LANG_VAY, 16]];

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
    seed: 19681,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a5c", top: "#6f6a4a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "ta-con": lính (xanh nhạt) trong căn cứ; đốm vàng ở sân bay; các làng Bru (đốm ngà) quanh cao nguyên (diễn hoạ).
  const p0 = run("ta-con", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19691, groups: [{ path: [[-25, -25], [25, -25], [-25, 25], [25, 25], [-25, -25]], count: 70, spread: [1,8], color: DICH, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("ta-con") }));
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ta-con") })); }
  { const S: Pt[] = [[60, 130], [-80, 110], [120, 60], [-130, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ta-con") })); }
  // 2. "vay-can-cu": theo thanh kéo, các sư đoàn (son) khép vòng vây quanh căn cứ; lửa pháo kích loé trong căn cứ; trại Làng Vây (đốm xanh nhạt) tắt (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["vay-can-cu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 19721, groups: [{ path: [[196, 40], [88, 18]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[111, 167], [50, 75]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-40, 196], [-18, 88]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-167, 111], [-75, 50]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-196, -40], [-88, -18]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-111, -167], [-50, -75]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[40, -196], [18, -88]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[167, -111], [75, -50]], count: 14, spread: [4,12], color: SON, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("vay-can-cu") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring([0, 0], 25, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("vay-can-cu") * smoothstep(0.4, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-150, -70]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.5, 0.65, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vay-can-cu") })); }
  // 3. "niagara": lửa bom bùng khắp vòng đồi quanh căn cứ; máy bay vận tải (đốm xanh nhạt) bay vào tiếp tế (diễn hoạ).
  const p2 = run("niagara", 28);
  world.add(createFires({ sites: Array.from({ length: 12 }, (_, i) => { const [x, z] = ring([0, 0], 140, (i / 12) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 12, size: 1.1 }; }), lit: () => clock.near("niagara") * smoothstep(0.05, 0.9, p2()), size: 4, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 50, seed: 19761, groups: [{ path: [[380, 60], [150, 20], [0, 0]], count: 6, spread: [4,14], color: DICH, timing: [[0.05,0],[0.9,1]] }], progress: p2, visible: () => clock.near("niagara") }));
  // 4. "pha-bo": lính (xanh nhạt) rời căn cứ về phía đông; lửa phá huỷ trong căn cứ (diễn hoạ).
  const p3 = run("pha-bo", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19771, groups: [{ path: [[0, 0], [150, 20], [390, 40]], count: 60, spread: [4,14], color: DICH, timing: [[0.05,0],[0.9,1]] }], progress: p3, visible: () => clock.near("pha-bo") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([0, 0], 20, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("pha-bo") * smoothstep(0.45, 0.9, p3()), size: 4, glow: () => 0.8 }));
};

export default setup;
