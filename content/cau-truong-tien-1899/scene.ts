import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAC, NAM } from "./terrain";

type Pt = [number, number];

// Cầu Trường Tiền — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cau-mong","xay-cau","lu-nam-thin","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAC, 36], [NAM, 36]];

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
    seed: 1899,
  });

  // 1. "cau-mong": chuỗi đốm ngà mờ (cầu Mây, cầu Mống) vắt qua sông; người (son) qua lại (diễn hoạ).
  const p0 = run("cau-mong", 28);
  { const S: Pt[] = [[0, -55], [0, -41], [0, -27], [0, -14], [0, 0], [0, 14], [0, 28], [0, 41], [0, 55]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cau-mong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1919, groups: [{ path: [[0, -70], [0, 70]], count: 12, spread: [2,4], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("cau-mong") }));
  // 2. "xay-cau": theo thanh kéo, bảy trụ (đốm vàng) lần lượt sáng nối hai bờ thành sáu nhịp; thợ (son) đứng hai đầu cầu (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-cau"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, -60], [0, -40], [0, -20], [0, 0], [0, 20], [0, 40], [0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-cau") })); }
  { const S: Pt[] = [[0, -50], [0, -30], [0, -10], [0, 10], [0, 30], [0, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-cau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1949, groups: [{ path: [[-40, 80], [40, 80]], count: 16, spread: [3,8], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-40, -80], [40, -80]], count: 16, spread: [3,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-cau") }));
  // 3. "lu-nam-thin": dòng lũ (chấm xanh nhạt) cuốn qua; bốn nhịp giữa tắt rồi sáng lại khi cầu được làm lại (diễn hoạ).
  const p2 = run("lu-nam-thin", 28);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 1, seed: 1959, groups: [{ path: [[-380, 0], [380, 0]], count: 50, spread: [10,34], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p2, visible: () => clock.near("lu-nam-thin") }));
  { const S: Pt[] = [[0, -60], [0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lu-nam-thin") })); }
  { const S: Pt[] = [[0, -40], [0, -20], [0, 0], [0, 20], [0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.28, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lu-nam-thin") })); }
  { const S: Pt[] = [[0, -40], [0, -20], [0, 0], [0, 20], [0, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.06, 0.75 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lu-nam-thin") })); }
  // 4. "ve-sau": cầu sáng đèn đổi màu (đốm vàng và ngà xen nhau); người qua cầu hai chiều (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, -60], [0, -40], [0, -20], [0, 0], [0, 20], [0, 40], [0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 7, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, -50], [0, -30], [0, -10], [0, 10], [0, 30], [0, 50]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 7, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.03, 0.44999999999999996 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2019, groups: [{ path: [[0, -75], [0, 75]], count: 14, spread: [2,3], color: SON, timing: [[0,0],[0.9,1]] }, { path: [[3, 75], [3, -75]], count: 14, spread: [2,3], color: SON, timing: [[0.1,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
