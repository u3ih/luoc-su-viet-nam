import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, PHU_XUAN, QUY_NHON, THI_NAI } from "./terrain";

type Pt = [number, number];

// Vua Cảnh Thịnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","chia-re","mat-phu-xuan","ket-cuc"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 32], [PHU_XUAN, 32], [QUY_NHON, 32]];

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
    seed: 1799,
  });

  // 1. "len-ngoi": đốm vàng (vua nhỏ tuổi) sáng ở Phú Xuân giữa vòng triều thần (ngà); sứ nhà Thanh (chấm xanh nhạt) từ phương bắc tới (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  { const S: Pt[] = [[10, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1819, groups: [{ path: [[44, 130], [41, 145], [31, 157], [18, 163], [2, 163], [-11, 157], [-21, 145], [-24, 130], [-21, 115], [-11, 103], [2, 97], [18, 97], [31, 103], [41, 115], [44, 130]], count: 30, spread: [1,3], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1829, groups: [{ path: [[-200, 360], [-90, 290], [5, 135]], count: 1, spread: [3,3], color: DICH, timing: [[0.3,0],[0.85,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "chia-re": hai toán quân (son và ngà) đóng hai bờ sông Hương đối mặt; ở phía nam, đốm Quy Nhơn lụi dần (diễn hoạ).
  const p1 = run("chia-re", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1839, groups: [{ path: [[-130, 240], [-10, 145]], count: 26, spread: [6,20], color: SON, timing: [[0.04,0],[0.5,1]] }, { path: [[-120, -40], [0, 85]], count: 26, spread: [6,20], color: NGHIA, timing: [[0.08,0],[0.55,1]] }], progress: p1, visible: () => clock.near("chia-re") }));
  { const S: Pt[] = [[40, -200]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.55, 0.65, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-re") })); }
  // 3. "mat-phu-xuan": theo thanh kéo, đoàn thuyền chúa Nguyễn (chấm xanh nhạt) từ Thị Nại theo gió nam ra bắc tới cửa Tư Dung; đốm vàng Phú Xuân lụi (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["mat-phu-xuan"] ?? 0) / 0.9);
  world.add(createFires({ sites: [[120, -230], [130, -215], [110, -245]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("mat-phu-xuan") * smoothstep(0.05, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 1869, groups: [{ path: [[180, -230], [230, -60], [210, 90], [60, 115]], count: 36, spread: [8,22], color: DICH, timing: [[0.05,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("mat-phu-xuan") }));
  { const S: Pt[] = [[10, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.8, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mat-phu-xuan") })); }
  // 4. "ket-cuc": quân Nguyễn (xanh nhạt) tiến ra bắc; toán nhỏ của vua Cảnh Thịnh (ngà) rời Thăng Long chạy lên phía bắc rồi dừng lại (diễn hoạ).
  const p3 = run("ket-cuc", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1889, groups: [{ path: [[40, -60], [10, 130], [-80, 270]], count: 50, spread: [8,26], color: DICH, timing: [[0.04,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ket-cuc") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1899, groups: [{ path: [[-90, 290], [-200, 340]], count: 10, spread: [3,8], color: NGHIA, timing: [[0.4,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ket-cuc") }));
};

export default setup;
