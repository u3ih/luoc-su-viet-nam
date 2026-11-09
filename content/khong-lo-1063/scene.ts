import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LAI_TRI, DUNG_NHUE, THAY, THANG_LONG } from "./terrain";

type Pt = [number, number];

// Thiền sư Dương Không Lộ và chùa Keo — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chai-luoi","hoc-dao","chua-keo","quoc-su"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LAI_TRI, 40], [DUNG_NHUE, 44]];

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
    seed: 1063,
  });

  // 1. "chai-luoi": thuyền chài (chấm ngà) trên sông; làng chài (son); một chấm ngà (Không Lộ) lên bờ (diễn hoạ).
  const p0 = run("chai-luoi", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1073, groups: [{ path: [[300, 100], [295, -300]], count: 5, spread: [8,200], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("chai-luoi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1083, groups: [{ path: [[180, -140], [200, -120]], count: 16, spread: [10,40], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("chai-luoi") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1093, groups: [{ path: [[270, -110], [210, -115]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[0.9,1]] }], progress: p0, visible: () => clock.near("chai-luoi") }));
  // 2. "hoc-dao": chấm ngà rời làng chài sang phía tây theo thầy học đạo; nơi học (đốm vàng) sáng lên (diễn hoạ).
  const p1 = run("hoc-dao", 28);
  world.add(createCrowd({ size: 7, height: ground, seed: 1103, groups: [{ path: [[200, -120], [0, -60], [-180, 10]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p1, visible: () => clock.near("hoc-dao") }));
  { const S: Pt[] = [[-200, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoc-dao") })); }
  // 3. "chua-keo": theo thanh kéo, chùa Nghiêm Quang (cột đốm vàng) dựng lên bên sông; dân (son) tụ về (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chua-keo"] ?? 0) / 0.9);
  { const S: Pt[] = [[190, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-keo") })); }
  { const S: Pt[] = [[190, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.28 + i * 0.12, 0.43000000000000005 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-keo") })); }
  { const S: Pt[] = [[190, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45999999999999996 + i * 0.12, 0.61 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-keo") })); }
  { const S: Pt[] = [[190, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.64 + i * 0.12, 0.79 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chua-keo") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1163, groups: [{ path: [[120, -40], [180, 50]], count: 16, spread: [10,40], color: SON, timing: [[0.2,0],[0.8,1]] }, { path: [[100, 180], [180, 90]], count: 14, spread: [10,40], color: SON, timing: [[0.25,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chua-keo") }));
  // 4. "quoc-su": chấm ngà theo đường sông lên kinh thành phía bắc (đốm vàng); về sau tháp thờ (đốm ngà) ở chùa (diễn hoạ).
  const p3 = run("quoc-su", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1173, groups: [{ path: [[280, 60], [285, 250], [150, 340], [20, 350]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.5,1]] }], progress: p3, visible: () => clock.near("quoc-su") }));
  { const S: Pt[] = [[0, 360]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-su") })); }
  { const S: Pt[] = [[190, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-su") })); }
};

export default setup;
