import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, AI_LAO, VAN_LAI, TAY_DO, THANG_LONG, THUAN_HOA } from "./terrain";

type Pt = [number, number];

// Trịnh Kiểm nắm binh quyền Nam triều — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguyen-kim","nam-1545","nam-bac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VAN_LAI, 40], [TAY_DO, 32]];

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
    seed: 1545,
  });

  // 1. "nguyen-kim": quân Nam triều (son) từ Ai Lao kéo về Thanh Hóa; đốm ngà (Nguyễn Kim) và một chấm ngà (Trịnh Kiểm) theo sau; thành Tây Đô (đốm vàng) sáng lên (diễn hoạ).
  const p0 = run("nguyen-kim", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1555, groups: [{ path: [[-320, 60], [-220, -40], [-150, -95]], count: 50, spread: [14,60], color: SON, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("nguyen-kim") }));
  { const S: Pt[] = [[-140, -100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-kim") })); }
  { const S: Pt[] = [[0, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-kim") })); }
  // 2. "nam-1545": đốm ngà (Nguyễn Kim) tắt; đốm vàng (Trịnh Kiểm) sáng lên; quân Mạc (xanh nhạt) đánh úp từ phía bắc rồi tan ở bờ sông (diễn hoạ).
  const p1 = run("nam-1545", 28);
  { const S: Pt[] = [[-140, -100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.1, 0.3, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1545") })); }
  { const S: Pt[] = [[-130, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1545") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1605, groups: [{ path: [[180, 330], [40, 100], [-40, -40]], count: 40, spread: [16,60], color: DICH, mortal: true, timing: [[0.3,0],[0.75,1]] }], progress: p1, fall: (ctx) => smoothstep(0.05, 0.9, p1()), visible: () => clock.near("nam-1545") }));
  // 3. "nam-bac": theo thanh kéo, hào kiệt các xứ phía nam (son) kéo về Vạn Lại; dải đốm xanh nhạt phía bắc (Bắc triều), đốm ngà phía nam (Nam triều) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-bac"] ?? 0) / 0.9);
  { const S: Pt[] = [[-250, 140], [-150, 108], [-50, 76], [50, 66], [150, 78], [250, 90]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.02, 0.15 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-bac") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1625, groups: [{ path: [[150, -380], [0, -250], [-120, -110]], count: 20, spread: [8,40], color: SON, timing: [[0,0],[0.8,1]] }, { path: [[300, -300], [60, -200], [-110, -110]], count: 20, spread: [8,40], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [[250, -150], [40, -120], [-100, -100]], count: 20, spread: [8,40], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nam-bac") }));
  { const S: Pt[] = [[-130, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-bac") })); }
  // 4. "ve-sau": Nguyễn Hoàng (chấm ngà) rời Thanh Hóa vào Thuận Hóa; đốm vàng ở Vạn Lại lịm dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1645, groups: [{ path: [[-130, -100], [20, -250], [150, -370]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[150, -380]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-130, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.7, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
