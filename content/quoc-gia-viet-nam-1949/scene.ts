import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI_F, DA_LAT_F, SAI_GON_F, ELYSEE } from "./terrain";

type Pt = [number, number];

// Quốc gia Việt Nam và Việt Nam Cộng hoà — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["elysee","hai-khoi","vi-tuyen-17","cong-hoa"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI_F, 32], [SAI_GON_F, 32], [DA_LAT_F, 20]];

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
    seed: 1949,
  });

  // 1. "elysee": đốm vàng (hiệp định) ở ký hiệu Élysée ngoài khơi; đốm ngà sáng ở Sài Gòn; đốm son vẫn sáng ở vùng Hà Nội (diễn hoạ).
  const p0 = run("elysee", 28);
  { const S: Pt[] = [[200, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("elysee") })); }
  { const S: Pt[] = [[0, -150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("elysee") })); }
  { const S: Pt[] = [[-40, 170]]; world.add(createGlows({ count: S.length, color: SON, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("elysee") })); }
  // 2. "hai-khoi": vòng đốm xanh nhạt (các nước công nhận) quanh Sài Gòn; vòng đốm son quanh Hà Nội; đốm vàng ở Đà Lạt (diễn hoạ).
  const p1 = run("hai-khoi", 28);
  { const S: Pt[] = [[50, -145], [37, -117], [11, -101], [-20, -104], [-43, -125], [-50, -155], [-37, -183], [-11, -199], [20, -196], [43, -175]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.03, 0.25 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-khoi") })); }
  { const S: Pt[] = [[10, 175], [-3, 203], [-29, 219], [-60, 216], [-83, 195], [-90, 165], [-77, 137], [-51, 121], [-20, 124], [3, 145]]; world.add(createGlows({ count: S.length, color: SON, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.03, 0.44999999999999996 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-khoi") })); }
  { const S: Pt[] = [[-80, -80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-khoi") })); }
  // 3. "vi-tuyen-17": theo thanh kéo, dòng người di cư (ngà) từ phía bắc đi qua vĩ tuyến 17 vào Nam; một nhóm nhỏ (son) đi ngược ra Bắc; vạch đốm vàng dọc vĩ tuyến (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["vi-tuyen-17"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2019, groups: [{ path: [[-40, 170], [-10, 60], [0, -150]], count: 90, spread: [6,24], color: NGHIA, timing: [[0.02,0],[0.9,1]] }, { path: [[40, 150], [30, 40], [10, -140]], count: 40, spread: [4,16], color: NGHIA, timing: [[0.1,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("vi-tuyen-17") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2029, groups: [{ path: [[-60, -120], [-60, 40], [-50, 160]], count: 20, spread: [3,10], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("vi-tuyen-17") }));
  { const S: Pt[] = [[-200, 42], [-162, 42], [-124, 42], [-87, 42], [-49, 42], [-11, 42], [27, 42], [64, 42], [102, 42], [140, 42]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vi-tuyen-17") })); }
  // 4. "cong-hoa": đám đông (ngà) ở Sài Gòn; đốm vàng sáng ở giữa; vòng đốm xanh nhạt nhỏ quanh (diễn hoạ).
  const p3 = run("cong-hoa", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2049, groups: [{ path: [[40, -150], [32, -126], [12, -112], [-12, -112], [-32, -126], [-40, -150], [-32, -174], [-12, -188], [12, -188], [32, -174], [40, -150]], count: 90, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("cong-hoa") }));
  { const S: Pt[] = [[0, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-hoa") })); }
  { const S: Pt[] = [[69, -136], [52, -104], [22, -84], [-14, -81], [-46, -98], [-66, -128], [-69, -164], [-52, -196], [-22, -216], [14, -219], [46, -202], [66, -172]]; world.add(createGlows({ count: S.length, color: DICH, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.02, 0.7000000000000001 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-hoa") })); }
};

export default setup;
