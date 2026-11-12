import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, MY_SON, SAI_GON, ANGKOR } from "./terrain";

type Pt = [number, number];

// Viện Viễn Đông Bác cổ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ra-doi","khao-sat","thu-vien","tro-lai"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 32], [MY_SON, 28], [SAI_GON, 32], [ANGKOR, 32]];

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
    seed: 1900,
  });

  // 1. "ra-doi": đốm vàng (viện) sáng ở Sài Gòn năm 1900, rồi theo đường ven biển dời ra Hà Nội (1902) (diễn hoạ).
  const p0 = run("ra-doi", 28);
  { const S: Pt[] = [[90, -250]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.5, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ra-doi") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 1920, groups: [{ path: [[90, -250], [150, -60], [130, 120], [-50, 255]], count: 1, spread: [2,2], color: GOLD, timing: [[0.45,0],[0.85,1]] }], progress: p0, visible: () => clock.near("ra-doi") }));
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.86 + i * 0.12, 1.01 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ra-doi") })); }
  // 2. "khao-sat": các nhóm nghiên cứu (ngà) từ Hà Nội tỏa đi Mỹ Sơn và Angkor; vòng đốm (các công trình được ghi nhận) sáng ở Mỹ Sơn (diễn hoạ).
  const p1 = run("khao-sat", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1940, groups: [{ path: [[-60, 260], [100, 50]], count: 8, spread: [3,8], color: NGHIA, timing: [[0.04,0],[0.5,1]] }, { path: [[-60, 260], [-160, -170]], count: 8, spread: [3,8], color: NGHIA, timing: [[0.1,0],[0.6,1]] }], progress: p1, visible: () => clock.near("khao-sat") }));
  { const S: Pt[] = [[132, 40], [129, 51], [121, 59], [110, 62], [99, 59], [91, 51], [88, 40], [91, 29], [99, 21], [110, 18], [121, 21], [129, 29]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.03, 0.65 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khao-sat") })); }
  { const S: Pt[] = [[-148, -180], [-154, -164], [-170, -158], [-186, -164], [-192, -180], [-186, -196], [-170, -202], [-154, -196]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.03, 0.75 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khao-sat") })); }
  // 3. "thu-vien": theo thanh kéo, cột đốm vàng (thư viện) cao dần ở Hà Nội; các bảo tàng (đốm ngà) sáng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["thu-vien"] ?? 0) / 0.9);
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.12000000000000001 + i * 0.12, 0.27 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.22 + i * 0.12, 0.37 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 29, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.32000000000000006 + i * 0.12, 0.4700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 37, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.42000000000000004 + i * 0.12, 0.5700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 45, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.52 + i * 0.12, 0.67 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 52, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6200000000000001 + i * 0.12, 0.7700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.7200000000000001 + i * 0.12, 0.8700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  { const S: Pt[] = [[-20, 250], [-100, 250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.2, 0.44999999999999996 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thu-vien") })); }
  // 4. "tro-lai": đốm Hà Nội tắt (1957), đoàn (ngà) rời về phía Angkor rồi ra khỏi cảnh; về sau đốm Hà Nội sáng lại (1993) (diễn hoạ).
  const p3 = run("tro-lai", 28);
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.2, 0.3, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-lai") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2070, groups: [{ path: [[-60, 260], [-170, -180], [-300, -330]], count: 8, spread: [3,8], color: NGHIA, timing: [[0.2,0],[0.55,1]] }], progress: p3, visible: () => clock.near("tro-lai") }));
  { const S: Pt[] = [[-60, 260]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-lai") })); }
  { const S: Pt[] = [[90, -250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-lai") })); }
};

export default setup;
