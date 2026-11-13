import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TAN_LAP, SAI_GON_G, LANG_G } from "./terrain";

type Pt = [number, number];

// Mặt trận Dân tộc Giải phóng miền Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["sau-geneve","tan-lap","dai-hoi","chinh-phu"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TAN_LAP, 32], [SAI_GON_G, 32], [LANG_G, 24]];

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
    seed: 1960,
  });

  // 1. "sau-geneve": các làng (đốm ngà) rải rác; các toán lính (xanh nhạt) đi lại giữa làng; vài đốm ngà tắt (diễn hoạ).
  const p0 = run("sau-geneve", 28);
  { const S: Pt[] = [[20, -40], [-60, -100], [80, 0], [-20, 40], [100, -60], [-90, -20], [40, -140]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-geneve") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1980, groups: [{ path: [[120, -120], [80, 0], [-20, 40], [-90, -20], [-60, -100], [40, -140]], count: 40, spread: [4,12], color: DICH, timing: [[0.05,0],[0.95,1]] }], progress: p0, visible: () => clock.near("sau-geneve") }));
  { const S: Pt[] = [[-20, 40], [-90, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.5, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-geneve") })); }
  // 2. "tan-lap": theo thanh kéo, đại biểu (son) từ nhiều vùng tụ về căn cứ trong rừng Tân Lập; đốm vàng sáng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tan-lap"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 2000, groups: [{ path: [[84, 98], [-40, 60]], count: 5, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-11, 187], [-40, 60]], count: 5, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-135, 148], [-40, 60]], count: 5, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-164, 22], [-40, 60]], count: 5, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-69, -67], [-40, 60]], count: 5, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[55, -28], [-40, 60]], count: 5, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tan-lap") }));
  { const S: Pt[] = [[-40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tan-lap") })); }
  // 3. "dai-hoi": vòng người (son) quanh đốm vàng ở Tân Lập; từng toán (son) toả đi các vùng (diễn hoạ).
  const p2 = run("dai-hoi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2020, groups: [{ path: [[-14, 60], [-19, 75], [-32, 85], [-48, 85], [-61, 75], [-66, 60], [-61, 45], [-48, 35], [-32, 35], [-19, 45], [-14, 60]], count: 40, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("dai-hoi") }));
  { const S: Pt[] = [[-40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dai-hoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2040, groups: [{ path: [[-40, 60], [60, -60]], count: 12, spread: [2,6], color: SON, timing: [[0.3,0],[0.9,1]] }, { path: [[-40, 60], [-120, -60]], count: 12, spread: [2,6], color: SON, timing: [[0.35,0],[0.95,1]] }], progress: p2, visible: () => clock.near("dai-hoi") }));
  // 4. "chinh-phu": các đốm son lan khắp đồng bằng; đốm vàng ở Tân Lập (diễn hoạ).
  const p3 = run("chinh-phu", 28);
  { const S: Pt[] = [[-40, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chinh-phu") })); }
  { const S: Pt[] = [[20, -40], [-60, -100], [80, 0], [100, -60], [-90, -20], [40, -140], [-140, 80], [60, 100], [-20, -180]]; world.add(createGlows({ count: S.length, color: SON, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.07, 0.25 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chinh-phu") })); }
};

export default setup;
