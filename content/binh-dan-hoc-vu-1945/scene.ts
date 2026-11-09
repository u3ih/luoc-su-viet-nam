import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DINH, LANG_A, LANG_B, LANG_C, LANG_D } from "./terrain";

type Pt = [number, number];

// Bình dân học vụ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["mu-chu","lop-hoc","i-tu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DINH, 48], [LANG_A, 44], [LANG_B, 44], [LANG_C, 44], [LANG_D, 44]];

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
    seed: 1948,
  });

  // 1. "mu-chu": dân các làng (son) ra đồng làm việc; làng còn tối (diễn hoạ).
  const p0 = run("mu-chu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1958, groups: [{ path: [[-170, 120], [-80, 60]], count: 16, spread: [10,50], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[160, 140], [80, 60]], count: 16, spread: [10,50], color: SON, timing: [[0.1,0],[0.65,1]] }, { path: [[-160, -110], [-80, -40]], count: 16, spread: [10,50], color: SON, timing: [[0.15,0],[0.7,1]] }, { path: [[170, -100], [90, -40]], count: 16, spread: [10,50], color: SON, timing: [[0.2,0],[0.75,1]] }], progress: p0, visible: () => clock.near("mu-chu") }));
  // 2. "lop-hoc": theo thanh kéo, các lớp học (đốm vàng) lần lượt sáng lên ở đình và các làng; người đi học (son) tụ về (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lop-hoc"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 20], [-170, 120], [160, 140], [-160, -110], [170, -100], [-60, 150], [80, -150], [-240, 20], [240, 30], [40, 200], [-90, -200], [120, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lop-hoc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1978, groups: [{ path: [[-250, 250], [-170, 130]], count: 14, spread: [8,40], color: SON, timing: [[0.1,0],[0.6,1]] }, { path: [[250, 250], [160, 150]], count: 14, spread: [8,40], color: SON, timing: [[0.2,0],[0.7,1]] }, { path: [[0, -300], [0, 10]], count: 18, spread: [8,50], color: SON, timing: [[0.3,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lop-hoc") }));
  // 3. "i-tu": đội nhi đồng (chấm ngà) đi khắp ngõ xóm cổ động; chữ cái treo ở cổng làng (đốm ngà) (diễn hoạ).
  const p2 = run("i-tu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1988, groups: [{ path: [[-170, 120], [-60, 100], [0, 30], [-120, -80], [-170, 100]], count: 10, spread: [4,20], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: p2, visible: () => clock.near("i-tu") }));
  { const S: Pt[] = [[-130, 160], [-210, 80], [-120, -70], [-30, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("i-tu") })); }
  { const S: Pt[] = [[-170, 120], [0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("i-tu") })); }
  // 4. "ve-sau": khắp vùng (rồi cả nước) lớp học sáng lên dày đặc (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-270, -205], [-180, -205], [-90, -205], [0, -205], [90, -205], [180, -205], [270, -205], [-270, -115], [-180, -115], [-90, -115], [0, -115], [90, -115], [180, -115], [270, -115], [-270, -25], [-180, -25], [-90, -25], [0, -25], [90, -25], [180, -25], [270, -25], [-270, 65], [-180, 65], [-90, 65], [0, 65], [90, 65], [180, 65], [270, 65], [-270, 155], [-180, 155], [-90, 155], [0, 155], [90, 155], [180, 155], [270, 155], [-270, 245], [-180, 245], [-90, 245], [0, 245], [90, 245], [180, 245], [270, 245]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.018, 0.2 + i * 0.018, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
