import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, NGOC_LAU, TRINH_QUANG } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Lê Duy Mật — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chinh-bien","thanh-hoa","trinh-quang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 48], [NGOC_LAU, 44]];

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
    seed: 1738,
  });

  // 1. "chinh-bien": ba chấm ngà (Duy Mật, Duy Chúc, Duy Quý) ở kinh thành (đốm vàng) — mưu lộ, ba người rời kinh (diễn hoạ).
  const p0 = run("chinh-bien", 28);
  { const S: Pt[] = [[200, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chinh-bien") })); }
  world.add(createCrowd({ size: 6, height: ground, seed: 1758, groups: [{ path: [[195, 275], [120, 150], [40, 40]], count: 3, spread: [4,10], color: NGHIA, timing: [[0.35,0],[0.95,1]] }], progress: p0, visible: () => clock.near("chinh-bien") }));
  // 2. "thanh-hoa": theo thanh kéo, dân chúng (son) tụ về căn cứ Ngọc Lâu; đốm vàng sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thanh-hoa"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1768, groups: [{ path: [[150, -150], [-10, 0]], count: 20, spread: [8,50], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[-150, 150], [-20, 20]], count: 20, spread: [8,50], color: SON, timing: [[0.05,0],[0.75,1]] }, { path: [[200, 80], [0, 15]], count: 16, spread: [8,50], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thanh-hoa") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1778, groups: [{ path: [[30, 50], [-15, 10]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,0],[0.3,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thanh-hoa") }));
  { const S: Pt[] = [[-20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-hoa") })); }
  // 3. "trinh-quang": nghĩa quân (son) chuyển lên núi Trình Quang; 16 đồn luỹ (đốm vàng) sáng quanh núi (diễn hoạ).
  const p2 = run("trinh-quang", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1798, groups: [{ path: [[-20, 10], [-120, -20], [-190, -40]], count: 30, spread: [10,50], color: SON, timing: [[0.03,0],[0.55,1]] }], progress: p2, visible: () => clock.near("trinh-quang") }));
  { const S: Pt[] = [[-150, -40], [-154, -21], [-165, -5], [-181, 6], [-200, 10], [-219, 6], [-235, -5], [-246, -21], [-250, -40], [-246, -59], [-235, -75], [-219, -86], [-200, -90], [-181, -86], [-165, -75], [-154, -59]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.02, 0.65 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trinh-quang") })); }
  // 4. "ve-sau": ba đạo quân Trịnh (xanh nhạt) kéo tới vây Trình Quang; lửa bùng trong căn cứ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-150, -40], [-154, -21], [-165, -5], [-181, 6], [-200, 10], [-219, 6], [-235, -5], [-246, -21], [-250, -40], [-246, -59], [-235, -75], [-219, -86], [-200, -90], [-181, -86], [-165, -75], [-154, -59]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1828, groups: [{ path: [[100, -250], [-150, -90]], count: 30, spread: [10,60], color: DICH, timing: [[0.05,0],[0.55,1]] }, { path: [[120, 150], [-150, 0]], count: 30, spread: [10,60], color: DICH, timing: [[0.08,0],[0.6,1]] }, { path: [[-60, -330], [-190, -100]], count: 24, spread: [10,60], color: DICH, timing: [[0.11,0],[0.65,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring([-200, -40], 30, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.6, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
