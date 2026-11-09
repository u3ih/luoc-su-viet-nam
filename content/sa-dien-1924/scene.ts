import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SA_DIEN, KHACH_SAN, QUANG_CHAU, HOANG_HOA } from "./terrain";

type Pt = [number, number];

// Tiếng bom Sa Diện — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["roi-que","sa-dien","chau-giang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUANG_CHAU, 72]];

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
    seed: 1924,
  });

  // 1. "roi-que": nhóm thanh niên (chấm ngà) từ phương nam xa vượt sang Quảng Châu (diễn hoạ).
  const p0 = run("roi-que", 28);
  world.add(createCrowd({ size: 6, height: ground, seed: 1934, groups: [{ path: [[-380, -380], [-260, -200], [-120, 60], [-50, 130]], count: 5, spread: [4,20], color: NGHIA, timing: [[0.05,0],[0.85,1]] }], progress: p0, visible: () => clock.near("roi-que") }));
  { const S: Pt[] = [[-40, 140]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("roi-que") })); }
  // 2. "sa-dien": theo thanh kéo, khách (xanh nhạt) lần lượt qua cầu sang đảo, khách sạn (đốm vàng) sáng đèn; một chấm ngà lẫn vào cuối (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["sa-dien"] ?? 0) / 0.9);
  { const S: Pt[] = [[10, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sa-dien") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1964, groups: [{ path: [[-40, 130], [0, 70], [10, 0]], count: 16, spread: [6,50], color: DICH, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("sa-dien") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1974, groups: [{ path: [[-30, 120], [0, 70], [15, 5]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.6,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("sa-dien") }));
  // 3. "chau-giang": chấm ngà rời đảo ra mép sông rồi lịm dần dưới nước; người truy đuổi (xanh nhạt) toả quanh đảo (diễn hoạ).
  const p2 = run("chau-giang", 28);
  { const S: Pt[] = [[50, -50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.5, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-giang") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1994, groups: [{ path: [[10, -10], [40, -30]], count: 20, spread: [10,60], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("chau-giang") }));
  { const S: Pt[] = [[10, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-giang") })); }
  // 4. "ve-sau": mộ ở Hoàng Hoa Cương (đốm vàng); người đến viếng (son) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-150, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2024, groups: [{ path: [[-40, 140], [-140, 270]], count: 16, spread: [8,30], color: SON, timing: [[0.15,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
