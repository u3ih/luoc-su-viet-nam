import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DA_NANG, O_DIEN, QUAN_THAN, LONG_BIEN, CO_LOA } from "./terrain";

type Pt = [number, number];

// Lý Phật Tử và nước Vạn Xuân — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["da-nang","quan-than","danh-up","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[O_DIEN, 40], [LONG_BIEN, 44], [CO_LOA, 40]];

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
    seed: 571,
  });

  // 1. "da-nang": đoàn người (son) rút vào núi phía tây, đắp thành ở động Dã Năng (đốm vàng) (diễn hoạ).
  const p0 = run("da-nang", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 581, groups: [{ path: [[80, -100], [-150, 100], [-290, 220]], count: 30, spread: [10,60], color: SON, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("da-nang") }));
  { const S: Pt[] = [[-300, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-nang") })); }
  // 2. "quan-than": quân Lý Phật Tử (son) từ tây và quân Triệu Việt Vương (ngà) từ đông giáp nhau ở bãi Quân Thần; đốm vàng (chia đất) (diễn hoạ).
  const p1 = run("quan-than", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 601, groups: [{ path: [[-250, 200], [-10, 150]], count: 30, spread: [10,50], color: SON, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("quan-than") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 611, groups: [{ path: [[180, 40], [50, 150]], count: 30, spread: [10,50], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("quan-than") }));
  { const S: Pt[] = [[20, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-than") })); }
  { const S: Pt[] = [[-120, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-than") })); }
  // 3. "danh-up": theo thanh kéo, quân Lý Phật Tử (son) từ Ô Diên kéo về Long Biên; Triệu Việt Vương (đốm ngà) chạy về phía nam (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["danh-up"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 641, groups: [{ path: [[-120, 120], [40, 80], [170, 45]], count: 40, spread: [10,60], color: SON, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("danh-up") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 651, groups: [{ path: [[180, 40], [120, -150], [40, -380]], count: 6, spread: [4,20], color: NGHIA, timing: [[0.4,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("danh-up") }));
  { const S: Pt[] = [[180, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.5, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("danh-up") })); }
  // 4. "ve-sau": quân Tuỳ (xanh nhạt) từ phía bắc kéo xuống; các thành Long Biên, Ô Diên, Cổ Loa (đốm son) lần lượt tắt (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[180, 40], [-120, 120], [160, 260]]; world.add(createGlows({ count: S.length, color: SON, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 681, groups: [{ path: [[250, 400], [170, 270]], count: 50, spread: [20,80], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
