import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NAM_SACH, CHU_DAU, BEN_XA } from "./terrain";

type Pt = [number, number];

// Chu Đậu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chiec-binh", "tim-lai", "den-noi-xa"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHU_DAU, 55], [NAM_SACH, 55], [BEN_XA, 55]];

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
    seed: 1450,
  });

  // 1. "chiec-binh": các nhóm người (son) tụ về Nam Sách, một đốm ngà sáng dần, vài lửa lò bật lên (diễn hoạ).
  const p0 = run("chiec-binh", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1450, groups: [{ path: [[-330, 300], [-250, 240], NAM_SACH], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-100, 60], [-130, 120], NAM_SACH], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("chiec-binh") }));
  { const S: Pt[] = [NAM_SACH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chiec-binh") })); }
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring(NAM_SACH, 28, (i / 4) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: () => clock.near("chiec-binh") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "tim-lai": các lò lửa ở Chu Đậu nhóm lên dần theo thanh kéo, các nhóm người (son) tụ về làng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nung-lo"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1460, groups: [{ path: [NAM_SACH, [-80, 90], CHU_DAU], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[130, 60], [80, 10], CHU_DAU], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tim-lai") }));
  { const S: Pt[] = [CHU_DAU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tim-lai") })); }
  world.add(createFires({ sites: Array.from({ length: 9 }, (_, i) => { const [x, z] = ring(CHU_DAU, 30, (i / 9) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 9, size: 1.1 }; }), lit: (ctx) => clock.near("tim-lai") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "den-noi-xa": đoàn người (son) đi từ Chu Đậu dọc sông ra bến xa; đốm vàng sáng ở bến (diễn hoạ).
  const p2 = run("den-noi-xa", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1470, groups: [{ path: [CHU_DAU, [100, -40], [150, -110], BEN_XA], count: 24, spread: [30,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p2, visible: () => clock.near("den-noi-xa") }));
  { const S: Pt[] = [BEN_XA]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("den-noi-xa") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(CHU_DAU, 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("den-noi-xa") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
};

export default setup;
