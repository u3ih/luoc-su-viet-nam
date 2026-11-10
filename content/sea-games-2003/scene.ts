import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MY_DINH, DEN_HUNG, PHUONG_NAM } from "./terrain";

type Pt = [number, number];

// SEA Games 22 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chuan-bi","ruoc-duoc","khai-mac","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[MY_DINH, 72], [DEN_HUNG, 24]];

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
    seed: 2003,
  });

  // 1. "chuan-bi": vòng đốm ngà (sân vận động) dựng dần; người (son) làm việc quanh sân (diễn hoạ).
  const p0 = run("chuan-bi", 28);
  { const S: Pt[] = [[48, 40], [46, 52], [42, 64], [34, 74], [24, 82], [12, 86], [0, 88], [-12, 86], [-24, 82], [-34, 74], [-42, 64], [-46, 52], [-48, 40], [-46, 28], [-42, 16], [-34, 6], [-24, -2], [-12, -6], [0, -8], [12, -6], [24, -2], [34, 6], [42, 16], [46, 28]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chuan-bi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2023, groups: [{ path: [[-120, -60], [-30, 20]], count: 30, spread: [8,40], color: SON, timing: [[0.03,0],[0.6,1]] }], progress: p0, visible: () => clock.near("chuan-bi") }));
  // 2. "ruoc-duoc": đốm vàng (ngọn lửa) sáng ở đền Hùng; ngọn đuốc (chấm vàng) đi từ phương nam qua nhiều nơi ra sân Mỹ Đình (diễn hoạ).
  const p1 = run("ruoc-duoc", 28);
  { const S: Pt[] = [[-250, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ruoc-duoc") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2043, groups: [{ path: [[60, -380], [-60, -200], [60, -60], [0, 30]], count: 1, spread: [3,3], color: GOLD, timing: [[0.2,0],[0.9,1]] }], progress: p1, visible: () => clock.near("ruoc-duoc") }));
  { const S: Pt[] = [[48, 40], [46, 52], [42, 64], [34, 74], [24, 82], [12, 86], [0, 88], [-12, 86], [-24, 82], [-34, 74], [-42, 64], [-46, 52], [-48, 40], [-46, 28], [-42, 16], [-34, 6], [-24, -2], [-12, -6], [0, -8], [12, -6], [24, -2], [34, 6], [42, 16], [46, 28]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ruoc-duoc") })); }
  // 3. "khai-mac": theo thanh kéo, đoàn vận động viên các nước (chấm người nhiều màu) lần lượt tiến vào sân (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["khai-mac"] ?? 0) / 0.9);
  { const S: Pt[] = [[48, 40], [46, 52], [42, 64], [34, 74], [24, 82], [12, 86], [0, 88], [-12, 86], [-24, 82], [-34, 74], [-42, 64], [-46, 52], [-48, 40], [-46, 28], [-42, 16], [-34, 6], [-24, -2], [-12, -6], [0, -8], [12, -6], [24, -2], [34, 6], [42, 16], [46, 28]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.001, 0.15 + i * 0.001, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-mac") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2073, groups: [{ path: [[-150, 40], [-10, 40]], count: 20, spread: [4,14], color: SON, timing: [[0,0],[0.4,1]] }, { path: [[150, 40], [10, 40]], count: 20, spread: [4,14], color: DICH, timing: [[0.15,0],[0.55,1]] }, { path: [[0, -120], [0, 30]], count: 20, spread: [4,14], color: NGHIA, timing: [[0.3,0],[0.7,1]] }, { path: [[0, 200], [0, 50]], count: 20, spread: [4,14], color: "#c9a3e0", timing: [[0.45,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("khai-mac") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-mac") })); }
  // 4. "ve-sau": cột đốm vàng (huy chương) cao dần giữa sân; cổ động viên (son) quanh sân (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15000000000000002 + i * 0.12, 0.30000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35000000000000003 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 41, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2153, groups: [{ path: [[62, 40], [59, 59], [50, 76], [36, 90], [19, 99], [0, 102], [-19, 99], [-36, 90], [-50, 76], [-59, 59], [-62, 40], [-59, 21], [-50, 4], [-36, -10], [-19, -19], [0, -22], [19, -19], [36, -10], [50, 4], [59, 21], [62, 40]], count: 60, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
