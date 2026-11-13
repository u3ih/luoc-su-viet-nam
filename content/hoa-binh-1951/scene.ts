import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_BINH, TU_VU, PHEO, XUAN_MAI } from "./terrain";

type Pt = [number, number];

// Chiến dịch Hoà Bình — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nhay-du","tu-vu","duong-so-6","rut-lui"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_BINH, 32], [TU_VU, 16], [XUAN_MAI, 24]];

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
    seed: 1951,
  });

  // 1. "nhay-du": đốm xanh nhạt (lính dù) rơi xuống thị xã; đoàn quân (xanh nhạt) theo đường số 6 và sông Đà tiến lên (diễn hoạ).
  const p0 = run("nhay-du", 28);
  { const S: Pt[] = [[-11, 26], [-21, 43], [-41, 50], [-60, 42], [-70, 24], [-66, 4], [-50, -8], [-29, -8], [-14, 6]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (1 - smoothstep(0.45, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhay-du") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1971, groups: [{ path: [[-10, 20], [-16, 38], [-31, 49], [-49, 49], [-64, 38], [-70, 20], [-64, 2], [-49, -9], [-31, -9], [-16, 2], [-10, 20]], count: 40, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }, { path: [[200, -140], [100, -60], [20, -10], [-30, 15]], count: 50, spread: [3,10], color: DICH, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("nhay-du") }));
  // 2. "tu-vu": đêm, các mũi quân (son) từ bốn phía đánh vào cứ điểm Tu Vũ; lửa bùng; ca nô (xanh nhạt) trên sông bị chặn (diễn hoạ).
  const p1 = run("tu-vu", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1981, groups: [{ path: [[225, 173], [120, 140]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.65,1]] }, { path: [[87, 245], [120, 140]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.65,1]] }, { path: [[15, 107], [120, 140]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.65,1]] }, { path: [[153, 35], [120, 140]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.65,1]] }], progress: p1, visible: () => clock.near("tu-vu") }));
  world.add(createFires({ sites: [[120, 140], [110, 150], [130, 128]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("tu-vu") * smoothstep(0.55, 0.9, p1()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2001, groups: [{ path: [[300, 400], [200, 260], [160, 210]], count: 3, spread: [2,6], color: DICH, timing: [[0.05,0],[0.5,1]] }], progress: p1, visible: () => clock.near("tu-vu") }));
  // 3. "duong-so-6": theo thanh kéo, đoàn xe tiếp tế (xanh nhạt) đi lên đường số 6; hai bên đèo (son) chặn đánh, lửa bùng dọc đường (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["duong-so-6"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2011, groups: [{ path: [[200, -140], [120, -80], [40, -20], [-30, 15]], count: 50, spread: [2,6], color: DICH, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("duong-so-6") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2021, groups: [{ path: [[144, -50], [141, -42], [134, -37], [126, -37], [119, -42], [116, -50], [119, -58], [126, -63], [134, -63], [141, -58], [144, -50]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[84, -70], [81, -62], [74, -57], [66, -57], [59, -62], [56, -70], [59, -78], [66, -83], [74, -83], [81, -78], [84, -70]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[44, 10], [41, 18], [34, 23], [26, 23], [19, 18], [16, 10], [19, 2], [26, -3], [34, -3], [41, 2], [44, 10]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("duong-so-6") }));
  world.add(createFires({ sites: [[120, -80], [80, -50], [40, -20]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("duong-so-6") * smoothstep(0.45, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "rut-lui": quân Pháp (xanh nhạt) rời thị xã, vượt sông Đà rồi theo đường số 6 về phía đông; lửa ở bến sông (diễn hoạ).
  const p3 = run("rut-lui", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2041, groups: [{ path: [[-40, 20], [-10, 60], [60, 40], [200, -140]], count: 80, spread: [4,14], color: DICH, timing: [[0.05,0],[0.95,1]] }], progress: p3, visible: () => clock.near("rut-lui") }));
  world.add(createFires({ sites: [[-15, 60], [0, 70]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("rut-lui") * smoothstep(0.35, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
