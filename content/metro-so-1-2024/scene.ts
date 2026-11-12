import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BEN_THANH, SUOI_TIEN, DEPOT } from "./terrain";

type Pt = [number, number];

// Tuyến metro số 1 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["du-an","cham-tre","tuyen","van-hanh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BEN_THANH, 32], [SUOI_TIEN, 32], [DEPOT, 24]];

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
    seed: 2024,
  });

  // 1. "du-an": hai đầu tuyến (đốm vàng) sáng; một đường đốm ngà mờ (tuyến quy hoạch) nối hai đầu (diễn hoạ).
  const p0 = run("du-an", 28);
  { const S: Pt[] = [[-260, -160], [250, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.2, 0.2 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("du-an") })); }
  { const S: Pt[] = [[-260, -160], [-220, -135], [-180, -111], [-140, -86], [-105, -62], [-71, -37], [-37, -12], [-5, 12], [26, 37], [57, 62], [93, 92], [145, 138], [198, 184], [250, 230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.5 * smoothstep(0.4 + i * 0.02, 0.55 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("du-an") })); }
  // 2. "cham-tre": thợ (son) làm dọc tuyến; các trụ, ga (đốm vàng) mọc lên chậm rãi (diễn hoạ).
  const p1 = run("cham-tre", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2054, groups: [{ path: [[-260, -160], [-20, 0], [250, 230]], count: 70, spread: [4,14], color: SON, drop: true, timing: [[0,0],[0.9,1]] }], progress: p1, visible: () => clock.near("cham-tre") }));
  { const S: Pt[] = [[-260, -160], [-220, -135], [-180, -111], [-140, -86], [-105, -62], [-71, -37], [-37, -12], [-5, 12], [26, 37], [57, 62], [93, 92], [145, 138], [198, 184], [250, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.055, 0.25 + i * 0.055, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cham-tre") })); }
  // 3. "tuyen": theo thanh kéo, đoàn tàu (chuỗi chấm vàng) chạy từ Bến Thành, ba ga ngầm (đốm thấp), qua sông lên cao tới Suối Tiên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tuyen"] ?? 0) / 0.9);
  { const S: Pt[] = [[-260, -160], [-220, -135], [-180, -111]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuyen") })); }
  { const S: Pt[] = [[-140, -86], [-105, -62], [-71, -37], [-37, -12], [-5, 12], [26, 37], [57, 62], [93, 92], [145, 138], [198, 184], [250, 230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuyen") })); }
  world.add(createCrowd({ glow: true, size: 11, height: (x, z) => ground(x, z) + 12, seed: 2094, groups: [{ path: [[-260, -160], [-130, -80], [-20, 0], [80, 80], [245, 225]], count: 3, spread: [1,4], color: GOLD, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("tuyen") }));
  // 4. "van-hanh": hành khách (son) xuống ga Bến Thành và lên tàu; các đoàn tàu (chấm vàng) nối nhau chạy (diễn hoạ).
  const p3 = run("van-hanh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2104, groups: [{ path: [[-330, -230], [-262, -162]], count: 40, spread: [3,16], color: SON, timing: [[0,0],[0.7,1]] }], progress: p3, visible: () => clock.near("van-hanh") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 12, seed: 2114, groups: [{ path: [[-260, -160], [-130, -80], [-20, 0], [80, 80], [245, 225]], count: 3, spread: [1,4], color: GOLD, timing: [[0.1,0],[1,1]] }, { path: [[245, 225], [80, 80], [-20, 0], [-130, -80], [-255, -155]], count: 3, spread: [1,4], color: GOLD, timing: [[0,0],[0.9,1]] }], progress: p3, visible: () => clock.near("van-hanh") }));
};

export default setup;
