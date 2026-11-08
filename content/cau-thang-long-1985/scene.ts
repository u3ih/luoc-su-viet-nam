import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BO_TAY, BO_DONG, CAU } from "./terrain";

type Pt = [number, number];

// Cầu Thăng Long — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khoi-cong","lam-lai","hai-tang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BO_TAY, 48], [BO_DONG, 48]];

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
    seed: 1985,
  });

  // 1. "khoi-cong": chín cột đốm ngà (trụ cầu) mọc giữa sông, ba cột dở dang mờ; người (son) trên hai bờ (diễn hoạ).
  const p0 = run("khoi-cong", 28);
  { const S: Pt[] = [[-100, 0], [-75, 0], [-50, 0], [-25, 0], [0, 0], [25, 0], [50, 0], [75, 0], [100, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  { const S: Pt[] = [[110, 0], [120, 0], [130, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.35 * smoothstep(0.6 + i * 0.05, 0.75 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2015, groups: [{ path: [[-260, -40], [-180, 0]], count: 20, spread: [40,80], color: SON, timing: [[0,1],[1,1]] }, { path: [[260, -40], [190, 0]], count: 20, spread: [40,80], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("khoi-cong") }));
  // 2. "lam-lai": theo thanh kéo, mười lăm nhịp dầm (hàng đốm vàng) lần lượt nối từ bờ tây sang bờ đông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lam-lai"] ?? 0) / 0.9);
  { const S: Pt[] = [[-200, 0], [-186, 0], [-171, 0], [-157, 0], [-142, 0], [-128, 0], [-113, 0], [-99, 0], [-84, 0], [-70, 0], [-55, 0], [-41, 0], [-26, 0], [-12, 0], [3, 0], [17, 0], [32, 0], [46, 0], [61, 0], [75, 0], [90, 0], [104, 0], [119, 0], [133, 0], [148, 0], [162, 0], [177, 0], [191, 0], [206, 0], [220, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lam-lai") })); }
  // 3. "hai-tang": hai tầng đốm sáng: tầng dưới (ngà, đường sắt), tầng trên (vàng, ô tô); chấm sáng (tàu, xe) chạy qua (diễn hoạ).
  const p2 = run("hai-tang", 28);
  { const S: Pt[] = [[-200, 0], [-182, 0], [-163, 0], [-145, 0], [-127, 0], [-109, 0], [-90, 0], [-72, 0], [-54, 0], [-36, 0], [-17, 0], [1, 0], [19, 0], [37, 0], [56, 0], [74, 0], [92, 0], [110, 0], [129, 0], [147, 0], [165, 0], [183, 0], [202, 0], [220, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.003, 0.15 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-tang") })); }
  { const S: Pt[] = [[-200, 0], [-182, 0], [-163, 0], [-145, 0], [-127, 0], [-109, 0], [-90, 0], [-72, 0], [-54, 0], [-36, 0], [-17, 0], [1, 0], [19, 0], [37, 0], [56, 0], [74, 0], [92, 0], [110, 0], [129, 0], [147, 0], [165, 0], [183, 0], [202, 0], [220, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.003, 0.15 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-tang") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 12, seed: 2055, groups: [{ path: [[-200, -3], [220, -3]], count: 6, spread: [2,300], color: "#fff6dc", timing: [[0.02,0],[1,1]] }], progress: p2, visible: () => clock.near("hai-tang") }));
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 26, seed: 2065, groups: [{ path: [[220, 3], [-200, 3]], count: 8, spread: [2,300], color: "#ffd37a", timing: [[0.05,0],[1,1]] }], progress: p2, visible: () => clock.near("hai-tang") }));
  // 4. "ve-sau": đêm: dải đèn trên cầu sáng; tàu xe qua lại (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-200, 0], [-186, 0], [-171, 0], [-157, 0], [-142, 0], [-128, 0], [-113, 0], [-99, 0], [-84, 0], [-70, 0], [-55, 0], [-41, 0], [-26, 0], [-12, 0], [3, 0], [17, 0], [32, 0], [46, 0], [61, 0], [75, 0], [90, 0], [104, 0], [119, 0], [133, 0], [148, 0], [162, 0], [177, 0], [191, 0], [206, 0], [220, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.01, 0.2 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 26, seed: 2085, groups: [{ path: [[-200, 3], [220, 3]], count: 10, spread: [2,300], color: "#fff6dc", timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
