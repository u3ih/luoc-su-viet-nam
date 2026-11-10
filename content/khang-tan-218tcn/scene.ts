import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KENH, TRAI, LANG, RUNG } from "./terrain";

type Pt = [number, number];

// Người Việt chống quân Tần — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-tien","linh-cu","rung-sau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRAI, 44], [LANG, 40]];

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
    counts: { trees: 700, bushes: 800, grass: 1800, reeds: 500 },
    forestAt: 0.45,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 218,
  });

  // 1. "nam-tien": quân Tần (xanh nhạt) theo sông kéo xuống phía nam, dựng trại (diễn hoạ).
  const p0 = run("nam-tien", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 228, groups: [{ path: [[-120, 400], [-70, 250], [10, 160]], count: 60, spread: [20,120], color: DICH, timing: [[0.03,0],[0.75,1]] }], progress: p0, visible: () => clock.near("nam-tien") }));
  { const S: Pt[] = [[20, 150]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-tien") })); }
  // 2. "linh-cu": chuỗi đốm xanh nhạt (kênh Linh Cừ) đào dần; người Việt (son) từ rừng đánh úp quân đào kênh (diễn hoạ).
  const p1 = run("linh-cu", 28);
  { const S: Pt[] = [[-260, 370], [-227, 360], [-193, 350], [-160, 340], [-137, 337], [-113, 333], [-90, 330]]; world.add(createGlows({ count: S.length, color: DICH, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("linh-cu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 258, groups: [{ path: [[-200, 330], [-120, 335]], count: 30, spread: [10,60], color: DICH, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("linh-cu") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 268, groups: [{ path: [[-300, 200], [-180, 310]], count: 14, spread: [8,30], color: SON, timing: [[0.3,0],[0.8,1]] }, { path: [[0, 380], [-110, 345]], count: 12, spread: [8,30], color: SON, timing: [[0.4,0],[0.85,1]] }], progress: p1, visible: () => clock.near("linh-cu") }));
  // 3. "rung-sau": theo thanh kéo, người Việt (son) rời làng rút vào rừng sâu; quân Tần (xanh nhạt) tiến sâu xuống phía nam (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["rung-sau"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 278, groups: [{ path: [[70, -60], [-80, -110], [-220, -170]], count: 40, spread: [10,60], color: SON, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("rung-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 288, groups: [{ path: [[20, 150], [40, 0], [-40, -80]], count: 50, spread: [16,80], color: DICH, timing: [[0.3,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("rung-sau") }));
  { const S: Pt[] = [[70, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.3, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rung-sau") })); }
  // 4. "ve-sau": người Việt (son) từ rừng đánh úp quân Tần (xanh nhạt ngã xuống); đốm vàng sáng lên ở làng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 308, groups: [{ path: [[-30, -70], [-60, -60]], count: 40, spread: [16,70], color: DICH, timing: [[0,1],[1,1]] }], progress: p3, fall: (ctx) => smoothstep(0.05, 0.9, p3()), visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 318, groups: [{ path: [[-220, -170], [-80, -80]], count: 24, spread: [10,60], color: SON, timing: [[0.05,0],[0.5,1]] }, { path: [[-250, 50], [-90, -40]], count: 20, spread: [10,60], color: SON, timing: [[0.1,0],[0.55,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[70, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
