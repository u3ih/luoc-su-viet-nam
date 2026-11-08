import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, QUANG_NAM, HA_TINH, QUANG_NGAI, BINH_THUAN } from "./terrain";

type Pt = [number, number];

// Cuộc vận động Duy Tân ở Trung Kỳ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chu-truong","van-dong","ngan-tro","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUANG_NAM, 48]];

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
    seed: 1906,
  });

  // 1. "chu-truong": ba đốm ngà (ba nhà duy tân) gặp nhau ở Quảng Nam; người (son) tụ lại nghe (diễn hoạ).
  const p0 = run("chu-truong", 28);
  { const S: Pt[] = [[60, 50], [80, 60], [100, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chu-truong") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1926, groups: [{ path: [[-100, 150], [70, 30]], count: 18, spread: [26,50], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("chu-truong") }));
  // 2. "van-dong": ba đốm ngà tỏa đi khắp các làng theo thanh kéo; các đốm vàng (trường học, hiệu buôn) lần lượt sáng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["van-dong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1936, groups: [{ path: [QUANG_NAM, [-150, 100], [-250, 200]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [QUANG_NAM, [-100, -120], [-200, -220]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [QUANG_NAM, [150, -100], [120, -250]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("van-dong") }));
  { const S: Pt[] = [[-60, 80], [-150, 100], [-250, 200], [-50, -60], [-100, -120], [-200, -220], [140, -60], [150, -100], [120, -250], [0, 160], [180, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.07, 0.25 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-dong") })); }
  // 3. "ngan-tro": các đám đông (son) bị giải tán; đốm ngà ở Hà Tĩnh chuyển xuống Bình Thuận; đốm ngà ở Quảng Ngãi chập chờn (diễn hoạ).
  const p2 = run("ngan-tro", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1956, groups: [{ path: [[0, 0], [-80, 60]], count: 20, spread: [40,40], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("ngan-tro") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1966, groups: [{ path: [HA_TINH, [200, 200], [230, -200], BINH_THUAN], count: 1, spread: [3,3], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("ngan-tro") }));
  { const S: Pt[] = [QUANG_NGAI]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngan-tro") })); }
  // 4. "ve-sau": các đốm vàng lịm dần; những chấm xanh nhạt (người bị đày) theo thuyền ra biển xa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-60, 80], [-150, 100], [-250, 200], [-50, -60], [-100, -120], [-200, -220], [140, -60], [150, -100], [120, -250]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.005, 0.15 + i * 0.005, k) * (1 - smoothstep(0.2, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1996, groups: [{ path: [QUANG_NAM, [250, -50], [380, -390]], count: 8, spread: [10,40], color: DICH, timing: [[0.3,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
