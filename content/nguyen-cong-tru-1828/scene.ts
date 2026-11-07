import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG_CU, TIEN_HAI, KIM_SON, LAC_THIEN } from "./terrain";

type Pt = [number, number];

// Khẩn hoang Tiền Hải, Kim Sơn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hy-van","tien-hai","kim-son","lan-bien"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG_CU, 48], [TIEN_HAI, 56], [KIM_SON, 56]];

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
    counts: { trees: 300, bushes: 500, grass: 2600, reeds: 1200 },
    forestAt: 0.62,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1828,
  });

  // 1. "hy-van": đốm ngà sáng ở làng cũ, người (son) tụ lại (diễn hoạ).
  const p0 = run("hy-van", 28);
  { const S: Pt[] = [LANG_CU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hy-van") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1848, groups: [{ path: [[-140, 230], LANG_CU], count: 14, spread: [30,40], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [[100, 240], LANG_CU], count: 12, spread: [30,40], color: SON, timing: [[0.15,0],[0.85,1]] }], progress: p0, visible: () => clock.near("hy-van") }));
  // 2. "tien-hai": các toán dân (son) từ làng cũ xuống bãi Tiền Châu, dàn hàng dọc tuyến đê theo thanh kéo (người dừng lại thành vệt đê); ruộng mới sáng dần (vàng), lửa đồn canh bật lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-de"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1858, groups: [{ path: [LANG_CU, [150, 30], [180, -120], [260, -145], [370, -120]], count: 60, spread: [10,10], color: SON, drop: true, timing: [[0,0],[1,1]] }, { path: [LANG_CU, [200, 40], [260, -40]], count: 20, spread: [30,40], color: SON, timing: [[0.1,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tien-hai") }));
  { const S: Pt[] = [[220, -90], [260, -100], [300, -90], [240, -60], [290, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.08, 0.7000000000000001 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tien-hai") })); }
  world.add(createFires({ sites: [[330, -110], [200, -115]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("tien-hai") * smoothstep(0.7, 0.9, inp1(ctx)), size: 4, glow: () => 0.8 }));
  // 3. "kim-son": các toán dân (son) xuống bãi bồi Kim Sơn, dàn hàng dọc tuyến đê Đường Quan; kênh xương cá sáng dần (vàng) (diễn hoạ).
  const p2 = run("kim-son", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1888, groups: [{ path: [LANG_CU, [-120, 60], [-80, -120], [-170, -145], [-280, -125]], count: 60, spread: [10,10], color: SON, drop: true, timing: [[0.03,0],[0.95,1]] }, { path: [LANG_CU, [-150, 30], LAC_THIEN], count: 20, spread: [30,40], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("kim-son") }));
  { const S: Pt[] = [[-200, -20], [-200, -60], [-200, -100], [-150, -100], [-110, -100], [-240, -100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.07, 0.65 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kim-son") })); }
  // 4. "lan-bien": các vệt vàng (những lần quai đê) lần lượt sáng ra phía biển; người (son) tụ về ấp Lạc Thiện, lửa bật quanh đền (diễn hoạ).
  const p3 = run("lan-bien", 28);
  { const S: Pt[] = [[-170, -135], [-170, -160], [-170, -185], [-170, -210], [-170, -235]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lan-bien") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1918, groups: [{ path: [[-60, 40], LAC_THIEN], count: 20, spread: [30,40], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: p3, visible: () => clock.near("lan-bien") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(LAC_THIEN, 18, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("lan-bien") * smoothstep(0.5, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
