import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SON_NAM, THANH_HOA, HUNG_HOA, MUONG_THANH, BAN_PHU, TAM_VAN } from "./terrain";

type Pt = [number, number];

// Hoàng Công Chất và thành Bản Phủ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Bản Phủ cách điệu: một vòng tường đất nhỏ; không vẽ cổng, lũy.
const WALLS: Wall[] = [
  { at: square(-165, 160, 28, 0), base: 6, top: 4, height: 4, gates: [{ at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["son-nam","muong-thanh","chua-muong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SON_NAM, 64], [MUONG_THANH, 76]];

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
    counts: { trees: 700, bushes: 700, grass: 1800, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1758,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("muong-thanh") + 0.5 ? 1 : ctx.t > world.beat("muong-thanh") - 0.6 ? smoothstep(0.4, 0.95, ctx.inputs["muong-thanh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a60", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "son-nam": các toán nghĩa quân (son) luồn qua vùng đầm lầy Sơn Nam; quân triều đình (xanh nhạt) kéo đến rồi rút; đốm ngà giữa vùng (diễn hoạ).
  const p0 = run("son-nam", 28);
  { const S: Pt[] = [SON_NAM]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("son-nam") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1778, groups: [{ path: [[300, -120], [230, -170], [180, -230], [260, -280]], count: 24, spread: [20,60], color: SON, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("son-nam") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1788, groups: [{ path: [[120, 60], [190, -130], [120, 60]], count: 26, spread: [30,50], color: DICH, timing: [[0.05,0],[0.9,1]] }], progress: p0, visible: () => clock.near("son-nam") }));
  // 2. "muong-thanh": nghĩa quân (son, đốm ngà dẫn đầu) từ Sơn Nam qua Thanh Hóa, Hưng Hóa vượt núi lên Mường Thanh theo thanh kéo; vòng thành Bản Phủ đắp dần lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["muong-thanh"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1798, groups: [{ path: [SON_NAM, THANH_HOA, HUNG_HOA, [-120, 100], BAN_PHU], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("muong-thanh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1808, groups: [{ path: [SON_NAM, THANH_HOA, HUNG_HOA, [-120, 100], [-160, 140]], count: 40, spread: [16,90], color: SON, timing: [[0,0],[1,0.97]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("muong-thanh") }));
  // 3. "chua-muong": người các bản mường (son) từ chân núi tụ về Bản Phủ, các đốm vàng (bản mường quy phục) sáng dần quanh cánh đồng (diễn hoạ).
  const p2 = run("chua-muong", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1818, groups: [{ path: [[-300, 260], BAN_PHU], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-60, 280], BAN_PHU], count: 14, spread: [26,50], color: SON, timing: [[0.08,0],[0.88,1]] }, { path: [[-280, 90], BAN_PHU], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.9,1]] }, { path: [[-80, 110], BAN_PHU], count: 14, spread: [26,50], color: SON, timing: [[0.16,0],[0.92,1]] }], progress: p2, visible: () => clock.near("chua-muong") }));
  { const S: Pt[] = [[-300, 260], [-60, 280], [-280, 90], [-80, 110], TAM_VAN]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-muong") })); }
  // 4. "ve-sau": quân Trịnh (xanh nhạt) từ phía đông nam tiến vào cánh đồng; đốm ngà ở Bản Phủ lịm dần, lửa bùng quanh thành (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1838, groups: [{ path: [[60, -40], [-80, 80], [-140, 140]], count: 40, spread: [30,90], color: DICH, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [BAN_PHU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(BAN_PHU, 30, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.55, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
