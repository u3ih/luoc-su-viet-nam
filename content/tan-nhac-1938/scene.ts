import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAI_GON, HUE, HA_NOI, NAM_DINH, HAI_PHONG } from "./terrain";

type Pt = [number, number];

// Tân nhạc ra đời — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chuan-bi","nguyen-van-tuyen","hoi-tri-tri","tien-chien"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAI_GON, 32], [HUE, 28], [HA_NOI, 40], [NAM_DINH, 24], [HAI_PHONG, 24]];

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
    seed: 1938,
  });

  // 1. "chuan-bi": những đốm ngà nhỏ rời rạc (các bài hát đầu tiên) lần lượt sáng ở Hà Nội, Hải Phòng, Nam Định (diễn hoạ).
  const p0 = run("chuan-bi", 28);
  { const S: Pt[] = [[-70, 240], [-50, 220], [130, 240], [30, 150], [-60, 210], [140, 230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chuan-bi") })); }
  // 2. "nguyen-van-tuyen": một đốm vàng (Nguyễn Văn Tuyên) đi từ Sài Gòn ra Huế, Hà Nội, Hải Phòng, Nam Định (diễn hoạ).
  const p1 = run("nguyen-van-tuyen", 28);
  { const S: Pt[] = [[120, -300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-van-tuyen") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 1968, groups: [{ path: [[120, -300], [80, -40], [-55, 225], [125, 235], [35, 155]], count: 1, spread: [2,2], color: GOLD, timing: [[0.08,0],[0.95,1]] }], progress: p1, visible: () => clock.near("nguyen-van-tuyen") }));
  { const S: Pt[] = [[80, -40], [-60, 230], [130, 240], [30, 150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.17, 0.44999999999999996 + i * 0.17, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-van-tuyen") })); }
  // 3. "hoi-tri-tri": theo thanh kéo, các vòng đốm vàng (tiếng hát) lan dần từ sân khấu ra khắp khán phòng (son) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["hoi-tri-tri"] ?? 0) / 0.9);
  { const S: Pt[] = [[-60, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-tri-tri") })); }
  { const S: Pt[] = [[-48, 230], [-52, 238], [-60, 242], [-68, 238], [-72, 230], [-68, 222], [-60, 218], [-52, 222]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.004, 0.25 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-tri-tri") })); }
  { const S: Pt[] = [[-38, 234], [-44, 245], [-53, 251], [-64, 252], [-75, 246], [-81, 237], [-82, 226], [-76, 215], [-67, 209], [-56, 208], [-45, 214], [-39, 223]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.28 + i * 0.004, 0.43000000000000005 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-tri-tri") })); }
  { const S: Pt[] = [[-31, 242], [-38, 253], [-48, 260], [-60, 262], [-72, 259], [-83, 252], [-90, 242], [-92, 230], [-89, 218], [-82, 207], [-72, 200], [-60, 198], [-48, 201], [-37, 208], [-30, 218], [-28, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45999999999999996 + i * 0.004, 0.61 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-tri-tri") })); }
  { const S: Pt[] = [[-25, 254], [-34, 263], [-46, 270], [-59, 272], [-72, 270], [-84, 265], [-93, 256], [-100, 244], [-102, 231], [-100, 218], [-95, 206], [-86, 197], [-74, 190], [-61, 188], [-48, 190], [-36, 195], [-27, 204], [-20, 216], [-18, 229], [-20, 242]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.64 + i * 0.004, 0.79 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-tri-tri") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2038, groups: [{ path: [[-10, 230], [-12, 245], [-20, 259], [-31, 270], [-45, 278], [-60, 280], [-75, 278], [-89, 270], [-100, 259], [-108, 245], [-110, 230], [-108, 215], [-100, 201], [-89, 190], [-75, 182], [-60, 180], [-45, 182], [-31, 190], [-20, 201], [-12, 215], [-10, 230]], count: 60, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("hoi-tri-tri") }));
  // 4. "tien-chien": đốm vàng sáng khắp các thành phố (bản nhạc bán ở hiệu sách); người yêu nhạc (son) tụ quanh (diễn hoạ).
  const p3 = run("tien-chien", 28);
  { const S: Pt[] = [[120, -300], [80, -40], [-60, 230], [30, 150], [130, 240]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tien-chien") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2058, groups: [{ path: [[-30, 230], [-34, 245], [-45, 256], [-60, 260], [-75, 256], [-86, 245], [-90, 230], [-86, 215], [-75, 204], [-60, 200], [-45, 204], [-34, 215], [-30, 230]], count: 30, spread: [2,6], color: SON, drop: true, timing: [[0,0],[0.8,1]] }, { path: [[106, -40], [103, -27], [93, -17], [80, -14], [67, -17], [57, -27], [54, -40], [57, -53], [67, -63], [80, -66], [93, -63], [103, -53], [106, -40]], count: 24, spread: [2,6], color: SON, drop: true, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("tien-chien") }));
};

export default setup;
