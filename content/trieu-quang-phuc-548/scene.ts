import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAM, NEN, TRAI_A, TRAI_B, TRAI_C, KHUAT_LAO, DAI_NHA } from "./terrain";

type Pt = [number, number];

// Triệu Quang Phục ở đầm Dạ Trạch — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nhan-viec","da-trach","thang-luong","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRAI_A, 24], [TRAI_B, 24], [TRAI_C, 24]];

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
    counts: { trees: 300, bushes: 600, grass: 2400, reeds: 1800 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 548,
  });

  // 1. "nhan-viec": đốm ngà (Lý Nam Đế) ở Khuất Lão lịm; đốm ngà thứ hai (Triệu Quang Phục) dẫn người (son) về phía đầm (diễn hoạ).
  const p0 = run("nhan-viec", 28);
  { const S: Pt[] = [[-360, 310]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.4, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhan-viec") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 568, groups: [{ path: [KHUAT_LAO, [-200, 120], [-90, 20]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("nhan-viec") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 578, groups: [{ path: [KHUAT_LAO, [-200, 120], [-100, 25]], count: 30, spread: [10,80], color: SON, timing: [[0.25,0],[0.95,1]] }], progress: p0, visible: () => clock.near("nhan-viec") }));
  // 2. "da-trach": theo thanh kéo (ngày → đêm): người (son) đứng yên trên nền đất giữa đầm; khi đêm xuống, thuyền độc mộc (chấm son sáng) lướt ra đánh trại quân Lương, lửa bùng ở các trại (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["da-trach"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 588, groups: [{ path: [[14, 0], [11, 8], [4, 13], [-4, 13], [-11, 8], [-14, 0], [-11, -8], [-4, -13], [4, -13], [11, -8], [14, 0]], count: 30, spread: [4,30], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("da-trach") }));
  world.add(createFires({ sites: [[-190, 60], [180, 80], [160, -140]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("da-trach") * smoothstep(0, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 1, seed: 608, groups: [{ path: [[0, 0], [-90, 40], [-185, 60]], count: 6, spread: [6,30], color: SON, timing: [[0.5,0],[1,1]] }, { path: [[0, 0], [90, 40], [175, 78]], count: 6, spread: [6,30], color: SON, timing: [[0.55,0],[1,1]] }, { path: [[0, 0], [80, -60], [155, -135]], count: 6, spread: [6,30], color: SON, timing: [[0.6,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("da-trach") }));
  // 3. "thang-luong": quân Lương (xanh nhạt) rời các trại rút về phía bắc; người (son) từ đầm tràn ra (diễn hoạ).
  const p2 = run("thang-luong", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 618, groups: [{ path: [TRAI_A, [-150, 395]], count: 20, spread: [30,40], color: DICH, timing: [[0.05,0],[0.8,1]] }, { path: [TRAI_B, [150, 395]], count: 20, spread: [30,40], color: DICH, timing: [[0.05,0],[0.8,1]] }], progress: p2, visible: () => clock.near("thang-luong") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 628, groups: [{ path: [[0, 0], [0, 150]], count: 30, spread: [20,100], color: SON, timing: [[0.3,0],[1,1]] }], progress: p2, visible: () => clock.near("thang-luong") }));
  // 4. "ve-sau": đốm ngà chạy về phía nam đến cửa biển Đại Nha rồi lịm; các đốm vàng (đền thờ) sáng dọc vùng ven biển (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 638, groups: [{ path: [[0, -70], [-40, -250], [-20, -385]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-20, -385]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (1 - smoothstep(0.65, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-120, -330], [80, -330], [-60, -300], [40, -290]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8 + i * 0.04, 0.9500000000000001 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
