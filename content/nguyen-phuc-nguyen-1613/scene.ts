import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_XUAN, HOI_AN_S, OUDONG, PREY_NOKOR } from "./terrain";

type Pt = [number, number];

// Chúa Sãi, Ngọc Vạn và Prey Nokor — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["noi-ngoi","hoi-an","ngoc-van","prey-nokor"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_XUAN, 24], [HOI_AN_S, 24], [OUDONG, 32], [PREY_NOKOR, 28]];

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
    seed: 1613,
  });

  // 1. "noi-ngoi": đốm vàng (phủ chúa ở Phú Xuân); thuyền (son) đóng ở cửa biển; quân (son) dàn phía bắc (diễn hoạ).
  const p0 = run("noi-ngoi", 28);
  { const S: Pt[] = [[60, 210]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-ngoi") })); }
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1633, groups: [{ path: [[150, 230], [180, 250]], count: 8, spread: [4,10], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("noi-ngoi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1643, groups: [{ path: [[0, 300], [40, 300], [80, 300], [120, 300]], count: 40, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("noi-ngoi") }));
  // 2. "hoi-an": thuyền buôn (đốm ngà, đốm xanh nhạt) từ biển xa vào Hội An; phố buôn (đốm vàng nhỏ) sáng (diễn hoạ).
  const p1 = run("hoi-an", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1653, groups: [{ path: [[380, 300], [200, 160], [100, 130]], count: 6, spread: [6,16], color: NGHIA, timing: [[0.02,0],[0.8,1]] }, { path: [[380, 0], [200, 100], [100, 130]], count: 5, spread: [6,16], color: DICH, timing: [[0.15,0],[0.9,1]] }], progress: p1, visible: () => clock.near("hoi-an") }));
  { const S: Pt[] = [[108, 134], [100, 145], [86, 148], [75, 140], [72, 126], [80, 115], [94, 112], [105, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.02, 0.55 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-an") })); }
  // 3. "ngoc-van": theo thanh kéo, đoàn thuyền đưa dâu (đốm vàng) đi từ Phú Xuân theo đường biển vào sông tới Oudong (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ngoc-van"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 1673, groups: [{ path: [[100, 210], [190, 100], [190, -100], [120, -170], [-60, -150], [-170, -100]], count: 5, spread: [3,8], color: GOLD, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ngoc-van") }));
  { const S: Pt[] = [[-170, -90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngoc-van") })); }
  // 4. "prey-nokor": đốm vàng nhỏ (trạm thu thuế) sáng ở Prey Nokor; thuyền (ngà) qua lại; các làng Khmer (đốm ngà) quanh vẫn sáng (diễn hoạ).
  const p3 = run("prey-nokor", 28);
  { const S: Pt[] = [[40, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("prey-nokor") })); }
  { const S: Pt[] = [[-20, -110], [80, -110], [0, -200], [100, -200], [-60, -190]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("prey-nokor") })); }
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1713, groups: [{ path: [[120, -170], [40, -155], [-60, -150]], count: 6, spread: [3,8], color: NGHIA, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("prey-nokor") }));
};

export default setup;
