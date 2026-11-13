import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KHE_HO, TRAM, CUOI } from "./terrain";

type Pt = [number, number];

// Đường Trường Sơn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["doan-559","gui-tho","danh-pha","dai-truong-son"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KHE_HO, 24], [TRAM, 24], [CUOI, 24]];

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
    seed: 1959,
  });

  // 1. "doan-559": những người lính đầu tiên (son) từ Khe Hó gùi hàng vào lối mòn xuyên rừng (diễn hoạ).
  const p0 = run("doan-559", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1969, groups: [{ path: [[-40, 330], [-60, 240], [-50, 150]], count: 24, spread: [1,4], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: p0, visible: () => clock.near("doan-559") }));
  { const S: Pt[] = [[-40, 330]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doan-559") })); }
  // 2. "gui-tho": theo thanh kéo, lối mòn (đốm vàng) nối dài dọc Trường Sơn và toả nhánh sang đông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["gui-tho"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 330], [-45, 288], [-49, 245], [-54, 203], [-59, 161], [-60, 131], [-60, 105], [-60, 79], [-60, 53], [-59, 21], [-56, -16], [-54, -54], [-52, -92], [-49, -131], [-47, -173], [-45, -215], [-42, -258], [-40, -300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gui-tho") })); }
  { const S: Pt[] = [[-60, 40], [36, 32], [132, 24], [196, 28], [228, 44], [260, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.05, 0.65 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gui-tho") })); }
  { const S: Pt[] = [[-50, -120], [13, -135], [75, -150], [138, -165], [200, -180]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.05, 0.85 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gui-tho") })); }
  // 3. "danh-pha": đoàn người và xe (son, ngà) vẫn đi qua những đoạn đường bị đánh (lửa); công binh (son) sửa đường (diễn hoạ).
  const p2 = run("danh-pha", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2019, groups: [{ path: [[-50, 200], [-60, 40], [-50, -150]], count: 50, spread: [2,6], color: SON, timing: [[0.02,0],[0.95,1]] }], progress: p2, visible: () => clock.near("danh-pha") }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 3, seed: 2029, groups: [{ path: [[-55, 220], [-60, 40], [-50, -160]], count: 6, spread: [1,3], color: NGHIA, timing: [[0.05,0],[0.95,1]] }], progress: p2, visible: () => clock.near("danh-pha") }));
  world.add(createFires({ sites: [[-70, 100], [-40, -40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("danh-pha") * smoothstep(0.15, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "dai-truong-son": mạng đường (đốm ngà, vàng) trải khắp — trục dọc, trục ngang, tuyến ống (đốm vàng nhỏ) (diễn hoạ).
  const p3 = run("dai-truong-son", 28);
  { const S: Pt[] = [[-40, 330], [-43, 291], [-45, 253], [-48, 214], [-51, 175], [-53, 137], [-56, 98], [-59, 59], [-59, 17], [-56, -28], [-53, -73], [-51, -119], [-48, -164], [-45, -209], [-43, -255], [-40, -300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-truong-son") })); }
  { const S: Pt[] = [[-200, 300], [-204, 245], [-207, 191], [-211, 136], [-215, 82], [-218, 27], [-218, -29], [-215, -87], [-211, -145], [-207, -204], [-204, -262], [-200, -320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.02, 0.35 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-truong-son") })); }
  { const S: Pt[] = [[-200, 200], [-162, 203], [-125, 205], [-87, 208], [-50, 210], [-220, 0], [-180, 5], [-140, 10], [-100, 15], [-60, 20], [-200, -200], [-162, -200], [-125, -200], [-87, -200], [-50, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45 + i * 0.02, 0.6 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-truong-son") })); }
};

export default setup;
