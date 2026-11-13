import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH_THANH, KHIEM_LANG, NAM_KY_T } from "./terrain";

type Pt = [number, number];

// Vua Tự Đức — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành Huế (mặt bằng vuông, cách điệu)
const WALLS: Wall[] = [
  { at: square(0, 70, 52, 0), base: 7, top: 5, height: 5, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","hong-bao","mat-dat","cai-cach"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH_THANH, 56], [NAM_KY_T, 32]];

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
    seed: 1847,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8b8170", top: "#6d6f4f" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "len-ngoi": đốm vàng (điện Thái Hoà) sáng giữa kinh thành; bá quan (ngà) đứng thành hàng trước điện (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  { const S: Pt[] = [[0, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1867, groups: [{ path: [[-24, 60], [24, 60], [24, 30], [-24, 30], [-24, 60]], count: 60, spread: [1,3], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "hong-bao": lửa nổi dậy ở xa (phía tây bắc); một nhóm (son) nổi lên ngay ở kinh thành rồi tan; người phu (ngà) ở công trường lăng phía nam sông (diễn hoạ).
  const p1 = run("hong-bao", 28);
  world.add(createFires({ sites: [[-170, 140], [-150, 160]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("hong-bao") * smoothstep(0.05, 0.9, p1()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1887, groups: [{ path: [[70, -110], [30, -40], [10, 40], [-120, 120]], count: 30, spread: [3,10], color: SON, timing: [[0.3,0],[0.95,1]] }], progress: p1, visible: () => clock.near("hong-bao") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1897, groups: [{ path: [[88, -110], [85, -99], [76, -93], [64, -93], [55, -99], [52, -110], [55, -121], [64, -127], [76, -127], [85, -121], [88, -110]], count: 30, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("hong-bao") }));
  // 3. "mat-dat": theo thanh kéo, sáu đốm ngà (sáu tỉnh Nam Kỳ) lần lượt bị phủ đốm xanh nhạt — ba tỉnh miền Đông trước, ba tỉnh miền Tây sau; tàu (xanh nhạt) từ biển vào (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["mat-dat"] ?? 0) / 0.9);
  { const S: Pt[] = [[-80, -170], [-30, -200], [20, -170], [60, -210], [100, -180], [140, -205]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-dat") })); }
  { const S: Pt[] = [[100, -180], [140, -205], [60, -210]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.2 + i * 0.08, 0.35 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-dat") })); }
  { const S: Pt[] = [[20, -170], [-30, -200], [-80, -170]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.08, 0.75 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-dat") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1937, groups: [{ path: [[390, -230], [250, -220], [160, -205]], count: 4, spread: [4,10], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("mat-dat") }));
  // 4. "cai-cach": các bản điều trần (đốm ngà nhỏ) từ nhiều nơi đưa về kinh thành; đốm vàng ở điện mờ dần; đốm vàng nhỏ sáng ở Khiêm Lăng (diễn hoạ).
  const p3 = run("cai-cach", 28);
  world.add(createCrowd({ size: 6, height: ground, seed: 1947, groups: [{ path: [[-180, 0], [0, 70]], count: 6, spread: [2,6], color: NGHIA, timing: [[0.02,0],[0.6,1]] }, { path: [[150, 160], [0, 70]], count: 6, spread: [2,6], color: NGHIA, timing: [[0.1,0],[0.7,1]] }, { path: [[0, -190], [0, 70]], count: 6, spread: [2,6], color: NGHIA, timing: [[0.2,0],[0.8,1]] }], progress: p3, visible: () => clock.near("cai-cach") }));
  { const S: Pt[] = [[0, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.7, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cai-cach") })); }
  { const S: Pt[] = [[70, -110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cai-cach") })); }
};

export default setup;
