import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAN } from "./terrain";

type Pt = [number, number];

// Nghệ thuật Bài chòi Trung Bộ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["choi-canh","hoi-choi","ho-thai","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAN, 48]];

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
    seed: 2017,
  });

  // 1. "choi-canh": chòi canh (đốm ngà) dọc bìa rừng; thú dữ (xanh nhạt) từ rừng xuống ruộng rồi bị xua về (diễn hoạ).
  const p0 = run("choi-canh", 28);
  { const S: Pt[] = [[-190, 200], [-194, 144], [-198, 88], [-196, 32], [-188, -24], [-180, -80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.06, 0.16999999999999998 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("choi-canh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2037, groups: [{ path: [[-300, 60], [-120, 40], [-300, 50]], count: 12, spread: [10,40], color: DICH, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("choi-canh") }));
  // 2. "hoi-choi": theo thanh kéo, mười chòi hai bên và chòi mẹ ở giữa (đốm vàng) lần lượt sáng; dân (son) tụ về sân hội (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hoi-choi"] ?? 0) / 0.9);
  { const S: Pt[] = [[-20, -20], [0, -20], [20, -20], [40, -20], [60, -20], [-20, 60], [0, 60], [20, 60], [40, 60], [60, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.07, 0.16999999999999998 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-choi") })); }
  { const S: Pt[] = [[-40, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-choi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2067, groups: [{ path: [[200, -100], [20, 20]], count: 30, spread: [10,50], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hoi-choi") }));
  // 3. "ho-thai": anh hiệu (đốm ngà) đi giữa hai dãy chòi hô thai; chòi trúng (đốm vàng) sáng lên (diễn hoạ).
  const p2 = run("ho-thai", 28);
  { const S: Pt[] = [[-20, -20], [0, -20], [20, -20], [40, -20], [60, -20], [-20, 60], [0, 60], [20, 60], [40, 60], [60, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.45 * smoothstep(0 + i * 0.003, 0.15 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-thai") })); }
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 2087, groups: [{ path: [[-30, 20], [60, 20], [0, 20], [40, 20]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.02,0],[0.9,1]] }], progress: p2, visible: () => clock.near("ho-thai") }));
  { const S: Pt[] = [[40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-thai") })); }
  // 4. "ve-sau": hội chòi sáng rực; người (son) quây quanh sân hội (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, -20], [0, -20], [20, -20], [40, -20], [60, -20], [-20, 60], [0, 60], [20, 60], [40, 60], [60, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2117, groups: [{ path: [[90, 20], [85, 47], [69, 69], [47, 85], [20, 90], [-7, 85], [-29, 69], [-45, 47], [-50, 20], [-45, -7], [-29, -29], [-7, -45], [20, -50], [47, -45], [69, -29], [85, -7], [90, 20]], count: 70, spread: [4,300], color: SON, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
