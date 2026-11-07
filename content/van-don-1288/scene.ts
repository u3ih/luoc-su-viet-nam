import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BINH_THAN, CUA_LUC, VAN_DON, NGOC_SON, GIUA } from "./terrain";

type Pt = [number, number];

// Trận Vân Đồn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ban-than","thuyen-luong","thua-tran","danh-up","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2a4652", shallow: "#7f9a8a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 520, bushes: 500, grass: 1800, reeds: 400 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1288,
  });

  // 1. "ban-than": một chấm ngà (thuyền than) xuôi sông về bến Bình Than, đốm vàng (thuyền vua) sáng dần ở bến (diễn hoạ).
  const p0 = run("ban-than", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1298, groups: [{ path: [[-400, 390], [-350, 320], BINH_THAN], count: 3, spread: [8,14], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("ban-than") }));
  { const S: Pt[] = [BINH_THAN]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-than") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1318, groups: [{ path: [[-380, 230], BINH_THAN], count: 10, spread: [20,30], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("ban-than") }));
  // 2. "thuyen-luong": đoàn chiến thuyền (xanh nhạt) từ phía đông bắc vượt biển vào vùng đảo, đoàn thuyền lương (xanh nhạt) theo chậm phía sau (diễn hoạ).
  const p1 = run("thuyen-luong", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1328, groups: [{ path: [NGOC_SON, [250, 150], VAN_DON, [-20, 90]], count: 40, spread: [50,90], color: DICH, timing: [[0.02,0],[0.9,1]] }, { path: [[400, 260], NGOC_SON, [230, 140], [180, 110]], count: 20, spread: [40,60], color: "#d6e4f2", size: 1.2, timing: [[0.1,0],[0.95,1]] }], progress: p1, visible: () => clock.near("thuyen-luong") }));
  // 3. "thua-tran": thuyền nhà Trần (ngà) chặn đánh ở Vân Đồn, lửa bật lên; đoàn chiến thuyền (xanh nhạt) vượt lên phía tây, bỏ đoàn thuyền lương lại phía sau (diễn hoạ).
  const p2 = run("thua-tran", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1338, groups: [{ path: [VAN_DON, [-20, 90], CUA_LUC, [-330, 200], [-400, 250]], count: 34, spread: [50,90], color: DICH, timing: [[0.05,0],[0.9,1]] }, { path: [[200, 110], VAN_DON], count: 18, spread: [40,60], color: "#d6e4f2", size: 1.2, timing: [[0.05,0],[0.9,1]] }, { path: [[170, 200], [140, 110]], count: 10, spread: [30,30], color: NGHIA, timing: [[0,0],[0.4,1]] }], progress: p2, visible: () => clock.near("thua-tran") }));
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring([130, 90], 22, (i / 4) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: () => clock.near("thua-tran") * smoothstep(0.2, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "danh-up": đoàn thuyền lương (xanh nhạt) đi vào giữa các đảo về Cửa Lục; thuyền nhà Trần (ngà) từ các đảo khép vòng theo thanh kéo, lửa bùng trên đoàn thuyền lương (diễn hoạ).
  const inp3 = (ctx: FrameCtx) => clamp((ctx.inputs["danh-up"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1358, groups: [{ path: [VAN_DON, [0, 90], [-110, 100]], count: 22, spread: [40,50], color: "#d6e4f2", size: 1.2, timing: [[0,0],[0.6,1]] }, { path: [[-150, 40], [-120, 80]], count: 10, spread: [40,20], color: NGHIA, timing: [[0.3,0],[0.9,1]] }, { path: [[40, 90], [-60, 110]], count: 10, spread: [40,20], color: NGHIA, timing: [[0.35,0],[0.95,1]] }, { path: [CUA_LUC, [-170, 115]], count: 14, spread: [40,20], color: NGHIA, timing: [[0.2,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp3(ctx), visible: () => clock.near("danh-up") }));
  world.add(createFires({ sites: [[-80, 100], [-110, 92], [-130, 108], [-95, 115], [-60, 96], [-125, 88]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("danh-up") * smoothstep(0.55, 0.9, inp3(ctx)), size: 4, glow: () => 0.8 }));
  // 5. "ve-sau": các đốm vàng (lương chìm) mờ dần giữa vùng đảo; đoàn chiến thuyền (xanh nhạt) quay về phía tây; thuyền nhà Trần (ngà) đứng ở Cửa Lục (diễn hoạ).
  const p4 = run("ve-sau", 28);
  { const S: Pt[] = [[-80, 100], [-110, 92], [-130, 108], [-60, 96]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p4(); return 0.8 * smoothstep(0 + i * 0.05, 0.15 + i * 0.05, k) * (1 - smoothstep(0.5, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1388, groups: [{ path: [[-400, 300], [-300, 220], [-380, 170]], count: 26, spread: [50,60], color: DICH, timing: [[0.1,0],[0.9,1]] }, { path: [[-160, 100], CUA_LUC], count: 14, spread: [40,30], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
};

export default setup;
