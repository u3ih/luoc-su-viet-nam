import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NGHIA_LINH, DEN_HA, DEN_TRUNG, DEN_THUONG, LANG_A, LANG_B, LANG_C, LANG_D } from "./terrain";

type Pt = [number, number];

// Tín ngưỡng thờ cúng Hùng Vương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nghia-linh","gio-to","giu-le","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG_A, 40], [LANG_B, 40], [LANG_C, 40], [LANG_D, 32]];

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
    seed: 2013,
  });

  // 1. "nghia-linh": ba đền (đốm ngà) lần lượt sáng từ chân lên đỉnh núi Nghĩa Lĩnh; người giữ đền (son) từ ba làng gần (diễn hoạ).
  const p0 = run("nghia-linh", 28);
  { const S: Pt[] = [[10, -35], [6, 5], [0, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.2, 0.2 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghia-linh") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2033, groups: [{ path: [[-80, -100], [5, -40]], count: 6, spread: [4,16], color: SON, timing: [[0.1,0],[0.6,1]] }, { path: [[90, -100], [12, -40]], count: 6, spread: [4,16], color: SON, timing: [[0.15,0],[0.65,1]] }], progress: p0, visible: () => clock.near("nghia-linh") }));
  // 2. "gio-to": theo thanh kéo, đoàn rước (son) cùng kiệu (đốm vàng) từ bốn phía tụ về chân núi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["gio-to"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2043, groups: [{ path: [[-200, -120], [-10, -50]], count: 18, spread: [8,50], color: SON, timing: [[0,0],[0.75,1]] }, { path: [[180, -160], [20, -55]], count: 18, spread: [8,50], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [[-180, 200], [-60, 60], [-5, -45]], count: 18, spread: [8,50], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [[170, 210], [70, 40], [20, -45]], count: 18, spread: [8,50], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("gio-to") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 3, seed: 2053, groups: [{ path: [[-200, -120], [-10, -50]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.75,1]] }, { path: [[180, -160], [20, -55]], count: 1, spread: [3,3], color: GOLD, timing: [[0.05,0],[0.8,1]] }, { path: [[-180, 200], [-60, 60], [-5, -45]], count: 1, spread: [3,3], color: GOLD, timing: [[0.1,0],[0.85,1]] }, { path: [[170, 210], [70, 40], [20, -45]], count: 1, spread: [3,3], color: GOLD, timing: [[0.15,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("gio-to") }));
  // 3. "giu-le": ban nghi lễ (chấm ngà) lên đền Thượng dâng hương; khói hương (cột đốm vàng nhạt) (diễn hoạ).
  const p2 = run("giu-le", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2063, groups: [{ path: [[10, -35], [6, 5], [0, 35]], count: 10, spread: [3,14], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p2, visible: () => clock.near("giu-le") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giu-le") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6599999999999999 + i * 0.12, 0.8099999999999999 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giu-le") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 23, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.72 + i * 0.12, 0.87 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giu-le") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.78 + i * 0.12, 0.93 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giu-le") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.84 + i * 0.12, 0.99 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giu-le") })); }
  // 4. "ve-sau": các làng quanh vùng và các nơi xa (đốm ngà) cùng sáng; ba đền (đốm vàng) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[10, -35], [6, 5], [0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.02, 0.15 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[167, 54], [127, 133], [54, 181], [-34, 187], [-113, 147], [-161, 74], [-167, -14], [-127, -93], [-54, -141], [34, -147], [113, -107], [161, -34]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.04, 0.25 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[281, 173], [137, 309], [-59, 334], [-233, 240], [-317, 61], [-281, -133], [-137, -269], [59, -294], [233, -200], [317, -21]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.04, 0.65 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
