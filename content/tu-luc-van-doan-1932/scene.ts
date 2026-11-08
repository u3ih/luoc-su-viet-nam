import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TOA_SOAN, HO } from "./terrain";

type Pt = [number, number];

// Tự Lực văn đoàn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phong-hoa","ton-chi","sang-tac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TOA_SOAN, 48]];

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
    seed: 1932,
  });

  // 1. "phong-hoa": các đốm ngà (ban biên tập) tụ về tòa soạn; người (son) xếp hàng mua báo (diễn hoạ).
  const p0 = run("phong-hoa", 28);
  { const S: Pt[] = [[30, 20], [25, 29], [15, 29], [10, 20], [15, 11], [25, 11]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-hoa") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1952, groups: [{ path: [[20, -150], [20, -10]], count: 24, spread: [6,120], color: SON, timing: [[0.3,0],[1,1]] }], progress: p0, visible: () => clock.near("phong-hoa") }));
  // 2. "ton-chi": mười đốm vàng (mười điều tôn chỉ) sáng thành vòng quanh tòa soạn (diễn hoạ).
  const p1 = run("ton-chi", 28);
  { const S: Pt[] = [[46, 20], [41, 35], [28, 45], [12, 45], [-1, 35], [-6, 20], [-1, 5], [12, -5], [28, -5], [41, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.07, 0.25 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ton-chi") })); }
  { const S: Pt[] = [[30, 20], [26, 28], [18, 30], [11, 24], [11, 16], [18, 10], [26, 12]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ton-chi") })); }
  // 3. "sang-tac": sách, báo (đốm vàng) lan từ tòa soạn ra khắp các tỉnh theo thanh kéo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["sang-tac"] ?? 0) / 0.9);
  { const S: Pt[] = [[20, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sang-tac") })); }
  { const S: Pt[] = [[110, 20], [84, 84], [20, 110], [-44, 84], [-70, 20], [-44, -44], [20, -70], [84, -44], [198, 47], [161, 132], [86, 188], [-7, 198], [-92, 161], [-148, 86], [-158, -7], [-121, -92], [-46, -148], [47, -158], [132, -121], [188, -46], [287, 103], [235, 199], [151, 268], [46, 299], [-63, 287], [-159, 235], [-228, 151], [-259, 46], [-247, -63], [-195, -159], [-111, -228], [-6, -259], [103, -247], [199, -195], [268, -111], [299, -6]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.025, 0.2 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sang-tac") })); }
  // 4. "ve-sau": những đốm sáng tự do (câu thơ mới) bay lên quanh hồ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 12, seed: 2002, groups: [{ path: [[-180, -40], [-100, 60], [-60, -40], [-160, 50]], count: 10, spread: [20,120], color: GOLD, timing: [[0.03,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[46, 20], [41, 35], [28, 45], [12, 45], [-1, 35], [-6, 20], [-1, 5], [12, -5], [28, -5], [41, 5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.5 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
