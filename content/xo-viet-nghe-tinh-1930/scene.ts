import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VINH, HUNG_NGUYEN, LANG } from "./terrain";

type Pt = [number, number];

// Xô viết Nghệ Tĩnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ben-thuy","hung-nguyen","xo-viet","tran-ap"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VINH, 48], [HUNG_NGUYEN, 32], [LANG, 32]];

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
    seed: 1930,
  });

  // 1. "ben-thuy": công nhân (son) rời nhà máy ở Bến Thuỷ (đốm vàng), tụ thành đoàn bãi công (diễn hoạ).
  const p0 = run("ben-thuy", 28);
  { const S: Pt[] = [[230, 0], [190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.1, 0.16999999999999998 + i * 0.1, k) * (1 - smoothstep(0.3, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ben-thuy") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1950, groups: [{ path: [[230, 0], [180, 60]], count: 40, spread: [3,10], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[190, 40], [180, 60]], count: 30, spread: [3,10], color: SON, timing: [[0.1,0],[0.65,1]] }], progress: p0, visible: () => clock.near("ben-thuy") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1960, groups: [{ path: [[204, 60], [199, 74], [187, 83], [173, 83], [161, 74], [156, 60], [161, 46], [173, 37], [187, 37], [199, 46], [204, 60]], count: 40, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("ben-thuy") }));
  // 2. "hung-nguyen": theo thanh kéo, nông dân (son) từ các làng nhập vào đoàn biểu tình đi từ Hưng Nguyên về phía Vinh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hung-nguyen"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1970, groups: [{ path: [[-120, -40], [40, -10], [160, 10]], count: 120, spread: [3,12], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hung-nguyen") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1980, groups: [{ path: [[84, 66], [0, -20]], count: 20, spread: [4,16], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[-86, 64], [0, -20]], count: 20, spread: [4,16], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[-84, -106], [0, -20]], count: 20, spread: [4,16], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[86, -104], [0, -20]], count: 20, spread: [4,16], color: SON, timing: [[0.1,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hung-nguyen") }));
  // 3. "xo-viet": ở nhiều làng (đốm ngà), bộ máy cũ (đốm xanh nhạt) tắt, các uỷ ban tự quản (đốm vàng) sáng; dân làng (son) họp quanh đình (diễn hoạ).
  const p2 = run("xo-viet", 28);
  { const S: Pt[] = [[-160, 160], [-40, 120], [-220, 20], [60, 160], [-120, -40]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.1, 0.4, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xo-viet") })); }
  { const S: Pt[] = [[-160, 160], [-40, 120], [-220, 20], [60, 160], [-120, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.07, 0.55 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xo-viet") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2010, groups: [{ path: [[-138, 160], [-142, 173], [-153, 181], [-167, 181], [-178, 173], [-182, 160], [-178, 147], [-167, 139], [-153, 139], [-142, 147], [-138, 160]], count: 30, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-20, 120], [-24, 132], [-34, 139], [-46, 139], [-56, 132], [-60, 120], [-56, 108], [-46, 101], [-34, 101], [-24, 108], [-20, 120]], count: 25, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("xo-viet") }));
  // 4. "tran-ap": lính (xanh nhạt) trở lại các đồn; các uỷ ban (đốm vàng) lần lượt tắt (diễn hoạ).
  const p3 = run("tran-ap", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2020, groups: [{ path: [[390, 60], [200, 20], [-40, 100], [-160, 150]], count: 50, spread: [4,12], color: DICH, timing: [[0.02,0],[0.8,1]] }], progress: p3, visible: () => clock.near("tran-ap") }));
  { const S: Pt[] = [[-160, 160], [-40, 120], [-220, 20], [60, 160], [-120, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.3, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tran-ap") })); }
};

export default setup;
