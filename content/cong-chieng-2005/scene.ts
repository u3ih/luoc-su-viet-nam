import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BUON_A, BUON_B, BUON_C, BUON_D, BUON_E } from "./terrain";

type Pt = [number, number];

// Không gian văn hóa Cồng chiêng Tây Nguyên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cong-chieng","buon-lang","le-hoi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BUON_A, 32]];

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
    counts: { trees: 700, bushes: 700, grass: 2000, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2005,
  });

  // 1. "cong-chieng": vòng đốm vàng (người đánh cồng chiêng) quanh đốm ngà (nhà rông) trong buôn (diễn hoạ).
  const p0 = run("cong-chieng", 28);
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-chieng") })); }
  { const S: Pt[] = [[16, 40], [13, 49], [5, 55], [-5, 55], [-13, 49], [-16, 40], [-13, 31], [-5, 25], [5, 25], [13, 31]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-chieng") })); }
  // 2. "buon-lang": theo thanh kéo, tiếng cồng chiêng (vòng đốm vàng) lan từ buôn này sang buôn khác khắp cao nguyên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["buon-lang"] ?? 0) / 0.9);
  { const S: Pt[] = [[16, 40], [11, 51], [0, 56], [-11, 51], [-16, 40], [-11, 29], [0, 24], [11, 29]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.004, 0.15 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("buon-lang") })); }
  { const S: Pt[] = [[-166, 140], [-170, 150], [-180, 154], [-190, 150], [-194, 140], [-190, 130], [-180, 126], [-170, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.01, 0.35 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("buon-lang") })); }
  { const S: Pt[] = [[194, 160], [190, 170], [180, 174], [170, 170], [166, 160], [170, 150], [180, 146], [190, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.01, 0.55 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("buon-lang") })); }
  { const S: Pt[] = [[-206, -150], [-210, -140], [-220, -136], [-230, -140], [-234, -150], [-230, -160], [-220, -164], [-210, -160]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.01, 0.75 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("buon-lang") })); }
  { const S: Pt[] = [[234, -180], [230, -170], [220, -166], [210, -170], [206, -180], [210, -190], [220, -194], [230, -190]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.01, 0.9500000000000001 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("buon-lang") })); }
  // 3. "le-hoi": lửa lễ hội giữa buôn; người (son) nhảy vòng quanh lửa (diễn hoạ).
  const p2 = run("le-hoi", 28);
  world.add(createFires({ sites: [[0, 40], [4, 44]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("le-hoi") * smoothstep(0.03, 0.9, p2()), size: 4, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2095, groups: [{ path: [[22, 40], [20, 48], [16, 56], [8, 60], [0, 62], [-8, 60], [-16, 56], [-20, 48], [-22, 40], [-20, 32], [-16, 24], [-8, 20], [0, 18], [8, 20], [16, 24], [20, 32], [22, 40]], count: 40, spread: [4,140], color: SON, timing: [[0.02,0],[1,1]] }], progress: p2, visible: () => clock.near("le-hoi") }));
  // 4. "ve-sau": các buôn làng đều sáng vòng đốm vàng; đốm vàng lớn (ghi danh) giữa cao nguyên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [BUON_A, BUON_B, BUON_C, BUON_D, BUON_E]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 45, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
