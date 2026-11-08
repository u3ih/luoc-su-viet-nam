import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LUNG_DONG, KINH, PHUONG_BAC } from "./terrain";

type Pt = [number, number];

// Mạc Đĩnh Chi đi sứ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hoc-duong","trang-nguyen","di-su","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LUNG_DONG, 40], [KINH, 56]];

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
    seed: 1308,
  });

  // 1. "hoc-duong": văn sĩ (son) bốn phương tụ về học đường; một đốm ngà nhỏ (Mạc Đĩnh Chi) đi từ Lũng Động tới (diễn hoạ).
  const p0 = run("hoc-duong", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1318, groups: [{ path: [[380, 250], [150, 80]], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[380, -250], [150, 60]], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("hoc-duong") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1328, groups: [{ path: [LUNG_DONG, [160, 70]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.2,0],[0.8,1]] }], progress: p0, visible: () => clock.near("hoc-duong") }));
  { const S: Pt[] = [[150, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoc-duong") })); }
  // 2. "trang-nguyen": đốm ngà đến kinh đô dự thi; ba đốm vàng (Tam khôi) sáng; một đốm sen (hồng) nở bên cạnh (diễn hoạ).
  const p1 = run("trang-nguyen", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1348, groups: [{ path: [[150, 70], [0, 60], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: p1, visible: () => clock.near("trang-nguyen") }));
  { const S: Pt[] = [[-220, 80], [-200, 85], [-180, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.08, 0.65 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-nguyen") })); }
  { const S: Pt[] = [[-200, 40]]; world.add(createGlows({ count: S.length, color: "#f2b8c8", size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trang-nguyen") })); }
  // 3. "di-su": sứ đoàn (chấm ngà) rời kinh đô theo đường núi lên phương Bắc theo thanh kéo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["di-su"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1378, groups: [{ path: [KINH, [-120, 180], [0, 280], PHUONG_BAC], count: 6, spread: [6,40], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("di-su") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1388, groups: [{ path: [KINH, [-120, 180], [0, 280], [30, 360]], count: 14, spread: [8,50], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("di-su") }));
  // 4. "ve-sau": sứ đoàn trở về kinh đô; đốm vàng sáng ở kinh đô (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1398, groups: [{ path: [PHUONG_BAC, [0, 280], [-120, 180], KINH], count: 6, spread: [6,40], color: NGHIA, timing: [[0.02,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
