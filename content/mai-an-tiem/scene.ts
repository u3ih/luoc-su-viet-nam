import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BO, DAO_AN_TIEM } from "./terrain";

type Pt = [number, number];

// Mai An Tiêm và quả dưa hấu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bi-day","hat-giong","trao-doi","ve-sau"]);
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
    counts: { trees: 300, bushes: 400, grass: 1200, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 665,
  });

  // 1. "bi-day": thuyền (chấm ngà, vợ chồng An Tiêm) rời bờ bắc ra hòn đảo giữa biển (diễn hoạ).
  const p0 = run("bi-day", 28);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 675, groups: [{ path: [[-160, 230], [-80, 100], [-40, 20]], count: 2, spread: [3,6], color: NGHIA, timing: [[0.05,0],[0.85,1]] }], progress: p0, visible: () => clock.near("bi-day") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 685, groups: [{ path: [[-200, 300], [-170, 250]], count: 14, spread: [20,20], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("bi-day") }));
  // 2. "hat-giong": theo thanh kéo, đốm vàng (chim mang hạt) bay tới đảo; ruộng dưa (đốm vàng nhỏ) lan dần trên đảo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hat-giong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 28, seed: 695, groups: [{ path: [[300, 200], [120, 40], [10, -40]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.3,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hat-giong") }));
  { const S: Pt[] = [[-20, -78], [-8, -78], [4, -78], [16, -78], [28, -78], [40, -78], [-20, -66], [-8, -66], [4, -66], [16, -66], [28, -66], [40, -66], [-20, -54], [-8, -54], [4, -54], [16, -54], [28, -54], [40, -54], [-20, -42], [-8, -42], [4, -42], [16, -42], [28, -42], [40, -42]]; world.add(createGlows({ count: S.length, color: GOLD, size: 5, minPx: 8, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.025, 0.44999999999999996 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hat-giong") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 715, groups: [{ path: [[-20, -30], [10, -55]], count: 2, spread: [3,6], color: NGHIA, timing: [[0.25,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hat-giong") }));
  // 3. "trao-doi": thuyền (xanh nhạt) từ nhiều phía tìm tới đảo đổi dưa (diễn hoạ).
  const p2 = run("trao-doi", 28);
  { const S: Pt[] = [[-20, -78], [-8, -78], [4, -78], [16, -78], [28, -78], [40, -78], [-20, -66], [-8, -66], [4, -66], [16, -66], [28, -66], [40, -66], [-20, -54], [-8, -54], [4, -54], [16, -54], [28, -54], [40, -54], [-20, -42], [-8, -42], [4, -42], [16, -42], [28, -42], [40, -42]]; world.add(createGlows({ count: S.length, color: GOLD, size: 5, minPx: 8, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trao-doi") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 735, groups: [{ path: [[350, -200], [90, -60]], count: 3, spread: [10,30], color: DICH, timing: [[0.05,0],[0.7,1]] }, { path: [[-350, -250], [-100, -80]], count: 3, spread: [10,30], color: DICH, timing: [[0.1,0],[0.75,1]] }, { path: [[200, 250], [50, 40]], count: 3, spread: [10,30], color: DICH, timing: [[0.15,0],[0.8,1]] }], progress: p2, visible: () => clock.near("trao-doi") }));
  // 4. "ve-sau": thuyền (đốm vàng) đưa vợ chồng An Tiêm về đất liền; đốm ngà (đền thờ) dưới chân núi; dân (son) dự hội (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 745, groups: [{ path: [[-40, 20], [-80, 100], [-160, 230]], count: 2, spread: [3,6], color: GOLD, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-70, -10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 765, groups: [{ path: [[-20, -20], [-25, 0], [-40, 15], [-60, 20], [-80, 15], [-95, 0], [-100, -20], [-95, -40], [-80, -55], [-60, -60], [-40, -55], [-25, -40], [-20, -20]], count: 40, spread: [4,120], color: SON, timing: [[0.6,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
