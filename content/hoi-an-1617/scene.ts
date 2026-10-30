import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOI_AN, PHO_NHAT, CUA_BIEN, QUANG_NAM_DINH, DA_NANG } from "./terrain";

type Pt = [number, number];

// Hội An 1617 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thuong-cang", "nguoi-nhat", "nguoi-hoa", "suy-giam", "ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOI_AN, 55], [PHO_NHAT, 55], [CUA_BIEN, 55], [QUANG_NAM_DINH, 55], [DA_NANG, 55]];

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
    seed: 1617,
  });

  // 1. "thuong-cang": đốm ngà sáng ở Hội An, các nhóm người (son) từ trong đất liền đi ra cảng, lửa bật dần (diễn hoạ).
  const p0 = run("thuong-cang", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1617, groups: [{ path: [QUANG_NAM_DINH, [40, -30], HOI_AN], count: 22, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-100, 160], [40, 60], PHO_NHAT], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p0, visible: () => clock.near("thuong-cang") }));
  { const S: Pt[] = [HOI_AN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thuong-cang") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(HOI_AN, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("thuong-cang") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "nguoi-nhat": các đốm xanh nhạt (thuyền) từ biển vào cửa sông cập bến theo thanh kéo; đốm ngà sáng ở phố Nhật (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["den-cang"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1627, groups: [{ path: [[340, 220], [320, 100], CUA_BIEN, [250, 5], HOI_AN], count: 12, spread: [30,50], color: DICH, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nguoi-nhat") }));
  { const S: Pt[] = [PHO_NHAT]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguoi-nhat") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHO_NHAT, 32, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("nguoi-nhat") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "nguoi-hoa": hai đốm ngà sáng ở Hội An và phố bên cạnh, các nhóm người (son) đi lại giữa hai nơi (diễn hoạ).
  const p2 = run("nguoi-hoa", 28);
  { const S: Pt[] = [HOI_AN, PHO_NHAT]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.3, 0.25 + i * 0.3, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguoi-hoa") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1637, groups: [{ path: [PHO_NHAT, [170, 25], HOI_AN], count: 16, spread: [26,50], color: SON, timing: [[0.05,0],[0.5,1]] }, { path: [HOI_AN, [170, 25], PHO_NHAT], count: 14, spread: [26,50], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p2, visible: () => clock.near("nguoi-hoa") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(HOI_AN, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("nguoi-hoa") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "suy-giam": đoàn xanh nhạt từ phía bắc xuống tới Hội An, các đốm ngà ở cảng mờ dần (diễn hoạ).
  const p3 = run("suy-giam", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1647, groups: [{ path: [DA_NANG, [80, 160], [-20, 50], QUANG_NAM_DINH, [100, 10], HOI_AN], count: 26, spread: [30,60], color: DICH, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: p3, visible: () => clock.near("suy-giam") }));
  { const S: Pt[] = [HOI_AN, PHO_NHAT]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.1, 0.15 + i * 0.1, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("suy-giam") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(HOI_AN, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("suy-giam") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
  // 5. "ngay-nay": quầng vàng dịu ở Hội An, từng nhóm người (son) đến đứng lặng, đèn quanh cảng bật dần (diễn hoạ).
  const p4 = run("ngay-nay", 28);
  { const S: Pt[] = [HOI_AN]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1657, groups: [{ path: [[-60, 40], [80, 50], PHO_NHAT], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [QUANG_NAM_DINH, [60, -30], HOI_AN], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p4, visible: () => clock.near("ngay-nay") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(HOI_AN, 40, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ngay-nay") * smoothstep(0.3, 0.9, p4()), size: 3, glow: () => 0.8 }));
};

export default setup;
