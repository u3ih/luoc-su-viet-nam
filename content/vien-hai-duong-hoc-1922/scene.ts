import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CAU_DA, KHOI } from "./terrain";

type Pt = [number, number];

// Viện Hải dương học Nha Trang — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thanh-lap","ho-ca","khao-sat","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CAU_DA, 32]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#1f4a5a", shallow: "#6fa3a0" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1922,
  });

  // 1. "thanh-lap": đốm vàng (sở hải dương học) sáng ở Cầu Đá; các nhà nghiên cứu (ngà) tụ về (diễn hoạ).
  const p0 = run("thanh-lap", 28);
  { const S: Pt[] = [[-20, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1942, groups: [{ path: [[-200, -100], [-30, -25]], count: 12, spread: [3,10], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("thanh-lap") }));
  // 2. "ho-ca": những vòng đốm xanh nhạt và ngà (bể cá) ven bờ; hàng đốm vàng dài (bộ xương cá voi 18 m) (diễn hoạ).
  const p1 = run("ho-ca", 28);
  { const S: Pt[] = [[38, -30], [34, -23], [26, -23], [22, -30], [26, -37], [34, -37]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.004, 0.2 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-ca") })); }
  { const S: Pt[] = [[46, -27], [41, -18], [32, -14], [22, -16], [15, -23], [14, -33], [19, -42], [28, -46], [38, -44], [45, -37]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.004, 0.35 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-ca") })); }
  { const S: Pt[] = [[-40, 10], [-34, 10], [-29, 10], [-23, 10], [-17, 10], [-11, 10], [-6, 10], [0, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.45 + i * 0.04, 0.6 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-ca") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1982, groups: [{ path: [[-80, -60], [-20, -40]], count: 20, spread: [3,12], color: SON, timing: [[0.1,0],[0.7,1]] }], progress: p1, visible: () => clock.near("ho-ca") }));
  // 3. "khao-sat": theo thanh kéo, tàu khảo sát (chấm ngà) ra khơi đi một vòng; các trạm đo (đốm xanh nhạt) lần lượt sáng dọc đường (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["khao-sat"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 1992, groups: [{ path: [[20, -20], [120, -90], [240, -60], [230, 10], [120, 20], [25, -15]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("khao-sat") }));
  { const S: Pt[] = [[120, -90], [240, -60], [230, 10], [120, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.2 + i * 0.18, 0.35 + i * 0.18, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khao-sat") })); }
  // 4. "ve-sau": các vùng sinh thái biển (rạn san hô, cỏ biển — đốm vàng, xanh nhạt) sáng quanh viện; khách tham quan (son) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[117, -2], [101, 24], [73, 39], [42, 37], [16, 21], [1, -7], [3, -38], [19, -64], [47, -79], [78, -77], [104, -61], [119, -33]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[160, -10], [145, 32], [114, 64], [72, 79], [28, 75], [-10, 52], [-34, 14], [-40, -30], [-25, -72], [6, -104], [48, -119], [92, -115], [130, -92], [154, -54]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.03, 0.5 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2032, groups: [{ path: [[-120, -20], [-25, -20]], count: 24, spread: [3,14], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
