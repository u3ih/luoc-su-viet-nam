import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_BAI_THO, CUA_SONG, VACH } from "./terrain";

type Pt = [number, number];

// Núi Bài Thơ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["truyen-dang","tuan-du","khac-tho","ve-sau"]);
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
    counts: { trees: 300, bushes: 400, grass: 900, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1468,
  });

  // 1. "truyen-dang": lửa báo (lửa) bật trên đỉnh núi Truyền Đăng rồi lan dọc đất liền về phía tây bắc (diễn hoạ).
  const p0 = run("truyen-dang", 28);
  world.add(createFires({ sites: [[40, 40], [-20, 120], [-100, 200], [-200, 280]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("truyen-dang") * smoothstep(0.05, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "tuan-du": theo thanh kéo, đoàn thuyền (đốm vàng) từ cửa sông Bạch Đằng ra biển, tới chân núi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tuan-du"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1488, groups: [{ path: [[-240, 120], [-210, -40], [-100, -50], [20, -10]], count: 14, spread: [12,160], color: GOLD, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tuan-du") }));
  // 3. "khac-tho": quân (son) dừng dưới chân núi; đốm vàng (bài thơ) sáng trên vách đá (diễn hoạ).
  const p2 = run("khac-tho", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1498, groups: [{ path: [[20, -10], [40, 0]], count: 30, spread: [10,50], color: SON, timing: [[0.02,0],[0.4,1]] }], progress: p2, visible: () => clock.near("khac-tho") }));
  { const S: Pt[] = [[40, 14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khac-tho") })); }
  // 4. "ve-sau": mười hai đốm ngà (mười hai bài thơ) lần lượt sáng quanh vách núi (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[52, 8], [67, 19], [74, 35], [72, 52], [61, 67], [45, 74], [28, 72], [13, 61], [6, 45], [8, 28], [19, 13], [35, 6]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 9, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
