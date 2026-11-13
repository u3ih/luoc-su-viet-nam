import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHU_PONG, X_RAY, ALBANY, PLEI_ME } from "./terrain";

type Pt = [number, number];

// Trận Ia Đrăng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["plei-me","x-ray","albany","ca-hai"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[X_RAY, 24], [ALBANY, 20], [PLEI_ME, 20]];

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
    seed: 1965,
  });

  // 1. "plei-me": các trung đoàn (son) vây trại Plei Me (đốm xanh nhạt); đoàn quân cứu viện (ngà) từ phía đông bị chặn giữa đường (diễn hoạ).
  const p0 = run("plei-me", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1975, groups: [{ path: [[258, -48], [150, -70]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.6,1]] }, { path: [[185, 34], [150, -70]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.6,1]] }, { path: [[77, 12], [150, -70]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.6,1]] }, { path: [[42, -92], [150, -70]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.6,1]] }, { path: [[115, -174], [150, -70]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.6,1]] }, { path: [[223, -152], [150, -70]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: p0, visible: () => clock.near("plei-me") }));
  { const S: Pt[] = [[150, -70]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("plei-me") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1995, groups: [{ path: [[390, -20], [260, -40]], count: 40, spread: [4,14], color: NGHIA, timing: [[0.2,0],[0.75,1]] }], progress: p0, visible: () => clock.near("plei-me") }));
  world.add(createFires({ sites: [[260, -40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("plei-me") * smoothstep(0.7, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "x-ray": theo thanh kéo, trực thăng (đốm xanh nhạt, cách điệu) đổ quân xuống bãi đáp X-Ray; các mũi quân (son) từ sườn núi đánh xuống; lửa quanh bãi đáp (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["x-ray"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 40, seed: 2015, groups: [{ path: [[330, 40], [120, 0], [-35, -20]], count: 16, spread: [4,12], color: DICH, timing: [[0.02,0],[0.45,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("x-ray") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2025, groups: [{ path: [[-16, -20], [-21, -6], [-33, 3], [-47, 3], [-59, -6], [-64, -20], [-59, -34], [-47, -43], [-33, -43], [-21, -34], [-16, -20]], count: 50, spread: [1,6], color: DICH, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("x-ray") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2035, groups: [{ path: [[-150, -70], [-70, -30]], count: 30, spread: [4,14], color: SON, timing: [[0.35,0],[0.9,1]] }, { path: [[-120, 40], [-60, 0]], count: 30, spread: [4,14], color: SON, timing: [[0.4,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("x-ray") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([-40, -20], 34, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("x-ray") * smoothstep(0.55, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "albany": đoàn quân (xanh nhạt) hành quân bộ từ X-Ray lên Albany; giữa rừng, các nhóm (son) áp sát hai bên sườn đội hình (diễn hoạ).
  const p2 = run("albany", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2055, groups: [{ path: [[-40, -20], [-10, 40], [20, 110]], count: 60, spread: [2,8], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: p2, visible: () => clock.near("albany") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2065, groups: [{ path: [[-110, 60], [-25, 45]], count: 25, spread: [3,10], color: SON, timing: [[0.4,0],[0.8,1]] }, { path: [[80, 40], [10, 55]], count: 25, spread: [3,10], color: SON, timing: [[0.45,0],[0.85,1]] }], progress: p2, visible: () => clock.near("albany") }));
  // 4. "ca-hai": hai bên rời trận địa: các nhóm (son) rút về núi Chư Pông; trực thăng (đốm xanh nhạt) đưa quân đi; đốm vàng nhỏ ở thung lũng (diễn hoạ).
  const p3 = run("ca-hai", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2075, groups: [{ path: [[-40, -20], [-150, -70]], count: 40, spread: [4,14], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ca-hai") }));
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 40, seed: 2085, groups: [{ path: [[20, 110], [150, 60], [380, 0]], count: 10, spread: [4,12], color: DICH, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ca-hai") }));
  { const S: Pt[] = [[-10, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ca-hai") })); }
};

export default setup;
