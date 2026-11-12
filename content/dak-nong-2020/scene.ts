import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_LUA, HANG, BUON } from "./terrain";

type Pt = [number, number];

// Công viên địa chất Đắk Nông — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["day-bien","hang-dong","dan-da","ghi-danh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HANG, 48], [BUON, 32]];

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
    seed: 2023,
  });

  // 1. "day-bien": những đốm xanh nhạt (biển cổ, hoá thạch) mờ dần; các miệng núi lửa (lửa) bùng lên ở phía bắc (diễn hoạ).
  const p0 = run("day-bien", 28);
  { const S: Pt[] = [[-100, 0], [-60, 0], [-20, 0], [20, 0], [60, 0], [100, 0], [-100, 40], [-60, 40], [-20, 40], [20, 40], [60, 40], [100, 40], [-100, 80], [-60, 80], [-20, 80], [20, 80], [60, 80], [100, 80], [-100, 120], [-60, 120], [-20, 120], [20, 120], [60, 120], [100, 120]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (1 - smoothstep(0.35, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("day-bien") })); }
  world.add(createFires({ sites: [[-80, 200], [80, 230], [220, 180]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("day-bien") * smoothstep(0.45, 0.9, p0()), size: 4, glow: () => 0.8 }));
  // 2. "hang-dong": theo thanh kéo, dòng dung nham (chấm cam) chảy từ núi lửa xuống, nguội đi để lại chuỗi hang (đốm ngà) dưới lòng đất (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hang-dong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 2053, groups: [{ path: [[-80, 200], [-40, 100], [0, 20], [40, -60]], count: 30, spread: [3,12], color: "#ff8a3d", timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hang-dong") }));
  { const S: Pt[] = [[-80, 190], [-69, 165], [-58, 141], [-47, 116], [-36, 93], [-25, 71], [-15, 49], [-4, 27], [7, 5], [18, -16], [29, -38], [40, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.03, 0.7000000000000001 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hang-dong") })); }
  // 3. "dan-da": buôn làng (son) quanh đống lửa; vòng đốm vàng (tiếng đàn đá, cồng chiêng) lan ra (diễn hoạ).
  const p2 = run("dan-da", 28);
  world.add(createFires({ sites: [[-60, -120]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("dan-da") * smoothstep(0.02, 0.9, p2()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2083, groups: [{ path: [[-36, -120], [-38, -111], [-43, -103], [-51, -98], [-60, -96], [-69, -98], [-77, -103], [-82, -111], [-84, -120], [-82, -129], [-77, -137], [-69, -142], [-60, -144], [-51, -142], [-43, -137], [-38, -129], [-36, -120]], count: 40, spread: [1,3], color: SON, drop: true, timing: [[0,0],[0.9,1]] }], progress: p2, visible: () => clock.near("dan-da") }));
  { const S: Pt[] = [[-24, -120], [-31, -99], [-49, -86], [-71, -86], [-89, -99], [-96, -120], [-89, -141], [-71, -154], [-49, -154], [-31, -141]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.004, 0.44999999999999996 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dan-da") })); }
  { const S: Pt[] = [[-9, -110], [-19, -89], [-36, -74], [-59, -68], [-81, -73], [-100, -87], [-110, -107], [-111, -130], [-101, -151], [-84, -166], [-61, -172], [-39, -167], [-20, -153], [-10, -133]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.004, 0.65 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dan-da") })); }
  // 4. "ghi-danh": các điểm di sản địa chất (đốm vàng: núi lửa, hang, thác) lần lượt sáng khắp cao nguyên (diễn hoạ).
  const p3 = run("ghi-danh", 28);
  { const S: Pt[] = [[-80, 200], [80, 230], [220, 180], [0, 20], [-40, 100], [40, -60], [-200, 40], [180, 0], [-160, -200], [140, -150], [-260, 160], [260, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 17, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.07, 0.16999999999999998 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
};

export default setup;
