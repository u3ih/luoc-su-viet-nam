import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DEN_HUNG, DINH_A, DINH_B, DINH_C, DINH_D } from "./terrain";

type Pt = [number, number];

// Hát Xoan Phú Thọ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["goc-tich","phuong-xoan","the-cach","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DINH_A, 32], [DINH_B, 24], [DINH_C, 24], [DINH_D, 24]];

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
    seed: 2015,
  });

  // 1. "goc-tich": đền Hùng (đốm vàng) trên núi; người (son) lên đền dâng hát mùa xuân (diễn hoạ).
  const p0 = run("goc-tich", 28);
  { const S: Pt[] = [[-150, 165]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("goc-tich") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2035, groups: [{ path: [[50, 0], [-80, 80], [-145, 155]], count: 30, spread: [8,100], color: SON, timing: [[0.05,0],[0.85,1]] }], progress: p0, visible: () => clock.near("goc-tich") }));
  // 2. "phuong-xoan": theo thanh kéo, bốn phường Xoan (chấm ngà) lần lượt tới các cửa đình (đốm vàng) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["phuong-xoan"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 0], [110, -40], [-60, -110], [80, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.15, 0.16999999999999998 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phuong-xoan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2055, groups: [{ path: [[-200, 0], [-10, 0]], count: 10, spread: [6,20], color: NGHIA, timing: [[0,0],[0.3,1]] }, { path: [[0, -200], [105, -45]], count: 10, spread: [6,20], color: NGHIA, timing: [[0.15,0],[0.5,1]] }, { path: [[-200, -200], [-62, -105]], count: 10, spread: [6,20], color: NGHIA, timing: [[0.3,0],[0.7,1]] }, { path: [[200, 200], [78, 84]], count: 10, spread: [6,20], color: NGHIA, timing: [[0.45,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("phuong-xoan") }));
  // 3. "the-cach": phường Xoan (chấm ngà) múa thành vòng trước cửa đình; dân (son) đứng xem (diễn hoạ).
  const p2 = run("the-cach", 28);
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("the-cach") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2075, groups: [{ path: [[12, -15], [10, -8], [4, -4], [-4, -4], [-10, -8], [-12, -15], [-10, -22], [-4, -26], [4, -26], [10, -22], [12, -15]], count: 12, spread: [2,80], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p2, visible: () => clock.near("the-cach") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2085, groups: [{ path: [[30, -15], [27, -2], [19, 8], [7, 14], [-7, 14], [-19, 8], [-27, -2], [-30, -15], [-27, -28], [-19, -38], [-7, -44], [7, -44], [19, -38], [27, -28]], count: 40, spread: [3,180], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("the-cach") }));
  // 4. "ve-sau": các đình và đền Hùng (đốm vàng) sáng; người (son) dự hội khắp vùng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 0], [110, -40], [-60, -110], [80, 80], [-150, 165]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2105, groups: [{ path: [[-250, -50], [0, -5]], count: 30, spread: [10,100], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [[250, 0], [100, -40]], count: 26, spread: [10,100], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
