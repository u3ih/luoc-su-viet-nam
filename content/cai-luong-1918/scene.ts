import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MY_THO, VINH_LONG, SA_DEC, SAI_GON } from "./terrain";

type Pt = [number, number];

// Cải lương ra đời — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tai-tu","ca-ra-bo","dem-1918","lan-rong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[MY_THO, 32], [VINH_LONG, 24], [SA_DEC, 24], [SAI_GON, 44]];

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
    seed: 1918,
  });

  // 1. "tai-tu": vòng nhỏ đốm ngà (ban đờn ca tài tử) ở Mỹ Tho; người nghe (son) ngồi vòng ngoài (diễn hoạ).
  const p0 = run("tai-tu", 28);
  { const S: Pt[] = [[-50, -40], [-55, -31], [-65, -31], [-70, -40], [-65, -49], [-55, -49]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tai-tu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1938, groups: [{ path: [[-28, -40], [-30, -29], [-35, -19], [-44, -12], [-54, -8], [-66, -8], [-76, -12], [-85, -19], [-90, -29], [-92, -40], [-90, -51], [-85, -61], [-76, -68], [-66, -72], [-54, -72], [-44, -68], [-35, -61], [-30, -51], [-28, -40]], count: 50, spread: [1,4], color: SON, drop: true, timing: [[0,0],[0.9,1]] }], progress: p0, visible: () => clock.near("tai-tu") }));
  // 2. "ca-ra-bo": một người khách (chấm ngà) theo đường xe lửa về Vĩnh Long; ở đó đốm vàng (ca ra bộ) sáng; sau đó gánh xiếc Sa Đéc (đốm ngà) sáng (diễn hoạ).
  const p1 = run("ca-ra-bo", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1948, groups: [{ path: [[-60, -40], [-150, -100], [-225, -155]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.45,1]] }], progress: p1, visible: () => clock.near("ca-ra-bo") }));
  { const S: Pt[] = [[-230, -160]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ca-ra-bo") })); }
  { const S: Pt[] = [[-290, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ca-ra-bo") })); }
  // 3. "dem-1918": theo thanh kéo, hàng đốm vàng (màn sân khấu) mở dần từ giữa ra; gánh hát (ngà) bước lên; khán giả (son) ngồi kín (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dem-1918"] ?? 0) / 0.9);
  { const S: Pt[] = [[140, 155], [130, 155], [150, 155], [120, 155], [160, 155], [110, 155], [170, 155]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.1, 0.16999999999999998 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-1918") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1988, groups: [{ path: [[100, 175], [140, 150]], count: 10, spread: [3,10], color: NGHIA, timing: [[0.5,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dem-1918") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1998, groups: [{ path: [[90, 80], [190, 80]], count: 40, spread: [2,22], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dem-1918") }));
  // 4. "lan-rong": đốm vàng lan dần từ Sài Gòn lên phía bắc (cải lương lan ra Bắc); các gánh hát (ngà) đi các nơi (diễn hoạ).
  const p3 = run("lan-rong", 28);
  { const S: Pt[] = [[140, 130], [113, 170], [87, 210], [60, 250], [27, 290], [-7, 330], [-40, 370]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.1, 0.25 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lan-rong") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2018, groups: [{ path: [[-60, -40], [140, 120]], count: 12, spread: [3,10], color: NGHIA, timing: [[0.04,0],[0.6,1]] }, { path: [[140, 130], [-30, 320]], count: 12, spread: [3,10], color: NGHIA, timing: [[0.3,0],[0.95,1]] }], progress: p3, visible: () => clock.near("lan-rong") }));
};

export default setup;
