import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, THIEN_MAC, THIEN_TRUONG } from "./terrain";

type Pt = [number, number];

// Trần Bình Trọng ở bãi Thiên Mạc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["rut-lui","thien-mac","khang-khai","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 48], [THIEN_TRUONG, 48]];

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
    counts: { trees: 380, bushes: 550, grass: 2600, reeds: 1000 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1285,
  });

  // 1. "rut-lui": đoàn quân, đoàn thuyền nhà Trần (son, ngà) rời Thăng Long xuôi về Thiên Trường; một toán (ngà) dừng lại ở bãi Thiên Mạc (diễn hoạ).
  const p0 = run("rut-lui", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1295, groups: [{ path: [THANG_LONG, [-150, 200], [0, 40], [120, -150], THIEN_TRUONG], count: 16, spread: [12,80], color: NGHIA, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("rut-lui") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1305, groups: [{ path: [THANG_LONG, [-130, 200], [30, 30]], count: 24, spread: [20,60], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("rut-lui") }));
  // 2. "thien-mac": thuyền nhẹ, kỵ binh Nguyên (xanh nhạt) đuổi xuống; quân Trần (son) giữ bãi Thiên Mạc chặn lại theo thanh kéo; lửa bùng trên bãi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thien-mac"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1315, groups: [{ path: [[-300, 400], [-150, 200], [-20, 70]], count: 20, spread: [16,60], color: DICH, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thien-mac") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1325, groups: [{ path: [[-200, 250], [-60, 90]], count: 30, spread: [40,60], color: DICH, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thien-mac") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1335, groups: [{ path: [[30, 30], [40, 10]], count: 24, spread: [40,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thien-mac") }));
  world.add(createFires({ sites: [[20, 30], [50, 10], [70, 30], [30, 0]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("thien-mac") * smoothstep(0.5, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "khang-khai": đốm ngà (Trần Bình Trọng) giữa vòng quân Nguyên (xanh nhạt), sáng rồi lịm dần (diễn hoạ).
  const p2 = run("khang-khai", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1355, groups: [{ path: [[-20, 60], [10, 30]], count: 30, spread: [60,40], color: DICH, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("khang-khai") }));
  { const S: Pt[] = [THIEN_MAC]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.6, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khang-khai") })); }
  // 4. "ve-sau": trời rạng; đốm vàng sáng ở bãi Thiên Mạc; đoàn thuyền (ngà) đã về đến Thiên Trường an toàn (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [THIEN_MAC]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [THIEN_TRUONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
