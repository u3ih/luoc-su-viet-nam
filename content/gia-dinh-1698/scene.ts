import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHIEN_TRAN, CHAN_LAP, SAM_GIANG, TRAN_BIEN, HUYEN_A, HUYEN_B } from "./terrain";

type Pt = [number, number];

// Phủ Gia Định 1698 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-tien", "lap-phu", "chan-lap", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHIEN_TRAN, 55], [TRAN_BIEN, 55], [SAM_GIANG, 55], [CHAN_LAP, 55], [HUYEN_A, 55], [HUYEN_B, 55]];

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
    seed: 1698,
  });

  // 1. "nam-tien": đoàn ngà từ phía bắc đi vào vùng Đồng Nai, một đốm ngà sáng ở Phiên Trấn (diễn hoạ).
  const p0 = run("nam-tien", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1698, groups: [{ path: [[260, 420], [200, 300], TRAN_BIEN, [80, 130], PHIEN_TRAN], count: 30, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p0, visible: () => clock.near("nam-tien") }));
  { const S: Pt[] = [PHIEN_TRAN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-tien") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(PHIEN_TRAN, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("nam-tien") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "lap-phu": bốn đốm vàng (hai huyện, hai dinh) sáng dần theo thanh kéo; các nhóm người (son) từ phía bắc đi vào ở (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["lap-phu"] ?? 0) / 0.9);
  { const S: Pt[] = [PHIEN_TRAN, TRAN_BIEN, HUYEN_A, HUYEN_B]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.2, 0.2 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lap-phu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1708, groups: [{ path: [[250, 400], [200, 280], TRAN_BIEN], count: 18, spread: [26,40], color: SON, timing: [[0,0],[1,0.95]] }, { path: [[200, 300], [110, 170], HUYEN_B], count: 14, spread: [26,40], color: SON, timing: [[0,0],[1,0.95]] }, { path: [[170, 200], [80, 70], HUYEN_A], count: 12, spread: [26,40], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("lap-phu") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHIEN_TRAN, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("lap-phu") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "chan-lap": đoàn ngà đi từ Phiên Trấn sang phía tây; đốm xanh nhạt ở phía tây mờ dần khi đoàn tới (diễn hoạ).
  const p2 = run("chan-lap", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1718, groups: [{ path: [PHIEN_TRAN, [-60, 90], [-200, 70], CHAN_LAP], count: 30, spread: [30,60], color: NGHIA, size: 1.1, timing: [[0.04,0],[0.85,1]] }], progress: p2, visible: () => clock.near("chan-lap") }));
  { const S: Pt[] = [CHAN_LAP]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0, 0.55 + i * 0, k) * (1 - 0.8 * smoothstep(0.7, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chan-lap") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(CHAN_LAP, 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("chan-lap") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": đốm vàng dịu ở Sầm Giang, các nhóm người (son) đến đứng lặng, lửa bật dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [SAM_GIANG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1728, groups: [{ path: [[-60, -60], [-100, -150], SAM_GIANG], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-200, -100], SAM_GIANG], count: 12, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(SAM_GIANG, 36, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
