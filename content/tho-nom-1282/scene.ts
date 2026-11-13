import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SONG_PHU_LUONG, THANG_LONG_T } from "./terrain";

type Pt = [number, number];

// Từ Hàn Thuyên đến Hồng Đức quốc âm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ca-sau","quoc-ngu","nguyen-trai","hong-duc"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG_T, 40]];

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
    seed: 1282,
  });

  // 1. "ca-sau": một đốm vàng (bài văn) bay từ bờ ra giữa sông rồi chìm; gợn sóng (đốm ngà) lan rồi tắt (diễn hoạ).
  const p0 = run("ca-sau", 28);
  world.add(createCrowd({ glow: true, size: 14, height: (x, z) => ground(x, z) + 4, seed: 1292, groups: [{ path: [[-20, 30], [30, 40], [50, 40]], count: 1, spread: [0,1], color: GOLD, size: 14, timing: [[0.1,0],[0.5,1]] }], progress: p0, visible: () => clock.near("ca-sau") }));
  { const S: Pt[] = [[60, 40], [55, 49], [45, 49], [40, 40], [45, 31], [55, 31]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.004, 0.65 + i * 0.004, k) * (1 - smoothstep(0.85, 0.98, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ca-sau") })); }
  { const S: Pt[] = [[72, 44], [64, 57], [49, 62], [35, 56], [28, 43], [31, 29], [43, 19], [58, 20], [69, 29]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.004, 0.75 + i * 0.004, k) * (1 - smoothstep(0.85, 0.98, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ca-sau") })); }
  { const S: Pt[] = [[81, 53], [71, 67], [54, 74], [37, 71], [23, 61], [16, 44], [19, 27], [29, 13], [46, 6], [63, 9], [77, 19], [84, 36]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.004, 0.85 + i * 0.004, k) * (1 - smoothstep(0.85, 0.98, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ca-sau") })); }
  // 2. "quoc-ngu": ở kinh thành, các đốm ngà (bài thơ Nôm) lần lượt sáng; người (son) tụ quanh nghe đọc (diễn hoạ).
  const p1 = run("quoc-ngu", 28);
  { const S: Pt[] = [[-55, 25], [-66, 41], [-85, 45], [-101, 34], [-105, 15], [-94, -1], [-75, -5], [-59, 6]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-ngu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1342, groups: [{ path: [[-46, 20], [-52, 40], [-69, 52], [-91, 52], [-108, 40], [-114, 20], [-108, 0], [-91, -12], [-69, -12], [-52, 0], [-46, 20]], count: 30, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("quoc-ngu") }));
  // 3. "nguyen-trai": theo thanh kéo, một dải đốm vàng nối dài từ bờ sông (Hàn Thuyên) qua kinh thành tới cung (hội Tao đàn) — dòng thơ Nôm qua các thế kỷ (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nguyen-trai"] ?? 0) / 0.9);
  { const S: Pt[] = [[30, 40], [15, 28], [1, 15], [-14, 3], [-28, -9], [-43, -22], [-58, -34], [-72, -46], [-87, -58], [-102, -71], [-116, -83], [-131, -95], [-145, -108], [-160, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.065, 0.16999999999999998 + i * 0.065, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-trai") })); }
  // 4. "hong-duc": hai mươi tám đốm ngà (hội Tao đàn nhị thập bát tú) xếp vòng quanh một đốm vàng (vua Lê Thánh Tông) (diễn hoạ).
  const p3 = run("hong-duc", 28);
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hong-duc") })); }
  { const S: Pt[] = [[-46, 20], [-47, 28], [-49, 35], [-53, 41], [-59, 47], [-65, 51], [-72, 53], [-80, 54], [-88, 53], [-95, 51], [-101, 47], [-107, 41], [-111, 35], [-113, 28], [-114, 20], [-113, 12], [-111, 5], [-107, -1], [-101, -7], [-95, -11], [-88, -13], [-80, -14], [-72, -13], [-65, -11], [-59, -7], [-53, -1], [-49, 5], [-47, 12]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.02, 0.35 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hong-duc") })); }
};

export default setup;
