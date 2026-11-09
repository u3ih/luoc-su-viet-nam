import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VUNG_TAU, MSP1 } from "./terrain";

type Pt = [number, number];

// Tấn dầu đầu tiên ở mỏ Bạch Hổ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tham-do","dong-dau","da-mong","ve-sau"]);
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
    counts: { trees: 160, bushes: 200, grass: 600, reeds: 100 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1986,
  });

  // 1. "tham-do": tàu khảo sát (chấm xanh nhạt) chạy trên biển; giếng thăm dò (đốm xanh nhạt) nhấp nháy (diễn hoạ).
  const p0 = run("tham-do", 28);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 1996, groups: [{ path: [[-250, -100], [0, -60], [150, 120], [-20, 160]], count: 2, spread: [6,120], color: DICH, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("tham-do") }));
  { const S: Pt[] = [[80, 40], [140, -20]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.25, 0.44999999999999996 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tham-do") })); }
  // 2. "dong-dau": theo thanh kéo, giàn MSP-1 (cột đốm vàng) sáng dần từ mặt nước lên; ngọn đuốc khí cháy; tàu chở dầu (chấm ngà) cập giàn (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dong-dau"] ?? 0) / 0.9);
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.41 + i * 0.12, 0.5599999999999999 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.53 + i * 0.12, 0.68 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-dau") })); }
  world.add(createFires({ sites: [[92, 52]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.6 })), lit: (ctx) => clock.near("dong-dau") * smoothstep(0.6, 0.9, inp1(ctx)), size: 5, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2076, groups: [{ path: [[-250, -120], [40, 10]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.65,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dong-dau") }));
  // 3. "da-mong": thêm các giàn khác (cột đốm vàng) quanh mỏ; khí đuốc cháy (diễn hoạ).
  const p2 = run("da-mong", 28);
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-mong") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-mong") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-mong") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-mong") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-mong") })); }
  { const S: Pt[] = [[160, 100], [20, 130], [180, -40], [0, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.15, 0.25 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-mong") })); }
  world.add(createFires({ sites: [[92, 52], [170, 110]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.4 })), lit: () => clock.near("da-mong") * smoothstep(0.2, 0.9, p2()), size: 5, glow: () => 0.8 }));
  // 4. "ve-sau": đường ống khí (chuỗi đốm ngà) từ mỏ vào bờ Vũng Tàu; bờ sáng đèn (đốm vàng) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 40], [40, 27], [0, 13], [-40, 0], [-80, -13], [-122, -24], [-167, -33], [-211, -42], [-256, -51], [-300, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-320, -60], [-330, 0], [-310, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8 + i * 0.04, 0.9500000000000001 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
