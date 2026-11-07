import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH_SU, LE_CHI, CHI_LINH, CON_SON } from "./terrain";

type Pt = [number, number];

// Vụ án Lệ Chi Viên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["con-son","tuan-du","ba-cach","minh-oan"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH_SU, 48], [LE_CHI, 48], [CHI_LINH, 40]];

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
    counts: { trees: 480, bushes: 650, grass: 2600, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1442,
  });

  // 1. "con-son": đốm ngà sáng ở Côn Sơn, vài người (son) đến; đốm vàng ở kinh sư xa (diễn hoạ).
  const p0 = run("con-son", 28);
  { const S: Pt[] = [CON_SON]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("con-son") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1462, groups: [{ path: [[180, 170], CON_SON], count: 6, spread: [20,20], color: SON, timing: [[0.1,0],[0.7,1]] }], progress: p0, visible: () => clock.near("con-son") }));
  // 2. "tuan-du": đoàn ngự giá (người son, đốm vàng dẫn đầu) đi từ Côn Sơn qua Chí Linh về Lệ Chi Viên theo thanh kéo, đèn lửa bật lên ở Lệ Chi Viên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tuan-du"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1472, groups: [{ path: [CON_SON, CHI_LINH, [110, 100], LE_CHI], count: 1, spread: [3,3], color: GOLD, size: 1.6, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tuan-du") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1482, groups: [{ path: [CON_SON, CHI_LINH, [110, 100], LE_CHI], count: 36, spread: [20,70], color: SON, timing: [[0,0],[1,0.96]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tuan-du") }));
  { const S: Pt[] = [CON_SON]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuan-du") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(LE_CHI, 26, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("tuan-du") * smoothstep(0.75, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "ba-cach": đốm vàng ở Lệ Chi Viên lịm dần; đoàn xa giá (son) lặng lẽ rời đi về kinh sư; lửa bật ở kinh sư (diễn hoạ).
  const p2 = run("ba-cach", 28);
  { const S: Pt[] = [LE_CHI]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.15, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-cach") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1522, groups: [{ path: [LE_CHI, [-100, 40], [-200, -60], KINH_SU], count: 30, spread: [16,70], color: SON, timing: [[0.35,0],[1,1]] }], progress: p2, visible: () => clock.near("ba-cach") }));
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring(KINH_SU, 30, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("ba-cach") * smoothstep(0.8, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "minh-oan": trời sáng, đốm vàng sáng dần ở Côn Sơn, các nhóm người (son) đến đứng lặng (diễn hoạ).
  const p3 = run("minh-oan", 28);
  { const S: Pt[] = [CON_SON, [250, 190], [290, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("minh-oan") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1552, groups: [{ path: [[120, 150], CON_SON], count: 14, spread: [26,40], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [CHI_LINH, [230, 180]], count: 10, spread: [26,40], color: SON, timing: [[0.15,0],[0.85,1]] }], progress: p3, visible: () => clock.near("minh-oan") }));
};

export default setup;
