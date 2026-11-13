import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THI_XA_BAC, BA_CHUC, PHNOM_PENH } from "./terrain";

type Pt = [number, number];

// Hai cuộc chiến biên giới — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ba-chuc","phnom-penh","ngay-17-2","sau-chien-tranh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THI_XA_BAC, 32], [BA_CHUC, 24], [PHNOM_PENH, 32]];

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
    seed: 1979,
  });

  // 1. "ba-chuc": đoàn quân (xanh nhạt) từ phía tây tràn vào làng Ba Chúc; các đốm ngà (dân làng) tắt dần; đốm vàng (nhà mồ) sáng về sau (diễn hoạ).
  const p0 = run("ba-chuc", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1989, groups: [{ path: [[-100, -150], [40, -150], [80, -150]], count: 40, spread: [4,14], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p0, visible: () => clock.near("ba-chuc") }));
  { const S: Pt[] = [[104, -148], [98, -134], [85, -127], [70, -128], [59, -138], [56, -152], [62, -166], [75, -173], [90, -172], [101, -162]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.45, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-chuc") })); }
  { const S: Pt[] = [[80, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-chuc") })); }
  // 2. "phnom-penh": các mũi quân (son) từ phía đông tiến sang phía tây tới Phnôm Pênh; đốm ngà sáng ở Phnôm Pênh (diễn hoạ).
  const p1 = run("phnom-penh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2019, groups: [{ path: [[150, -100], [0, -120], [-140, -145]], count: 40, spread: [6,16], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[150, -220], [0, -190], [-140, -160]], count: 40, spread: [6,16], color: SON, timing: [[0.05,0],[0.85,1]] }], progress: p1, visible: () => clock.near("phnom-penh") }));
  { const S: Pt[] = [[-150, -150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phnom-penh") })); }
  // 3. "ngay-17-2": theo thanh kéo, các mũi quân (xanh nhạt) từ biên giới phía bắc tràn xuống các thị xã; lửa ở các thị xã (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ngay-17-2"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2039, groups: [{ path: [[-200, 380], [-150, 200]], count: 30, spread: [6,18], color: DICH, timing: [[0.02,0],[0.8,1]] }, { path: [[0, 390], [0, 170]], count: 30, spread: [6,18], color: DICH, timing: [[0.02,0],[0.8,1]] }, { path: [[200, 380], [150, 200]], count: 30, spread: [6,18], color: DICH, timing: [[0.02,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ngay-17-2") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2049, groups: [{ path: [[-130, 190], [-134, 202], [-144, 209], [-156, 209], [-166, 202], [-170, 190], [-166, 178], [-156, 171], [-144, 171], [-134, 178], [-130, 190]], count: 16, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[20, 160], [16, 172], [6, 179], [-6, 179], [-16, 172], [-20, 160], [-16, 148], [-6, 141], [6, 141], [16, 148], [20, 160]], count: 16, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }, { path: [[170, 190], [166, 202], [156, 209], [144, 209], [134, 202], [130, 190], [134, 178], [144, 171], [156, 171], [166, 178], [170, 190]], count: 16, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ngay-17-2") }));
  world.add(createFires({ sites: [[-150, 190], [0, 160], [150, 190]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("ngay-17-2") * smoothstep(0.7, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "sau-chien-tranh": các mũi quân rút về; lửa tàn dần ở biên giới phía bắc; các đốm vàng nhỏ (tưởng niệm) sáng ở cả hai miền biên giới (diễn hoạ).
  const p3 = run("sau-chien-tranh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2069, groups: [{ path: [[0, 160], [0, 390]], count: 40, spread: [6,18], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("sau-chien-tranh") }));
  { const S: Pt[] = [[-150, 190], [0, 160], [150, 190], [80, -150], [-150, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.05, 0.65 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-chien-tranh") })); }
};

export default setup;
