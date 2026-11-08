import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BACH_VAN, TRUNG_TAN, KINH, CAU1, CAU2 } from "./terrain";

type Pt = [number, number];

// Trạng Trình Nguyễn Bỉnh Khiêm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["the-ky","trang-nguyen","bach-van","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BACH_VAN, 40], [KINH, 56]];

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
    seed: 1535,
  });

  // 1. "the-ky": hai đoàn quân (son, xanh nhạt) giằng co nhiều nơi trên đồng bằng (Nam – Bắc triều) (diễn hoạ).
  const p0 = run("the-ky", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1545, groups: [{ path: [[-350, -200], [-100, -50]], count: 26, spread: [40,60], color: SON, timing: [[0.03,0],[0.6,1]] }, { path: [[-350, 300], [-120, 60]], count: 26, spread: [40,60], color: DICH, timing: [[0.06,0],[0.6,1]] }], progress: p0, visible: () => clock.near("the-ky") }));
  // 2. "trang-nguyen": đốm ngà đến kinh đô dự thi; đốm vàng sáng (Trạng nguyên) (diễn hoạ).
  const p1 = run("trang-nguyen", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1555, groups: [{ path: [BACH_VAN, [-80, 100], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.55,1]] }], progress: p1, visible: () => clock.near("trang-nguyen") }));
  { const S: Pt[] = [[-250, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-nguyen") })); }
  // 3. "bach-van": học trò (son) từ khắp nơi tìm về am Bạch Vân theo thanh kéo; đốm vàng sáng ở quán Trung Tân và hai cây cầu (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["bach-van"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1575, groups: [{ path: [[-300, -300], BACH_VAN], count: 14, spread: [26,50], color: SON, timing: [[0,0],[0.9,1]] }, { path: [[-350, 50], BACH_VAN], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[1,1]] }, { path: [[300, -300], CAU2, TRUNG_TAN, BACH_VAN], count: 12, spread: [26,50], color: SON, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("bach-van") }));
  { const S: Pt[] = [BACH_VAN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bach-van") })); }
  { const S: Pt[] = [TRUNG_TAN, CAU1, CAU2]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.1, 0.44999999999999996 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bach-van") })); }
  // 4. "ve-sau": các đốm vàng nhỏ (bài thơ Bạch Vân) sáng dần quanh am (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[110, 40], [106, 55], [95, 66], [80, 70], [65, 66], [54, 55], [50, 40], [54, 25], [65, 14], [80, 10], [95, 14], [106, 25], [134, 51], [124, 73], [105, 89], [81, 95], [57, 90], [38, 75], [27, 54], [26, 29], [36, 7], [55, -9], [79, -15], [103, -10], [122, 5], [133, 26]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.03, 0.18 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [BACH_VAN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.8, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
