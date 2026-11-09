import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAI_SON, HANG, CHUA, LANG } from "./terrain";

type Pt = [number, number];

// Từ Đạo Hạnh và chùa Thầy — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["sai-son","chua-thay","trut-xac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHUA, 24]];

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
    seed: 1116,
  });

  // 1. "sai-son": đốm ngà (Từ Lộ) rời làng Láng đi về phía tây nam, nửa đường quay lại, lên núi Sài Sơn (diễn hoạ).
  const p0 = run("sai-son", 28);
  { const S: Pt[] = [[300, -150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.2, 0.35, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sai-son") })); }
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 3, seed: 1136, groups: [{ path: [[300, -150], [120, -280], [-60, -240], [-20, -80], [0, 20]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.9,1]] }], progress: p0, visible: () => clock.near("sai-son") }));
  // 2. "chua-thay": theo thanh kéo, am nhỏ (đốm ngà) rồi chùa Cao trên núi, chùa Cả dưới chân núi và các toà quanh hồ (đốm vàng) lần lượt sáng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["chua-thay"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-thay") })); }
  { const S: Pt[] = [[10, 75], [0, 0], [-25, -10], [25, -10], [-50, -45], [50, -45], [0, -45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.15 + i * 0.1, 0.3 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-thay") })); }
  // 3. "trut-xac": người phi ngựa (đốm vàng) từ kinh thành tới núi; đốm ngà ở hang lịm đi; đốm vàng (người con ra đời) sáng ở phía đông (diễn hoạ).
  const p2 = run("trut-xac", 28);
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 3, seed: 1166, groups: [{ path: [[300, -150], [100, -60], [25, 55]], count: 1, spread: [3,3], color: GOLD, timing: [[0.03,0],[0.4,1]] }], progress: p2, visible: () => clock.near("trut-xac") }));
  { const S: Pt[] = [[20, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.45, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trut-xac") })); }
  { const S: Pt[] = [[300, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trut-xac") })); }
  // 4. "ve-sau": hội chùa Thầy: người (son) đông quanh hồ; đốm vàng (thủy đình) giữa hồ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1196, groups: [{ path: [[60, -40], [55, -17], [42, 2], [23, 15], [0, 20], [-23, 15], [-42, 2], [-55, -17], [-60, -40], [-55, -63], [-42, -82], [-23, -95], [0, -100], [23, -95], [42, -82], [55, -63], [60, -40]], count: 90, spread: [4,260], color: SON, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[0, -45]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
