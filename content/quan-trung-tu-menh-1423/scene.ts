import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DOANH, THANH_A, THANH_B, THANH_C, THU_VIEN } from "./terrain";

type Pt = [number, number];

// Quân trung từ mệnh tập — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Ba thành của quân Minh, cách điệu thành hình vuông nhỏ.
const WALLS: Wall[] = [
  { at: square(170, 170, 26, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }] },
  { at: square(230, -40, 26, 0), base: 8, top: 5, height: 4, gates: [{ at: 3.141592653589793, width: 10 }] },
  { at: square(10, 270, 26, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thu-dau","thu-tu","bien-tap","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DOANH, 44], [THANH_A, 36], [THANH_B, 36], [THANH_C, 36]];

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
    seed: 1423,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 3 - k * 0.6), wear: () => 0 }));

  // 1. "thu-dau": doanh trại Lam Sơn (đốm vàng); lá thư đầu tiên (đốm ngà) đi tới thành quân Minh phía bắc (diễn hoạ).
  const p0 = run("thu-dau", 28);
  { const S: Pt[] = [[-200, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-dau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1443, groups: [{ path: [[-220, -140], [-190, -110]], count: 30, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("thu-dau") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 8, seed: 1453, groups: [{ path: [[-200, -120], [-80, 100], [10, 255]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.15,0],[0.8,1]] }], progress: p0, visible: () => clock.near("thu-dau") }));
  // 2. "thu-tu": theo thanh kéo, thư từ (đốm ngà) lần lượt tới các thành quân Minh (xanh nhạt) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thu-tu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1463, groups: [{ path: [[160, 160], [175, 175]], count: 20, spread: [6,30], color: DICH, timing: [[0,1],[1,1]] }, { path: [[220, -50], [235, -35]], count: 20, spread: [6,30], color: DICH, timing: [[0,1],[1,1]] }, { path: [[0, 260], [15, 275]], count: 20, spread: [6,30], color: DICH, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thu-tu") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 8, seed: 1473, groups: [{ path: [[-200, -120], [10, 255]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[0.4,1]] }, { path: [[-200, -120], [165, 165]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.25,0],[0.65,1]] }, { path: [[-200, -120], [225, -40]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thu-tu") }));
  // 3. "bien-tap": các đời sau gom chép: nhà nho (ngà) tụ lại; chồng sách (cột đốm vàng) cao dần (diễn hoạ).
  const p2 = run("bien-tap", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1483, groups: [{ path: [[-150, 100], [-50, 50]], count: 8, spread: [4,20], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("bien-tap") }));
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.30000000000000004 + i * 0.12, 0.45000000000000007 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 17, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 26, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7000000000000001 + i * 0.12, 0.8500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-tap") })); }
  // 4. "ve-sau": các bài văn (đốm ngà) — 62 bài cũ và 30 bài tìm thêm — sáng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-89, 19], [-75, 19], [-61, 19], [-47, 19], [-33, 19], [-19, 19], [-5, 19], [9, 19], [-89, 33], [-75, 33], [-61, 33], [-47, 33], [-33, 33], [-19, 33], [-5, 33], [9, 33], [-89, 47], [-75, 47], [-61, 47], [-47, 47], [-33, 47], [-19, 47], [-5, 47], [9, 47], [-89, 61], [-75, 61], [-61, 61], [-47, 61], [-33, 61], [-19, 61], [-5, 61], [9, 61]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.012, 0.2 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-75, 93], [-61, 93], [-47, 93], [-33, 93], [-19, 93], [-5, 93], [-75, 107], [-61, 107], [-47, 107], [-33, 107], [-19, 107], [-5, 107]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.02, 0.7000000000000001 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
