import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LAM_KINH, VINH_LANG, BIA, NUI_DAU, NUI_CHUA } from "./terrain";

type Pt = [number, number];

// Lam Kinh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành điện Lam Kinh cách điệu: một vòng tường gần vuông (thành thật có tường bắc hình cánh cung); không vẽ điện, lăng.
const WALLS: Wall[] = [
  { at: square(0, 20, 70, 0), base: 4, top: 3, height: 3, gates: [{ at: -1.5707963267948966, width: 12 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dat-to","tay-kinh","vinh-lang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LAM_KINH, 88]];

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
    counts: { trees: 650, bushes: 600, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1433,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("tay-kinh") + 0.5 ? 1 : ctx.t > world.beat("tay-kinh") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["tay-kinh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "dat-to": đàn đốm vàng nhỏ (đàn chim) lượn quanh chân núi Dầu; một gia đình (son) dời đến ở (diễn hoạ).
  const p0 = run("dat-to", 28);
  { const S: Pt[] = [[50, 140], [40, 169], [15, 188], [-15, 188], [-40, 169], [-50, 140], [-40, 111], [-15, 92], [15, 92], [40, 111]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.04, 0.18 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dat-to") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1453, groups: [{ path: [[-300, -50], [-100, 60], [0, 110]], count: 6, spread: [8,10], color: SON, timing: [[0.3,0],[0.95,1]] }], progress: p0, visible: () => clock.near("dat-to") }));
  // 2. "tay-kinh": người (son) đắp thành dọc bốn cạnh theo thanh kéo; vòng thành Lam Kinh dựng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tay-kinh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1463, groups: [{ path: [[-70, -50], [70, -50]], count: 20, spread: [8,100], color: SON, timing: [[0,0],[1,0.9]] }, { path: [[70, 90], [-70, 90]], count: 20, spread: [8,100], color: SON, timing: [[0,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tay-kinh") }));
  // 3. "vinh-lang": đốm vàng sáng ở Vĩnh Lăng; đốm ngà (bia đá) sáng ở chỗ dựng bia; người (son) đến đứng lặng (diễn hoạ).
  const p2 = run("vinh-lang", 28);
  { const S: Pt[] = [VINH_LANG]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vinh-lang") })); }
  { const S: Pt[] = [BIA]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vinh-lang") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1493, groups: [{ path: [[-150, -80], [-100, 20]], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p2, visible: () => clock.near("vinh-lang") }));
  // 4. "ve-sau": các đốm vàng (lăng các vua, hoàng hậu) sáng dần quanh Lam Kinh (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-60, 60], [80, 70], [-120, 120], [120, -40], [-140, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1513, groups: [{ path: [[0, -200], [0, -60]], count: 16, spread: [30,40], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
