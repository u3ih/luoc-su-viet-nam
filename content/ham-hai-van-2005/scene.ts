import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUE, DA_NANG, CUA_BAC, CUA_NAM } from "./terrain";

type Pt = [number, number];

// Hầm đường bộ Hải Vân — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["deo","dao-ham","khanh-thanh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

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
    seed: 2012,
  });

  // 1. "deo": xe (chấm ngà) chậm chạp bò qua con đèo quanh co vắt qua núi (diễn hoạ).
  const p0 = run("deo", 28);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 2022, groups: [{ path: [[180, 300], [150, 120], [110, 60], [160, 20], [120, -20], [170, -60], [140, -150], [120, -320]], count: 8, spread: [4,300], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("deo") }));
  // 2. "dao-ham": theo thanh kéo, hai cửa hầm (đốm vàng) sáng, rồi đường hầm (chuỗi đốm vàng) xuyên núi từ hai đầu gặp nhau; công nhân (son) ở hai cửa (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dao-ham"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 95], [-40, -95]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-ham") })); }
  { const S: Pt[] = [[-40, 85], [-40, 69], [-40, 53], [-40, 37], [-40, 21], [-40, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-ham") })); }
  { const S: Pt[] = [[-40, -85], [-40, -69], [-40, -53], [-40, -37], [-40, -21], [-40, -5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-ham") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2062, groups: [{ path: [[-60, 130], [-40, 105]], count: 14, spread: [10,20], color: SON, timing: [[0,1],[1,1]] }, { path: [[-60, -130], [-40, -105]], count: 14, spread: [10,20], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dao-ham") }));
  // 3. "khanh-thanh": đường hầm sáng trọn (đốm vàng); xe (xanh nhạt) nối nhau qua hầm (diễn hoạ).
  const p2 = run("khanh-thanh", 28);
  { const S: Pt[] = [[-40, 95], [-40, 78], [-40, 60], [-40, 43], [-40, 26], [-40, 9], [-40, -9], [-40, -26], [-40, -43], [-40, -60], [-40, -78], [-40, -95]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khanh-thanh") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 2082, groups: [{ path: [[-150, 300], [-40, 110], [-40, -110], [100, -320]], count: 12, spread: [4,500], color: DICH, timing: [[0.05,0],[1,1]] }], progress: p2, visible: () => clock.near("khanh-thanh") }));
  // 4. "ve-sau": hầm thứ hai (chuỗi đốm ngà) sáng song song bên cạnh hầm cũ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-40, 95], [-40, 78], [-40, 60], [-40, 43], [-40, 26], [-40, 9], [-40, -9], [-40, -26], [-40, -43], [-40, -60], [-40, -78], [-40, -95]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-25, 95], [-25, 78], [-25, 60], [-25, 43], [-25, 26], [-25, 9], [-25, -9], [-25, -26], [-25, -43], [-25, -60], [-25, -78], [-25, -95]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.04, 0.35 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
