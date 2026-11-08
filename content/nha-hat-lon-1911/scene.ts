import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VUNG_LAY, HO } from "./terrain";

type Pt = [number, number];

// Nhà hát Lớn Hà Nội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["do-an","dong-coc","khanh-thanh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VUNG_LAY, 56]];

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
    seed: 1911,
  });

  // 1. "do-an": các đốm xanh nhạt (nước đọng) trên vũng lầy; đốm ngà (bản vẽ) sáng bên cạnh (diễn hoạ).
  const p0 = run("do-an", 28);
  { const S: Pt[] = [[16, -18], [28, -18], [40, -18], [52, -18], [64, -18], [16, -6], [28, -6], [40, -6], [52, -6], [64, -6], [16, 6], [28, 6], [40, 6], [52, 6], [64, 6], [16, 18], [28, 18], [40, 18], [52, 18], [64, 18]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 0.5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.02, 0.18 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-an") })); }
  { const S: Pt[] = [[100, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-an") })); }
  // 2. "dong-coc": người (son) đóng cọc, những hàng đốm vàng nhỏ (cọc tre) dày dần trên nền theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dong-coc"] ?? 0) / 0.9);
  { const S: Pt[] = [[17.5, -17.5], [22.5, -17.5], [27.5, -17.5], [32.5, -17.5], [37.5, -17.5], [42.5, -17.5], [47.5, -17.5], [52.5, -17.5], [57.5, -17.5], [62.5, -17.5], [17.5, -12.5], [22.5, -12.5], [27.5, -12.5], [32.5, -12.5], [37.5, -12.5], [42.5, -12.5], [47.5, -12.5], [52.5, -12.5], [57.5, -12.5], [62.5, -12.5], [17.5, -7.5], [22.5, -7.5], [27.5, -7.5], [32.5, -7.5], [37.5, -7.5], [42.5, -7.5], [47.5, -7.5], [52.5, -7.5], [57.5, -7.5], [62.5, -7.5], [17.5, -2.5], [22.5, -2.5], [27.5, -2.5], [32.5, -2.5], [37.5, -2.5], [42.5, -2.5], [47.5, -2.5], [52.5, -2.5], [57.5, -2.5], [62.5, -2.5], [17.5, 2.5], [22.5, 2.5], [27.5, 2.5], [32.5, 2.5], [37.5, 2.5], [42.5, 2.5], [47.5, 2.5], [52.5, 2.5], [57.5, 2.5], [62.5, 2.5], [17.5, 7.5], [22.5, 7.5], [27.5, 7.5], [32.5, 7.5], [37.5, 7.5], [42.5, 7.5], [47.5, 7.5], [52.5, 7.5], [57.5, 7.5], [62.5, 7.5], [17.5, 12.5], [22.5, 12.5], [27.5, 12.5], [32.5, 12.5], [37.5, 12.5], [42.5, 12.5], [47.5, 12.5], [52.5, 12.5], [57.5, 12.5], [62.5, 12.5], [17.5, 17.5], [22.5, 17.5], [27.5, 17.5], [32.5, 17.5], [37.5, 17.5], [42.5, 17.5], [47.5, 17.5], [52.5, 17.5], [57.5, 17.5], [62.5, 17.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.011, 0.16999999999999998 + i * 0.011, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-coc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1951, groups: [{ path: [[74, 0], [69, 17], [57, 29], [40, 34], [23, 29], [11, 17], [6, 0], [11, -17], [23, -29], [40, -34], [57, -29], [69, -17], [74, 0]], count: 20, spread: [4,40], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dong-coc") }));
  // 3. "khanh-thanh": đêm khánh thành: nhiều đốm vàng sáng rực (đèn), người (son) tụ về trước cửa (diễn hoạ).
  const p2 = run("khanh-thanh", 28);
  { const S: Pt[] = [[19, -9], [25, -9], [31, -9], [37, -9], [43, -9], [49, -9], [55, -9], [61, -9], [19, -3], [25, -3], [31, -3], [37, -3], [43, -3], [49, -3], [55, -3], [61, -3], [19, 3], [25, 3], [31, 3], [37, 3], [43, 3], [49, 3], [55, 3], [61, 3], [19, 9], [25, 9], [31, 9], [37, 9], [43, 9], [49, 9], [55, 9], [61, 9]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.01, 0.18 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khanh-thanh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1971, groups: [{ path: [[40, -150], [40, -30]], count: 30, spread: [60,30], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: p2, visible: () => clock.near("khanh-thanh") }));
  // 4. "ve-sau": đèn nhà hát sáng dịu; người (son) qua lại quảng trường (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[19, -9], [25, -9], [31, -9], [37, -9], [43, -9], [49, -9], [55, -9], [61, -9], [19, -3], [25, -3], [31, -3], [37, -3], [43, -3], [49, -3], [55, -3], [61, -3], [19, 3], [25, 3], [31, 3], [37, 3], [43, 3], [49, 3], [55, 3], [61, 3], [19, 9], [25, 9], [31, 9], [37, 9], [43, 9], [49, 9], [55, 9], [61, 9]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.6 * smoothstep(0 + i * 0.003, 0.15 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1991, groups: [{ path: [[-50, -60], [140, -60]], count: 16, spread: [20,60], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
