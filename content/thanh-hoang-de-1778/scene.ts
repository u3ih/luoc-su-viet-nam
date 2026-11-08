import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH, QUY_NHON, BINH_DINH_MOI } from "./terrain";

type Pt = [number, number];

// Thành Hoàng Đế — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Thành Hoàng Đế cách điệu: vòng thành ngoài và tử cấm thành bên trong; không vẽ cung điện.
const WALLS: Wall[] = [
  { at: square(-20, 80, 75, 0), base: 10, top: 6, height: 5, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
  { at: square(-20, 80, 25, 0), base: 5, top: 3, height: 3, gates: [{ at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thai-duc","xay-thanh","chia-ba","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH, 96]];

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
    seed: 1778,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("xay-thanh") + 0.5 ? 1 : ctx.t > world.beat("xay-thanh") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["xay-thanh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a60", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 2 - k * 0.6), wear: () => 0 }));

  // 1. "thai-duc": đốm vàng (vua Thái Đức) sáng giữa nền thành cũ; người (son) tụ về (diễn hoạ).
  const p0 = run("thai-duc", 28);
  { const S: Pt[] = [[-20, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thai-duc") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1798, groups: [{ path: [[-200, -100], [-30, 40]], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[200, 200], [10, 100]], count: 16, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("thai-duc") }));
  // 2. "xay-thanh": hai đốm ngà (đôi sư tử đá còn lại của thành cũ) ở cửa; người (son) đắp thành dọc các cạnh theo thanh kéo, vòng thành dựng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-thanh"] ?? 0) / 0.9);
  { const S: Pt[] = [[-30, 50], [-10, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thanh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1818, groups: [{ path: [[-95, 5], [55, 5]], count: 24, spread: [8,140], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[55, 155], [-95, 155]], count: 24, spread: [8,140], color: SON, timing: [[0,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-thanh") }));
  // 3. "chia-ba": ba đốm vàng: Quy Nhơn (Trung ương Hoàng đế) ở giữa, một ở bắc (Bắc Bình vương), một ở nam (Đông Định vương); đốm ở thành mờ dần (diễn hoạ).
  const p2 = run("chia-ba", 28);
  { const S: Pt[] = [[-20, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-ba") })); }
  { const S: Pt[] = [[-100, 380], [100, -380]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.15, 0.44999999999999996 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-ba") })); }
  { const S: Pt[] = [[-20, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.7, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chia-ba") })); }
  // 4. "ve-sau": lửa bùng trong thành (Võ Tánh giữ rồi mất thành); về sau đốm vàng mới ở thành Bình Định mới, thành cũ lịm (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring(THANH, 30, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.1, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [BINH_DINH_MOI]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
