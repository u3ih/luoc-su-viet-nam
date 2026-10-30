import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, BAI_GIUA, GIA_LAM } from "./terrain";

type Pt = [number, number];

// Cầu Long Biên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dau-thau", "dung-cau", "thong-xe", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 55], [BAI_GIUA, 55], [GIA_LAM, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1898,
  });

  // 1. "dau-thau": các nhóm người (son) tụ về bờ Hà Nội, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("dau-thau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1898, groups: [{ path: [[-330, 150], [-250, 60], HA_NOI], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-250, -160], [-220, -70], HA_NOI], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("dau-thau") }));
  { const S: Pt[] = [HA_NOI]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dau-thau") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(HA_NOI, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("dau-thau") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "dung-cau": các toán thợ (son) từ hai bờ đi ra giữa sông theo thanh kéo, đốm ngà sáng dần dọc tuyến ngang sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bac-cau"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1908, groups: [{ path: [[-190, 0], [-120, 0], [-50, 0], [10, 0], [70, 0], [140, 5], [210, 10]], count: 26, spread: [20,30], color: SON, timing: [[0,0],[0.5,0.5]] }, { path: [[210, 10], [140, 5], [70, 0], [10, 0], [-50, 0], [-120, 0], [-190, 0]], count: 26, spread: [20,30], color: SON, timing: [[0,0],[0.5,0.5]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dung-cau") }));
  { const S: Pt[] = [[-120, 0], [-50, 0], [10, 0], [70, 0], [140, 5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.14, 0.16999999999999998 + i * 0.14, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-cau") })); }
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring(HA_NOI, 28, (i / 4) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: (ctx) => clock.near("dung-cau") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "thong-xe": dòng người (son) qua lại giữa hai bờ, một dải ánh sáng vàng dọc tuyến ngang sông (diễn hoạ).
  const p2 = run("thong-xe", 28);
  { const S: Pt[] = [[-190, 0], [-120, 0], [-50, 0], [10, 0], [70, 0], [140, 5], [210, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.08, 0.15 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1918, groups: [{ path: [[-190, 0], [-120, 0], [-50, 0], [10, 0], [70, 0], [140, 5], [210, 10]], count: 16, spread: [18,26], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[210, 10], [140, 5], [70, 0], [10, 0], [-50, 0], [-120, 0], [-190, 0]], count: 16, spread: [18,26], color: SON, timing: [[0.14,0],[0.85,1]] }], progress: p2, visible: () => clock.near("thong-xe") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(GIA_LAM, 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("thong-xe") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": dải ánh sáng vàng dọc tuyến sáng rồi dịu bớt, các nhóm người (son) từ hai bờ ra đứng giữa tuyến, đốm vàng sáng lại (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-190, 0], [-120, 0], [-50, 0], [10, 0], [70, 0], [140, 5], [210, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.05, 0.15 + i * 0.05, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1928, groups: [{ path: [[-100, 0], [10, 0]], count: 14, spread: [20,26], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[200, 10], [80, 3], [10, 0]], count: 14, spread: [20,26], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [BAI_GIUA]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0, 0.75 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(GIA_LAM, 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
