import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TONG_BINH, HOANG_DONG, TAC_KHAU, RE } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Dương Thanh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hao-truong","quay-quan","that-bai","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TONG_BINH, 52], [TAC_KHAU, 40]];

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
    seed: 819,
  });

  // 1. "hao-truong": phủ thành Tống Bình (đốm xanh nhạt) có quân đô hộ đóng; chấm ngà (Dương Thanh) từ phía nam bị điều về thành (diễn hoạ).
  const p0 = run("hao-truong", 28);
  { const S: Pt[] = [[120, 60]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hao-truong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 839, groups: [{ path: [[90, 30], [130, 70]], count: 26, spread: [10,40], color: DICH, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("hao-truong") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 849, groups: [{ path: [[0, -360], [60, -150], [110, 40]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p0, visible: () => clock.near("hao-truong") }));
  // 2. "quay-quan": theo thanh kéo, đoàn quân (son) ra đi về phía Hoàng Động rồi quay lại đánh chiếm phủ thành; lửa bùng ở Tống Bình (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["quay-quan"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 859, groups: [{ path: [[120, 60], [-60, 140], [-120, 150], [-60, 120], [110, 60]], count: 34, spread: [10,50], color: SON, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("quay-quan") }));
  { const S: Pt[] = [[-120, 150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (1 - smoothstep(0.55, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quay-quan") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring([120, 60], 26, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("quay-quan") * smoothstep(0.75, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "that-bai": quân Đường (xanh nhạt) kéo tới từ phía bắc; một cánh nghĩa quân (son) rút về Tạc Khẩu, lửa ở Tạc Khẩu (diễn hoạ).
  const p2 = run("that-bai", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 889, groups: [{ path: [[260, 390], [150, 100]], count: 40, spread: [20,70], color: DICH, timing: [[0.05,0],[0.55,1]] }], progress: p2, visible: () => clock.near("that-bai") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 899, groups: [{ path: [[110, 40], [40, -120], [-30, -240]], count: 18, spread: [8,40], color: SON, timing: [[0.3,0],[0.8,1]] }], progress: p2, visible: () => clock.near("that-bai") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([-30, -250], 20, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("that-bai") * smoothstep(0.6, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": các nhóm nghĩa quân nhỏ (son) đi lại giữa vùng núi (theo Toàn thư, còn chống tới năm 828); thành nhỏ La Thành (đốm xanh nhạt) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 919, groups: [{ path: [[-260, 220], [-150, 120], [-200, 30]], count: 10, spread: [6,30], color: SON, timing: [[0.05,0],[0.9,1]] }, { path: [[-100, -60], [-220, 120]], count: 8, spread: [6,30], color: SON, timing: [[0.15,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[120, 60]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
