import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DA_BANG, HAM_TU, TAY_DO, KY_LA, PHUONG_BAC } from "./terrain";

type Pt = [number, number];

// Hồ Nguyên Trừng và súng thần cơ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ta-tuong-quoc","than-co","chong-minh","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DA_BANG, 48], [TAY_DO, 48]];

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
    seed: 1405,
  });

  // 1. "ta-tuong-quoc": đốm vàng (vua) và đốm ngà (Tả Tướng quốc) ở kinh đô; triều thần (son) tụ lại (diễn hoạ).
  const p0 = run("ta-tuong-quoc", 28);
  { const S: Pt[] = [TAY_DO]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ta-tuong-quoc") })); }
  { const S: Pt[] = [[-230, -215]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ta-tuong-quoc") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1435, groups: [{ path: [[-150, -150], [-230, -220]], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p0, visible: () => clock.near("ta-tuong-quoc") }));
  // 2. "than-co": các vệt vàng dọc sông, kênh sáng dần theo thanh kéo (đê, kênh được khơi thông); thuyền lớn (ngà) xuôi sông; lửa lò rèn bật ở kinh đô (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["than-co"] ?? 0) / 0.9);
  { const S: Pt[] = [[-320, 340], [-260, 280], [-200, 220], [-120, 140], [-40, 60], [40, 0], [120, -60], [-250, -80], [-120, -120], [0, -170], [100, -210]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.07, 0.16999999999999998 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("than-co") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1455, groups: [{ path: [TAY_DO, [-120, -120], [-40, 60], [-150, 180]], count: 8, spread: [10,50], color: NGHIA, timing: [[0.1,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("than-co") }));
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring(TAY_DO, 18, (i / 4) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: (ctx) => clock.near("than-co") * smoothstep(0.3, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "chong-minh": quân Minh (xanh nhạt) tràn xuống từ phía bắc qua Đa Bang; quân Đại Ngu (son) giữ thành rồi phản công ở Hàm Tử, lửa bùng (diễn hoạ).
  const p2 = run("chong-minh", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1475, groups: [{ path: [PHUONG_BAC, [-180, 300], DA_BANG, [-80, 100]], count: 46, spread: [40,100], color: DICH, timing: [[0.03,0],[0.85,1]] }], progress: p2, visible: () => clock.near("chong-minh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1485, groups: [{ path: [[-160, 200], [-200, 230]], count: 24, spread: [50,30], color: SON, timing: [[0,0],[0.4,1]] }], progress: p2, visible: () => clock.near("chong-minh") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1495, groups: [{ path: [[60, -20], HAM_TU], count: 12, spread: [20,40], color: NGHIA, timing: [[0.4,0],[0.9,1]] }], progress: p2, visible: () => clock.near("chong-minh") }));
  world.add(createFires({ sites: [DA_BANG, [-190, 250], HAM_TU, [-10, 50]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("chong-minh") * smoothstep(0.3, 0.9, p2()), size: 4, glow: () => 0.8 }));
  // 4. "ve-sau": đốm ngà bị đưa từ cửa Kỳ La đi về phương bắc cùng đoàn chấm xanh nhạt; về sau các đốm vàng nhỏ (trang Nam Ông mộng lục) sáng ở phương bắc (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1515, groups: [{ path: [KY_LA, [100, -100], [-60, 150], PHUONG_BAC], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.7,1]] }, { path: [KY_LA, [100, -100], [-60, 150], PHUONG_BAC], count: 10, spread: [10,40], color: DICH, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-130, 370], [-110, 370], [-90, 370], [-70, 370]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.05, 0.9 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
