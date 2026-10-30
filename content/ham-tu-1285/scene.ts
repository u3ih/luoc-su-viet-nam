import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HAM_TU, CHUONG_DUONG, TAY_KET, GIA_LAM, THANG_LONG, VINH_BINH } from "./terrain";

type Pt = [number, number];

// Hàm Tử – Chương Dương 1285 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ham-tu", "chuong-duong", "tay-ket", "truy-kich", "so-lieu"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 55], [CHUONG_DUONG, 55], [HAM_TU, 55], [TAY_KET, 55], [GIA_LAM, 55], [VINH_BINH, 55]];

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
    seed: 1285,
  });

  // 1. "ham-tu": đoàn ngà đi tới Hàm Tử, đốm xanh nhạt (quân Nguyên) ở đó mờ dần khi đoàn tới (diễn hoạ).
  const p0 = run("ham-tu", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1285, groups: [{ path: [[100, -300], [150, -190], HAM_TU], count: 34, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p0, visible: () => clock.near("ham-tu") }));
  { const S: Pt[] = [HAM_TU]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0, 0.65 + i * 0, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ham-tu") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(HAM_TU, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("ham-tu") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "chuong-duong": đoàn ngà đi từ Chương Dương lên Thăng Long, đoàn xanh nhạt rút sang bờ bắc (diễn hoạ).
  const p1 = run("chuong-duong", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1295, groups: [{ path: [[150, -150], CHUONG_DUONG, [10, 60], THANG_LONG], count: 34, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p1, visible: () => clock.near("chuong-duong") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1296, groups: [{ path: [THANG_LONG, [20, 140], GIA_LAM], count: 26, spread: [30,50], color: DICH, size: 1.1, timing: [[0.3,0],[0.9,1]] }], progress: p1, visible: () => clock.near("chuong-duong") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0, 0.65 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chuong-duong") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(THANG_LONG, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("chuong-duong") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "tay-ket": đoàn thuyền ngà tiến tới Tây Kết theo thanh kéo; đốm xanh nhạt ở Tây Kết mờ dần khi đoàn tới (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1305, groups: [{ path: [[40, -420], [130, -340], [200, -290], TAY_KET], count: 30, spread: [30,50], color: NGHIA, size: 1.1, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("tay-ket") }));
  { const S: Pt[] = [TAY_KET]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tay-ket") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(TAY_KET, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("tay-ket") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "truy-kich": đoàn xanh nhạt rút về phía tây bắc, đoàn ngà đuổi theo; vài đốm vàng sáng dọc đường (các trận truy kích) (diễn hoạ).
  const p3 = run("truy-kich", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1315, groups: [{ path: [GIA_LAM, [20, 230], [-90, 320], VINH_BINH], count: 30, spread: [30,60], color: DICH, size: 1.1, timing: [[0.05,0],[0.8,1]] }], progress: p3, visible: () => clock.near("truy-kich") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1316, groups: [{ path: [THANG_LONG, [0, 200], [-110, 300]], count: 30, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.15,0],[0.95,0.9]] }], progress: p3, visible: () => clock.near("truy-kich") }));
  { const S: Pt[] = [[20, 230], [-90, 320], VINH_BINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.2, 0.35 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truy-kich") })); }
  // 5. "so-lieu": ba đốm vàng sáng dịu ở ba nơi (các chỗ nguồn khác nhau), vài nhóm người (son) trở về (diễn hoạ).
  const p4 = run("so-lieu", 28);
  { const S: Pt[] = [THANG_LONG, CHUONG_DUONG, TAY_KET]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.1 + i * 0.2, 0.25 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("so-lieu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1325, groups: [{ path: [[-120, 200], [-70, 150], THANG_LONG], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[130, 60], [60, 0], CHUONG_DUONG], count: 12, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p4, visible: () => clock.near("so-lieu") }));
};

export default setup;
