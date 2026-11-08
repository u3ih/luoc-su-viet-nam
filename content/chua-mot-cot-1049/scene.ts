import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HO, CAM_THANH, CAU_DONG, CAU_TAY, CAU_BAC, CAU_NAM } from "./terrain";

type Pt = [number, number];

// Chùa Một Cột — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["giac-mong","dung-chua","sua-chua","dung-lai"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CAM_THANH, 56]];

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
    counts: { trees: 360, bushes: 500, grass: 1600, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1049,
  });

  // 1. "giac-mong": đốm vàng (tòa sen trong mộng) hiện dần trên mặt hồ, đốm ngà (vua) ở cấm thành (diễn hoạ).
  const p0 = run("giac-mong", 28);
  { const S: Pt[] = [HO]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giac-mong") })); }
  { const S: Pt[] = [CAM_THANH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giac-mong") })); }
  // 2. "dung-chua": các nhà sư (son) đi vòng quanh hồ tụng kinh theo thanh kéo, đốm vàng giữa hồ sáng dần (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dung-chua"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1079, groups: [{ path: [[58, 0], [54, 22], [41, 41], [22, 54], [0, 58], [-22, 54], [-41, 41], [-54, 22], [-58, 0], [-54, -22], [-41, -41], [-22, -54], [0, -58], [22, -54], [41, -41], [54, -22], [58, 0]], count: 18, spread: [6,50], color: SON, timing: [[0,0],[1,1]] }, { path: [[170, 60], [100, 20], [60, 10]], count: 16, spread: [20,30], color: SON, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dung-chua") }));
  { const S: Pt[] = [HO]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-chua") })); }
  // 3. "sua-chua": vòng hành lang sáng dần (vàng) quanh hồ Linh Chiểu, bốn cây cầu qua hồ Bích Trì sáng lên (ngà) (diễn hoạ).
  const p2 = run("sua-chua", 28);
  { const S: Pt[] = [[66, 0], [57, 33], [33, 57], [0, 66], [-33, 57], [-57, 33], [-66, 0], [-57, -33], [-33, -57], [0, -66], [33, -57], [57, -33]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sua-chua") })); }
  { const S: Pt[] = [CAU_DONG, CAU_BAC, CAU_TAY, CAU_NAM]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.06, 0.75 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sua-chua") })); }
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1119, groups: [{ path: [[170, 60], CAU_DONG, [62, 0]], count: 14, spread: [16,30], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("sua-chua") }));
  // 4. "dung-lai": ánh cam bùng lên giữa hồ rồi tắt (chùa bị phá năm 1954), sau đó đốm vàng sáng lại; người (son) đến dựng lại (diễn hoạ).
  const p3 = run("dung-lai", 28);
  { const S: Pt[] = [HO]; world.add(createGlows({ count: S.length, color: "#ff9a5a", size: 30, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.25, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-lai") })); }
  { const S: Pt[] = [HO]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-lai") })); }
  world.add(createCrowd({ size: 3.5, height: ground, seed: 1149, groups: [{ path: [[170, 60], CAU_DONG, [60, 0]], count: 20, spread: [20,30], color: SON, timing: [[0.45,0],[0.95,1]] }], progress: p3, visible: () => clock.near("dung-lai") }));
};

export default setup;
