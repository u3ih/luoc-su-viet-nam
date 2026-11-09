import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAU_TRUC, BAI_NUNG } from "./terrain";

type Pt = [number, number];

// Nghệ thuật làm gốm của người Chăm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bau-truc","nan-gom","nung-gom","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAU_TRUC, 48], [BAI_NUNG, 24]];

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
    counts: { trees: 250, bushes: 500, grass: 1500, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2022,
  });

  // 1. "bau-truc": người (son) từ sông Quao gánh đất sét về làng gốm (đốm ngà) (diễn hoạ).
  const p0 = run("bau-truc", 28);
  { const S: Pt[] = [[0, 0], [25, 15], [-20, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bau-truc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2042, groups: [{ path: [[-60, 170], [-20, 80], [0, 10]], count: 20, spread: [4,120], color: SON, timing: [[0.03,0],[0.85,1]] }], progress: p0, visible: () => clock.near("bau-truc") }));
  // 2. "nan-gom": theo thanh kéo, những người thợ (chấm ngà) đi vòng quanh bàn gốm; dáng gốm (đốm vàng) cao dần (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nan-gom"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 2052, groups: [{ path: [[-9, 0], [-10, 4], [-13, 6], [-17, 6], [-20, 4], [-21, 0], [-20, -4], [-17, -6], [-13, -6], [-10, -4], [-9, 0]], count: 1, spread: [1,1], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [[21, 5], [20, 9], [17, 11], [13, 11], [10, 9], [9, 5], [10, 1], [13, -1], [17, -1], [20, 1], [21, 5]], count: 1, spread: [1,1], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [[6, 25], [5, 29], [2, 31], [-2, 31], [-5, 29], [-6, 25], [-5, 21], [-2, 19], [2, 19], [5, 21], [6, 25]], count: 1, spread: [1,1], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nan-gom") }));
  { const S: Pt[] = [[-15, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[-15, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[-15, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[15, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[15, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[15, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[0, 25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[0, 25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  { const S: Pt[] = [[0, 25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nan-gom") })); }
  // 3. "nung-gom": gốm xếp thành đống, phủ rơm củi rồi nung lộ thiên (lửa) trên bãi (diễn hoạ).
  const p2 = run("nung-gom", 28);
  { const S: Pt[] = [[66, -74], [70, -74], [74, -74], [66, -70], [70, -70], [74, -70], [66, -66], [70, -66], [74, -66]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (1 - smoothstep(0.4, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nung-gom") })); }
  world.add(createFires({ sites: [[70, -70], [66, -66], [74, -74], [66, -74], [74, -66]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.4 })), lit: () => clock.near("nung-gom") * smoothstep(0.35, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": làng gốm (đốm vàng) trong chiều; người (son) qua lại (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-11, -14], [3, -14], [17, -14], [31, -14], [-11, 0], [3, 0], [17, 0], [31, 0], [-11, 14], [3, 14], [17, 14], [31, 14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2182, groups: [{ path: [[200, -100], [20, 0]], count: 20, spread: [6,60], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
