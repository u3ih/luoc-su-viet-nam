import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DONG_HO, BEN, LANG_A, LANG_B } from "./terrain";

type Pt = [number, number];

// Tranh Đông Hồ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lang-tranh","giay-diep","in-mau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DONG_HO, 56]];

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
    seed: 1600,
  });

  // 1. "lang-tranh": người làng (son) đi lại giữa các nhà; đốm vàng sáng ở làng Đông Hồ (diễn hoạ).
  const p0 = run("lang-tranh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1610, groups: [{ path: [[-60, -100], [60, -40]], count: 20, spread: [40,40], color: SON, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("lang-tranh") }));
  { const S: Pt[] = [DONG_HO]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lang-tranh") })); }
  // 2. "giay-diep": những đốm trắng ngà lấp lánh (giấy điệp) phơi thành hàng dài (diễn hoạ).
  const p1 = run("giay-diep", 28);
  { const S: Pt[] = [[-28, -68], [-20, -68], [-12, -68], [-4, -68], [4, -68], [12, -68], [20, -68], [28, -68], [-28, -60], [-20, -60], [-12, -60], [-4, -60], [4, -60], [12, -60], [20, -60], [28, -60], [-28, -52], [-20, -52], [-12, -52], [-4, -52], [4, -52], [12, -52], [20, -52], [28, -52]]; world.add(createGlows({ count: S.length, color: "#fbf3dc", size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.03 + i * 0.025, 0.18 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giay-diep") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1640, groups: [{ path: [[-40, -100], [40, -100]], count: 6, spread: [8,8], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p1, visible: () => clock.near("giay-diep") }));
  // 3. "in-mau": theo thanh kéo, từng lớp màu (đen, vàng, đỏ) in chồng lên nền điệp: các đốm màu lần lượt sáng trên hàng tranh (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["in-mau"] ?? 0) / 0.9);
  { const S: Pt[] = [[-28, -68], [-20, -68], [-12, -68], [-4, -68], [4, -68], [12, -68], [20, -68], [28, -68], [-28, -60], [-20, -60], [-12, -60], [-4, -60], [4, -60], [12, -60], [20, -60], [28, -60], [-28, -52], [-20, -52], [-12, -52], [-4, -52], [4, -52], [12, -52], [20, -52], [28, -52]]; world.add(createGlows({ count: S.length, color: "#fbf3dc", size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("in-mau") })); }
  { const S: Pt[] = [[-28, -66], [-20, -66], [-12, -66], [-4, -66], [4, -66], [12, -66], [20, -66], [28, -66], [-28, -58], [-20, -58], [-12, -58], [-4, -58], [4, -58], [12, -58], [20, -58], [28, -58], [-28, -50], [-20, -50], [-12, -50], [-4, -50], [4, -50], [12, -50], [20, -50], [28, -50]]; world.add(createGlows({ count: S.length, color: "#c9a227", size: 5, minPx: 8, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1.3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.25 + i * 0.008, 0.4 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("in-mau") })); }
  { const S: Pt[] = [[-28, -70], [-20, -70], [-12, -70], [-4, -70], [4, -70], [12, -70], [20, -70], [28, -70], [-28, -62], [-20, -62], [-12, -62], [-4, -62], [4, -62], [12, -62], [20, -62], [28, -62], [-28, -54], [-20, -54], [-12, -54], [-4, -54], [4, -54], [12, -54], [20, -54], [28, -54]]; world.add(createGlows({ count: S.length, color: "#c4402c", size: 4, minPx: 7, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1.6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.55 + i * 0.008, 0.7000000000000001 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("in-mau") })); }
  // 4. "ve-sau": người các làng (son) về Đông Hồ mua tranh rồi mang đi (dịp Tết); đốm vàng ở mỗi làng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1680, groups: [{ path: [LANG_A, DONG_HO, LANG_A], count: 14, spread: [10,40], color: SON, timing: [[0.03,0],[0.95,1]] }, { path: [LANG_B, DONG_HO, LANG_B], count: 14, spread: [10,40], color: SON, timing: [[0.08,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [LANG_A, LANG_B, [-150, -280], [150, -300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.08, 0.75 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
