import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BO_TAY, BO_DONG } from "./terrain";

type Pt = [number, number];

// Cầu Rồng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cuoc-thi","khoi-cong","thong-xe","phun-lua"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BO_TAY, 32], [BO_DONG, 32]];

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
    seed: 2013,
  });

  // 1. "cuoc-thi": 17 phương án (đốm xanh nhạt) xếp hàng; một đốm vàng (phương án hình rồng) được chọn, các đốm khác tắt (diễn hoạ).
  const p0 = run("cuoc-thi", 28);
  { const S: Pt[] = [[-160, -80], [-139, -80], [-117, -80], [-96, -80], [-75, -80], [-53, -80], [-32, -80], [-11, -80], [11, -80], [32, -80], [53, -80], [75, -80], [96, -80], [117, -80], [139, -80], [160, -80]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (1 - smoothstep(0.6, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cuoc-thi") })); }
  { const S: Pt[] = [[0, -80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cuoc-thi") })); }
  // 2. "khoi-cong": theo thanh kéo, thân rồng (chuỗi đốm vàng uốn lượn lên xuống) vươn từng nhịp từ bờ đông sang bờ tây (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoi-cong"] ?? 0) / 0.9);
  { const S: Pt[] = [[90, 0], [60, 0], [30, 0], [0, 0], [-30, 0], [-60, 0], [-90, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 22, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  { const S: Pt[] = [[75, 0], [45, 0], [15, 0], [-15, 0], [-45, 0], [-75, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 22, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.08 + i * 0.12, 0.22999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  // 3. "thong-xe": xe (chấm ngà) chạy qua cầu từ sân bay phía tây ra biển phía đông (diễn hoạ).
  const p2 = run("thong-xe", 28);
  { const S: Pt[] = [[90, 0], [60, 0], [30, 0], [0, 0], [-30, 0], [-60, 0], [-90, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  { const S: Pt[] = [[75, 0], [45, 0], [15, 0], [-15, 0], [-45, 0], [-75, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thong-xe") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 8, seed: 2083, groups: [{ path: [[-300, 10], [-90, 2], [90, -2], [260, -10]], count: 12, spread: [2,4], color: NGHIA, timing: [[0,0],[0.95,1]] }], progress: p2, visible: () => clock.near("thong-xe") }));
  // 4. "phun-lua": đầu rồng phun lửa (đốm cam, lửa) rồi phun nước (đốm xanh nhạt); người xem (son) hai bên bờ (diễn hoạ).
  const p3 = run("phun-lua", 28);
  { const S: Pt[] = [[90, 0], [60, 0], [30, 0], [0, 0], [-30, 0], [-60, 0], [-90, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phun-lua") })); }
  { const S: Pt[] = [[75, 0], [45, 0], [15, 0], [-15, 0], [-45, 0], [-75, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 20, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phun-lua") })); }
  world.add(createFires({ sites: [[-92, 0]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("phun-lua") * smoothstep(0.1, 0.9, p3()), size: 4, glow: () => 0.8 }));
  { const S: Pt[] = [[-95, 0], [-107, 0], [-118, 0], [-130, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.04, 0.75 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phun-lua") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2133, groups: [{ path: [[-120, -60], [-120, 60]], count: 50, spread: [3,10], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[120, -60], [120, 60]], count: 40, spread: [3,10], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("phun-lua") }));
};

export default setup;
