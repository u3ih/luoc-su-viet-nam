import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_QUYET, NUI_MEO, TRUNG_DO, LA_SON } from "./terrain";

type Pt = [number, number];

// Phượng Hoàng Trung Đô — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hai vòng thành cách điệu (thành Ngoại, thành Nội); thành thật gần hình tam giác, có hào; không vẽ lầu, điện.
const WALLS: Wall[] = [
  { at: square(0, 40, 80, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 12 }, { at: 3.141592653589793, width: 12 }] },
  { at: square(0, 40, 45, 0), base: 6, top: 4, height: 3, gates: [{ at: 0, width: 8 }, { at: 3.141592653589793, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["la-son","trung-do","xay-thanh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUNG_DO, 72]];

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
    seed: 1788,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("xay-thanh") + 0.5 ? 1 : ctx.t > world.beat("xay-thanh") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["xay-thanh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a60", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 2 - k * 0.6), wear: () => 0 }));

  // 1. "la-son": một chấm ngà (sứ giả) mang thư vào núi; đốm ngà (Nguyễn Thiếp) xuống núi gặp đốm vàng (Nguyễn Huệ) (diễn hoạ).
  const p0 = run("la-son", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1798, groups: [{ path: [[0, 40], [-150, 80], LA_SON], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.4,1]] }], progress: p0, visible: () => clock.near("la-son") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1808, groups: [{ path: [LA_SON, [-200, 90]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[0.9,1]] }], progress: p0, visible: () => clock.near("la-son") }));
  { const S: Pt[] = [[-190, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-son") })); }
  // 2. "trung-do": các đạo quân (son) tụ về dưới chân núi Dũng Quyết; đốm vàng ở giữa (diễn hoạ).
  const p1 = run("trung-do", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1828, groups: [{ path: [[-350, -50], [-20, 20]], count: 26, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[350, 0], [30, 40]], count: 26, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }, { path: [[100, -380], [20, 0]], count: 22, spread: [26,50], color: SON, timing: [[0.2,0],[0.95,1]] }], progress: p1, visible: () => clock.near("trung-do") }));
  { const S: Pt[] = [TRUNG_DO]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trung-do") })); }
  // 3. "xay-thanh": người (son) đắp thành dọc các cạnh theo thanh kéo; hai vòng thành dựng lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-thanh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1848, groups: [{ path: [[-85, -45], [85, -45]], count: 24, spread: [8,120], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[85, 125], [-85, 125]], count: 24, spread: [8,120], color: SON, timing: [[0,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("xay-thanh") }));
  // 4. "ve-sau": các đốm vàng nhỏ (sách dịch ra chữ Nôm) sáng dần ở nơi Nguyễn Thiếp ở ẩn (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-316, 92], [-308, 92], [-300, 92], [-292, 92], [-284, 92], [-316, 100], [-308, 100], [-300, 100], [-292, 100], [-284, 100], [-316, 108], [-308, 108], [-300, 108], [-292, 108], [-284, 108]]; world.add(createGlows({ count: S.length, color: GOLD, size: 7, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [LA_SON]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
