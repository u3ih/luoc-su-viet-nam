import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRUNG_TAM, BAN_GIOC, THANG_HEN, PHIA_OAC } from "./terrain";

type Pt = [number, number];

// Non nước Cao Bằng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dia-chat","ho-so","ghi-danh","cong-dong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUNG_TAM, 48], [BAN_GIOC, 24], [THANG_HEN, 24], [PHIA_OAC, 24]];

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
    seed: 2031,
  });

  // 1. "dia-chat": cột đốm từ xanh nhạt đến vàng (các lớp đá qua 500 triệu năm) dựng lên giữa thung lũng (diễn hoạ).
  const p0 = run("dia-chat", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.15000000000000002 + i * 0.12, 0.30000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 28, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.35000000000000003 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 46, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 54, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 62, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-chat") })); }
  // 2. "ho-so": các nhà khoa học và người dân (ngà, son) tụ về trung tâm làm hồ sơ (diễn hoạ).
  const p1 = run("ho-so", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2121, groups: [{ path: [[-200, -150], [-10, 15]], count: 14, spread: [3,10], color: NGHIA, timing: [[0.04,0],[0.6,1]] }, { path: [[200, 140], [10, 25]], count: 20, spread: [3,12], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[-160, 120], [-5, 30]], count: 20, spread: [3,12], color: SON, timing: [[0.15,0],[0.75,1]] }], progress: p1, visible: () => clock.near("ho-so") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-so") })); }
  // 3. "ghi-danh": theo thanh kéo, các điểm di sản địa chất (đốm vàng) lần lượt sáng khắp vùng núi đá (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ghi-danh"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 20], [200, 140], [-160, 120], [-200, -150], [90, 80], [-80, 60], [60, -60], [-60, -80], [150, 0], [-140, 0], [40, 160], [-30, 200], [120, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 17, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.065, 0.16999999999999998 + i * 0.065, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
  // 4. "cong-dong": các bản làng (đốm ngà) quanh thung lũng; người dân (son) đi chợ, lên nương (diễn hoạ).
  const p3 = run("cong-dong", 28);
  { const S: Pt[] = [[-160, 120], [-200, -150], [200, 140], [-90, 40], [80, 60], [-40, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cong-dong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2161, groups: [{ path: [[-160, 120], [0, 20]], count: 16, spread: [3,10], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-200, -150], [0, 20]], count: 16, spread: [3,10], color: SON, timing: [[0.15,0],[0.8,1]] }], progress: p3, visible: () => clock.near("cong-dong") }));
};

export default setup;
