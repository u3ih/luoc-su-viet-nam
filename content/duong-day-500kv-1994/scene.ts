import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_BINH, PHU_LAM } from "./terrain";

type Pt = [number, number];

// Đường dây 500 kV Bắc – Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thieu-dien","dung-cot","dong-dien","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_BINH, 48], [PHU_LAM, 56]];

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
    seed: 1994,
  });

  // 1. "thieu-dien": phía bắc đèn sáng (đốm vàng); phía nam đèn chập chờn rồi tắt (đốm ngà) (diễn hoạ).
  const p0 = run("thieu-dien", 28);
  { const S: Pt[] = [[-120, 330], [-141, 359], [-174, 348], [-174, 312], [-141, 301]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thieu-dien") })); }
  { const S: Pt[] = [[164, -320], [147, -291], [113, -291], [96, -320], [113, -349], [147, -349]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (1 - smoothstep(0.4, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thieu-dien") })); }
  // 2. "dung-cot": theo thanh kéo, hàng cột thép (chuỗi đốm ngà) nối dài từ bắc vào nam qua núi rừng; người thi công (son) dọc tuyến (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dung-cot"] ?? 0) / 0.9);
  { const S: Pt[] = [[-150, 330], [-133, 301], [-116, 273], [-99, 244], [-81, 216], [-64, 187], [-50, 156], [-37, 123], [-23, 91], [-10, 59], [3, 26], [13, -5], [19, -36], [24, -66], [30, -97], [36, -127], [44, -158], [61, -190], [79, -223], [96, -255], [113, -288], [130, -320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-cot") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2034, groups: [{ path: [[-110, 260], [-60, 180]], count: 10, spread: [6,30], color: SON, timing: [[0,1],[1,1]] }, { path: [[0, 60], [10, 10]], count: 10, spread: [6,30], color: SON, timing: [[0,1],[1,1]] }, { path: [[60, -200], [40, -150]], count: 10, spread: [6,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dung-cot") }));
  // 3. "dong-dien": đóng điện: dòng điện (chuỗi đốm vàng) chạy từ bắc vào nam; phía nam sáng đèn (diễn hoạ).
  const p2 = run("dong-dien", 28);
  { const S: Pt[] = [[-150, 330], [-133, 301], [-116, 273], [-99, 244], [-81, 216], [-64, 187], [-50, 156], [-37, 123], [-23, 91], [-10, 59], [3, 26], [13, -5], [19, -36], [24, -66], [30, -97], [36, -127], [44, -158], [61, -190], [79, -223], [96, -255], [113, -288], [130, -320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dien") })); }
  { const S: Pt[] = [[164, -320], [147, -291], [113, -291], [96, -320], [113, -349], [147, -349]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.02, 0.9 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dien") })); }
  // 4. "ve-sau": thành phố phía nam (đốm vàng) sáng đều (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-150, 330], [-133, 301], [-116, 273], [-99, 244], [-81, 216], [-64, 187], [-50, 156], [-37, 123], [-23, 91], [-10, 59], [3, 26], [13, -5], [19, -36], [24, -66], [30, -97], [36, -127], [44, -158], [61, -190], [79, -223], [96, -255], [113, -288], [130, -320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[91, -346], [117, -346], [143, -346], [169, -346], [91, -320], [117, -320], [143, -320], [169, -320], [91, -294], [117, -294], [143, -294], [169, -294]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
