import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAN, SAN } from "./terrain";

type Pt = [number, number];

// Nghệ thuật Xòe Thái — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguon-goc","dieu-xoe","vong-xoe","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAN, 72]];

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
    seed: 2028,
  });

  // 1. "nguon-goc": người Thái (son) theo các ngả núi xuống thung lũng, dựng bản (đốm ngà) (diễn hoạ).
  const p0 = run("nguon-goc", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2038, groups: [{ path: [[-150, 380], [-60, 200], [-10, 70]], count: 30, spread: [8,30], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[200, 380], [80, 200], [10, 70]], count: 30, spread: [8,30], color: SON, timing: [[0.08,0],[0.75,1]] }], progress: p0, visible: () => clock.near("nguon-goc") }));
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguon-goc") })); }
  // 2. "dieu-xoe": các điệu xòe: vòng đốm ngà nhỏ (khăn, nón, quạt) quanh sân; tiếng trống, chiêng (đốm vàng) (diễn hoạ).
  const p1 = run("dieu-xoe", 28);
  { const S: Pt[] = [[16, 60], [11, 71], [0, 76], [-11, 71], [-16, 60], [-11, 49], [0, 44], [11, 49]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dieu-xoe") })); }
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dieu-xoe") })); }
  // 3. "vong-xoe": theo thanh kéo, vòng xòe (chấm người son) nối dài quanh đống lửa giữa sân (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["vong-xoe"] ?? 0) / 0.9);
  world.add(createFires({ sites: [[0, 60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("vong-xoe") * smoothstep(0.05, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2088, groups: [{ path: [[26, 60], [25, 68], [21, 75], [15, 81], [8, 85], [0, 86], [-8, 85], [-15, 81], [-21, 75], [-25, 68], [-26, 60], [-25, 52], [-21, 45], [-15, 39], [-8, 35], [0, 34], [8, 35], [15, 39], [21, 45], [25, 52], [26, 60]], count: 60, spread: [1,3], color: SON, drop: true, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("vong-xoe") }));
  // 4. "ve-sau": các bản quanh thung lũng (đốm vàng) lần lượt sáng; vòng xòe vẫn quanh lửa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createFires({ sites: [[0, 60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("ve-sau") * smoothstep(0.01, 0.9, p3()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2108, groups: [{ path: [[26, 60], [25, 68], [21, 75], [15, 81], [8, 85], [0, 86], [-8, 85], [-15, 81], [-21, 75], [-25, 68], [-26, 60], [-25, 52], [-21, 45], [-15, 39], [-8, 35], [0, 34], [8, 35], [15, 39], [21, 45], [25, 52], [26, 60]], count: 60, spread: [1,3], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[182, 96], [114, 192], [3, 230], [-109, 195], [-180, 101], [-182, -16], [-114, -112], [-3, -150], [109, -115], [180, -21]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.07, 0.25 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
