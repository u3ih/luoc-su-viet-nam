import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHIEU_NAM, MY_HOA, NGHIA_TRANG, BEN } from "./terrain";

type Pt = [number, number];

// Đám tang Phan Châu Trinh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ve-nuoc","dien-thuyet","dam-tang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHIEU_NAM, 56], [MY_HOA, 44], [NGHIA_TRANG, 56]];

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
    seed: 1926,
  });

  // 1. "ve-nuoc": tàu (đốm ngà) từ biển ngược sông Sài Gòn cập bến; người đón (son) chờ trên bến (diễn hoạ).
  const p0 = run("ve-nuoc", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1936, groups: [{ path: [[390, -310], [290, -100], [255, -45]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("ve-nuoc") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1946, groups: [{ path: [[200, -20], [225, -40]], count: 24, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("ve-nuoc") }));
  // 2. "dien-thuyet": thanh niên (son) tụ về nghe diễn thuyết ở nhà Mỹ Hoà (đốm ngà) (diễn hoạ).
  const p1 = run("dien-thuyet", 28);
  { const S: Pt[] = [[-40, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dien-thuyet") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1966, groups: [{ path: [[150, -120], [-30, -190]], count: 20, spread: [10,40], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-200, -100], [-50, -190]], count: 18, spread: [10,40], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p1, visible: () => clock.near("dien-thuyet") }));
  // 3. "dam-tang": theo thanh kéo, đoàn người đưa tang (son, ngà) nối dài từ Chiêu Nam Lầu tới nghĩa trang; đốm vàng (linh cữu) đi đầu (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dam-tang"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 3, seed: 1976, groups: [{ path: [[120, -40], [20, 40], [-100, 130], [-200, 195]], count: 1, spread: [3,3], color: GOLD, timing: [[0.02,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dam-tang") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1986, groups: [{ path: [[120, -40], [20, 40], [-100, 130], [-190, 190]], count: 60, spread: [20,220], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dam-tang") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1996, groups: [{ path: [[130, -60], [30, 20], [-90, 110], [-180, 180]], count: 30, spread: [20,180], color: NGHIA, timing: [[0.1,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dam-tang") }));
  // 4. "ve-sau": mộ (đốm vàng); lễ truy điệu ở khắp nơi (đốm ngà toả ra xa) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-210, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-300, 330], [100, 350], [320, 250], [-330, -50], [0, -330], [300, -300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.1, 0.35 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
