import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GIAO_CHI, CHUA, KIEN_NGHIEP } from "./terrain";

type Pt = [number, number];

// Thiền sư Khương Tăng Hội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["giao-chi","xuat-gia","kien-nghiep","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[GIAO_CHI, 56]];

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
    seed: 247,
  });

  // 1. "giao-chi": thuyền buôn (xanh nhạt) từ biển ngược sông vào Giao Chỉ; người (son) họp chợ bên bến (diễn hoạ).
  const p0 = run("giao-chi", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 257, groups: [{ path: [[390, -40], [250, -20], [60, 20], [-10, 0]], count: 5, spread: [10,120], color: DICH, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("giao-chi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 267, groups: [{ path: [[-150, -150], [-40, -30]], count: 20, spread: [8,60], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-200, 100], [-50, -10]], count: 16, spread: [8,60], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("giao-chi") }));
  // 2. "xuat-gia": theo thanh kéo, đốm ngà (Tăng Hội) vào chùa; những bản kinh (đốm vàng nhỏ) lần lượt sáng quanh chùa (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["kinh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 277, groups: [{ path: [[-40, -20], [-85, -55]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,0],[0.25,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xuat-gia") }));
  { const S: Pt[] = [[-72, -60], [-79, -46], [-94, -42], [-106, -52], [-106, -68], [-94, -78], [-79, -74]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.09, 0.4 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-gia") })); }
  // 3. "kien-nghiep": thuyền (đốm vàng) xuôi sông ra biển, đi về phía đông bắc tới Kiến Nghiệp (đốm vàng xa) (diễn hoạ).
  const p2 = run("kien-nghiep", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 4, seed: 297, groups: [{ path: [[-40, 0], [60, 20], [250, -20], [340, 60], [370, 360]], count: 1, spread: [3,3], color: GOLD, timing: [[0.03,0],[0.85,1]] }], progress: p2, visible: () => clock.near("kien-nghiep") }));
  { const S: Pt[] = [[370, 370]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kien-nghiep") })); }
  // 4. "ve-sau": vòng chấm ngà (người tu thiền) ngồi quanh đốm vàng ở chùa; cột sáng nhỏ (hơi thở) lên xuống (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 317, groups: [{ path: [[-66, -60], [-68, -50], [-75, -41], [-85, -37], [-95, -37], [-105, -41], [-112, -50], [-114, -60], [-112, -70], [-105, -79], [-95, -83], [-85, -83], [-75, -79], [-68, -70]], count: 24, spread: [3,150], color: NGHIA, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-90, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-90, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-90, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-90, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.41 + i * 0.12, 0.5599999999999999 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
