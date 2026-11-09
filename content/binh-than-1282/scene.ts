import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BINH_THAN, TRAN_XA, THAI_AP } from "./terrain";

type Pt = [number, number];

// Hội nghị Bình Than — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hop-ban","khanh-du","qua-cam","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRAN_XA, 40], [THAI_AP, 48]];

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
    seed: 1282,
  });

  // 1. "hop-ban": thuyền vua (đốm vàng) theo sông về bến Bình Than; vương hầu, trăm quan (ngà) tụ ở Trần Xá (diễn hoạ).
  const p0 = run("hop-ban", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1292, groups: [{ path: [[-380, 240], [-160, 110], [10, 5], [110, 25]], count: 1, spread: [3,3], color: GOLD, timing: [[0.02,0],[0.6,1]] }], progress: p0, visible: () => clock.near("hop-ban") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1302, groups: [{ path: [[220, 80], [140, 30]], count: 24, spread: [10,40], color: NGHIA, timing: [[0.1,0],[0.7,1]] }, { path: [[200, -80], [140, 25]], count: 16, spread: [10,40], color: NGHIA, timing: [[0.15,0],[0.75,1]] }], progress: p0, visible: () => clock.near("hop-ban") }));
  // 2. "khanh-du": một thuyền than (đốm ngà) xuôi sông Kinh Thầy tới bến; được mời vào nơi họp (diễn hoạ).
  const p1 = run("khanh-du", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1312, groups: [{ path: [[380, 310], [150, 160], [70, 60]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p1, visible: () => clock.near("khanh-du") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1322, groups: [{ path: [[70, 60], [130, 35]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.65,0],[0.9,1]] }], progress: p1, visible: () => clock.near("khanh-du") }));
  { const S: Pt[] = [[140, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khanh-du") })); }
  // 3. "qua-cam": theo thanh kéo, gia nô và thân thuộc (son) từ các làng tụ về thái ấp của Quốc Toản; cuối cùng đốm vàng (lá cờ sáu chữ) sáng lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["qua-cam"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1342, groups: [{ path: [[-380, 120], [-250, 50]], count: 20, spread: [10,50], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[-300, -200], [-240, 20]], count: 20, spread: [10,50], color: SON, timing: [[0.05,0],[0.75,1]] }, { path: [[-100, 200], [-230, 50]], count: 20, spread: [10,50], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("qua-cam") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1352, groups: [{ path: [[-235, 45], [-240, 40]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("qua-cam") }));
  { const S: Pt[] = [[-240, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("qua-cam") })); }
  // 4. "ve-sau": đội quân của Quốc Toản (son) xuống thuyền xuôi sông ra trận; quân Nguyên (xanh nhạt) từ phía bắc (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1372, groups: [{ path: [[-240, 40], [-170, 110]], count: 24, spread: [8,40], color: SON, timing: [[0.02,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1382, groups: [{ path: [[-160, 110], [0, 0], [200, -110]], count: 8, spread: [8,80], color: SON, timing: [[0.35,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1392, groups: [{ path: [[-200, 400], [-120, 260]], count: 30, spread: [20,60], color: DICH, timing: [[0.1,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
