import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRUONG, VIET_BAC, MAT } from "./terrain";

type Pt = [number, number];

// Trường Y khoa Hà Nội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thanh-lap","y-duoc","chien-khu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUONG, 40], [VIET_BAC, 32], [MAT, 56]];

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
    seed: 1902,
  });

  // 1. "thanh-lap": đốm vàng (trường) sáng; đốm ngà (hiệu trưởng) tới; những sinh viên đầu tiên (son) tụ về (diễn hoạ).
  const p0 = run("thanh-lap", 28);
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1922, groups: [{ path: [[300, -300], [100, -60], [-15, 35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.1,0],[0.5,1]] }], progress: p0, visible: () => clock.near("thanh-lap") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1932, groups: [{ path: [[-200, -40], [-25, 30]], count: 24, spread: [3,12], color: SON, timing: [[0.4,0],[0.9,1]] }], progress: p0, visible: () => clock.near("thanh-lap") }));
  // 2. "y-duoc": theo thanh kéo, từng lớp tốt nghiệp (hàng đốm ngà) sáng dần thành khối lớn (237 người đến năm 1914) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["y-duoc"] ?? 0) / 0.9);
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("y-duoc") })); }
  { const S: Pt[] = [[90, 36], [102, 36], [114, 36], [126, 36], [138, 36], [150, 36], [90, 48], [102, 48], [114, 48], [126, 48], [138, 48], [150, 48], [90, 60], [102, 60], [114, 60], [126, 60], [138, 60], [150, 60], [90, 72], [102, 72], [114, 72], [126, 72], [138, 72], [150, 72], [90, 84], [102, 84], [114, 84], [126, 84], [138, 84], [150, 84]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.028, 0.16999999999999998 + i * 0.028, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("y-duoc") })); }
  // 3. "chien-khu": thầy trò (son, ngà) rời Hà Nội lên chiến khu Việt Bắc; lớp học (đốm vàng) sáng giữa núi rừng (diễn hoạ).
  const p2 = run("chien-khu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1962, groups: [{ path: [[-20, 40], [-120, 140], [-235, 225]], count: 30, spread: [3,12], color: SON, timing: [[0.02,0],[0.6,1]] }, { path: [[-20, 40], [-235, 225]], count: 4, spread: [2,4], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("chien-khu") }));
  { const S: Pt[] = [[-240, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chien-khu") })); }
  // 4. "ve-sau": trường (đốm vàng) sáng lại ở Hà Nội; nhiều thế hệ bác sĩ (son) toả đi khắp nơi (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1992, groups: [{ path: [[-20, 40], [200, 200]], count: 18, spread: [3,10], color: SON, timing: [[0.2,0],[0.8,1]] }, { path: [[-20, 40], [200, -200]], count: 18, spread: [3,10], color: SON, timing: [[0.3,0],[0.9,1]] }, { path: [[-20, 40], [-220, -180]], count: 18, spread: [3,10], color: SON, timing: [[0.4,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
