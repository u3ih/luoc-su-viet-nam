import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAO_TANG, MY_SON, TRA_KIEU, DONG_DUONG } from "./terrain";

type Pt = [number, number];

// Bảo tàng Điêu khắc Chăm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["suu-tap","xay-dung","thang-tram","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAO_TANG, 32], [MY_SON, 24], [TRA_KIEU, 24], [DONG_DUONG, 24]];

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
    seed: 1922,
  });

  // 1. "suu-tap": các di tích Chăm (đốm xanh nhạt) sáng; di vật (chấm vàng) được chở về Đà Nẵng (diễn hoạ).
  const p0 = run("suu-tap", 28);
  { const S: Pt[] = [[-260, -230], [-170, -290], [-80, -320]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("suu-tap") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1942, groups: [{ path: [[-260, -230], [-5, 15]], count: 2, spread: [3,5], color: GOLD, timing: [[0.3,0],[0.8,1]] }, { path: [[-170, -290], [0, 15]], count: 2, spread: [3,5], color: GOLD, timing: [[0.35,0],[0.85,1]] }, { path: [[-80, -320], [5, 15]], count: 2, spread: [3,5], color: GOLD, timing: [[0.4,0],[0.9,1]] }], progress: p0, visible: () => clock.near("suu-tap") }));
  // 2. "xay-dung": theo thanh kéo, các tác phẩm điêu khắc (lưới đốm vàng) lần lượt được đặt vào bảo tàng bên sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-dung"] ?? 0) / 0.9);
  { const S: Pt[] = [[-20, 5], [-10, 5], [0, 5], [10, 5], [20, 5], [-20, 15], [-10, 15], [0, 15], [10, 15], [20, 15], [-20, 25], [-10, 25], [0, 25], [10, 25], [20, 25], [-20, 35], [-10, 35], [0, 35], [10, 35], [20, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.03 + i * 0.04, 0.18 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1962, groups: [{ path: [[-80, -40], [-10, 10]], count: 16, spread: [3,10], color: SON, timing: [[0,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-dung") }));
  // 3. "thang-tram": một phần hiện vật (đốm) mất đi rồi được thu hồi; người canh gác (ngà) đứng quanh bảo tàng (diễn hoạ).
  const p2 = run("thang-tram", 28);
  { const S: Pt[] = [[-10, 5], [0, 5], [20, 5], [-20, 15], [0, 15], [10, 15], [-20, 25], [-10, 25], [10, 25], [20, 25], [-10, 35], [0, 35], [20, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thang-tram") })); }
  { const S: Pt[] = [[-20, 5], [10, 5], [-10, 15], [20, 15], [0, 25], [-20, 35], [10, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.1, 0.2, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thang-tram") })); }
  { const S: Pt[] = [[-20, 5], [10, 5], [-10, 15], [20, 15], [0, 25], [-20, 35], [10, 35]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.04, 0.65 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thang-tram") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2002, groups: [{ path: [[34, 20], [29, 37], [17, 49], [0, 54], [-17, 49], [-29, 37], [-34, 20], [-29, 3], [-17, -9], [0, -14], [17, -9], [29, 3], [34, 20]], count: 12, spread: [1,2], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("thang-tram") }));
  // 4. "ngay-nay": bảo tàng mở rộng: thêm lưới đốm (toà nhà mới phía sau); khách tham quan (son) (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[-20, 5], [-10, 5], [0, 5], [10, 5], [20, 5], [-20, 15], [-10, 15], [0, 15], [10, 15], [20, 15], [-20, 25], [-10, 25], [0, 25], [10, 25], [20, 25], [-20, 35], [-10, 35], [0, 35], [10, 35], [20, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  { const S: Pt[] = [[-65, 5], [-55, 5], [-45, 5], [-35, 5], [-65, 15], [-55, 15], [-45, 15], [-35, 15], [-65, 25], [-55, 25], [-45, 25], [-35, 25], [-65, 35], [-55, 35], [-45, 35], [-35, 35]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.03, 0.35 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2032, groups: [{ path: [[-120, -60], [-10, 0]], count: 30, spread: [3,14], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
