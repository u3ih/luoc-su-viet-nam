import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUYNH_CUNG, KINH, PHUONG_HOANG, CHAN_NUI } from "./terrain";

type Pt = [number, number];

// Chu Văn An và Thất trảm sớ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["huynh-cung","quoc-tu-giam","that-tram","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUYNH_CUNG, 40], [KINH, 56]];

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
    seed: 1350,
  });

  // 1. "huynh-cung": học trò (son) từ nhiều ngả tụ về trường làng Huỳnh Cung, đốm ngà (thầy) sáng ở trường (diễn hoạ).
  const p0 = run("huynh-cung", 28);
  { const S: Pt[] = [HUYNH_CUNG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("huynh-cung") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1370, groups: [{ path: [[-300, -200], HUYNH_CUNG], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-60, -250], HUYNH_CUNG], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [[-50, 40], HUYNH_CUNG], count: 12, spread: [26,50], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: p0, visible: () => clock.near("huynh-cung") }));
  // 2. "quoc-tu-giam": đốm ngà đi từ Huỳnh Cung lên kinh đô; đốm vàng sáng ở Quốc Tử Giám, học trò (son) tụ lại (diễn hoạ).
  const p1 = run("quoc-tu-giam", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1380, groups: [{ path: [HUYNH_CUNG, [-110, 20], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: p1, visible: () => clock.near("quoc-tu-giam") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-tu-giam") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1400, groups: [{ path: [[-200, 260], KINH], count: 16, spread: [26,50], color: SON, timing: [[0.3,0],[0.95,1]] }], progress: p1, visible: () => clock.near("quoc-tu-giam") }));
  // 3. "that-tram": đốm vàng ở kinh đô lịm dần; đốm ngà rời kinh đô đi về núi Phượng Hoàng theo thanh kéo, vài học trò (son) theo sau (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["that-tram"] ?? 0) / 0.9);
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.1, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("that-tram") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1420, groups: [{ path: [KINH, [60, 150], CHAN_NUI, PHUONG_HOANG], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("that-tram") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1430, groups: [{ path: [KINH, [60, 150], CHAN_NUI], count: 8, spread: [10,30], color: SON, timing: [[0.2,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("that-tram") }));
  // 4. "ve-sau": đốm vàng sáng trên núi Phượng Hoàng; học trò (son) theo đường lên núi; một đốm vàng nữa ở kinh đô (thờ ở Văn Miếu) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [PHUONG_HOANG]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1450, groups: [{ path: [[60, 60], CHAN_NUI, [225, 190]], count: 18, spread: [10,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
