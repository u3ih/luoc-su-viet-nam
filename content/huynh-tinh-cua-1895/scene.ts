import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAI_GON, BA_RIA, PENANG, MAT } from "./terrain";

type Pt = [number, number];

// Đại Nam quấc âm tự vị — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["paulus-cua","quoc-ngu","tu-vi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAI_GON, 40], [BA_RIA, 32], [MAT, 64]];

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
    seed: 1895,
  });

  // 1. "paulus-cua": đốm vàng nhỏ (cậu bé) ở Bà Rịa; chấm ngà đi du học xa rồi trở về Sài Gòn làm việc (diễn hoạ).
  const p0 = run("paulus-cua", 28);
  { const S: Pt[] = [[220, -80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paulus-cua") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1915, groups: [{ path: [[220, -80], [-100, -200], [-300, -300], [-120, -100], [-45, 15]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("paulus-cua") }));
  { const S: Pt[] = [[-40, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("paulus-cua") })); }
  // 2. "quoc-ngu": những đốm ngà (sách viết bằng chữ quốc ngữ) lần lượt sáng quanh Sài Gòn; một đốm xanh nhạt (điều trần gửi ra Huế) đi lên phía bắc rồi tắt (diễn hoạ).
  const p1 = run("quoc-ngu", 28);
  { const S: Pt[] = [[-1, 28], [-10, 46], [-27, 58], [-48, 59], [-66, 50], [-78, 33], [-79, 12], [-70, -6], [-53, -18], [-32, -19], [-14, -10], [-2, 7]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-ngu") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1945, groups: [{ path: [[-40, 20], [-60, 200], [-80, 370]], count: 1, spread: [2,2], color: DICH, timing: [[0.6,0],[0.95,1]] }], progress: p1, visible: () => clock.near("quoc-ngu") }));
  // 3. "tu-vi": theo thanh kéo, lưới đốm vàng (các mục từ) hiện dần thành hai khối (hai tập tự vị) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tu-vi"] ?? 0) / 0.9);
  { const S: Pt[] = [[16.5, 117.5], [25.5, 117.5], [34.5, 117.5], [43.5, 117.5], [16.5, 126.5], [25.5, 126.5], [34.5, 126.5], [43.5, 126.5], [16.5, 135.5], [25.5, 135.5], [34.5, 135.5], [43.5, 135.5], [16.5, 144.5], [25.5, 144.5], [34.5, 144.5], [43.5, 144.5], [16.5, 153.5], [25.5, 153.5], [34.5, 153.5], [43.5, 153.5], [16.5, 162.5], [25.5, 162.5], [34.5, 162.5], [43.5, 162.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.018, 0.16999999999999998 + i * 0.018, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-vi") })); }
  { const S: Pt[] = [[76.5, 117.5], [85.5, 117.5], [94.5, 117.5], [103.5, 117.5], [76.5, 126.5], [85.5, 126.5], [94.5, 126.5], [103.5, 126.5], [76.5, 135.5], [85.5, 135.5], [94.5, 135.5], [103.5, 135.5], [76.5, 144.5], [85.5, 144.5], [94.5, 144.5], [103.5, 144.5], [76.5, 153.5], [85.5, 153.5], [94.5, 153.5], [103.5, 153.5], [76.5, 162.5], [85.5, 162.5], [94.5, 162.5], [103.5, 162.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45 + i * 0.018, 0.6 + i * 0.018, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-vi") })); }
  // 4. "ve-sau": hai tập sách (đốm vàng) sáng; người đọc (son) qua nhiều thế hệ tụ về (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[30, 140], [90, 140]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.1, 0.16999999999999998 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1985, groups: [{ path: [[-200, 200], [40, 120]], count: 24, spread: [3,12], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[220, 200], [80, 120]], count: 24, spread: [3,12], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
