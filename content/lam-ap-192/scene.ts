import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUYEN_THANH, KHU_LAT, TAY_QUYEN, LANG_A, LANG_B, LANG_C } from "./terrain";

type Pt = [number, number];

// Khu Liên lập nước Lâm Ấp — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Khu Lật cách điệu (hình chữ nhật theo mô tả sử cũ; vị trí thật còn tranh luận).
const WALLS: Wall[] = [
  { at: square(-40, 110, 42, 0, 1.5), base: 8, top: 5, height: 5, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tuong-lam","lap-nuoc","khu-lat","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUYEN_THANH, 44], [KHU_LAT, 48]];

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
    seed: 192,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => smoothstep(world.beat("khu-lat") - 0.6, world.beat("khu-lat") - 0.1, ctx.t);
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#9a8a70", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "tuong-lam": đốm xanh nhạt (huyện thành của chính quyền đô hộ); dân các làng (son) kéo lên phía bắc, lửa bùng ở Tây Quyển (diễn hoạ).
  const p0 = run("tuong-lam", 28);
  { const S: Pt[] = [[60, -60]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuong-lam") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 212, groups: [{ path: [[-200, -60], [-100, 200], [-60, 280]], count: 18, spread: [10,40], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[-180, 160], [-70, 270]], count: 14, spread: [10,40], color: SON, timing: [[0.1,0],[0.6,1]] }], progress: p0, visible: () => clock.near("tuong-lam") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([-60, 300], 18, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("tuong-lam") * smoothstep(0.55, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "lap-nuoc": theo thanh kéo, người các làng (son) kéo về huyện thành; quan lại (xanh nhạt) rút đi; đốm vàng (nước Lâm Ấp) sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lap-nuoc"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 232, groups: [{ path: [[-200, -60], [40, -60]], count: 18, spread: [10,40], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[150, -170], [70, -80]], count: 14, spread: [10,40], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-180, 160], [50, -40]], count: 14, spread: [10,40], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lap-nuoc") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 242, groups: [{ path: [[60, -60], [80, 60], [120, 330]], count: 10, spread: [6,20], color: DICH, timing: [[0.3,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lap-nuoc") }));
  { const S: Pt[] = [[60, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lap-nuoc") })); }
  // 3. "khu-lat": thành Khu Lật đắp lên bên bờ bắc; dân (son) tụ quanh; đốm vàng giữa thành (diễn hoạ).
  const p2 = run("khu-lat", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 262, groups: [{ path: [[60, -60], [-20, 60], [-40, 100]], count: 24, spread: [10,70], color: SON, timing: [[0.03,0],[0.6,1]] }], progress: p2, visible: () => clock.near("khu-lat") }));
  { const S: Pt[] = [[-40, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khu-lat") })); }
  // 4. "ve-sau": chuỗi đốm ngà dọc bờ biển về phía nam (nước dời dần về phía nam, thành Chăm Pa); thuyền (ngà) xuôi nam (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-40, 110], [32, 26], [104, -58], [152, -146], [176, -238], [200, -330]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 292, groups: [{ path: [[280, 100], [290, -380]], count: 4, spread: [10,120], color: NGHIA, timing: [[0.05,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
