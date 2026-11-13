import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CAO_BANG, DONG_KHE, COC_XA, THAT_KHE, LANG_SON } from "./terrain";

type Pt = [number, number];

// Chiến dịch Biên giới — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["duong-so-4","dong-khe","coc-xa","khai-thong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CAO_BANG, 32], [DONG_KHE, 24], [THAT_KHE, 24], [LANG_SON, 32]];

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
    seed: 1950,
  });

  // 1. "duong-so-4": chuỗi đồn (đốm xanh nhạt) dọc đường số 4 từ Lạng Sơn lên Cao Bằng; các đơn vị (son) hành quân qua rừng (diễn hoạ).
  const p0 = run("duong-so-4", 28);
  { const S: Pt[] = [[280, -180], [140, -60], [-30, 40], [-230, 230]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.08, 0.16999999999999998 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("duong-so-4") })); }
  { const S: Pt[] = [[280, -180], [248, -152], [215, -125], [183, -97], [151, -69], [114, -45], [75, -22], [35, 2], [-4, 25], [-45, 55], [-92, 98], [-138, 142], [-184, 186], [-230, 230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.02, 0.44999999999999996 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("duong-so-4") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1980, groups: [{ path: [[-300, -390], [-200, -200], [-120, -60]], count: 50, spread: [4,14], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("duong-so-4") }));
  // 2. "dong-khe": theo thanh kéo, các đơn vị (son) khép vòng quanh đồn Đông Khê (đốm xanh nhạt) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dong-khe"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1990, groups: [{ path: [[75, 73], [-30, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-6, 147], [-30, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-111, 115], [-30, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-135, 7], [-30, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-54, -67], [-30, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[51, -35], [-30, 40]], count: 12, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dong-khe") }));
  { const S: Pt[] = [[-30, 40]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.8, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-khe") })); }
  // 3. "coc-xa": hai cánh quân Pháp (xanh nhạt) từ Cao Bằng và Thất Khê tiến dọc đường, dạt vào hẻm núi Cốc Xá, bị chặn (son) (diễn hoạ).
  const p2 = run("coc-xa", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2010, groups: [{ path: [[-230, 230], [-150, 120], [-110, 60]], count: 40, spread: [4,10], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[140, -60], [40, 0], [-90, 50]], count: 40, spread: [4,10], color: DICH, timing: [[0.05,0],[0.75,1]] }], progress: p2, visible: () => clock.near("coc-xa") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2020, groups: [{ path: [[-60, 60], [-70, 89], [-95, 108], [-125, 108], [-150, 89], [-160, 60], [-150, 31], [-125, 12], [-95, 12], [-70, 31], [-60, 60]], count: 50, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("coc-xa") }));
  // 4. "khai-thong": các đồn (đốm xanh nhạt) từ Thất Khê đến Lạng Sơn lần lượt tắt; dọc biên giới (đốm vàng) sáng lên (diễn hoạ).
  const p3 = run("khai-thong", 28);
  { const S: Pt[] = [[140, -60], [280, -180]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-thong") })); }
  { const S: Pt[] = [[-380, 380], [-287, 373], [-193, 367], [-100, 360], [-17, 363], [67, 367], [150, 370], [227, 353], [303, 337], [380, 320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.04, 0.55 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-thong") })); }
};

export default setup;
