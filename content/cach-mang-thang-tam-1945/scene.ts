import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TAN_TRAO, NHA_HAT, BA_DINH, HUE } from "./terrain";

type Pt = [number, number];

// Cách mạng Tháng Tám — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tan-trao","ha-noi","ngo-mon","ba-dinh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TAN_TRAO, 32], [NHA_HAT, 40], [BA_DINH, 48], [HUE, 40]];

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
    seed: 1945,
  });

  // 1. "tan-trao": các đại biểu (ngà) từ nhiều ngả về đình Tân Trào (đốm vàng) (diễn hoạ).
  const p0 = run("tan-trao", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1955, groups: [{ path: [[-25, 185], [-140, 150]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[-113, 267], [-140, 150]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[-228, 232], [-140, 150]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[-255, 115], [-140, 150]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[-167, 33], [-140, 150]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[-52, 68], [-140, 150]], count: 10, spread: [4,16], color: NGHIA, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("tan-trao") }));
  { const S: Pt[] = [[-140, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tan-trao") })); }
  // 2. "ha-noi": theo thanh kéo, đoàn người (son) từ các ngả phố và các tỉnh lân cận đổ về quảng trường Nhà hát Lớn; đốm vàng ở quảng trường (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ha-noi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1975, groups: [{ path: [[287, 74], [120, 40]], count: 40, spread: [6,26], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[174, 201], [120, 40]], count: 40, spread: [6,26], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[7, 167], [120, 40]], count: 40, spread: [6,26], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[-47, 6], [120, 40]], count: 40, spread: [6,26], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[66, -121], [120, 40]], count: 40, spread: [6,26], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[233, -87], [120, 40]], count: 40, spread: [6,26], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ha-noi") }));
  { const S: Pt[] = [[120, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ha-noi") })); }
  // 3. "ngo-mon": các tỉnh (đốm ngà) lần lượt sáng; đám đông (son) trước Ngọ Môn (đốm vàng) — ấn kiếm được trao (diễn hoạ).
  const p2 = run("ngo-mon", 28);
  { const S: Pt[] = [[-140, 150], [120, 40], [200, -60], [-120, -60], [180, -260], [-80, -260], [280, -160]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.06, 0.16999999999999998 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngo-mon") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2005, groups: [{ path: [[100, -175], [92, -151], [72, -137], [48, -137], [28, -151], [20, -175], [28, -199], [48, -213], [72, -213], [92, -199], [100, -175]], count: 70, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("ngo-mon") }));
  { const S: Pt[] = [[60, -135]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngo-mon") })); }
  // 4. "ba-dinh": đám đông (son) đứng kín quảng trường Ba Đình; đốm vàng (lễ đài) sáng phía trước (diễn hoạ).
  const p3 = run("ba-dinh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2025, groups: [{ path: [[-80, 20], [40, 20], [40, -40], [-80, -40], [-80, 20]], count: 140, spread: [1,8], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ba-dinh") }));
  { const S: Pt[] = [[-20, 75]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-dinh") })); }
};

export default setup;
