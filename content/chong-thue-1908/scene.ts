import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAI_LOC, PHIEM_AI, VINH_DIEN, HOI_AN, BAC, NAM, CON_DAO } from "./terrain";

type Pt = [number, number];

// Phong trào chống sưu thuế Trung Kỳ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguyen-nhan","hoi-an","lan-rong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DAI_LOC, 40], [HOI_AN, 48]];

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
    seed: 1908,
  });

  // 1. "nguyen-nhan": dân phu (son) dàn hàng dọc con đường từ Đại Lộc đi tỉnh lỵ; đốm vàng ở Phiếm Ái (nơi bàn làm đơn) (diễn hoạ).
  const p0 = run("nguyen-nhan", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1918, groups: [{ path: [DAI_LOC, [-100, 70], [20, 50]], count: 40, spread: [6,6], color: SON, drop: true, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("nguyen-nhan") }));
  { const S: Pt[] = [PHIEM_AI]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-nhan") })); }
  // 2. "hoi-an": đoàn người (son) từ Đại Lộc qua bến đò Vĩnh Điện về Hội An theo thanh kéo, người hai bên đường nhập vào, đốm vàng ở Hội An (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hoi-an"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1938, groups: [{ path: [DAI_LOC, [-80, 40], VINH_DIEN, [180, -30]], count: 40, spread: [24,120], color: SON, timing: [[0,0],[1,1]] }, { path: [[-100, 200], [-80, 60], VINH_DIEN, [170, -20]], count: 24, spread: [24,80], color: SON, timing: [[0.2,0],[1,0.95]] }, { path: [[0, -180], VINH_DIEN, [175, -40]], count: 24, spread: [24,80], color: SON, timing: [[0.35,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hoi-an") }));
  { const S: Pt[] = [HOI_AN]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-an") })); }
  // 3. "lan-rong": những đốm vàng (các tỉnh hưởng ứng) sáng dần ở phía bắc và phía nam; các đoàn người (son) đi từ nhiều ngả (diễn hoạ).
  const p2 = run("lan-rong", 28);
  { const S: Pt[] = [[100, 330], [0, 250], [-120, 300], [100, -250], [20, -330], [-80, -280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lan-rong") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1968, groups: [{ path: [BAC, [60, 200]], count: 24, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [NAM, [60, -200]], count: 24, spread: [26,50], color: SON, timing: [[0.15,0],[0.95,1]] }], progress: p2, visible: () => clock.near("lan-rong") }));
  // 4. "ve-sau": những chấm xanh nhạt (người bị đày) theo thuyền rời Hội An ra biển xa; người (son) đứng lặng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1978, groups: [{ path: [HOI_AN, [300, -100], CON_DAO], count: 10, spread: [10,40], color: DICH, timing: [[0.03,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1988, groups: [{ path: [[190, -10], [210, -20]], count: 18, spread: [40,20], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
