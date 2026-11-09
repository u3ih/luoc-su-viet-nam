import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, YEN_PHU, CHAN_NUI, LANG_A, LANG_B, LANG_C, KINH } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Ngô Bệ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["yen-phu","chan-cuu","trieu-dinh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHAN_NUI, 36], [LANG_A, 32], [LANG_B, 32]];

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
    seed: 1358,
  });

  // 1. "yen-phu": dân phiêu tán (son) tụ về chân núi Yên Phụ; quân triều (xanh nhạt) tới, nhóm son tản ra nhiều ngả (diễn hoạ).
  const p0 = run("yen-phu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1368, groups: [{ path: [[-230, -60], [-50, 40]], count: 16, spread: [8,40], color: SON, timing: [[0.03,0],[0.45,1]] }, { path: [[40, -150], [-30, 40]], count: 14, spread: [8,40], color: SON, timing: [[0.06,0],[0.5,1]] }], progress: p0, visible: () => clock.near("yen-phu") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1378, groups: [{ path: [[-250, -300], [-70, 20]], count: 30, spread: [16,50], color: DICH, timing: [[0.45,0],[0.9,1]] }], progress: p0, visible: () => clock.near("yen-phu") }));
  // 2. "chan-cuu": theo thanh kéo, dân nghèo (son) các làng tụ về chân núi; đốm vàng (bảng 'chẩn cứu dân nghèo') sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["chan-cuu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1388, groups: [{ path: [[-230, -60], [-60, 40]], count: 20, spread: [8,50], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[40, -150], [-30, 40]], count: 20, spread: [8,50], color: SON, timing: [[0.05,0],[0.75,1]] }, { path: [[-180, 170], [-70, 70]], count: 16, spread: [8,50], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [[200, 50], [-20, 55]], count: 16, spread: [8,50], color: SON, timing: [[0.15,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("chan-cuu") }));
  { const S: Pt[] = [[-40, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chan-cuu") })); }
  // 3. "trieu-dinh": nhà giàu các làng bỏ thóc cứu đói (đốm ngà); quân triều (xanh nhạt) từ kinh thành kéo tới (diễn hoạ).
  const p2 = run("trieu-dinh", 28);
  { const S: Pt[] = [[-230, -60], [40, -150], [-180, 170]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trieu-dinh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1418, groups: [{ path: [[-250, -300], [-120, -100], [-50, 20]], count: 50, spread: [20,80], color: DICH, timing: [[0.2,0],[0.9,1]] }], progress: p2, visible: () => clock.near("trieu-dinh") }));
  // 4. "ve-sau": nghĩa quân (son) tan vỡ; đốm vàng ở chân núi lịm dần (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1428, groups: [{ path: [[-40, 50], [-30, 40]], count: 30, spread: [10,50], color: SON, timing: [[0,1],[1,1]] }], progress: p3, fall: (ctx) => smoothstep(0.05, 0.9, p3()), visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-40, 50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.4, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
