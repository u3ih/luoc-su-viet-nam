import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHUKET, SINGAPORE, BANG_COC, MY_DINH } from "./terrain";

type Pt = [number, number];

// Vô địch AFF Cup 2008 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vong-bang","ban-ket","chung-ket","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHUKET, 32], [SINGAPORE, 32], [BANG_COC, 32], [MY_DINH, 72]];

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
    seed: 2017,
  });

  // 1. "vong-bang": đội tuyển (chấm son) tới Phuket; ba trận vòng bảng (ba đốm sáng lần lượt) (diễn hoạ).
  const p0 = run("vong-bang", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2027, groups: [{ path: [[80, 160], [-80, 0], [-210, -160]], count: 20, spread: [4,12], color: SON, timing: [[0.03,0],[0.5,1]] }], progress: p0, visible: () => clock.near("vong-bang") }));
  { const S: Pt[] = [[-240, -160], [-220, -190], [-200, -160]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vong-bang") })); }
  // 2. "ban-ket": lượt đi ở Mỹ Đình, lượt về ở Singapore (đốm vàng khi thắng) (diễn hoạ).
  const p1 = run("ban-ket", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2047, groups: [{ path: [[-210, -160], [80, 160], [120, -190]], count: 1, spread: [3,3], color: GOLD, timing: [[0.03,0],[0.4,0.5],[0.8,1]] }], progress: p1, visible: () => clock.near("ban-ket") }));
  { const S: Pt[] = [[120, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-ket") })); }
  // 3. "chung-ket": theo thanh kéo, khán đài sân Mỹ Đình (vòng đốm ngà) bừng sáng dần; đốm vàng giữa sân khi trận đấu khép lại (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chung-ket"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2067, groups: [{ path: [[-250, 60], [80, 160]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.3,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chung-ket") }));
  { const S: Pt[] = [[120, 170], [119, 180], [115, 190], [108, 198], [100, 205], [90, 209], [80, 210], [70, 209], [60, 205], [52, 198], [45, 190], [41, 180], [40, 170], [41, 160], [45, 150], [52, 142], [60, 135], [70, 131], [80, 130], [90, 131], [100, 135], [108, 142], [115, 150], [119, 160]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.2 + i * 0.004, 0.35 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  { const S: Pt[] = [[133, 181], [130, 191], [124, 201], [117, 210], [107, 217], [97, 221], [86, 224], [75, 224], [64, 222], [53, 217], [44, 210], [37, 202], [31, 192], [27, 182], [26, 171], [27, 159], [30, 149], [36, 139], [43, 130], [53, 123], [63, 119], [74, 116], [85, 116], [96, 118], [107, 123], [116, 130], [123, 138], [129, 148], [133, 158], [134, 169]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45 + i * 0.004, 0.6 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  { const S: Pt[] = [[80, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chung-ket") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2107, groups: [{ path: [[146, 170], [143, 190], [133, 209], [119, 223], [100, 233], [80, 236], [60, 233], [41, 223], [27, 209], [17, 190], [14, 170], [17, 150], [27, 131], [41, 117], [60, 107], [80, 104], [100, 107], [119, 117], [133, 131], [143, 150], [146, 170]], count: 70, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chung-ket") }));
  // 4. "ve-sau": người hâm mộ (son) từ khắp nơi đổ về; đốm vàng giữa sân (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[80, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2127, groups: [{ path: [[-200, 300], [40, 180]], count: 40, spread: [10,60], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[300, 0], [110, 150]], count: 40, spread: [10,60], color: SON, timing: [[0.06,0],[0.75,1]] }, { path: [[-100, -100], [70, 130]], count: 40, spread: [10,60], color: SON, timing: [[0.09,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
