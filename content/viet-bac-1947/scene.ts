import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAC_KAN, CHO_DON, DOAN_HUNG, BONG_LAU, ATK } from "./terrain";

type Pt = [number, number];

// Thu – đông Việt Bắc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["atk","nhay-du","song-lo","rut-lui"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAC_KAN, 40], [CHO_DON, 24], [ATK, 32], [BONG_LAU, 24]];

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
    seed: 1947,
  });

  // 1. "atk": đoàn người (son) gùi máy móc từ miền xuôi lên rừng; các lán (đốm ngà) sáng trong An toàn khu (diễn hoạ).
  const p0 = run("atk", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1957, groups: [{ path: [[150, -390], [80, -240], [40, -140]], count: 60, spread: [3,10], color: SON, timing: [[0.02,0],[0.8,1]] }], progress: p0, visible: () => clock.near("atk") }));
  { const S: Pt[] = [[77, -124], [45, -100], [8, -116], [3, -156], [35, -180], [72, -164]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("atk") })); }
  // 2. "nhay-du": theo thanh kéo, lính dù (đốm xanh nhạt) từ trên cao rơi xuống Bắc Kạn; cơ quan (ngà) tản vào rừng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nhay-du"] ?? 0) / 0.9);
  { const S: Pt[] = [[50, 60], [35, 86], [5, 86], [-10, 60], [5, 34], [35, 34]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 90, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.01, 0.2 + i * 0.01, k) * (1 - smoothstep(0.3, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhay-du") })); }
  { const S: Pt[] = [[42, 94], [2, 96], [-20, 62], [-2, 26], [38, 24], [60, 58]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 65, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.13 + i * 0.01, 0.28 + i * 0.01, k) * (1 - smoothstep(0.38, 0.53, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhay-du") })); }
  { const S: Pt[] = [[-1, 105], [-30, 65], [-9, 19], [41, 15], [70, 55], [49, 101]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.21000000000000002 + i * 0.01, 0.36 + i * 0.01, k) * (1 - smoothstep(0.45999999999999996, 0.61, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhay-du") })); }
  { const S: Pt[] = [[-39, 68], [-17, 13], [42, 4], [79, 52], [57, 107], [-2, 116]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.29 + i * 0.01, 0.43999999999999995 + i * 0.01, k) * (1 - smoothstep(0.54, 0.69, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhay-du") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2017, groups: [{ path: [[20, 60], [-60, -40], [30, -130]], count: 20, spread: [3,8], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nhay-du") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2027, groups: [{ path: [[50, 60], [44, 78], [29, 89], [11, 89], [-4, 78], [-10, 60], [-4, 42], [11, 31], [29, 31], [44, 42], [50, 60]], count: 40, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nhay-du") }));
  // 3. "song-lo": đoàn tàu (chấm xanh nhạt) ngược sông Lô; pháo bên bờ phục kích (lửa ở Đoan Hùng); trên đường số 4, đoàn xe (xanh nhạt) vào đèo Bông Lau (diễn hoạ).
  const p2 = run("song-lo", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2037, groups: [{ path: [[-160, -390], [-170, -200], [-200, -60]], count: 5, spread: [2,6], color: DICH, timing: [[0.02,0],[0.7,1]] }], progress: p2, visible: () => clock.near("song-lo") }));
  world.add(createFires({ sites: [[-200, -60], [-185, -90]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("song-lo") * smoothstep(0.65, 0.9, p2()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2057, groups: [{ path: [[-216, -50], [-219, -42], [-226, -37], [-234, -37], [-241, -42], [-244, -50], [-241, -58], [-234, -63], [-226, -63], [-219, -58], [-216, -50]], count: 20, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("song-lo") }));
  // 4. "rut-lui": các cánh quân Pháp (xanh nhạt) rút khỏi Bắc Kạn về phía nam và đông; các lán (đốm ngà) sáng lại (diễn hoạ).
  const p3 = run("rut-lui", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2067, groups: [{ path: [[20, 60], [120, 0], [300, -120], [390, -200]], count: 50, spread: [4,12], color: DICH, timing: [[0.02,0],[0.85,1]] }, { path: [[-150, 120], [-200, -60], [-160, -390]], count: 30, spread: [4,12], color: DICH, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("rut-lui") }));
  { const S: Pt[] = [[20, 60], [-150, 120], [40, -140], [230, 80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.07, 0.75 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rut-lui") })); }
};

export default setup;
