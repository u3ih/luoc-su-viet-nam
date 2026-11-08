import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH, CHUA_DAU, NGOAI } from "./terrain";

type Pt = [number, number];

// Sĩ Nhiếp và thành Luy Lâu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Thành Luy Lâu cách điệu: hình chữ nhật khoảng 300 m x 600 m (theo khảo cổ, bài Luy Lâu); không vẽ kiến trúc trong thành.
const WALLS: Wall[] = [
  { at: square(0, 0, 75, 0, 2), base: 10, top: 6, height: 5, gates: [{ at: 0, width: 14 }, { at: 1.5707963267948966, width: 14 }, { at: 3.141592653589793, width: 14 }, { at: -1.5707963267948966, width: 14 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thai-thu","thanh-luy-lau","chua-dau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH, 56]];

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
    seed: 187,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("thanh-luy-lau") + 0.5 ? 1 : ctx.t > world.beat("thanh-luy-lau") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["thanh-luy-lau"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8572", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "thai-thu": đốm ngà (Thái thú) theo thuyền đến bến sông, vào thành; ba đốm ngà nhỏ (các em) đi về ba phía xa (diễn hoạ).
  const p0 = run("thai-thu", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 197, groups: [{ path: [NGOAI, [100, -175], [0, -150], [0, 0]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p0, visible: () => clock.near("thai-thu") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 207, groups: [{ path: [[0, 0], [-395, 200]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[1,1]] }, { path: [[0, 0], [-395, -300]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.55,0],[1,1]] }, { path: [[0, 0], [395, 300]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.6,0],[1,1]] }], progress: p0, visible: () => clock.near("thai-thu") }));
  // 2. "thanh-luy-lau": theo thanh kéo, vòng thành chữ nhật đắp cao; người (son) đắp thành; thuyền buôn (chấm vàng) cập bến sông Dâu trước thành (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thanh-luy-lau"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 217, groups: [{ path: [[-150, -80], [150, -80]], count: 24, spread: [8,260], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[150, 80], [-150, 80]], count: 24, spread: [8,260], color: SON, timing: [[0,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thanh-luy-lau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 227, groups: [{ path: [NGOAI, [200, -195], [60, -180]], count: 12, spread: [8,120], color: GOLD, timing: [[0.1,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thanh-luy-lau") }));
  // 3. "chua-dau": đốm vàng (chùa Dâu) và các đốm vàng nhỏ (chùa Đậu, Tướng, Dàn) quanh; học trò (son) tụ về lớp học trong thành (đốm ngà) (diễn hoạ).
  const p2 = run("chua-dau", 28);
  { const S: Pt[] = [[-60, -260], [-120, -300], [0, -310], [-40, -340]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-dau") })); }
  { const S: Pt[] = [[-40, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-dau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 257, groups: [{ path: [[-300, 200], [-40, 20]], count: 16, spread: [10,80], color: SON, timing: [[0.3,0],[0.95,1]] }], progress: p2, visible: () => clock.near("chua-dau") }));
  // 4. "ve-sau": đốm ngà trong thành lịm dần; đốm vàng chùa Dâu vẫn sáng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [CHUA_DAU]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
