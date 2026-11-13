import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DINH_YT, HOA_YEN, VINH_NGHIEM, CON_SON, KIEP_BAC } from "./terrain";

type Pt = [number, number];

// Yên Tử – Vĩnh Nghiêm – Côn Sơn, Kiếp Bạc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["yen-tu","vinh-nghiem","ho-so","paris"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VINH_NGHIEM, 20], [CON_SON, 16], [KIEP_BAC, 16]];

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
    seed: 2025,
  });

  // 1. "yen-tu": đoàn hành hương (ngà) theo đường núi từ chân núi lên đỉnh Yên Tử; đốm vàng (chùa Đồng) trên đỉnh, đốm ngà ở Hoa Yên (diễn hoạ).
  const p0 = run("yen-tu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2035, groups: [{ path: [[0, 0], [10, 60], [10, 120], [30, 190]], count: 40, spread: [1,4], color: NGHIA, timing: [[0.02,0],[0.9,1]] }], progress: p0, visible: () => clock.near("yen-tu") }));
  { const S: Pt[] = [[10, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("yen-tu") })); }
  { const S: Pt[] = [[30, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("yen-tu") })); }
  // 2. "vinh-nghiem": từ Yên Tử, đốm sáng lan tới Vĩnh Nghiêm (truyền bá) rồi Côn Sơn – Kiếp Bạc (phục hưng); dòng người (ngà) nối các nơi (diễn hoạ).
  const p1 = run("vinh-nghiem", 28);
  { const S: Pt[] = [[10, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vinh-nghiem") })); }
  { const S: Pt[] = [[-140, -40], [60, -110], [120, -90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.2, 0.35 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vinh-nghiem") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2085, groups: [{ path: [[10, 120], [-140, -40]], count: 20, spread: [2,6], color: NGHIA, timing: [[0.1,0],[0.5,1]] }, { path: [[-140, -40], [60, -110], [120, -90]], count: 20, spread: [2,6], color: NGHIA, timing: [[0.45,0],[0.95,1]] }], progress: p1, visible: () => clock.near("vinh-nghiem") }));
  // 3. "ho-so": theo thanh kéo, mười hai điểm di tích (đốm vàng) lần lượt sáng lên, nối Yên Tử với Vĩnh Nghiêm và Côn Sơn – Kiếp Bạc (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ho-so"] ?? 0) / 0.9);
  { const S: Pt[] = [[30, 200], [10, 120], [-30, 140], [50, 100], [70, 150], [-140, -40], [-110, -70], [60, -110], [120, -90], [90, -130], [30, -80], [150, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.075, 0.16999999999999998 + i * 0.075, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-so") })); }
  // 4. "paris": cả mười hai đốm vàng sáng rực; vòng sáng toả ra; người dân (ngà) đứng ở chân núi Yên Tử đón bằng di sản (diễn hoạ).
  const p3 = run("paris", 28);
  { const S: Pt[] = [[30, 200], [10, 120], [-30, 140], [50, 100], [70, 150], [-140, -40], [-110, -70], [60, -110], [120, -90], [90, -130], [30, -80], [150, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[80, 20], [65, 67], [25, 96], [-25, 96], [-65, 67], [-80, 20], [-65, -27], [-25, -56], [25, -56], [65, -27]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.004, 0.44999999999999996 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  { const S: Pt[] = [[147, 50], [124, 104], [83, 145], [29, 167], [-30, 167], [-84, 144], [-125, 103], [-147, 49], [-147, -10], [-124, -64], [-83, -105], [-29, -127], [30, -127], [84, -104], [125, -63], [147, -9]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.004, 0.65 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paris") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2135, groups: [{ path: [[26, 20], [21, 35], [8, 45], [-8, 45], [-21, 35], [-26, 20], [-21, 5], [-8, -5], [8, -5], [21, 5], [26, 20]], count: 60, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("paris") }));
};

export default setup;
