import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KHE_SANH_N, LAO_BAO, CAN_CU_31, SE_PON, TRUONG_SON_N } from "./terrain";

type Pt = [number, number];

// Đường 9 – Nam Lào — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ke-hoach","cao-diem-31","se-pon","rut-lui"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KHE_SANH_N, 24], [SE_PON, 24]];

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
    seed: 1971,
  });

  // 1. "ke-hoach": các đốm ngà dọc đường Trường Sơn (bắc – nam); đoàn người (son) đi dọc đường mòn; đốm vàng ở Sê Pôn (kho hậu cần) (diễn hoạ).
  const p0 = run("ke-hoach", 28);
  { const S: Pt[] = [[-60, 300], [-60, 233], [-60, 167], [-60, 100], [-60, 33], [-60, -33], [-60, -100], [-60, -167], [-60, -233], [-60, -300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-hoach") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1991, groups: [{ path: [[-60, 380], [-60, 0], [-60, -380]], count: 40, spread: [2,6], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p0, visible: () => clock.near("ke-hoach") }));
  { const S: Pt[] = [[-150, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-hoach") })); }
  // 2. "cao-diem-31": đoàn quân (xanh nhạt) theo đường 9 vượt biên giới; các căn cứ trên đồi (đốm xanh nhạt); các mũi quân (son) đánh vào căn cứ 31, lửa bùng (diễn hoạ).
  const p1 = run("cao-diem-31", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2011, groups: [{ path: [[170, -10], [80, -10], [-20, -15]], count: 50, spread: [3,10], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p1, visible: () => clock.near("cao-diem-31") }));
  { const S: Pt[] = [[-20, 90], [40, 80], [-80, -70]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.1 + i * 0.05, 0.25 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cao-diem-31") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2031, groups: [{ path: [[42, 168], [-20, 90]], count: 14, spread: [4,16], color: SON, timing: [[0.4,0],[0.85,1]] }, { path: [[-98, 152], [-20, 90]], count: 14, spread: [4,16], color: SON, timing: [[0.4,0],[0.85,1]] }, { path: [[-82, 12], [-20, 90]], count: 14, spread: [4,16], color: SON, timing: [[0.4,0],[0.85,1]] }, { path: [[58, 28], [-20, 90]], count: 14, spread: [4,16], color: SON, timing: [[0.4,0],[0.85,1]] }], progress: p1, visible: () => clock.near("cao-diem-31") }));
  world.add(createFires({ sites: [[-20, 90], [-10, 100]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("cao-diem-31") * smoothstep(0.65, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "se-pon": theo thanh kéo, đoàn trực thăng (đốm xanh nhạt, cách điệu) bay dọc đường 9 từ Khe Sanh tới Sê Pôn, đổ quân (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["se-pon"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 45, seed: 2051, groups: [{ path: [[170, -10], [0, 10], [-150, 0]], count: 24, spread: [6,20], color: DICH, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("se-pon") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2061, groups: [{ path: [[-126, 0], [-131, 14], [-143, 23], [-157, 23], [-169, 14], [-174, 0], [-169, -14], [-157, -23], [-143, -23], [-131, -14], [-126, 0]], count: 30, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("se-pon") }));
  { const S: Pt[] = [[-150, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("se-pon") })); }
  // 4. "rut-lui": đoàn quân (xanh nhạt) rút ngược đường 9 về Khe Sanh; lửa dọc đường; các nhóm (son) trên các đồi hai bên (diễn hoạ).
  const p3 = run("rut-lui", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2081, groups: [{ path: [[-150, 0], [-20, -15], [80, -10], [170, -10]], count: 60, spread: [3,12], color: DICH, timing: [[0.02,0],[0.95,1]] }], progress: p3, visible: () => clock.near("rut-lui") }));
  world.add(createFires({ sites: [[-100, -5], [-40, -15], [20, -15], [60, -10]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("rut-lui") * smoothstep(0.2, 0.9, p3()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2101, groups: [{ path: [[-46, 60], [-49, 68], [-56, 73], [-64, 73], [-71, 68], [-74, 60], [-71, 52], [-64, 47], [-56, 47], [-49, 52], [-46, 60]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[44, -70], [41, -62], [34, -57], [26, -57], [19, -62], [16, -70], [19, -78], [26, -83], [34, -83], [41, -78], [44, -70]], count: 14, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("rut-lui") }));
};

export default setup;
