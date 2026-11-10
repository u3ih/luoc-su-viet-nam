import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAI_BOI, DINH, HA_NOI, MAT } from "./terrain";

type Pt = [number, number];

// Trống đồng Ngọc Lũ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tim-thay","ha-noi","mat-trong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAI_BOI, 24], [DINH, 32], [MAT, 72]];

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
    seed: 450,
  });

  // 1. "tim-thay": người đắp đê (son) dọc bãi bồi; đốm vàng (chiếc trống) hiện dưới cát rồi được đưa về đình làng (đốm ngà) (diễn hoạ).
  const p0 = run("tim-thay", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 460, groups: [{ path: [[-260, -60], [-40, -60]], count: 40, spread: [6,20], color: SON, drop: true, timing: [[0.03,0],[0.4,1]] }], progress: p0, visible: () => clock.near("tim-thay") }));
  { const S: Pt[] = [[-120, -70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (1 - smoothstep(0.6, 0.65, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tim-thay") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 480, groups: [{ path: [[-120, -70], [20, -40], [135, 0]], count: 1, spread: [3,3], color: GOLD, timing: [[0.6,0],[0.95,1]] }], progress: p0, visible: () => clock.near("tim-thay") }));
  { const S: Pt[] = [[140, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tim-thay") })); }
  // 2. "ha-noi": chiếc trống (đốm vàng) rời đình làng lên Hà Nội; đốm ngà (Hà Nội) sáng lên (diễn hoạ).
  const p1 = run("ha-noi", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 500, groups: [{ path: [[140, 0], [150, 160], [140, 310]], count: 1, spread: [3,3], color: GOLD, timing: [[0.05,0],[0.75,1]] }], progress: p1, visible: () => clock.near("ha-noi") }));
  { const S: Pt[] = [[140, 320]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ha-noi") })); }
  // 3. "mat-trong": theo thanh kéo, mười bốn đốm vàng (ngôi sao 14 cánh) sáng giữa khoảng trống, rồi các vòng đốm ngà đồng tâm hiện dần từ trong ra ngoài — chỉ là ký hiệu, không vẽ hoa văn (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["mat-trong"] ?? 0) / 0.9);
  { const S: Pt[] = [[9, 120], [8, 124], [6, 127], [2, 129], [-2, 129], [-6, 127], [-8, 124], [-9, 120], [-8, 116], [-6, 113], [-2, 111], [2, 111], [6, 113], [8, 116]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.008, 0.16999999999999998 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-trong") })); }
  { const S: Pt[] = [[22, 120], [21, 127], [18, 133], [13, 138], [7, 141], [0, 142], [-7, 141], [-13, 138], [-18, 133], [-21, 127], [-22, 120], [-21, 113], [-18, 107], [-13, 102], [-7, 99], [0, 98], [7, 99], [13, 102], [18, 107], [21, 113]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.2 + i * 0.004, 0.35 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-trong") })); }
  { const S: Pt[] = [[37, 128], [35, 136], [30, 143], [24, 149], [17, 154], [9, 157], [1, 158], [-8, 157], [-16, 155], [-23, 150], [-29, 144], [-34, 137], [-37, 129], [-38, 121], [-37, 112], [-35, 104], [-30, 97], [-24, 91], [-17, 86], [-9, 83], [-1, 82], [8, 83], [16, 85], [23, 90], [29, 96], [34, 103], [37, 111], [38, 119]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.38 + i * 0.004, 0.53 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-trong") })); }
  { const S: Pt[] = [[50, 141], [45, 149], [40, 157], [33, 163], [25, 168], [16, 172], [7, 174], [-3, 174], [-12, 173], [-21, 170], [-29, 165], [-37, 160], [-43, 153], [-48, 145], [-52, 136], [-54, 127], [-54, 117], [-53, 108], [-50, 99], [-45, 91], [-40, 83], [-33, 77], [-25, 72], [-16, 68], [-7, 66], [3, 66], [12, 67], [21, 70], [29, 75], [37, 80], [43, 87], [48, 95], [52, 104], [54, 113], [54, 123], [53, 132]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.56 + i * 0.004, 0.7100000000000001 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-trong") })); }
  { const S: Pt[] = [[58, 160], [52, 167], [44, 174], [36, 180], [27, 184], [18, 188], [8, 190], [-2, 190], [-12, 189], [-22, 187], [-31, 183], [-40, 178], [-47, 172], [-54, 164], [-60, 156], [-64, 147], [-68, 138], [-70, 128], [-70, 118], [-69, 108], [-67, 98], [-63, 89], [-58, 80], [-52, 73], [-44, 66], [-36, 60], [-27, 56], [-18, 52], [-8, 50], [2, 50], [12, 51], [22, 53], [31, 57], [40, 62], [47, 68], [54, 76], [60, 84], [64, 93], [68, 102], [70, 112], [70, 122], [69, 132], [67, 142], [63, 151]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.74 + i * 0.004, 0.89 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-trong") })); }
  // 4. "ve-sau": sáu chấm sáng (thuyền trên tang trống) đi vòng quanh các vòng đốm, từ trái sang phải (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[9, 120], [8, 124], [6, 127], [2, 129], [-2, 129], [-6, 127], [-8, 124], [-9, 120], [-8, 116], [-6, 113], [-2, 111], [2, 111], [6, 113], [8, 116]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[38, 120], [37, 128], [34, 136], [30, 144], [24, 150], [16, 154], [8, 157], [0, 158], [-8, 157], [-16, 154], [-24, 150], [-30, 144], [-34, 136], [-37, 128], [-38, 120], [-37, 112], [-34, 104], [-30, 96], [-24, 90], [-16, 86], [-8, 83], [0, 82], [8, 83], [16, 86], [24, 90], [30, 96], [34, 104], [37, 112]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.004, 0.15 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[69, 134], [66, 144], [62, 153], [57, 161], [50, 169], [43, 175], [34, 181], [25, 185], [16, 188], [6, 190], [-4, 190], [-14, 189], [-24, 186], [-33, 182], [-41, 177], [-49, 170], [-55, 163], [-61, 154], [-65, 145], [-68, 136], [-70, 126], [-70, 116], [-69, 106], [-66, 96], [-62, 87], [-57, 79], [-50, 71], [-43, 65], [-34, 59], [-25, 55], [-16, 52], [-6, 50], [4, 50], [14, 51], [24, 54], [33, 58], [41, 63], [49, 70], [55, 77], [61, 86], [65, 95], [68, 104], [70, 114], [70, 124]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.002 + i * 0.004, 0.152 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 600, groups: [{ path: [[86, 120], [74, 163], [43, 194], [0, 206], [-43, 194], [-74, 163], [-86, 120], [-74, 77], [-43, 46], [0, 34], [43, 46], [74, 77], [86, 120]], count: 6, spread: [2,140], color: GOLD, drop: true, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
