import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THU_VIEN } from "./terrain";

type Pt = [number, number];

// Thư viện Quốc gia — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nghi-dinh","mo-cua","doi-ten","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THU_VIEN, 80]];

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
    seed: 1917,
  });

  // 1. "nghi-dinh": một đốm vàng (nghị định) sáng; thợ (son) dựng thư viện, nền (lưới đốm ngà mờ) hiện dần (diễn hoạ).
  const p0 = run("nghi-dinh", 28);
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghi-dinh") })); }
  { const S: Pt[] = [[-32, -6], [-16, -6], [0, -6], [16, -6], [32, -6], [-32, 10], [-16, 10], [0, 10], [16, 10], [32, 10], [-32, 26], [-16, 26], [0, 26], [16, 26], [32, 26]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.3 + i * 0.03, 0.44999999999999996 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghi-dinh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1947, groups: [{ path: [[-120, -80], [-10, 5]], count: 24, spread: [3,12], color: SON, drop: true, timing: [[0.2,0],[0.8,1]] }], progress: p0, visible: () => clock.near("nghi-dinh") }));
  // 2. "mo-cua": theo thanh kéo, các kệ sách (cột đốm vàng) cao dần; người đọc (son) tới (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["mo-cua"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.06 + i * 0.12, 0.21 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.13999999999999999 + i * 0.12, 0.29 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-40, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.18 + i * 0.12, 0.32999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.24000000000000002 + i * 0.12, 0.39 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.28 + i * 0.12, 0.43000000000000005 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.32 + i * 0.12, 0.47 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[-20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.36 + i * 0.12, 0.51 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.38 + i * 0.12, 0.53 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.42 + i * 0.12, 0.57 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.46 + i * 0.12, 0.61 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.54 + i * 0.12, 0.6900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.56 + i * 0.12, 0.7100000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 11, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6000000000000001 + i * 0.12, 0.7500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.64 + i * 0.12, 0.79 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.68 + i * 0.12, 0.8300000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  { const S: Pt[] = [[20, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7200000000000001 + i * 0.12, 0.8700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-cua") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2157, groups: [{ path: [[-140, -100], [0, -15]], count: 24, spread: [3,14], color: SON, timing: [[0.5,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mo-cua") }));
  // 3. "doi-ten": đốm vàng ở thư viện đổi sắc qua các tên gọi (vàng, ngà, xanh nhạt, vàng) lần lượt (diễn hoạ).
  const p2 = run("doi-ten", 28);
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.2, 0.28, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-ten") })); }
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.28 + i * 0.12, 0.43000000000000005 + i * 0.12, k) * (1 - smoothstep(0.48, 0.56, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-ten") })); }
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.56 + i * 0.12, 0.7100000000000001 + i * 0.12, k) * (1 - smoothstep(0.74, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-ten") })); }
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-ten") })); }
  { const S: Pt[] = [[-32, -6], [-16, -6], [0, -6], [16, -6], [32, -6], [-32, 10], [-16, 10], [0, 10], [16, 10], [32, 10], [-32, 26], [-16, 26], [0, 26], [16, 26], [32, 26]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-ten") })); }
  // 4. "ngay-nay": dòng xuất bản phẩm (chấm ngà) từ khắp nơi đổ về thư viện; kho sách (lưới đốm vàng) lớn dần (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[-42, -14], [-30, -14], [-18, -14], [-6, -14], [6, -14], [18, -14], [30, -14], [42, -14], [-42, -2], [-30, -2], [-18, -2], [-6, -2], [6, -2], [18, -2], [30, -2], [42, -2], [-42, 10], [-30, 10], [-18, 10], [-6, 10], [6, 10], [18, 10], [30, 10], [42, 10], [-42, 22], [-30, 22], [-18, 22], [-6, 22], [6, 22], [18, 22], [30, 22], [42, 22], [-42, 34], [-30, 34], [-18, 34], [-6, 34], [6, 34], [18, 34], [30, 34], [42, 34]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.012, 0.16999999999999998 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2227, groups: [{ path: [[-300, 250], [-5, 15]], count: 5, spread: [3,10], color: NGHIA, timing: [[0,0],[0.7,1]] }, { path: [[300, -250], [5, 10]], count: 5, spread: [3,10], color: NGHIA, timing: [[0.2,0],[0.9,1]] }, { path: [[-300, -250], [0, 5]], count: 5, spread: [3,10], color: NGHIA, timing: [[0.3,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
