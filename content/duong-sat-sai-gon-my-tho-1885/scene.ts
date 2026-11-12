import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAI_GON, BEN_LUC, TAN_AN, MY_THO } from "./terrain";

type Pt = [number, number];

// Chuyến tàu Sài Gòn – Mỹ Tho — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khoi-cong","qua-pha","chuyen-dau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAI_GON, 40], [MY_THO, 32]];

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
    seed: 1885,
  });

  // 1. "khoi-cong": hàng nghìn người (son) đắp nền, đặt ray dọc tuyến; các đốm ngà (ga) lần lượt đánh dấu (diễn hoạ).
  const p0 = run("khoi-cong", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1895, groups: [{ path: [[220, 180], [-2, 30], [-190, -10], [-280, -200]], count: 90, spread: [4,14], color: SON, drop: true, timing: [[0,0],[0.9,1]] }], progress: p0, visible: () => clock.near("khoi-cong") }));
  { const S: Pt[] = [[220, 180], [172, 148], [125, 116], [77, 84], [30, 51], [-15, 27], [-56, 19], [-96, 10], [-136, 1], [-177, -7], [-203, -37], [-222, -78], [-241, -119], [-261, -159], [-280, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.04, 0.35 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  // 2. "qua-pha": toa tàu (chấm vàng) lên phà (đốm ngà) qua sông Vàm Cỏ Đông rồi nối lại chạy tiếp (diễn hoạ).
  const p1 = run("qua-pha", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 3, seed: 1915, groups: [{ path: [[60, 70], [18, 40], [-22, 22], [-70, 0]], count: 6, spread: [2,4], color: GOLD, timing: [[0.05,0],[0.9,1]] }], progress: p1, visible: () => clock.near("qua-pha") }));
  { const S: Pt[] = [[0, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("qua-pha") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1935, groups: [{ path: [[30, 80], [40, 50]], count: 20, spread: [3,10], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("qua-pha") }));
  // 3. "chuyen-dau": theo thanh kéo, đoàn tàu hơi nước (chuỗi chấm vàng) chạy từ Sài Gòn qua 15 ga (đốm ngà) tới Mỹ Tho (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chuyen-dau"] ?? 0) / 0.9);
  { const S: Pt[] = [[220, 180], [172, 148], [125, 116], [77, 84], [30, 51], [-15, 27], [-56, 19], [-96, 10], [-136, 1], [-177, -7], [-203, -37], [-222, -78], [-241, -119], [-261, -159], [-280, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chuyen-dau") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 6, seed: 1955, groups: [{ path: [[220, 180], [-2, 30], [-190, -10], [-276, -196]], count: 4, spread: [1,4], color: GOLD, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chuyen-dau") }));
  // 4. "ve-sau": khách (son) đông nghịt ở ga Sài Gòn những năm đầu, thưa dần; đốm ga tắt (1958) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1965, groups: [{ path: [[250, 180], [247, 193], [239, 203], [227, 209], [213, 209], [201, 203], [193, 193], [190, 180], [193, 167], [201, 157], [213, 151], [227, 151], [239, 157], [247, 167], [250, 180]], count: 50, spread: [2,6], color: SON, drop: true, timing: [[0,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[220, 180]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.75, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
