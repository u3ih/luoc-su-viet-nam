import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_LU, CHUA, DU_HY } from "./terrain";

type Pt = [number, number];

// Khuông Việt đại sư — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cua-thien","tang-thong","ngoc-lang-quy","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_LU, 64]];

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
    seed: 971,
  });

  // 1. "cua-thien": một chấm ngà nhỏ (cậu bé) đi tới chùa (đốm vàng) (diễn hoạ).
  const p0 = run("cua-thien", 28);
  world.add(createCrowd({ size: 6, height: ground, seed: 981, groups: [{ path: [[150, -150], [0, -40], [-105, 85]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.85,1]] }], progress: p0, visible: () => clock.near("cua-thien") }));
  { const S: Pt[] = [[-110, 95]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cua-thien") })); }
  // 2. "tang-thong": theo thanh kéo, các chùa (đốm vàng) quanh kinh đô lần lượt sáng; tăng đoàn (ngà) về kinh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tang-thong"] ?? 0) / 0.9);
  { const S: Pt[] = [[115, 55], [65, 121], [-15, 139], [-88, 102], [-120, 26], [-96, -53], [-27, -97], [55, -87], [111, -27]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.09, 0.2 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tang-thong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1011, groups: [{ path: [[-110, 90], [0, 30]], count: 12, spread: [6,30], color: NGHIA, timing: [[0.05,0],[0.6,1]] }, { path: [[150, 100], [10, 25]], count: 12, spread: [6,30], color: NGHIA, timing: [[0.15,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tang-thong") }));
  // 3. "ngoc-lang-quy": đoàn sứ (xanh nhạt) ngược sông tới Hoa Lư; đốm vàng (khúc từ tiễn sứ) sáng ở kinh (diễn hoạ).
  const p2 = run("ngoc-lang-quy", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1021, groups: [{ path: [[390, -110], [100, -70], [10, -60]], count: 3, spread: [8,30], color: DICH, timing: [[0.03,0],[0.55,1]] }], progress: p2, visible: () => clock.near("ngoc-lang-quy") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1031, groups: [{ path: [[10, -60], [0, 10]], count: 10, spread: [6,20], color: DICH, timing: [[0.5,0],[0.75,1]] }], progress: p2, visible: () => clock.near("ngoc-lang-quy") }));
  { const S: Pt[] = [[0, 25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngoc-lang-quy") })); }
  // 4. "ve-sau": học trò (son) tìm tới núi Du Hý (đốm vàng) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[120, 270]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1061, groups: [{ path: [[0, 20], [110, 255]], count: 24, spread: [8,80], color: SON, timing: [[0.08,0],[0.8,1]] }, { path: [[-200, 200], [105, 260]], count: 18, spread: [8,80], color: SON, timing: [[0.15,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
