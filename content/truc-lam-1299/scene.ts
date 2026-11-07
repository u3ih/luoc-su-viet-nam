import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, DONG_CUU, VU_LAM, CHAN_NUI, YEN_TU, NGOA_VAN, QUY_DUC, PHO_MINH, HOA_YEN } from "./terrain";

type Pt = [number, number];

// Thiền phái Trúc Lâm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thai-tu","nhuong-ngoi","len-nui","mot-dong","vien-tich"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 48], [VU_LAM, 32], [CHAN_NUI, 32]];

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
    counts: { trees: 700, bushes: 700, grass: 1800, reeds: 500 },
    forestAt: 0.5,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1299,
  });

  // 1. "thai-tu": một chấm ngà rời kinh đô trong đêm đi về phía núi Đông Cứu, đốm vàng sáng ở Đông Cứu, một toán người (son) đuổi theo (diễn hoạ).
  const p0 = run("thai-tu", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1309, groups: [{ path: [THANG_LONG, [-200, -150], DONG_CUU], count: 2, spread: [4,6], color: NGHIA, timing: [[0.03,0],[0.6,1]] }], progress: p0, visible: () => clock.near("thai-tu") }));
  { const S: Pt[] = [DONG_CUU]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 26, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thai-tu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1329, groups: [{ path: [THANG_LONG, [-200, -150], [-140, -90]], count: 12, spread: [20,30], color: SON, timing: [[0.45,0],[1,1]] }], progress: p0, visible: () => clock.near("thai-tu") }));
  // 2. "nhuong-ngoi": người (son) tụ về kinh đô, đốm vàng sáng ở kinh đô; một đốm ngà rời kinh đô đi về Vũ Lâm (diễn hoạ).
  const p1 = run("nhuong-ngoi", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1339, groups: [{ path: [[-150, -200], THANG_LONG], count: 16, spread: [30,50], color: SON, timing: [[0.03,0],[0.6,1]] }, { path: [[-380, -180], THANG_LONG], count: 12, spread: [30,50], color: SON, timing: [[0.08,0],[0.6,1]] }], progress: p1, visible: () => clock.near("nhuong-ngoi") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhuong-ngoi") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1359, groups: [{ path: [THANG_LONG, [-320, -100], VU_LAM], count: 2, spread: [4,6], color: NGHIA, timing: [[0.4,0],[0.95,1]] }], progress: p1, visible: () => clock.near("nhuong-ngoi") }));
  // 3. "len-nui": một đốm ngà dẫn đoàn người (son) theo đường núi từ chân núi lên Yên Tử theo thanh kéo, các đốm vàng (tịnh xá) sáng dần dọc đường (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["len-nui"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1369, groups: [{ path: [CHAN_NUI, [70, 45], [60, 80], HOA_YEN, [120, 125], [150, 140], YEN_TU], count: 2, spread: [4,6], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("len-nui") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1379, groups: [{ path: [[-40, -20], CHAN_NUI, [70, 45], [60, 80], HOA_YEN, [120, 125], [150, 140]], count: 26, spread: [8,70], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("len-nui") }));
  { const S: Pt[] = [[70, 45], HOA_YEN, [150, 140], YEN_TU]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.2, 0.25 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-nui") })); }
  // 4. "mot-dong": ba dòng ánh sáng (ngà, xanh nhạt, vàng) từ ba phía hợp về Yên Tử; các nhóm người (son) đi giảng ở đồng bằng (diễn hoạ).
  const p3 = run("mot-dong", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 6, seed: 1399, groups: [{ path: [[-380, 300], [-100, 220], YEN_TU], count: 6, spread: [20,40], color: NGHIA, arrive: GOLD, timing: [[0.03,0],[0.7,1]] }, { path: [[-300, -350], [0, -80], YEN_TU], count: 6, spread: [20,40], color: DICH, timing: [[0.06,0],[0.7,1]] }, { path: [[380, -300], [250, 0], YEN_TU], count: 6, spread: [20,40], color: GOLD, timing: [[0.09,0],[0.7,1]] }], progress: p3, visible: () => clock.near("mot-dong") }));
  { const S: Pt[] = [YEN_TU]; world.add(createGlows({ count: S.length, color: GOLD, size: 30, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mot-dong") })); }
  // 5. "vien-tich": đốm vàng trên đỉnh Ngọa Vân sáng rồi lặng; ba đốm vàng tỏa về ba nơi (Quy Đức, Hoa Yên, Phổ Minh) (diễn hoạ).
  const p4 = run("vien-tich", 28);
  { const S: Pt[] = [NGOA_VAN]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.45, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vien-tich") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 8, seed: 1429, groups: [{ path: [NGOA_VAN, YEN_TU, HOA_YEN], count: 1, spread: [2,2], color: GOLD, size: 2, timing: [[0.4,0],[0.9,1]] }, { path: [NGOA_VAN, CHAN_NUI, QUY_DUC], count: 1, spread: [2,2], color: GOLD, size: 2, timing: [[0.4,0],[0.95,1]] }, { path: [NGOA_VAN, CHAN_NUI, PHO_MINH], count: 1, spread: [2,2], color: GOLD, size: 2, timing: [[0.4,0],[1,1]] }], progress: p4, visible: () => clock.near("vien-tich") }));
};

export default setup;
