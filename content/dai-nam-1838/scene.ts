import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAC_THANH, HUE, GIA_DINH } from "./terrain";

type Pt = [number, number];

// Ba mươi tỉnh và quốc hiệu Đại Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["truoc-1831","chia-tinh","quoc-hieu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAC_THANH, 48], [HUE, 48], [GIA_DINH, 48]];

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
    seed: 1838,
  });

  // 1. "truoc-1831": ba đốm vàng lớn: Bắc thành, kinh đô, Gia Định thành (diễn hoạ).
  const p0 = run("truoc-1831", 28);
  { const S: Pt[] = [BAC_THANH, HUE, GIA_DINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truoc-1831") })); }
  // 2. "chia-tinh": hai đốm xanh nhạt (tổng trấn) tắt; ba mươi đốm vàng (ba mươi tỉnh) lần lượt sáng từ bắc vào nam theo thanh kéo, đốm ngà ở Thừa Thiên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["chia-tinh"] ?? 0) / 0.9);
  { const S: Pt[] = [BAC_THANH, GIA_DINH]; world.add(createGlows({ count: S.length, color: DICH, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.05, 0.25, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-tinh") })); }
  { const S: Pt[] = [[-200, 360], [-120, 360], [-40, 350], [-220, 300], [-140, 300], [-60, 290], [20, 300], [-180, 240], [-100, 230], [-20, 220], [40, 240], [-150, 180], [-60, 170], [20, 160], [80, 120], [0, 90], [100, 60], [20, 40], [130, -40], [60, -80], [150, -120], [80, -160], [170, -200], [100, -240], [40, -280], [160, -280], [80, -330], [180, -350], [20, -360], [120, -380]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.028, 0.2 + i * 0.028, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-tinh") })); }
  { const S: Pt[] = [HUE]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-tinh") })); }
  // 3. "quoc-hieu": đốm vàng lớn ở kinh đô sáng rực (chiếu đổi quốc hiệu); người (son) tụ về (diễn hoạ).
  const p2 = run("quoc-hieu", 28);
  { const S: Pt[] = [HUE]; world.add(createGlows({ count: S.length, color: GOLD, size: 30, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-hieu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1898, groups: [{ path: [[-100, 100], HUE], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[150, -150], HUE], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("quoc-hieu") }));
  // 4. "ve-sau": các đốm vàng (các tỉnh) sáng đều khắp dải đất (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-200, 360], [-120, 360], [-40, 350], [-220, 300], [-140, 300], [-60, 290], [20, 300], [-180, 240], [-100, 230], [-20, 220], [40, 240], [-150, 180], [-60, 170], [20, 160], [80, 120], [0, 90], [100, 60], [20, 40], [130, -40], [60, -80], [150, -120], [80, -160], [170, -200], [100, -240], [40, -280], [160, -280], [80, -330], [180, -350], [20, -360], [120, -380]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.004, 0.15 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [HUE]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
