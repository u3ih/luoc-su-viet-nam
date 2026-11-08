import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_LU, HANG_BOI } from "./terrain";

type Pt = [number, number];

// Quần thể danh thắng Tràng An — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nui-da","tien-su","hoa-lu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_LU, 48]];

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
    counts: { trees: 900, bushes: 800, grass: 1600, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2014,
  });

  // 1. "nui-da": thuyền (chấm ngà) len theo sông giữa những núi đá vôi (diễn hoạ).
  const p0 = run("nui-da", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2024, groups: [{ path: [[-400, -50], [-200, -20], [-60, -80], [60, -20], [200, -60], [400, -30]], count: 8, spread: [6,300], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("nui-da") }));
  // 2. "tien-su": theo thanh kéo, các đốm lửa (người tiền sử) lần lượt sáng trong các hang quanh trung tâm khối đá vôi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tien-su"] ?? 0) / 0.9);
  world.add(createFires({ sites: [[-40, 60], [-80, 40], [0, 90], [-20, 20], [-90, 110]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("tien-su") * smoothstep(0.02, 0.9, inp1(ctx)), size: 2, glow: () => 0.8 }));
  { const S: Pt[] = [[-40, 60], [-80, 40], [0, 90], [-20, 20], [-90, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.15, 0.2 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tien-su") })); }
  // 3. "hoa-lu": đốm vàng (cố đô Hoa Lư) ở phía bắc; người (son) qua lại (diễn hoạ).
  const p2 = run("hoa-lu", 28);
  { const S: Pt[] = [[0, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-lu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2064, groups: [{ path: [[-100, 260], [80, 320]], count: 16, spread: [20,60], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p2, visible: () => clock.near("hoa-lu") }));
  // 4. "ve-sau": vòng đốm vàng (vùng lõi di sản kép) khoanh quanh khối núi; thuyền (chấm ngà) trên sông (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[260, 40], [254, 94], [238, 146], [210, 193], [174, 233], [130, 265], [80, 287], [27, 299], [-27, 299], [-80, 287], [-130, 265], [-174, 233], [-210, 193], [-238, 146], [-254, 94], [-260, 40], [-254, -14], [-238, -66], [-210, -113], [-174, -153], [-130, -185], [-80, -207], [-27, -219], [27, -219], [80, -207], [130, -185], [174, -153], [210, -113], [238, -66], [254, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.025, 0.16999999999999998 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2084, groups: [{ path: [[-400, -50], [-60, -80], [400, -30]], count: 6, spread: [6,300], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
