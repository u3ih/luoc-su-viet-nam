import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NHA_THO, BEN } from "./terrain";

type Pt = [number, number];

// Nhà thờ Đức Bà Sài Gòn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["do-an","xay-dung","thap-chuong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NHA_THO, 56]];

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
    seed: 1880,
  });

  // 1. "do-an": tàu (chấm ngà) cập bến chở vật liệu từ Pháp; người (son) khuân vác về khu đất (diễn hoạ).
  const p0 = run("do-an", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1890, groups: [{ path: [[330, -400], [260, -150], [210, -60]], count: 4, spread: [10,40], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: p0, visible: () => clock.near("do-an") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1900, groups: [{ path: [BEN, [100, -20], [20, 10]], count: 20, spread: [10,60], color: SON, timing: [[0.4,0],[1,1]] }], progress: p0, visible: () => clock.near("do-an") }));
  // 2. "xay-dung": đốm ngà (viên đá đầu tiên), rồi các đốm hồng (gạch) xếp dần thành khối theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-dung"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[-12.5, 2.5], [-7.5, 2.5], [-2.5, 2.5], [2.5, 2.5], [7.5, 2.5], [12.5, 2.5], [-12.5, 7.5], [-7.5, 7.5], [-2.5, 7.5], [2.5, 7.5], [7.5, 7.5], [12.5, 7.5], [-12.5, 12.5], [-7.5, 12.5], [-2.5, 12.5], [2.5, 12.5], [7.5, 12.5], [12.5, 12.5], [-12.5, 17.5], [-7.5, 17.5], [-2.5, 17.5], [2.5, 17.5], [7.5, 17.5], [12.5, 17.5], [-12.5, 22.5], [-7.5, 22.5], [-2.5, 22.5], [2.5, 22.5], [7.5, 22.5], [12.5, 22.5], [-12.5, 27.5], [-7.5, 27.5], [-2.5, 27.5], [2.5, 27.5], [7.5, 27.5], [12.5, 27.5], [-12.5, 32.5], [-7.5, 32.5], [-2.5, 32.5], [2.5, 32.5], [7.5, 32.5], [12.5, 32.5], [-12.5, 37.5], [-7.5, 37.5], [-2.5, 37.5], [2.5, 37.5], [7.5, 37.5], [12.5, 37.5]]; world.add(createGlows({ count: S.length, color: "#e8a08a", size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.018, 0.2 + i * 0.018, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1930, groups: [{ path: [[34, 20], [29, 37], [17, 49], [0, 54], [-17, 49], [-29, 37], [-34, 20], [-29, 3], [-17, -9], [0, -14], [17, -9], [29, 3], [34, 20]], count: 16, spread: [4,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-dung") }));
  // 3. "thap-chuong": hai cột đốm vàng (hai tháp chuông) mọc cao dần (diễn hoạ).
  const p2 = run("thap-chuong", 16);
  { const S: Pt[] = [[-10, 0], [10, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-chuong") })); }
  { const S: Pt[] = [[-10, 0], [10, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.02, 0.35 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-chuong") })); }
  { const S: Pt[] = [[-10, 0], [10, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 34, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.02, 0.5 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-chuong") })); }
  { const S: Pt[] = [[-10, 0], [10, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.02, 0.65 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-chuong") })); }
  { const S: Pt[] = [[-10, 0], [10, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 58, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.65 + i * 0.02, 0.8 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-chuong") })); }
  // 4. "ve-sau": đốm ngà (tượng) trước nhà thờ; người (son) qua lại quảng trường (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2000, groups: [{ path: [[-100, -60], [100, -60]], count: 14, spread: [20,60], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
