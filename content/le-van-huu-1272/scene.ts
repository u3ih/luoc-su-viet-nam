import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_LY, KINH, SU_VIEN } from "./terrain";

type Pt = [number, number];

// Đại Việt sử ký — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bang-nhan","soan-su","loi-binh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 64], [PHU_LY, 40]];

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
    seed: 1272,
  });

  // 1. "bang-nhan": ba đốm ngà từ ba phía về kinh đô dự thi; ba đốm vàng sáng lần lượt ở kinh đô (Tam khôi) (diễn hoạ).
  const p0 = run("bang-nhan", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1282, groups: [{ path: [PHU_LY, [-100, -100], [40, 60], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.7,1]] }, { path: [[-350, 300], [0, 220], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.72,1]] }, { path: [[380, 20], [250, 120], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.08,0],[0.74,1]] }], progress: p0, visible: () => clock.near("bang-nhan") }));
  { const S: Pt[] = [[100, 190], [120, 195], [140, 190]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.07, 0.85 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bang-nhan") })); }
  // 2. "soan-su": ba mươi đốm vàng nhỏ (ba mươi quyển sử) lần lượt sáng lên ở Quốc sử viện theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["soan-su"] ?? 0) / 0.9);
  { const S: Pt[] = [[77.5, 132], [86.5, 132], [95.5, 132], [104.5, 132], [113.5, 132], [122.5, 132], [77.5, 141], [86.5, 141], [95.5, 141], [104.5, 141], [113.5, 141], [122.5, 141], [77.5, 150], [86.5, 150], [95.5, 150], [104.5, 150], [113.5, 150], [122.5, 150], [77.5, 159], [86.5, 159], [95.5, 159], [104.5, 159], [113.5, 159], [122.5, 159], [77.5, 168], [86.5, 168], [95.5, 168], [104.5, 168], [113.5, 168], [122.5, 168]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("soan-su") })); }
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1312, groups: [{ path: [[60, 120], [80, 135]], count: 6, spread: [16,10], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("soan-su") }));
  // 3. "loi-binh": các đốm ngà (nhân vật được bình) sáng dần ở nhiều nơi trên đất nước; người (son) tụ về kinh đô (diễn hoạ).
  const p2 = run("loi-binh", 28);
  { const S: Pt[] = [[-300, 250], [-200, 80], [-100, 300], [250, -200], [300, 60], [-50, -250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("loi-binh") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1332, groups: [{ path: [[-100, 250], KINH], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[300, 300], KINH], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("loi-binh") }));
  // 4. "ve-sau": các đốm vàng (bộ sử) lịm dần; một dòng chấm xanh nhạt mang đi về phương bắc; về sau một đốm ngà (Ngô Sĩ Liên) sáng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[77.5, 132], [86.5, 132], [95.5, 132], [104.5, 132], [113.5, 132], [122.5, 132], [77.5, 141], [86.5, 141], [95.5, 141], [104.5, 141], [113.5, 141], [122.5, 141], [77.5, 150], [86.5, 150], [95.5, 150], [104.5, 150], [113.5, 150], [122.5, 150], [77.5, 159], [86.5, 159], [95.5, 159], [104.5, 159], [113.5, 159], [122.5, 159], [77.5, 168], [86.5, 168], [95.5, 168], [104.5, 168], [113.5, 168], [122.5, 168]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.005, 0.15 + i * 0.005, k) * (1 - smoothstep(0.15, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1352, groups: [{ path: [KINH, [150, 300], [180, 400]], count: 6, spread: [10,30], color: DICH, timing: [[0.15,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[80, 160]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
