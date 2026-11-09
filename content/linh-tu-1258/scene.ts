import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, HOANG_GIANG, HAI_AP } from "./terrain";

type Pt = [number, number];

// Linh Từ quốc mẫu giữ hậu phương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hai-ap","ly-tran","hoang-giang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 48], [HOANG_GIANG, 44], [HAI_AP, 44]];

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
    seed: 1258,
  });

  // 1. "hai-ap": làng Hải Ấp (đốm ngà); đoàn người (xanh nhạt, thái tử nhà Lý chạy loạn) tìm tới làng (diễn hoạ).
  const p0 = run("hai-ap", 28);
  { const S: Pt[] = [[200, 80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-ap") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1278, groups: [{ path: [[180, 60], [210, 90]], count: 18, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("hai-ap") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1288, groups: [{ path: [[-200, 260], [20, 200], [180, 100]], count: 10, spread: [6,30], color: DICH, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("hai-ap") }));
  // 2. "ly-tran": chấm ngà từ Hải Ấp lên kinh thành (đốm vàng); quân họ Trần (son) tụ về kinh (diễn hoạ).
  const p1 = run("ly-tran", 28);
  { const S: Pt[] = [[-200, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ly-tran") })); }
  world.add(createCrowd({ size: 7, height: ground, seed: 1308, groups: [{ path: [[200, 80], [0, 200], [-185, 255]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p1, visible: () => clock.near("ly-tran") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1318, groups: [{ path: [[250, -100], [0, 150], [-170, 240]], count: 30, spread: [16,60], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: p1, visible: () => clock.near("ly-tran") }));
  // 3. "hoang-giang": theo thanh kéo, thuyền gia quyến (đốm vàng, ngà) xuôi từ kinh thành về Hoàng Giang; quân Mông Cổ (xanh nhạt) tiến tới kinh thành; cuối cùng các thuyền chở quân khí (đốm son) tụ lại (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["hoang-giang"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 1328, groups: [{ path: [[-150, 260], [-40, 80], [40, -100], [100, -160]], count: 6, spread: [6,40], color: NGHIA, timing: [[0,0],[0.75,1]] }, { path: [[-150, 260], [-40, 80], [60, -120]], count: 1, spread: [3,3], color: GOLD, timing: [[0.02,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("hoang-giang") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1338, groups: [{ path: [[-300, 400], [-200, 280]], count: 40, spread: [20,60], color: DICH, timing: [[0.15,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("hoang-giang") }));
  { const S: Pt[] = [[148, -170], [134, -146], [106, -146], [92, -170], [106, -194], [134, -194]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.02, 0.9500000000000001 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoang-giang") })); }
  // 4. "ve-sau": đền thờ (đốm vàng) ở quê Hải Ấp; người đến lễ (son) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[200, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1368, groups: [{ path: [[80, -40], [190, 70]], count: 18, spread: [10,40], color: SON, timing: [[0.15,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
