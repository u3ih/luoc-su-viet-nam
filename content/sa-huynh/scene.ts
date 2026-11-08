import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAM, LANG, GO_A, GO_B, GO_C, NGOAI_KHOI } from "./terrain";

type Pt = [number, number];

// Văn hóa Sa Huỳnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["kho-chum","lang-ven-song","mo-chum","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG, 40], [GO_A, 24], [GO_B, 24], [GO_C, 24]];

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
    seed: 500,
  });

  // 1. "kho-chum": vài chấm ngà (người khảo cổ) đến bờ đầm; khoảng hai trăm đốm vàng nhỏ (chum táng) lộ ra quanh đầm (diễn hoạ).
  const p0 = run("kho-chum", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 510, groups: [{ path: [[-100, -150], [160, 20]], count: 4, spread: [6,10], color: NGHIA, timing: [[0.02,0],[0.4,1]] }], progress: p0, visible: () => clock.near("kho-chum") }));
  { const S: Pt[] = [[236, 40], [235, 50], [232, 59], [227, 67], [221, 74], [213, 80], [204, 84], [195, 86], [185, 86], [176, 84], [167, 80], [159, 74], [153, 67], [148, 59], [145, 50], [144, 40], [145, 30], [148, 21], [153, 13], [159, 6], [167, 0], [176, -4], [185, -6], [195, -6], [204, -4], [213, 0], [221, 6], [227, 13], [232, 21], [235, 30], [250, 46], [248, 57], [244, 67], [238, 77], [230, 85], [221, 91], [211, 96], [201, 99], [190, 100], [179, 99], [168, 96], [158, 91], [149, 84], [142, 76], [136, 66], [132, 56], [130, 45], [130, 34], [132, 23], [136, 13], [142, 3], [150, -5], [159, -11], [169, -16], [179, -19], [190, -20], [201, -19], [212, -16], [222, -11], [231, -4], [238, 4], [244, 14], [248, 24], [250, 35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.35 + i * 0.008, 0.5 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kho-chum") })); }
  // 2. "lang-ven-song": người làng (son) ra đồng ven sông; thuyền (chấm ngà) đánh cá ngoài biển (diễn hoạ).
  const p1 = run("lang-ven-song", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 530, groups: [{ path: [LANG, [-80, 20]], count: 20, spread: [40,40], color: SON, timing: [[0.03,0],[0.8,1]] }, { path: [LANG, [80, 20]], count: 16, spread: [40,40], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p1, visible: () => clock.near("lang-ven-song") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 540, groups: [{ path: [DAM, [300, 60], [340, -60], [300, 120]], count: 8, spread: [20,120], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p1, visible: () => clock.near("lang-ven-song") }));
  // 3. "mo-chum": theo thanh kéo, ba gò lần lượt hiện những cụm đốm vàng (mộ chum); đốm ngà nhỏ (hạt cườm) lấp lánh (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["mo-chum"] ?? 0) / 0.9);
  { const S: Pt[] = [[106, -50.5], [113, -50.5], [120, -50.5], [127, -50.5], [134, -50.5], [106, -43.5], [113, -43.5], [120, -43.5], [127, -43.5], [134, -43.5], [106, -36.5], [113, -36.5], [120, -36.5], [127, -36.5], [134, -36.5], [106, -29.5], [113, -29.5], [120, -29.5], [127, -29.5], [134, -29.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.012, 0.16999999999999998 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-chum") })); }
  { const S: Pt[] = [[46, -100.5], [53, -100.5], [60, -100.5], [67, -100.5], [74, -100.5], [46, -93.5], [53, -93.5], [60, -93.5], [67, -93.5], [74, -93.5], [46, -86.5], [53, -86.5], [60, -86.5], [67, -86.5], [74, -86.5], [46, -79.5], [53, -79.5], [60, -79.5], [67, -79.5], [74, -79.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.012, 0.44999999999999996 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-chum") })); }
  { const S: Pt[] = [[116, 119.5], [123, 119.5], [130, 119.5], [137, 119.5], [144, 119.5], [116, 126.5], [123, 126.5], [130, 126.5], [137, 126.5], [144, 126.5], [116, 133.5], [123, 133.5], [130, 133.5], [137, 133.5], [144, 133.5], [116, 140.5], [123, 140.5], [130, 140.5], [137, 140.5], [144, 140.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.012, 0.75 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-chum") })); }
  // 4. "ve-sau": thuyền (chấm vàng) mang khuyên tai ra biển xa nhiều hướng; đốm vàng sáng ở các nơi xa ngoài khơi (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 580, groups: [{ path: [DAM, [300, 0], [395, -150]], count: 4, spread: [8,30], color: GOLD, timing: [[0.03,0],[0.8,1]] }, { path: [DAM, [300, 80], [395, 250]], count: 4, spread: [8,30], color: GOLD, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[380, -200], [385, 300], [390, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.08, 0.85 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
