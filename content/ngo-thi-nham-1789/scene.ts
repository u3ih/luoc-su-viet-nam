import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, TA_THANH_OAI, TAM_DIEP } from "./terrain";

type Pt = [number, number];

// Ngô Thì Nhậm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ta-thanh-oai","tam-diep","bang-giao","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 52], [TA_THANH_OAI, 36], [TAM_DIEP, 48]];

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
    seed: 1790,
  });

  // 1. "ta-thanh-oai": làng Tả Thanh Oai (đốm ngà); chấm ngà (Ngô Thì Nhậm) lên kinh thành rồi rời kinh về phía nam lánh mình (diễn hoạ).
  const p0 = run("ta-thanh-oai", 28);
  { const S: Pt[] = [[-120, 140]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ta-thanh-oai") })); }
  world.add(createCrowd({ size: 7, height: ground, seed: 1810, groups: [{ path: [[-120, 140], [60, 250], [40, 150], [-60, -100]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.9,1]] }], progress: p0, visible: () => clock.near("ta-thanh-oai") }));
  { const S: Pt[] = [[80, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ta-thanh-oai") })); }
  // 2. "tam-diep": theo thanh kéo, quân Tây Sơn (son) rời Thăng Long lui về Tam Điệp; quân Thanh (xanh nhạt) từ phía bắc vào kinh thành (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tam-diep"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1830, groups: [{ path: [[80, 260], [20, 50], [-20, -190]], count: 40, spread: [16,70], color: SON, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tam-diep") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1840, groups: [{ path: [[330, 400], [120, 300], [80, 260]], count: 50, spread: [20,80], color: DICH, timing: [[0.45,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tam-diep") }));
  { const S: Pt[] = [[-20, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tam-diep") })); }
  // 3. "bang-giao": sứ bộ (chấm ngà) rời Thăng Long lên phía bắc; thư từ bang giao (đốm vàng) qua lại (diễn hoạ).
  const p2 = run("bang-giao", 28);
  { const S: Pt[] = [[80, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bang-giao") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1870, groups: [{ path: [[80, 260], [200, 360], [300, 420]], count: 6, spread: [4,20], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p2, visible: () => clock.near("bang-giao") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 20, seed: 1880, groups: [{ path: [[80, 260], [250, 400]], count: 3, spread: [3,40], color: GOLD, timing: [[0.3,0],[0.9,1]] }], progress: p2, visible: () => clock.near("bang-giao") }));
  // 4. "ve-sau": thiền viện (đốm vàng) ở chốn yên tĩnh; một chấm ngà (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-160, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 7, height: ground, seed: 1900, groups: [{ path: [[-80, 120], [-150, 70]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.1,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
