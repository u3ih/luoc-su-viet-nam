import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, XOM_A, XOM_B, XOM_C, XOM_D, XOM_E } from "./terrain";

type Pt = [number, number];

// Đờn ca tài tử Nam Bộ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguon-goc","nhac-su","nhac-cu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[XOM_A, 24], [XOM_B, 24]];

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
    counts: { trees: 500, bushes: 600, grass: 2000, reeds: 900 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.3 },
    seed: 2013,
  });

  // 1. "nguon-goc": ghe (chấm ngà) trên kênh rạch; các xóm (đốm ngà nhỏ) có nhóm đờn lúc nông nhàn (diễn hoạ).
  const p0 = run("nguon-goc", 28);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 2023, groups: [{ path: [[-390, -60], [-100, -40], [150, -80], [390, -60]], count: 6, spread: [8,400], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("nguon-goc") }));
  { const S: Pt[] = [[-60, 60], [60, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.15, 0.44999999999999996 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguon-goc") })); }
  // 2. "nhac-su": theo thanh kéo, đốm vàng (nhạc sư từ Huế) tới, rồi các nhóm đờn ca (đốm vàng) lần lượt sáng khắp các xóm (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nhac-su"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 4, seed: 2043, groups: [{ path: [[60, 390], [70, 200], [-50, 70]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.25,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nhac-su") }));
  { const S: Pt[] = [[-60, 60], [60, 120], [-200, 120], [180, 30], [-140, -160], [10, -150], [250, 180], [-280, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.08, 0.4 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhac-su") })); }
  // 3. "nhac-cu": bốn đốm (kìm, tranh, cò, bầu) ngồi quây quần; người nghe (son) vây quanh (diễn hoạ).
  const p2 = run("nhac-cu", 28);
  { const S: Pt[] = [[-55, 62], [-62, 65], [-65, 58], [-58, 55]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhac-cu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2073, groups: [{ path: [[-44, 60], [-46, 68], [-52, 74], [-60, 76], [-68, 74], [-74, 68], [-76, 60], [-74, 52], [-68, 46], [-60, 44], [-52, 46], [-46, 52]], count: 26, spread: [3,100], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("nhac-cu") }));
  // 4. "ve-sau": khắp đồng bằng sáng các nhóm đờn ca (đốm vàng); ghe (son) qua lại (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-60, 60], [60, 120], [-200, 120], [180, 30], [-140, -160], [10, -150], [250, 180], [-280, 10], [-20, 220], [200, -180]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 2093, groups: [{ path: [[-390, -60], [-100, -40], [150, -80], [390, -60]], count: 6, spread: [8,400], color: SON, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
