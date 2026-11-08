import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PU_SRA, DAK_HUICH, PETSA, BOU_MERA, BOU_POU_SRA } from "./terrain";

type Pt = [number, number];

// N'Trang Lơng trên cao nguyên M'Nông — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ten-goi","pu-sra","dak-huich","ve-sau"]);
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
    water: { deep: "#2f4a48", shallow: "#86997a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 900, bushes: 700, grass: 1600, reeds: 300 },
    forestAt: 0.42,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1912,
  });

  // 1. "ten-goi": đốm ngà (tù trưởng) giữa buôn; người M'Nông (son) quây quần (diễn hoạ).
  const p0 = run("ten-goi", 28);
  { const S: Pt[] = [[0, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ten-goi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1932, groups: [{ path: [[26, -40], [23, -27], [13, -17], [0, -14], [-13, -17], [-23, -27], [-26, -40], [-23, -53], [-13, -63], [0, -66], [13, -63], [23, -53], [26, -40]], count: 18, spread: [4,30], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("ten-goi") }));
  // 2. "pu-sra": lửa bùng ở đồn Pu Sra; đoàn quân (xanh nhạt) từ phía bắc kéo vào lùng sục; các đồn mới (xanh nhạt) sáng ở Pétsa, Bou Méra (diễn hoạ).
  const p1 = run("pu-sra", 28);
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(PU_SRA, 18, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("pu-sra") * smoothstep(0.05, 0.9, p1()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1952, groups: [{ path: [[100, 390], [60, 150], [0, 0], [-150, -100]], count: 30, spread: [30,60], color: DICH, timing: [[0.2,0],[1,1]] }], progress: p1, visible: () => clock.near("pu-sra") }));
  { const S: Pt[] = [PETSA, BOU_MERA]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.1, 0.75 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pu-sra") })); }
  // 3. "dak-huich": đốm ngà về nguồn Đắk Huich; các buôn làng (đốm vàng) lần lượt hưởng ứng theo thanh kéo, người (son) tụ lại (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dak-huich"] ?? 0) / 0.9);
  { const S: Pt[] = [DAK_HUICH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dak-huich") })); }
  { const S: Pt[] = [[-200, -120], [-320, -120], [-230, -260], [-150, -200], [-330, -230], [-180, -60], [-100, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.11, 0.25 + i * 0.11, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dak-huich") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1992, groups: [{ path: [[-200, -120], DAK_HUICH], count: 10, spread: [26,50], color: SON, timing: [[0.2,0],[0.8,1]] }, { path: [[-150, -200], DAK_HUICH], count: 10, spread: [26,50], color: SON, timing: [[0.4,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dak-huich") }));
  // 4. "ve-sau": nghĩa quân (son) bao quanh làng Bou Pou Sra; đốm xanh nhạt ở giữa làng lịm dần; về sau đốm vàng sáng (di tích) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2002, groups: [{ path: [[-80, -150], [40, -70]], count: 26, spread: [60,40], color: SON, timing: [[0.03,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [BOU_POU_SRA]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.45, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [BOU_POU_SRA]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
