import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_NUA, TU_PHO, BO_DIEN, NUI_TUNG, GIAO_CHAU } from "./terrain";

type Pt = [number, number];

// Bà Triệu 248 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nui-nua", "khoi-nghia", "luc-dan", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NUI_NUA, 55], [TU_PHO, 55], [BO_DIEN, 55], [GIAO_CHAU, 55], [NUI_TUNG, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 248,
  });

  // 1. "nui-nua": các nhóm người (son) từ nhiều ngả tụ về núi Nưa, một đốm ngà sáng dần, lửa trại bật lên (diễn hoạ).
  const p0 = run("nui-nua", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 248, groups: [{ path: [[-300, 40], [-230, -30], NUI_NUA], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-260, -230], [-210, -150], NUI_NUA], count: 16, spread: [26,50], color: SON, timing: [[0.09,0],[0.85,1]] }, { path: [[-120, 100], [-150, 0], NUI_NUA], count: 14, spread: [26,50], color: SON, timing: [[0.14,0],[0.85,1]] }], progress: p0, visible: () => clock.near("nui-nua") }));
  { const S: Pt[] = [NUI_NUA]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nui-nua") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(NUI_NUA, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("nui-nua") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "khoi-nghia": đoàn ngà đi từ núi Nưa tới Tư Phố rồi sang Bồ Điền, hai đốm vàng sáng lần lượt (diễn hoạ).
  const p1 = run("khoi-nghia", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 258, groups: [{ path: [NUI_NUA, [-80, -60], TU_PHO, [80, 40], BO_DIEN], count: 34, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p1, visible: () => clock.near("khoi-nghia") }));
  { const S: Pt[] = [TU_PHO, BO_DIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.25, 0.25 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-nghia") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(TU_PHO, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("khoi-nghia") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "luc-dan": đoàn xanh nhạt (quân phía Giao Châu) từ phía bắc tiến về Bồ Điền theo thanh kéo, người giữ căn cứ (son) đứng ở Bồ Điền (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 268, groups: [{ path: [GIAO_CHAU, [80, 230], [110, 150], BO_DIEN], count: 34, spread: [30,70], color: DICH, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("luc-dan") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 269, groups: [{ path: [[130, 90], BO_DIEN], count: 18, spread: [30,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("luc-dan") }));
  { const S: Pt[] = [BO_DIEN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luc-dan") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(BO_DIEN, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("luc-dan") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": một quầng ngà dịu ở chân núi, các nhóm người (son) đến đứng lặng, lửa bật dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 278, groups: [{ path: [[40, 250], [90, 150], NUI_TUNG], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-60, -60], [40, 10], NUI_TUNG], count: 16, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [NUI_TUNG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(NUI_TUNG, 36, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
