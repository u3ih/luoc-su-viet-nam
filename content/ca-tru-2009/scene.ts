import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DINH } from "./terrain";

type Pt = [number, number];

// Ca trù — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ten-goi","hat-noi","chau-hat","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DINH, 56]];

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
    seed: 2030,
  });

  // 1. "ten-goi": các đình làng (đốm ngà) khắp vùng lần lượt sáng; người nghe (son) tìm đến (diễn hoạ).
  const p0 = run("ten-goi", 28);
  { const S: Pt[] = [[-165, -145], [-55, -145], [55, -145], [165, -145], [-165, -35], [-55, -35], [55, -35], [165, -35], [-165, 75], [-55, 75], [55, 75], [165, 75], [-165, 185], [-55, 185], [55, 185], [165, 185]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ten-goi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2050, groups: [{ path: [[-150, -100], [-10, 30]], count: 20, spread: [6,20], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: p0, visible: () => clock.near("ten-goi") }));
  // 2. "hat-noi": các nhà nho (chấm ngà) tụ về đình; đốm vàng (bài hát nói) sáng lên (diễn hoạ).
  const p1 = run("hat-noi", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2060, groups: [{ path: [[-120, 160], [-10, 50]], count: 8, spread: [4,12], color: NGHIA, timing: [[0.03,0],[0.6,1]] }, { path: [[150, 120], [10, 50]], count: 8, spread: [4,12], color: NGHIA, timing: [[0.06,0],[0.65,1]] }], progress: p1, visible: () => clock.near("hat-noi") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hat-noi") })); }
  // 3. "chau-hat": theo thanh kéo, ba đốm (đào nương vàng, kép đàn đáy ngà, quan viên son) sáng; vòng đốm nhỏ quanh (tiếng phách, tiếng trống chầu) lan ra (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chau-hat"] ?? 0) / 0.9);
  { const S: Pt[] = [[-8, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-hat") })); }
  { const S: Pt[] = [[8, 44]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.15 + i * 0.12, 0.3 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-hat") })); }
  { const S: Pt[] = [[0, 22]]; world.add(createGlows({ count: S.length, color: "#e2563a", size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-hat") })); }
  { const S: Pt[] = [[20, 38], [17, 48], [10, 55], [0, 58], [-10, 55], [-17, 48], [-20, 38], [-17, 28], [-10, 21], [0, 18], [10, 21], [17, 28]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45 + i * 0.004, 0.6 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-hat") })); }
  { const S: Pt[] = [[31, 44], [27, 55], [20, 63], [10, 68], [-1, 70], [-12, 68], [-21, 62], [-28, 53], [-32, 43], [-31, 32], [-27, 21], [-20, 13], [-10, 8], [1, 6], [12, 8], [21, 14], [28, 23], [32, 33]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.65 + i * 0.004, 0.8 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chau-hat") })); }
  // 4. "ve-sau": mười sáu đốm vàng (các tỉnh, thành trong hồ sơ) lần lượt sáng khắp nửa phía bắc (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-260, 300], [-193, 267], [-127, 233], [-60, 200], [-7, 153], [47, 107], [100, 60], [67, 0], [33, -60], [0, -120], [-40, -167], [-80, -213], [-120, -260], [-100, -300], [-80, -340], [-60, -380]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
