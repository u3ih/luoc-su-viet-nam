import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, DONG_CO, TRUONG_YEN, CUA } from "./terrain";

type Pt = [number, number];

// Loạn Tam vương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Thăng Long cách điệu.
const WALLS: Wall[] = [
  { at: square(40, 160, 48, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vay-thanh","ra-thanh","truong-yen","dong-co"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 64], [TRUONG_YEN, 36]];

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
    seed: 1028,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "vay-thanh": quân ba vương (xanh nhạt) từ ba phía kéo đến vây thành; đốm vàng (thái tử) trong điện (diễn hoạ).
  const p0 = run("vay-thanh", 28);
  { const S: Pt[] = [[40, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vay-thanh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1048, groups: [{ path: [[-200, 120], [-30, 140]], count: 30, spread: [10,40], color: DICH, timing: [[0.05,0],[0.7,1]] }, { path: [[40, -60], [40, 90]], count: 30, spread: [10,40], color: DICH, timing: [[0.1,0],[0.75,1]] }, { path: [[260, 120], [110, 150]], count: 30, spread: [10,40], color: DICH, timing: [[0.15,0],[0.8,1]] }], progress: p0, visible: () => clock.near("vay-thanh") }));
  // 2. "ra-thanh": vệ sĩ (son) từ cửa thành xông ra; một cánh quân (xanh nhạt) ngã, phần còn lại tan chạy (diễn hoạ).
  const p1 = run("ra-thanh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1058, groups: [{ path: [[40, 150], [40, 105], [40, 80]], count: 40, spread: [10,40], color: SON, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("ra-thanh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1068, groups: [{ path: [[40, 85], [40, 85]], count: 30, spread: [10,40], color: DICH, mortal: true, timing: [[0,1],[1,1]] }], progress: p1, fall: (ctx) => smoothstep(0.05, 0.9, p1()), visible: () => clock.near("ra-thanh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1078, groups: [{ path: [[-40, 140], [-250, 60]], count: 24, spread: [10,60], color: DICH, timing: [[0.4,0],[1,1]] }, { path: [[110, 150], [300, 40]], count: 24, spread: [10,60], color: DICH, timing: [[0.45,0],[1,1]] }], progress: p1, visible: () => clock.near("ra-thanh") }));
  // 3. "truong-yen": theo thanh kéo, đạo quân của vua (son) tiến về Trường Yên; đốm ngà (Khai Quốc vương) ở Trường Yên chuyển sang vàng khi quân tới (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["truong-yen"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1088, groups: [{ path: [[40, 110], [10, -100], [-30, -290]], count: 60, spread: [14,60], color: SON, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("truong-yen") }));
  { const S: Pt[] = [[-40, -320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.7, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truong-yen") })); }
  { const S: Pt[] = [[-40, -320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truong-yen") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1118, groups: [{ path: [[-40, -320], [-40, -320]], count: 30, spread: [10,40], color: NGHIA, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("truong-yen") }));
  // 4. "dong-co": các quan (chấm ngà) từ kinh thành đến đền Đồng Cổ đọc lời thề; đốm vàng ở đền (diễn hoạ).
  const p3 = run("dong-co", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1128, groups: [{ path: [[40, 150], [-60, 200], [-150, 225]], count: 40, spread: [8,30], color: NGHIA, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("dong-co") }));
  { const S: Pt[] = [[-160, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-co") })); }
};

export default setup;
