import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_TIEN, NGOAI_KHOI } from "./terrain";

type Pt = [number, number];

// Tao đàn Chiêu Anh Các — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["noi-nghiep","gac-chieu-anh","thap-vinh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_TIEN, 48]];

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
    seed: 1736,
  });

  // 1. "noi-nghiep": đốm ngà (Mạc Thiên Tứ) ở Hà Tiên; ba chấm vàng (thuyền Long Bài) và thuyền buôn (chấm ngà) cập bến (diễn hoạ).
  const p0 = run("noi-nghiep", 28);
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-nghiep") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1756, groups: [{ path: [NGOAI_KHOI, [-250, -250], [-70, -40]], count: 3, spread: [8,20], color: GOLD, timing: [[0.1,0],[0.8,1]] }, { path: [[-395, -150], [-200, -200], [-60, -50]], count: 8, spread: [10,80], color: NGHIA, timing: [[0.2,0],[1,1]] }], progress: p0, visible: () => clock.near("noi-nghiep") }));
  // 2. "gac-chieu-anh": theo thanh kéo, đốm vàng (gác Chiêu Anh) sáng; thuyền (chấm ngà) từ biển xa và người (son) từ phía bắc tụ về (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["gac-chieu-anh"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gac-chieu-anh") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1776, groups: [{ path: [NGOAI_KHOI, [-250, -250], [-60, -40], [-45, 20]], count: 12, spread: [10,60], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("gac-chieu-anh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1786, groups: [{ path: [[100, 395], [40, 150], [-35, 40]], count: 10, spread: [8,60], color: SON, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("gac-chieu-anh") }));
  // 3. "thap-vinh": mười đốm vàng (mười cảnh Hà Tiên) sáng quanh vùng; vòng ba mươi hai đốm ngà nhỏ (thi nhân) quanh gác (diễn hoạ).
  const p2 = run("thap-vinh", 28);
  { const S: Pt[] = [[-150, 150], [150, 150], [200, -40], [60, 200], [-60, -60], [-200, -200], [-300, -260], [40, -150], [-250, 50], [100, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-vinh") })); }
  { const S: Pt[] = [[-18, 30], [-18, 34], [-20, 38], [-22, 42], [-24, 46], [-28, 48], [-32, 50], [-36, 52], [-40, 52], [-44, 52], [-48, 50], [-52, 48], [-56, 46], [-58, 42], [-60, 38], [-62, 34], [-62, 30], [-62, 26], [-60, 22], [-58, 18], [-56, 14], [-52, 12], [-48, 10], [-44, 8], [-40, 8], [-36, 8], [-32, 10], [-28, 12], [-24, 14], [-22, 18], [-20, 22], [-18, 26]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.01, 0.25 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thap-vinh") })); }
  // 4. "ve-sau": lửa bùng ở Hà Tiên (năm 1771); các đốm vàng mười cảnh vẫn còn sáng mờ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring(HA_TIEN, 30, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.2, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-150, 150], [150, 150], [200, -40], [60, 200], [-60, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.45 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
