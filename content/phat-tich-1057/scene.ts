import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DINH_NUI, CHUA, NEN_1, NEN_2, NEN_3 } from "./terrain";

type Pt = [number, number];

// Chùa Phật Tích và tượng A Di Đà — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khoi-dung","ba-cap-nen","tuong-phat","ve-sau"]);
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
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1057,
  });

  // 1. "khoi-dung": người (son) lên sườn núi xây chùa; đốm vàng (tháp) sáng trên sườn (diễn hoạ).
  const p0 = run("khoi-dung", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1067, groups: [{ path: [[-100, -150], [0, 70], [0, 105]], count: 30, spread: [10,80], color: SON, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("khoi-dung") }));
  { const S: Pt[] = [[0, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-dung") })); }
  // 2. "ba-cap-nen": theo thanh kéo, ba hàng đốm vàng (ba cấp nền) lần lượt sáng từ thấp lên cao; hàng đốm ngà (tượng thú đá) ở cấp hai (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ba-cap-nen"] ?? 0) / 0.9);
  { const S: Pt[] = [[-30, 80], [-20, 80], [-10, 80], [0, 80], [10, 80], [20, 80], [30, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-cap-nen") })); }
  { const S: Pt[] = [[-30, 110], [-23, 110], [-17, 110], [-10, 110], [-3, 110], [3, 110], [10, 110], [17, 110], [23, 110], [30, 110]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.03, 0.5 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-cap-nen") })); }
  { const S: Pt[] = [[-30, 140], [-20, 140], [-10, 140], [0, 140], [10, 140], [20, 140], [30, 140]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.03, 0.8 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-cap-nen") })); }
  // 3. "tuong-phat": một đốm vàng lớn, dịu (tượng A Di Đà) sáng ở giữa; đốm vàng xa trên sườn (chữ Phật khắc đá) (diễn hoạ).
  const p2 = run("tuong-phat", 28);
  { const S: Pt[] = [[0, 112]]; world.add(createGlows({ count: S.length, color: GOLD, size: 42, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuong-phat") })); }
  { const S: Pt[] = [[40, 190]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuong-phat") })); }
  // 4. "ve-sau": lửa bùng (chùa bị đốt năm 1947) rồi tắt; đốm vàng (tượng) vẫn còn, sau đó vài đốm (chùa dựng lại) sáng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: [[-20, 110], [0, 115], [20, 110], [-10, 140], [10, 80]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ve-sau") * smoothstep(0.05, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[0, 112]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-12, 108], [12, 108], [0, 100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.05, 0.85 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
