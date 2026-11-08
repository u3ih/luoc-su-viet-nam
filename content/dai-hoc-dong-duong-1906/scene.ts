import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VIEN, DON_THUY } from "./terrain";

type Pt = [number, number];

// Đại học Đông Dương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nghi-dinh","nam-truong","khoa-dau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VIEN, 64]];

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
    seed: 1906,
  });

  // 1. "nghi-dinh": đốm ngà (nghị định) sáng ở giữa (diễn hoạ).
  const p0 = run("nghi-dinh", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghi-dinh") })); }
  // 2. "nam-truong": theo thanh kéo, năm đốm vàng (năm trường) từ năm nơi dồn về viện (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-truong"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 6, seed: 1926, groups: [{ path: [[-250, 200], [-15, 30]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.5,1]] }, { path: [[250, 200], [15, 30]], count: 1, spread: [3,3], color: GOLD, timing: [[0.1,0],[0.6,1]] }, { path: [[-280, -150], [-15, 10]], count: 1, spread: [3,3], color: GOLD, timing: [[0.2,0],[0.7,1]] }, { path: [[200, -60], [15, 10]], count: 1, spread: [3,3], color: GOLD, timing: [[0.3,0],[0.8,1]] }, { path: [[0, -300], [0, 0]], count: 1, spread: [3,3], color: GOLD, timing: [[0.4,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-truong") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 42, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-truong") })); }
  // 3. "khoa-dau": 94 chấm (sinh viên, son) tụ về cơ sở cạnh Đồn Thủy; đốm vàng sáng rồi tắt (tạm dừng) (diễn hoạ).
  const p2 = run("khoa-dau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1946, groups: [{ path: [[-100, 100], [190, -50]], count: 47, spread: [20,120], color: SON, timing: [[0.03,0],[0.5,1]] }, { path: [[0, -250], [195, -70]], count: 47, spread: [20,120], color: SON, timing: [[0.05,0],[0.55,1]] }], progress: p2, visible: () => clock.near("khoa-dau") }));
  { const S: Pt[] = [DON_THUY]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (1 - smoothstep(0.7, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoa-dau") })); }
  // 4. "ve-sau": đốm vàng sáng lại (năm 1917); dòng sinh viên (son) đông dần về viện (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1976, groups: [{ path: [[-300, 300], [0, 30]], count: 40, spread: [14,200], color: SON, timing: [[0.1,0],[0.9,1]] }, { path: [[300, -300], [10, 10]], count: 40, spread: [14,200], color: SON, timing: [[0.2,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
