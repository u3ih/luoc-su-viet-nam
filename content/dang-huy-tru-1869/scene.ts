import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH_HA, CUA_BIEN, HUONG_CANG } from "./terrain";

type Pt = [number, number];

// Đặng Huy Trứ và hiệu ảnh Cảm Hiếu Đường — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["pham-huy","huong-cang","hieu-anh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH_HA, 48]];

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
    seed: 1869,
  });

  // 1. "pham-huy": đốm ngà vào trường thi; đốm vàng sáng rồi tắt (bài thi bị đánh hỏng); về sau đốm ngà đi nhậm chức nhiều nơi (diễn hoạ).
  const p0 = run("pham-huy", 28);
  { const S: Pt[] = [[0, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.3, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pham-huy") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1889, groups: [{ path: [[-300, 100], [0, 40], [-200, -150], [200, -150], [-250, 250]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.98,1]] }], progress: p0, visible: () => clock.near("pham-huy") }));
  // 2. "huong-cang": chấm ngà theo thuyền ra cửa biển đi xa theo thanh kéo, rồi trở về mang theo đốm vàng (sách, súng) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ra-bien"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1899, groups: [{ path: [THANH_HA, [180, -100], CUA_BIEN, HUONG_CANG, CUA_BIEN, [180, -100], [100, 40]], count: 2, spread: [4,8], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("huong-cang") }));
  { const S: Pt[] = [[100, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("huong-cang") })); }
  // 3. "hieu-anh": một đốm sáng lóe lên rồi tắt nhiều lần (đèn chụp ảnh) ở phố Thanh Hà; người (son) xếp hàng chờ (diễn hoạ).
  const p2 = run("hieu-anh", 28);
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (1 - smoothstep(0.25, 0.3, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hieu-anh") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (1 - smoothstep(0.5, 0.55, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hieu-anh") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (1 - smoothstep(0.75, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hieu-anh") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hieu-anh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1959, groups: [{ path: [[0, 20], [70, 55]], count: 10, spread: [4,60], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p2, visible: () => clock.near("hieu-anh") }));
  // 4. "ve-sau": các đốm vàng (thương điếm) sáng rồi lịm dần; đốm ngà lịm (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[60, 80], [120, 20], [40, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.65, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
