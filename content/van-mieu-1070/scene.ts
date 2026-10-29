import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VAN_MIEU, THANG_LONG, LANG_A, LANG_B, LANG_C } from "./terrain";

type Pt = [number, number];

// Văn Miếu – Quốc Tử Giám — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["van-mieu", "khoa-thi", "ve-sau", "ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 55], [VAN_MIEU, 55], [LANG_A, 55], [LANG_B, 55], [LANG_C, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1070,
  });

  // 1. "van-mieu": các nhóm người (son) từ Thăng Long đi tới khu Văn Miếu, một đốm ngà sáng dần ở đó, đèn bật dần (diễn hoạ).
  const p0 = run("van-mieu", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1070, groups: [{ path: [THANG_LONG, [0, 30], VAN_MIEU], count: 22, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p0, visible: () => clock.near("van-mieu") }));
  { const S: Pt[] = [VAN_MIEU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-mieu") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(VAN_MIEU, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("van-mieu") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "khoa-thi": các nhóm người (son) từ ba làng tụ về Thăng Long theo thanh kéo; một đốm vàng sáng ở khu Văn Miếu (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["mo-khoa"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1080, groups: [{ path: [LANG_A, [-130, 100], [-30, 50], THANG_LONG], count: 16, spread: [24,40], color: SON, timing: [[0,0],[1,0.95]] }, { path: [LANG_B, [-120, -60], [-20, 10], THANG_LONG], count: 16, spread: [24,40], color: SON, timing: [[0,0],[1,0.95]] }, { path: [LANG_C, [50, 170], THANG_LONG], count: 14, spread: [24,40], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoa-thi") }));
  { const S: Pt[] = [VAN_MIEU]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoa-thi") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(THANG_LONG, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("khoa-thi") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "ve-sau": bốn đốm vàng sáng lần lượt quanh khu Văn Miếu (các khoa thi nối nhau), vài nhóm người đi lại (diễn hoạ).
  const p2 = run("ve-sau", 28);
  { const S: Pt[] = [[-70, -30], [-30, 10], [-70, 50], [-110, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.18, 0.25 + i * 0.18, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1090, groups: [{ path: [[-150, 100], [-100, 40], VAN_MIEU], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[40, -30], [-30, 0], VAN_MIEU], count: 12, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p2, visible: () => clock.near("ve-sau") }));
  // 4. "ngay-nay": hai hàng đốm vàng (vườn bia) sáng đều hai bên một điểm giữa; khách (son) đến đứng lặng (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[-88, -52], [-88, -30], [-88, -8], [-88, 14], [-88, 36], [-88, 58], [-52, -52], [-52, -30], [-52, -8], [-52, 14], [-52, 36], [-52, 58]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1100, groups: [{ path: [[-150, 100], [-100, 40], VAN_MIEU], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [THANG_LONG, [0, 30], VAN_MIEU], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(VAN_MIEU, 50, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ngay-nay") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
