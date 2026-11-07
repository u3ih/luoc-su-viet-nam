import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, AN_VINH, PHU_XUAN, QUANG_NGAI, HOANG_SA, QUYNH_CHAU } from "./terrain";

type Pt = [number, number];

// Đội Hoàng Sa — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bay-muoi","ra-khoi","quang-anh","huu-nhat","khao-le"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_XUAN, 32], [QUANG_NGAI, 32]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#21465a", shallow: "#6f9a98" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 380, bushes: 400, grass: 1200, reeds: 200 },
    forestAt: 0.5,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1815,
  });

  // 1. "bay-muoi": người (son) tụ về An Vĩnh trên đảo Lý Sơn, đốm vàng sáng ở An Vĩnh, năm chấm ngà (thuyền câu) dàn ở bờ (diễn hoạ).
  const p0 = run("bay-muoi", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1825, groups: [{ path: [[-160, -80], AN_VINH], count: 36, spread: [40,40], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[-80, 0], [-110, -30]], count: 34, spread: [40,40], color: SON, timing: [[0.08,0],[0.75,1]] }], progress: p0, visible: () => clock.near("bay-muoi") }));
  { const S: Pt[] = [AN_VINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bay-muoi") })); }
  { const S: Pt[] = [[-50, -30], [-48, -18], [-52, -6], [-50, 6], [-54, -42]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1.5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.06, 0.55 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bay-muoi") })); }
  // 2. "ra-khoi": năm chấm ngà (thuyền câu) rời Lý Sơn ra khơi về phía Hoàng Sa theo thanh kéo, các đảo Hoàng Sa sáng dần (vàng); một chấm bị gió dạt lên phía bắc (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ra-khoi"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1855, groups: [{ path: [[-50, -20], [60, 20], [180, 60], HOANG_SA], count: 5, spread: [16,20], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [[-50, -20], [40, 60], [90, 250], QUYNH_CHAU], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ra-khoi") }));
  { const S: Pt[] = [[228, 22], [250, 80], [292, 42], [302, 112], [268, 142], [212, 118]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.06, 0.7000000000000001 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ra-khoi") })); }
  // 3. "quang-anh": các chấm ngà (thuyền) đi vòng quanh các đảo Hoàng Sa (đo đạc thủy trình), đốm vàng ở từng đảo sáng dần; một chấm tách ra xa rồi mờ (diễn hoạ).
  const p2 = run("quang-anh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1875, groups: [{ path: [[180, 60], [210, 0], [300, 10], [340, 100], [290, 180], [200, 150], [180, 70]], count: 5, spread: [12,20], color: NGHIA, timing: [[0.03,0],[0.95,1]] }], progress: p2, visible: () => clock.near("quang-anh") }));
  { const S: Pt[] = [[228, 22], [292, 42], [302, 112], [268, 142], [212, 118], [250, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quang-anh") })); }
  { const S: Pt[] = [[350, 190]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (1 - smoothstep(0.8, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quang-anh") })); }
  // 4. "huu-nhat": sáu chấm ngà (thuyền) đến các đảo; mười đốm vàng nhỏ (mười bài gỗ làm dấu mốc) lần lượt sáng lên trên các đảo (diễn hoạ).
  const p3 = run("huu-nhat", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1905, groups: [{ path: [[60, 20], [180, 60], [240, 60]], count: 6, spread: [20,24], color: NGHIA, timing: [[0.02,0],[0.45,1]] }], progress: p3, visible: () => clock.near("huu-nhat") }));
  { const S: Pt[] = [[228, 22], [234, 28], [250, 80], [256, 74], [292, 42], [286, 48], [302, 112], [268, 142], [212, 118], [262, 86]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.05, 0.5 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("huu-nhat") })); }
  // 5. "khao-le": người (son) tụ về An Vĩnh, lửa bật dần quanh chỗ làm lễ (diễn hoạ).
  const p4 = run("khao-le", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1925, groups: [{ path: [[-170, -90], AN_VINH], count: 30, spread: [40,40], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[-60, 10], AN_VINH], count: 24, spread: [40,40], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: p4, visible: () => clock.near("khao-le") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(AN_VINH, 22, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("khao-le") * smoothstep(0.35, 0.9, p4()), size: 3, glow: () => 0.8 }));
};

export default setup;
