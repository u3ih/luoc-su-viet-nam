import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, THE_MIEU, NGU_BINH, KIM_LONG } from "./terrain";

type Pt = [number, number];

// Kinh thành Huế — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hai vòng tường cách điệu: Kinh thành (vuông, 10 cửa trong thực tế — ở đây để 8 quãng trống) và Hoàng thành bên trong. Thành thật xây khúc khuỷu theo lối Vauban; không vẽ cổng, pháo đài.
const WALLS: Wall[] = [
  { at: square(-20, 20, 110, 0), base: 21, top: 12, height: 7, gates: [{ at: 0, width: 12 }, { at: 1.5707963267948966, width: 12 }, { at: 3.141592653589793, width: 12 }, { at: -1.5707963267948966, width: 12 }, { at: 0.7853981633974483, width: 12 }, { at: 2.356194490192345, width: 12 }, { at: -0.7853981633974483, width: 12 }, { at: -2.356194490192345, width: 12 }] },
  { at: square(-20, 10, 42, 0), base: 6, top: 4, height: 4, gates: [{ at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phu-xuan","chon-dat","dap-thanh","cuu-dinh","di-san"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 112], [KIM_LONG, 40]];

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
    counts: { trees: 420, bushes: 600, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1805,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("dap-thanh") + 0.5 ? 1 : ctx.t > world.beat("dap-thanh") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["dap-thanh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 2 - k * 0.6), wear: () => 0 }));

  // 1. "phu-xuan": đốm vàng sáng ở Kim Long rồi ở Phú Xuân (chỗ Kinh thành sau này); người (son) đi từ Kim Long sang (diễn hoạ).
  const p0 = run("phu-xuan", 28);
  { const S: Pt[] = [KIM_LONG, KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.4, 0.2 + i * 0.4, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phu-xuan") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1825, groups: [{ path: [KIM_LONG, [-150, -70], [-40, 0]], count: 20, spread: [20,50], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("phu-xuan") }));
  // 2. "chon-dat": đốm ngà cắm mốc ở bốn góc thành, đốm vàng trên núi Ngự Bình; một toán người (son) đi khảo sát quanh khu đất (diễn hoạ).
  const p1 = run("chon-dat", 28);
  { const S: Pt[] = [[-130, -90], [90, -90], [90, 130], [-130, 130]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chon-dat") })); }
  { const S: Pt[] = [NGU_BINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chon-dat") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1855, groups: [{ path: [[-130, -90], [90, -90], [90, 130], [-130, 130], [-130, -60]], count: 10, spread: [10,20], color: SON, timing: [[0.1,0],[0.95,1]] }], progress: p1, visible: () => clock.near("chon-dat") }));
  // 3. "dap-thanh": nhiều toán người (son) đi dọc các cạnh thành theo thanh kéo trong khi vòng Kinh thành rồi Hoàng thành đắp dần lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dap-thanh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1865, groups: [{ path: [[-130, -95], [90, -95]], count: 30, spread: [10,160], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[95, -90], [95, 130]], count: 30, spread: [10,160], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[90, 135], [-130, 135]], count: 30, spread: [10,160], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[-135, 130], [-135, -90]], count: 30, spread: [10,160], color: SON, timing: [[0,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dap-thanh") }));
  // 4. "cuu-dinh": chín đốm vàng (chín đỉnh) sáng dần thành một hàng trước Thế Miếu; người (son) đến đứng xem (diễn hoạ).
  const p3 = run("cuu-dinh", 16);
  { const S: Pt[] = [[-69, -12], [-63, -12], [-57, -12], [-51, -12], [-45, -12], [-39, -12], [-33, -12], [-27, -12], [-21, -12]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.07, 0.25 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cuu-dinh") })); }
  world.add(createCrowd({ size: 1.8, height: ground, seed: 1885, groups: [{ path: [[-45, -60], [-45, -24]], count: 24, spread: [40,8], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p3, visible: () => clock.near("cuu-dinh") }));
  // 5. "di-san": vệt vàng dịu chạy quanh bốn góc thành, vài nhóm người (son) đi trong thành (diễn hoạ).
  const p4 = run("di-san", 28);
  { const S: Pt[] = [[-130, -90], [-20, -95], [90, -90], [95, 20], [90, 130], [-20, 135], [-130, 130], [-135, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-san") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1905, groups: [{ path: [[-100, 60], [60, 60]], count: 12, spread: [20,30], color: SON, timing: [[0.05,0],[0.9,1]] }, { path: [[40, -60], [-100, -60]], count: 12, spread: [20,30], color: SON, timing: [[0.1,0],[0.95,1]] }], progress: p4, visible: () => clock.near("di-san") }));
};

export default setup;
