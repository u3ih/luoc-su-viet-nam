import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BO_HO, CAU_GIAY, BUOI, HA_DONG, BACH_MAI } from "./terrain";

type Pt = [number, number];

// Tàu điện Hà Nội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["do-an","khanh-thanh","mo-rong","dung-lai"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BO_HO, 40], [CAU_GIAY, 24], [BUOI, 24], [HA_DONG, 24], [BACH_MAI, 24]];

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
    seed: 1901,
  });

  // 1. "do-an": ba đường đốm ngà mờ (ba tuyến quy hoạch) toả ra từ bờ hồ tới Bạch Mai, làng Giấy, Thái Hà ấp (diễn hoạ).
  const p0 = run("do-an", 28);
  { const S: Pt[] = [[100, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-an") })); }
  { const S: Pt[] = [[100, 20], [96, -28], [92, -76], [88, -124], [84, -172], [80, -220]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.15 + i * 0.03, 0.3 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-an") })); }
  { const S: Pt[] = [[100, 20], [54, 23], [9, 26], [-37, 29], [-83, 31], [-129, 34], [-174, 37], [-220, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.35 + i * 0.03, 0.5 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-an") })); }
  { const S: Pt[] = [[100, 20], [51, -13], [3, -46], [-46, -79], [-94, -111], [-143, -144], [-191, -177], [-240, -210]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.55 + i * 0.03, 0.7000000000000001 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-an") })); }
  // 2. "khanh-thanh": theo thanh kéo, đoàn tàu điện (chấm vàng) chạy từ bờ hồ ra Cầu Giấy; khách (son) chờ ở ga (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khanh-thanh"] ?? 0) / 0.9);
  { const S: Pt[] = [[100, 20], [54, 23], [9, 26], [-37, 29], [-83, 31], [-129, 34], [-174, 37], [-220, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khanh-thanh") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 5, seed: 1961, groups: [{ path: [[100, 20], [-225, 40]], count: 2, spread: [1,3], color: GOLD, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khanh-thanh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1971, groups: [{ path: [[122, 20], [118, 33], [107, 41], [93, 41], [82, 33], [78, 20], [82, 7], [93, -1], [107, -1], [118, 7], [122, 20]], count: 30, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khanh-thanh") }));
  // 3. "mo-rong": mạng lưới lan rộng: các tuyến (đốm ngà) kéo ra chợ Bưởi, Hà Đông, Bạch Mai; nhiều đoàn tàu (chấm vàng) chạy (diễn hoạ).
  const p2 = run("mo-rong", 28);
  { const S: Pt[] = [[100, 20], [64, 49], [29, 77], [-7, 106], [-43, 134], [-79, 163], [-114, 191], [-150, 220], [100, 20], [56, -10], [13, -40], [-31, -70], [-75, -100], [-119, -130], [-162, -160], [-206, -190], [-250, -220], [100, 20], [96, -30], [92, -80], [88, -130], [84, -180], [80, -230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.012, 0.16999999999999998 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-rong") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 5, seed: 1991, groups: [{ path: [[100, 20], [-148, 215]], count: 1, spread: [1,1], color: GOLD, timing: [[0.05,0],[0.6,1]] }, { path: [[100, 20], [-245, -215]], count: 1, spread: [1,1], color: GOLD, timing: [[0.2,0],[0.8,1]] }, { path: [[100, 20], [80, -225]], count: 1, spread: [1,1], color: GOLD, timing: [[0.35,0],[0.9,1]] }], progress: p2, visible: () => clock.near("mo-rong") }));
  // 4. "dung-lai": các tuyến tắt dần; một đốm vàng cuối cùng ở bờ hồ lụi đi (1991) (diễn hoạ).
  const p3 = run("dung-lai", 28);
  { const S: Pt[] = [[100, 20], [54, 23], [9, 26], [-37, 29], [-83, 31], [-129, 34], [-174, 37], [-220, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-lai") })); }
  { const S: Pt[] = [[100, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.7, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-lai") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2021, groups: [{ path: [[130, 20], [126, 35], [115, 46], [100, 50], [85, 46], [74, 35], [70, 20], [74, 5], [85, -6], [100, -10], [115, -6], [126, 5], [130, 20]], count: 30, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("dung-lai") }));
};

export default setup;
