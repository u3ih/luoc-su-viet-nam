import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHI_LANG, VAN_KIEP, HAI_DUONG, KINH } from "./terrain";

type Pt = [number, number];

// Hịch tướng sĩ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chi-lang","tau-vua","van-kiep","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VAN_KIEP, 56]];

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
    counts: { trees: 600, bushes: 650, grass: 2000, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1284,
  });

  // 1. "chi-lang": quân Nguyên (xanh nhạt) tràn qua ải Chi Lăng; quân Trần (son) lui về Vạn Kiếp (diễn hoạ).
  const p0 = run("chi-lang", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1294, groups: [{ path: [[50, 400], CHI_LANG, [60, 200]], count: 40, spread: [40,80], color: DICH, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("chi-lang") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1304, groups: [{ path: [[60, 260], [70, 150], [80, 60]], count: 26, spread: [30,60], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("chi-lang") }));
  // 2. "tau-vua": đốm vàng (vua) ở Hải Dương; đốm ngà (Hưng Đạo vương) đi từ Vạn Kiếp đến gặp rồi trở về (diễn hoạ).
  const p1 = run("tau-vua", 28);
  { const S: Pt[] = [HAI_DUONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tau-vua") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1324, groups: [{ path: [VAN_KIEP, [170, -60], [240, -140], [170, -60], VAN_KIEP], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.95,1]] }], progress: p1, visible: () => clock.near("tau-vua") }));
  // 3. "van-kiep": các đạo quân (son) từ khắp các lộ tụ về Vạn Kiếp theo thanh kéo; đốm ngà ở giữa, lửa trại bật dần (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["van-kiep"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1334, groups: [{ path: [[-350, 250], [80, 60]], count: 26, spread: [30,60], color: SON, timing: [[0,0],[1,1]] }, { path: [[-300, -300], [70, 30]], count: 26, spread: [30,60], color: SON, timing: [[0.1,0],[1,1]] }, { path: [[380, 200], [90, 50]], count: 26, spread: [30,60], color: SON, timing: [[0.2,0],[1,1]] }, { path: [[350, -350], [90, 30]], count: 26, spread: [30,60], color: SON, timing: [[0.3,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("van-kiep") }));
  { const S: Pt[] = [VAN_KIEP]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-kiep") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(VAN_KIEP, 45, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: (ctx) => clock.near("van-kiep") * smoothstep(0.4, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": các đốm vàng nhỏ (những dòng hịch được chép lại) sáng dần quanh Vạn Kiếp (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[55, 30], [65, 30], [75, 30], [85, 30], [95, 30], [105, 30], [55, 40], [65, 40], [75, 40], [85, 40], [95, 40], [105, 40], [55, 50], [65, 50], [75, 50], [85, 50], [95, 50], [105, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(VAN_KIEP, 45, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
