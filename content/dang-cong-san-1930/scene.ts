import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, QUANG_CHAU, HUONG_CANG, HA_NOI_C, NGHE_AN, SAI_GON_C } from "./terrain";

type Pt = [number, number];

// Hội nghị hợp nhất ở Hương Cảng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quang-chau","ba-to-chuc","cuu-long","dong-duong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUANG_CHAU, 24], [HUONG_CANG, 24], [HA_NOI_C, 24], [SAI_GON_C, 24]];

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

  // 1. "quang-chau": đốm vàng (Hội Thanh niên) sáng ở Quảng Châu; các nhóm hội viên (son) từ đó về Hà Nội, Nghệ An, Sài Gòn (diễn hoạ).
  const p0 = run("quang-chau", 28);
  { const S: Pt[] = [[60, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quang-chau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1950, groups: [{ path: [[60, 150], [-120, 120]], count: 8, spread: [2,6], color: SON, timing: [[0.2,0],[0.7,1]] }, { path: [[60, 150], [-110, 0]], count: 8, spread: [2,6], color: SON, timing: [[0.3,0],[0.8,1]] }, { path: [[60, 150], [40, -60], [-60, -150]], count: 8, spread: [2,6], color: SON, timing: [[0.35,0],[0.9,1]] }], progress: p0, visible: () => clock.near("quang-chau") }));
  // 2. "ba-to-chuc": ba đốm ngà (ba tổ chức cộng sản) lần lượt sáng ở Hà Nội, Sài Gòn, Nghệ An — mỗi đốm có vòng người riêng, rời nhau (diễn hoạ).
  const p1 = run("ba-to-chuc", 28);
  { const S: Pt[] = [[-120, 120], [-60, -150], [-110, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.18, 0.2 + i * 0.18, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-to-chuc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1970, groups: [{ path: [[-98, 120], [-102, 133], [-113, 141], [-127, 141], [-138, 133], [-142, 120], [-138, 107], [-127, 99], [-113, 99], [-102, 107], [-98, 120]], count: 18, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-38, -150], [-42, -137], [-53, -129], [-67, -129], [-78, -137], [-82, -150], [-78, -163], [-67, -171], [-53, -171], [-42, -163], [-38, -150]], count: 18, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-92, 0], [-95, 11], [-104, 17], [-116, 17], [-125, 11], [-128, 0], [-125, -11], [-116, -17], [-104, -17], [-95, -11], [-92, 0]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("ba-to-chuc") }));
  // 3. "cuu-long": theo thanh kéo, đại biểu (son) từ ba nơi trong nước tụ về Hương Cảng; đốm vàng sáng khi hợp nhất (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["cuu-long"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 7, height: ground, seed: 1980, groups: [{ path: [[-120, 120], [110, 50]], count: 3, spread: [1,3], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[-60, -150], [110, 50]], count: 3, spread: [1,3], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-110, 0], [110, 50]], count: 3, spread: [1,3], color: SON, timing: [[0.02,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("cuu-long") }));
  { const S: Pt[] = [[110, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cuu-long") })); }
  // 4. "dong-duong": từ Hương Cảng, các vòng đốm sáng lan dần ra cả Đông Dương (cách điệu) (diễn hoạ).
  const p3 = run("dong-duong", 28);
  { const S: Pt[] = [[150, 50], [138, 78], [110, 90], [82, 78], [70, 50], [82, 22], [110, 10], [138, 22]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.004, 0.25 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-duong") })); }
  { const S: Pt[] = [[198, 68], [177, 110], [139, 135], [92, 138], [50, 117], [25, 79], [22, 32], [43, -10], [81, -35], [128, -38], [170, -17], [195, 21]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.30000000000000004 + i * 0.004, 0.45000000000000007 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-duong") })); }
  { const S: Pt[] = [[239, 105], [208, 150], [163, 180], [109, 190], [55, 179], [10, 148], [-20, 103], [-30, 49], [-19, -5], [12, -50], [57, -80], [111, -90], [165, -79], [210, -48], [240, -3], [250, 51]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.004, 0.65 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-duong") })); }
  { const S: Pt[] = [[-120, 120], [-110, 0], [-60, -150], [-250, 40], [-230, -120]]; world.add(createGlows({ count: S.length, color: SON, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.06, 0.65 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-duong") })); }
};

export default setup;
