import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THUNG_LUNG, HANG } from "./terrain";

type Pt = [number, number];

// Rừng Cúc Phương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nui-da-voi","thanh-lap","rung-gia","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

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
    counts: { trees: 1300, bushes: 900, grass: 1600, reeds: 200 },
    forestAt: 0.25,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1962,
  });

  // 1. "nui-da-voi": đốm vàng mờ (lửa của người xưa) trong hang sườn núi; vài chấm người (son) quanh hang (diễn hoạ).
  const p0 = run("nui-da-voi", 28);
  world.add(createFires({ sites: [[-60, 110]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nui-da-voi") * smoothstep(0.1, 0.9, p0()), size: 2, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1982, groups: [{ path: [[-50, 100], [-55, 109], [-65, 109], [-70, 100], [-65, 91], [-55, 91], [-50, 100]], count: 6, spread: [4,10], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("nui-da-voi") }));
  { const S: Pt[] = [[-60, 110], [140, 80], [-250, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nui-da-voi") })); }
  // 2. "thanh-lap": theo thanh kéo, vòng đốm vàng (ranh giới khu rừng cấm) khép dần quanh hai dãy núi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thanh-lap"] ?? 0) / 0.9);
  { const S: Pt[] = [[330, 0], [325, 57], [310, 113], [286, 165], [253, 212], [212, 253], [165, 286], [113, 310], [57, 325], [0, 330], [-57, 325], [-113, 310], [-165, 286], [-212, 253], [-253, 212], [-286, 165], [-310, 113], [-325, 57], [-330, 0], [-325, -57], [-310, -113], [-286, -165], [-253, -212], [-212, -253], [-165, -286], [-113, -310], [-57, -325], [0, -330], [57, -325], [113, -310], [165, -286], [212, -253], [253, -212], [286, -165], [310, -113], [325, -57]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.024, 0.16999999999999998 + i * 0.024, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  // 3. "rung-gia": các đốm vàng cao (ngọn chò nghìn năm) nhô trên tán rừng thung lũng; đàn chim (chấm ngà) bay (diễn hoạ).
  const p2 = run("rung-gia", 28);
  { const S: Pt[] = [[-30, 20], [40, -10], [10, 40], [-60, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 44, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rung-gia") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 50, seed: 2022, groups: [{ path: [[120, 0], [85, 85], [0, 120], [-85, 85], [-120, 0], [-85, -85], [0, -120], [85, -85], [120, 0]], count: 14, spread: [20,200], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p2, visible: () => clock.near("rung-gia") }));
  // 4. "ve-sau": những chấm sáng nhỏ (voọc, thú rừng) di chuyển dưới tán rừng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 14, seed: 2032, groups: [{ path: [[-150, 40], [-60, 10], [20, 20], [100, -30]], count: 10, spread: [10,60], color: "#f4f2ea", timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 10, seed: 2042, groups: [{ path: [[120, -40], [30, -10], [-70, -40]], count: 8, spread: [10,60], color: "#cfc4a4", timing: [[0.1,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
