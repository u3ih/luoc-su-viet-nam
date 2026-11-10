import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, HCM } from "./terrain";

type Pt = [number, number];

// Internet đến Việt Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thu-dien-tu","thu-nghiem","hoa-mang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [HCM, 40]];

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
    seed: 2008,
  });

  // 1. "thu-dien-tu": đốm vàng ở Hà Nội; chuỗi đốm ngà (đường dây điện thoại) nối ra biển tới phía đông nam xa (nước Úc) (diễn hoạ).
  const p0 = run("thu-dien-tu", 28);
  { const S: Pt[] = [[-60, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-dien-tu") })); }
  { const S: Pt[] = [[-60, 230], [-13, 206], [33, 181], [80, 157], [127, 132], [176, 96], [227, 47], [278, -2], [329, -51], [380, -100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-dien-tu") })); }
  // 2. "thu-nghiem": bốn điểm thử nghiệm (đốm vàng) ở Hà Nội và Thành phố Hồ Chí Minh, mỗi điểm nối ra một cổng quốc tế (chuỗi đốm ngà) (diễn hoạ).
  const p1 = run("thu-nghiem", 28);
  { const S: Pt[] = [[-70, 230], [-40, 220], [40, -240], [60, -230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-nghiem") })); }
  { const S: Pt[] = [[-40, 220], [-80, 260], [-120, 300], [-160, 340], [-200, 380]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.25 + i * 0.03, 0.4 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-nghiem") })); }
  { const S: Pt[] = [[40, -240], [93, -275], [145, -310], [198, -345], [250, -380]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.45 + i * 0.03, 0.6 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-nghiem") })); }
  { const S: Pt[] = [[60, -230], [140, -222], [220, -215], [300, -207], [380, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.65 + i * 0.03, 0.8 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-nghiem") })); }
  // 3. "hoa-mang": theo thanh kéo, các điểm kết nối (đốm vàng) lần lượt sáng khắp dải đất (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["hoa-mang"] ?? 0) / 0.9);
  { const S: Pt[] = [[-130, -240], [-70, -240], [-10, -240], [50, -240], [110, -240], [-130, -180], [-70, -180], [-10, -180], [50, -180], [110, -180], [-130, -120], [-70, -120], [-10, -120], [50, -120], [110, -120], [-130, -60], [-70, -60], [-10, -60], [50, -60], [110, -60], [-130, 0], [-70, 0], [-10, 0], [50, 0], [110, 0], [-130, 60], [-70, 60], [-10, 60], [50, 60], [110, 60], [-130, 120], [-70, 120], [-10, 120], [50, 120], [110, 120], [-130, 180], [-70, 180], [-10, 180], [50, 180], [110, 180], [-130, 240], [-70, 240], [-10, 240], [50, 240], [110, 240]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.03 + i * 0.02, 0.18 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-mang") })); }
  // 4. "ve-sau": người dùng (son) tụ về quanh các điểm sáng; mạng lưới (đốm vàng) sáng đều (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-130, -240], [-70, -240], [-10, -240], [50, -240], [110, -240], [-130, -180], [-70, -180], [-10, -180], [50, -180], [110, -180], [-130, -120], [-70, -120], [-10, -120], [50, -120], [110, -120], [-130, -60], [-70, -60], [-10, -60], [50, -60], [110, -60], [-130, 0], [-70, 0], [-10, 0], [50, 0], [110, 0], [-130, 60], [-70, 60], [-10, 60], [50, 60], [110, 60], [-130, 120], [-70, 120], [-10, 120], [50, 120], [110, 120], [-130, 180], [-70, 180], [-10, 180], [50, 180], [110, 180], [-130, 240], [-70, 240], [-10, 240], [50, 240], [110, 240]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2098, groups: [{ path: [[-200, 200], [-60, 220]], count: 30, spread: [10,50], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-150, -250], [30, -240]], count: 30, spread: [10,50], color: SON, timing: [[0.1,0],[0.75,1]] }, { path: [[-200, 0], [-40, 20]], count: 30, spread: [10,50], color: SON, timing: [[0.15,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
