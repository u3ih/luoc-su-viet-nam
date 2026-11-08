import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NHA_TRANG, SUOI_DAU, LAM_VIEN, DI_LINH, TU_NAM } from "./terrain";

type Pt = [number, number];

// Yersin và cao nguyên Lâm Viên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nha-trang","lam-vien","dich-hach","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NHA_TRANG, 40]];

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
    counts: { trees: 800, bushes: 600, grass: 1800, reeds: 400 },
    forestAt: 0.48,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1893,
  });

  // 1. "nha-trang": đoàn thám hiểm (chấm ngà) rời Nha Trang theo đường núi đi về phía tây (diễn hoạ).
  const p0 = run("nha-trang", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1903, groups: [{ path: [NHA_TRANG, [100, -60], [0, 0], [-200, -40], [-395, -60]], count: 7, spread: [8,40], color: NGHIA, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("nha-trang") }));
  // 2. "lam-vien": đoàn thám hiểm (chấm ngà) từ phía nam qua Di Linh lên cao nguyên Lâm Viên theo thanh kéo; các làng người Lạch (son) trên cao nguyên; đốm vàng sáng ở Lâm Viên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lam-vien"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1913, groups: [{ path: [TU_NAM, DI_LINH, [-170, 0], LAM_VIEN], count: 6, spread: [8,40], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lam-vien") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1923, groups: [{ path: [[-230, 180], [-220, 175]], count: 10, spread: [30,20], color: SON, timing: [[0,1],[1,1]] }, { path: [[-150, 140], [-145, 135]], count: 8, spread: [26,20], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lam-vien") }));
  { const S: Pt[] = [LAM_VIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lam-vien") })); }
  // 3. "dich-hach": đốm vàng (phòng thí nghiệm) sáng ở Nha Trang, rồi ở Suối Dầu; người (son) tụ đến (diễn hoạ).
  const p2 = run("dich-hach", 28);
  { const S: Pt[] = [NHA_TRANG, SUOI_DAU]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.35, 0.2 + i * 0.35, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dich-hach") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1953, groups: [{ path: [[100, -200], NHA_TRANG], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[150, -320], SUOI_DAU], count: 10, spread: [26,50], color: SON, timing: [[0.4,0],[1,1]] }], progress: p2, visible: () => clock.near("dich-hach") }));
  // 4. "ve-sau": các đốm vàng (thành phố mới) sáng dần trên cao nguyên Lâm Viên; một đốm ngà đi từ cao nguyên về Nha Trang (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-150, 160], [-162, 188], [-190, 200], [-218, 188], [-230, 160], [-218, 132], [-190, 120], [-162, 132], [-175, 160], [-190, 175], [-205, 160], [-190, 145]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1973, groups: [{ path: [LAM_VIEN, [0, 0], NHA_TRANG], count: 1, spread: [3,3], color: NGHIA, timing: [[0.4,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
