import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VAN_MIEU } from "./terrain";

type Pt = [number, number];

// 82 bia tiến sĩ Văn Miếu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Khuôn viên Văn Miếu cách điệu thành vòng tường chữ nhật hẹp, dài theo hướng bắc – nam.
const WALLS: Wall[] = [
  { at: square(0, 40, 60, 0, 0.55), base: 6, top: 4, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-1484","dung-bia","hang-bia","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VAN_MIEU, 104]];

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
    seed: 2023,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "nam-1484": bảy đốm vàng (bảy tấm bia đầu tiên) sáng ở đầu hai hàng (diễn hoạ).
  const p0 = run("nam-1484", 28);
  { const S: Pt[] = [[-12, 20], [-12, 27], [-12, 33], [-12, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.1, 0.25 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1484") })); }
  { const S: Pt[] = [[12, 20], [12, 28], [12, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.1, 0.65 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1484") })); }
  // 2. "dung-bia": các đợt dựng bia: hai hàng đốm ngà dài thêm theo thời gian (diễn hoạ).
  const p1 = run("dung-bia", 28);
  { const S: Pt[] = [[-12, 20], [-12, 23], [-12, 25], [-12, 28], [-12, 31], [-12, 33], [-12, 36], [-12, 38], [-12, 41], [-12, 44], [-12, 46], [-12, 49], [-12, 52], [-12, 54], [-12, 57], [-12, 59], [-12, 62], [-12, 65], [-12, 67], [-12, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.035, 0.2 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-bia") })); }
  { const S: Pt[] = [[12, 20], [12, 23], [12, 25], [12, 28], [12, 31], [12, 33], [12, 36], [12, 38], [12, 41], [12, 44], [12, 46], [12, 49], [12, 52], [12, 54], [12, 57], [12, 59], [12, 62], [12, 65], [12, 67], [12, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.035, 0.25 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dung-bia") })); }
  // 3. "hang-bia": theo thanh kéo, hai hàng 41 đốm vàng (82 tấm bia) lần lượt sáng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["hang-bia"] ?? 0) / 0.9);
  { const S: Pt[] = [[-12, 0], [-12, 2], [-12, 4], [-12, 6], [-12, 8], [-12, 10], [-12, 12], [-12, 14], [-12, 16], [-12, 18], [-12, 20], [-12, 22], [-12, 24], [-12, 26], [-12, 28], [-12, 30], [-12, 32], [-12, 34], [-12, 36], [-12, 38], [-12, 40], [-12, 42], [-12, 44], [-12, 46], [-12, 48], [-12, 50], [-12, 52], [-12, 54], [-12, 56], [-12, 58], [-12, 60], [-12, 62], [-12, 64], [-12, 66], [-12, 68], [-12, 70], [-12, 72], [-12, 74], [-12, 76], [-12, 78], [-12, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hang-bia") })); }
  { const S: Pt[] = [[12, 0], [12, 2], [12, 4], [12, 6], [12, 8], [12, 10], [12, 12], [12, 14], [12, 16], [12, 18], [12, 20], [12, 22], [12, 24], [12, 26], [12, 28], [12, 30], [12, 32], [12, 34], [12, 36], [12, 38], [12, 40], [12, 42], [12, 44], [12, 46], [12, 48], [12, 50], [12, 52], [12, 54], [12, 56], [12, 58], [12, 60], [12, 62], [12, 64], [12, 66], [12, 68], [12, 70], [12, 72], [12, 74], [12, 76], [12, 78], [12, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.03 + i * 0.02, 0.18 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hang-bia") })); }
  // 4. "ve-sau": hai hàng bia (đốm vàng) sáng đều; khách thăm (son) đi dọc trục giữa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-12, 0], [-12, 2], [-12, 4], [-12, 6], [-12, 8], [-12, 10], [-12, 12], [-12, 14], [-12, 16], [-12, 18], [-12, 20], [-12, 22], [-12, 24], [-12, 26], [-12, 28], [-12, 30], [-12, 32], [-12, 34], [-12, 36], [-12, 38], [-12, 40], [-12, 42], [-12, 44], [-12, 46], [-12, 48], [-12, 50], [-12, 52], [-12, 54], [-12, 56], [-12, 58], [-12, 60], [-12, 62], [-12, 64], [-12, 66], [-12, 68], [-12, 70], [-12, 72], [-12, 74], [-12, 76], [-12, 78], [-12, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[12, 0], [12, 2], [12, 4], [12, 6], [12, 8], [12, 10], [12, 12], [12, 14], [12, 16], [12, 18], [12, 20], [12, 22], [12, 24], [12, 26], [12, 28], [12, 30], [12, 32], [12, 34], [12, 36], [12, 38], [12, 40], [12, 42], [12, 44], [12, 46], [12, 48], [12, 50], [12, 52], [12, 54], [12, 56], [12, 58], [12, 60], [12, 62], [12, 64], [12, 66], [12, 68], [12, 70], [12, 72], [12, 74], [12, 76], [12, 78], [12, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2113, groups: [{ path: [[0, -120], [0, 70]], count: 30, spread: [2,4], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
