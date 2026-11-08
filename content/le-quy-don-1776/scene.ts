import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DIEN_HA, KINH, THUAN_HOA, QUANG_NAM } from "./terrain";

type Pt = [number, number];

// Lê Quý Đôn và Phủ biên tạp lục — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["do-dau","van-dai","thuan-hoa","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 56], [THUAN_HOA, 48]];

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
    seed: 1776,
  });

  // 1. "do-dau": đốm ngà đi từ Diên Hà lên kinh đô; ba đốm vàng sáng lần lượt (ba lần đỗ đầu) (diễn hoạ).
  const p0 = run("do-dau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1786, groups: [{ path: [DIEN_HA, [40, 320], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p0, visible: () => clock.near("do-dau") }));
  { const S: Pt[] = [[-80, 320], [-60, 325], [-40, 320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-dau") })); }
  // 2. "van-dai": người (son) gặp hạn hán tụ về kinh đô; chín đốm vàng (các mục của sách) sáng dần quanh kinh đô (diễn hoạ).
  const p1 = run("van-dai", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1806, groups: [{ path: [[-250, 200], KINH], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[150, 220], KINH], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p1, visible: () => clock.near("van-dai") }));
  { const S: Pt[] = [[-20, 300], [-29, 326], [-53, 339], [-80, 335], [-98, 314], [-98, 286], [-80, 265], [-53, 261], [-29, 274]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.06, 0.44999999999999996 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-dai") })); }
  // 3. "thuan-hoa": đốm ngà đi từ kinh đô vào Thuận Hóa; các đốm vàng (trang ghi chép) phủ dần khắp Thuận Hóa, Quảng Nam theo thanh kéo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["phu-bien"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1826, groups: [{ path: [KINH, [0, 100], THUAN_HOA], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[0.35,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("thuan-hoa") }));
  { const S: Pt[] = [[80, -180], [20, -150], [140, -160], [60, -230], [0, -260], [120, -260], [150, -320], [80, -330], [200, -280], [30, -340]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.06, 0.44999999999999996 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thuan-hoa") })); }
  // 4. "ve-sau": bốn mươi đốm vàng nhỏ (bốn mươi bộ sách) sáng dần quanh kinh đô (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-95, 280], [-85, 280], [-75, 280], [-65, 280], [-55, 280], [-45, 280], [-35, 280], [-25, 280], [-95, 290], [-85, 290], [-75, 290], [-65, 290], [-55, 290], [-45, 290], [-35, 290], [-25, 290], [-95, 300], [-85, 300], [-75, 300], [-65, 300], [-55, 300], [-45, 300], [-35, 300], [-25, 300], [-95, 310], [-85, 310], [-75, 310], [-65, 310], [-55, 310], [-45, 310], [-35, 310], [-25, 310], [-95, 320], [-85, 320], [-75, 320], [-65, 320], [-55, 320], [-45, 320], [-35, 320], [-25, 320]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.022, 0.18 + i * 0.022, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
