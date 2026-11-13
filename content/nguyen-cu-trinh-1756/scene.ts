import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GIA_DINH, TAM_BON, LOI_LAP, HA_TIEN_N, LANG_KHMER } from "./terrain";

type Pt = [number, number];

// Nguyễn Cư Trinh và đất Tầm Bôn – Lôi Lạp — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cu-trinh","con-man","tam-bon","ba-thac"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[GIA_DINH, 24], [TAM_BON, 24], [LOI_LAP, 20], [HA_TIEN_N, 20], [LANG_KHMER, 16]];

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
    seed: 1756,
  });

  // 1. "cu-trinh": đốm vàng (Nguyễn Cư Trinh) ở Gia Định; các đốm ngà nhỏ (bài vè, bài thơ Nôm) quanh (diễn hoạ).
  const p0 = run("cu-trinh", 28);
  { const S: Pt[] = [[120, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cu-trinh") })); }
  { const S: Pt[] = [[140, 159], [123, 172], [102, 163], [100, 141], [117, 128], [138, 137]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.05, 0.44999999999999996 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cu-trinh") })); }
  // 2. "con-man": quân (son) từ Gia Định chia hai đường đánh sang phía tây; các nhóm người Côn Man (ngà) đi theo (diễn hoạ).
  const p1 = run("con-man", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1786, groups: [{ path: [[120, 150], [0, 90], [-150, 80]], count: 40, spread: [4,14], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[120, 150], [40, -60], [-150, -80]], count: 40, spread: [4,14], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p1, visible: () => clock.near("con-man") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1796, groups: [{ path: [[-150, -80], [-40, -40]], count: 20, spread: [3,10], color: NGHIA, timing: [[0.4,0],[0.95,1]] }], progress: p1, visible: () => clock.near("con-man") }));
  // 3. "tam-bon": theo thanh kéo, những đoàn người định cư (ngà) đi từ Gia Định xuống vùng Tầm Bôn, Lôi Lạp; đốm vàng ở hai phủ mới (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["tam-bon"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1806, groups: [{ path: [[120, 150], [40, 60], [0, 0]], count: 40, spread: [4,14], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[120, 150], [140, 40], [140, -70]], count: 30, spread: [4,12], color: NGHIA, timing: [[0.05,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("tam-bon") }));
  { const S: Pt[] = [[0, 0], [140, -70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.75 + i * 0.05, 0.9 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tam-bon") })); }
  // 4. "ba-thac": các làng Khmer (đốm ngà) vẫn sáng khắp đồng bằng; thêm hai vùng đất xa (Trà Vang, Ba Thắc) sáng ở phía nam (diễn hoạ).
  const p3 = run("ba-thac", 28);
  { const S: Pt[] = [[-80, 60], [-120, -20], [-40, -120], [60, -140], [-160, 40], [20, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-thac") })); }
  { const S: Pt[] = [[100, -200], [0, -220]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.1, 0.65 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-thac") })); }
};

export default setup;
