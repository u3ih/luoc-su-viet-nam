import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BO, CANH_DOC, VUNG_LOI } from "./terrain";

type Pt = [number, number];

// Vịnh Hạ Long — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dao-da","nguoi-xua","unesco","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

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
    counts: { trees: 300, bushes: 400, grass: 800, reeds: 100 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1994,
  });

  // 1. "dao-da": thuyền (chấm ngà) chậm rãi đi giữa các đảo đá (diễn hoạ).
  const p0 = run("dao-da", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2004, groups: [{ path: [[-300, 100], [-100, -60], [60, -10], [200, -150], [350, -300]], count: 6, spread: [8,300], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("dao-da") }));
  // 2. "nguoi-xua": những đốm lửa nhỏ (người tiền sử) sáng ở chân các đảo; đốm ngà (thơ Nguyễn Trãi) trên bờ (diễn hoạ).
  const p1 = run("nguoi-xua", 28);
  world.add(createFires({ sites: [[-120, -40], [40, -150], [180, -60], [-40, -250]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nguoi-xua") * smoothstep(0.05, 0.9, p1()), size: 2, glow: () => 0.8 }));
  { const S: Pt[] = [[-200, 300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguoi-xua") })); }
  // 3. "unesco": theo thanh kéo, vòng đốm vàng khoanh vùng lõi di sản giữa vịnh (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["unesco"] ?? 0) / 0.9);
  { const S: Pt[] = [[220, -100], [215, -54], [201, -11], [178, 29], [147, 63], [110, 91], [68, 109], [23, 119], [-23, 119], [-68, 109], [-110, 91], [-147, 63], [-178, 29], [-201, -11], [-215, -54], [-220, -100], [-215, -146], [-201, -189], [-178, -229], [-147, -263], [-110, -291], [-68, -309], [-23, -319], [23, -319], [68, -309], [110, -291], [147, -263], [178, -229], [201, -189], [215, -146]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("unesco") })); }
  // 4. "ve-sau": đốm vàng ấm (động Thiên Cung) trong lưng đảo Canh Độc; thuyền khách (chấm ngà) ghé đảo (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[60, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 25, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2054, groups: [{ path: [[-200, 150], [40, -40]], count: 8, spread: [10,100], color: NGHIA, timing: [[0.02,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
