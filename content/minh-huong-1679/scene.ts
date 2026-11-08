import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CAN_GIO, SOAI_RAP, BIEN_HOA, CU_LAO_PHO, MY_THO, NGOAI_KHOI } from "./terrain";

type Pt = [number, number];

// Người Minh Hương đến Nam Bộ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["roi-que","xin-than-phuc","vao-nam","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BIEN_HOA, 40], [MY_THO, 40]];

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
    counts: { trees: 380, bushes: 600, grass: 2400, reeds: 1100 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1679,
  });

  // 1. "roi-que": đoàn thuyền (xanh nhạt) từ biển xa tiến về phía bờ (diễn hoạ).
  const p0 = run("roi-que", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1689, groups: [{ path: [NGOAI_KHOI, [360, -340]], count: 50, spread: [40,80], color: DICH, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("roi-que") }));
  // 2. "xin-than-phuc": đoàn thuyền dừng ngoài cửa biển; vài chấm (sứ) lên bờ; đốm vàng (chúa Nguyễn) sáng rồi chấp thuận (diễn hoạ).
  const p1 = run("xin-than-phuc", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1699, groups: [{ path: [[380, -360], [360, -330]], count: 50, spread: [40,60], color: DICH, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("xin-than-phuc") }));
  { const S: Pt[] = [[330, -260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xin-than-phuc") })); }
  // 3. "vao-nam": hai đoàn thuyền tách ra: một vào cửa Soài Rạp lên Mỹ Tho, một vào cửa Cần Giờ lên Biên Hòa theo thanh kéo; đốm vàng sáng ở hai nơi (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["vao-nam"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1719, groups: [{ path: [[360, -340], SOAI_RAP, [100, -300], [-100, -230], MY_THO], count: 24, spread: [16,80], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [[360, -340], CAN_GIO, [200, -80], [150, 50], BIEN_HOA], count: 24, spread: [16,80], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("vao-nam") }));
  { const S: Pt[] = [MY_THO, BIEN_HOA]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.05, 0.9500000000000001 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vao-nam") })); }
  // 4. "ve-sau": phố chợ sáng dần ở cù lao Phố và Mỹ Tho (đốm vàng); thuyền buôn (chấm ngà) qua lại tấp nập (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[100, 230], [94, 244], [80, 250], [66, 244], [60, 230], [66, 216], [80, 210], [94, 216], [-178, -190], [-184, -174], [-200, -168], [-216, -174], [-222, -190], [-216, -206], [-200, -212], [-184, -206]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1749, groups: [{ path: [[400, -300], [150, 50], [80, 230], [150, 50], [400, -300]], count: 10, spread: [10,200], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
