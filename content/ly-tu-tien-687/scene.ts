import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TONG_BINH, LANG_A } from "./terrain";

type Pt = [number, number];

// Lý Tự Tiên và Đinh Kiến — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["an-nam","thue","tong-binh","bi-dep"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TONG_BINH, 32], [LANG_A, 24]];

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
    seed: 687,
  });

  // 1. "an-nam": đốm vàng (trị sở Tống Bình) sáng bên sông; các làng (đốm ngà) quanh (diễn hoạ).
  const p0 = run("an-nam", 28);
  { const S: Pt[] = [[40, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("an-nam") })); }
  { const S: Pt[] = [[-80, -40], [-120, 60], [-20, 120], [100, -80], [-40, -130], [-150, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("an-nam") })); }
  // 2. "thue": theo thanh kéo, các toán thu thuế (xanh nhạt) từ trị sở toả về các làng; ở các làng, người dân (son) tụ lại (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thue"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 717, groups: [{ path: [[40, 40], [-80, -40]], count: 8, spread: [2,6], color: DICH, timing: [[0.02,0],[0.6,1]] }, { path: [[40, 40], [-120, 60]], count: 8, spread: [2,6], color: DICH, timing: [[0.05,0],[0.65,1]] }, { path: [[40, 40], [-40, -130]], count: 8, spread: [2,6], color: DICH, timing: [[0.08,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thue") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 727, groups: [{ path: [[-62, -40], [-65, -29], [-74, -23], [-86, -23], [-95, -29], [-98, -40], [-95, -51], [-86, -57], [-74, -57], [-65, -51], [-62, -40]], count: 20, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-104, 60], [-107, 69], [-115, 75], [-125, 75], [-133, 69], [-136, 60], [-133, 51], [-125, 45], [-115, 45], [-107, 51], [-104, 60]], count: 16, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[-24, -130], [-27, -121], [-35, -115], [-45, -115], [-53, -121], [-56, -130], [-53, -139], [-45, -145], [-35, -145], [-27, -139], [-24, -130]], count: 16, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thue") }));
  // 3. "tong-binh": đoàn người (son) từ các làng kéo về vây trị sở Tống Bình; lửa ở trị sở (diễn hoạ).
  const p2 = run("tong-binh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 737, groups: [{ path: [[183, 84], [40, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[73, 186], [40, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[-70, 142], [40, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[-103, -4], [40, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[7, -106], [40, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }, { path: [[150, -62], [40, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.7,1]] }], progress: p2, visible: () => clock.near("tong-binh") }));
  world.add(createFires({ sites: [[40, 40], [50, 50], [30, 30]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("tong-binh") * smoothstep(0.75, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "bi-dep": đoàn quân (xanh nhạt) từ phương bắc theo sông xuống; các đốm son tắt dần (diễn hoạ).
  const p3 = run("bi-dep", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 757, groups: [{ path: [[150, 390], [120, 200], [40, 60]], count: 60, spread: [6,20], color: DICH, timing: [[0.02,0],[0.7,1]] }], progress: p3, visible: () => clock.near("bi-dep") }));
  { const S: Pt[] = [[40, 40], [-80, -40], [-120, 60], [-40, -130]]; world.add(createGlows({ count: S.length, color: SON, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.55, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bi-dep") })); }
};

export default setup;
