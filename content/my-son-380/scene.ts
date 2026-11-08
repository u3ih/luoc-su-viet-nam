import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MY_SON, TRA_KIEU } from "./terrain";

type Pt = [number, number];

// Thánh địa Mỹ Sơn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["den-go","thap-gach","tim-lai","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[MY_SON, 72]];

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
    counts: { trees: 900, bushes: 700, grass: 1800, reeds: 300 },
    forestAt: 0.4,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 380,
  });

  // 1. "den-go": một đốm vàng (đền gỗ thờ Shiva) giữa thung lũng; về sau lửa bùng (hỏa hoạn) và đốm vàng lịm (diễn hoạ).
  const p0 = run("den-go", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("den-go") })); }
  world.add(createFires({ sites: [[-6, 18], [6, 22], [0, 30]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("den-go") * smoothstep(0.55, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "thap-gach": theo thanh kéo, các cụm tháp (cột đốm vàng, cao thấp khác nhau) lần lượt mọc lên khắp thung lũng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thap-gach"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.08 + i * 0.12, 0.22999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.11 + i * 0.12, 0.26 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 25, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.13999999999999999 + i * 0.12, 0.29 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.16999999999999998 + i * 0.12, 0.31999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-50, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-50, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.23 + i * 0.12, 0.38 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-50, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.26 + i * 0.12, 0.41000000000000003 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-50, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.29000000000000004 + i * 0.12, 0.44000000000000006 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.38 + i * 0.12, 0.53 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.41 + i * 0.12, 0.5599999999999999 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.43999999999999995 + i * 0.12, 0.59 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-30, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-30, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.53 + i * 0.12, 0.68 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-30, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 13, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.56 + i * 0.12, 0.7100000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[-30, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.59 + i * 0.12, 0.74 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[50, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[50, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 9, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.68 + i * 0.12, 0.8300000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[50, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 13, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.71 + i * 0.12, 0.86 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[50, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.74 + i * 0.12, 0.89 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  { const S: Pt[] = [[70, 20], [61, 55], [35, 81], [0, 90], [-35, 81], [-61, 55], [-70, 20], [-61, -15], [-35, -41], [0, -50], [35, -41], [61, -15]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.015, 0.9 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-gach") })); }
  // 3. "tim-lai": vài chấm ngà (nhà nghiên cứu) đi vào thung lũng; các đốm vàng mờ (tháp trong rừng) sáng dần lên (diễn hoạ).
  const p2 = run("tim-lai", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 640, groups: [{ path: [TRA_KIEU, [200, -60], [20, 10]], count: 5, spread: [6,10], color: NGHIA, timing: [[0.02,0],[0.6,1]] }], progress: p2, visible: () => clock.near("tim-lai") }));
  { const S: Pt[] = [[0, 20], [-50, 40], [40, 60], [-30, -30], [50, -20], [-70, 0], [70, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.06, 0.55 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tim-lai") })); }
  // 4. "ve-sau": vài cụm đốm lịm đi (bị phá hủy); các cụm còn lại vẫn sáng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-50, 40], [40, 60], [-70, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.55, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 20], [-30, -30], [50, -20], [70, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
