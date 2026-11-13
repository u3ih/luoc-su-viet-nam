import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI_E, HAI_PHONG_E, SAI_GON_E, FONTAINEBLEAU } from "./terrain";

type Pt = [number, number];

// Hiệp định sơ bộ và Fontainebleau — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hai-dao-quan","mung-6-3","fontainebleau","tam-uoc"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI_E, 32], [HAI_PHONG_E, 24], [SAI_GON_E, 32], [FONTAINEBLEAU, 16]];

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
    seed: 1946,
  });

  // 1. "hai-dao-quan": quân Trung Hoa (ngà) từ phía bắc vào Hà Nội; quân Anh, Pháp (xanh nhạt) từ biển vào Sài Gòn (diễn hoạ).
  const p0 = run("hai-dao-quan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1956, groups: [{ path: [[-60, 390], [-50, 250], [-40, 110]], count: 70, spread: [6,22], color: NGHIA, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("hai-dao-quan") }));
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1966, groups: [{ path: [[330, -240], [120, -200], [-10, -160]], count: 4, spread: [4,10], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("hai-dao-quan") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1976, groups: [{ path: [[-10, -160], [-30, -160]], count: 40, spread: [4,14], color: DICH, timing: [[0.6,0],[0.95,1]] }], progress: p0, visible: () => clock.near("hai-dao-quan") }));
  // 2. "mung-6-3": theo thanh kéo, quân Trung Hoa (ngà) rút về phương bắc; quân Pháp (xanh nhạt) từ biển vào Hải Phòng rồi lên Hà Nội; đốm vàng (hiệp định) ở Hà Nội (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["mung-6-3"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1986, groups: [{ path: [[-40, 110], [-50, 250], [-60, 390]], count: 60, spread: [6,20], color: NGHIA, timing: [[0.05,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mung-6-3") }));
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1996, groups: [{ path: [[340, 120], [200, 80], [130, 60]], count: 4, spread: [4,10], color: DICH, timing: [[0.02,0],[0.4,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mung-6-3") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2006, groups: [{ path: [[120, 60], [40, 80], [-30, 105]], count: 40, spread: [4,12], color: DICH, timing: [[0.4,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mung-6-3") }));
  { const S: Pt[] = [[-40, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mung-6-3") })); }
  // 3. "fontainebleau": đốm vàng ở Fontainebleau (ký hiệu); ở Sài Gòn bừng một đốm xanh nhạt (Nam Kỳ quốc), ở Đà Lạt một đốm khác; đốm vàng nhạt dần (bế tắc) (diễn hoạ).
  const p2 = run("fontainebleau", 28);
  { const S: Pt[] = [[100, -100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.75, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("fontainebleau") })); }
  { const S: Pt[] = [[-30, -160]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("fontainebleau") })); }
  { const S: Pt[] = [[-80, -90]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("fontainebleau") })); }
  // 4. "tam-uoc": lửa ở cảng Hải Phòng; quân Pháp (xanh nhạt) quanh cảng; ở Hà Nội các đốm son (chiến luỹ) sáng dần (diễn hoạ).
  const p3 = run("tam-uoc", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2056, groups: [{ path: [[150, 60], [144, 78], [129, 89], [111, 89], [96, 78], [90, 60], [96, 42], [111, 31], [129, 31], [144, 42], [150, 60]], count: 40, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("tam-uoc") }));
  world.add(createFires({ sites: [[120, 60], [105, 75], [135, 45], [110, 40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("tam-uoc") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-5, 113], [-14, 133], [-33, 144], [-54, 142], [-70, 128], [-75, 107], [-66, 87], [-47, 76], [-26, 78], [-10, 92]]; world.add(createGlows({ count: S.length, color: SON, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.02, 0.7000000000000001 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tam-uoc") })); }
};

export default setup;
