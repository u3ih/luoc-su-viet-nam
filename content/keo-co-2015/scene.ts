import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAN_DINH, DINH } from "./terrain";

type Pt = [number, number];

// Nghi lễ và trò chơi kéo co — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hoi-xuan","day-keo","keo","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAN_DINH, 64]];

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
    seed: 2046,
  });

  // 1. "hoi-xuan": đình (đốm vàng) sáng; dân làng (son) đổ về sân đình dự hội (diễn hoạ).
  const p0 = run("hoi-xuan", 28);
  { const S: Pt[] = [[0, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-xuan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2066, groups: [{ path: [[-200, -100], [-30, 30]], count: 30, spread: [8,30], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[200, -80], [30, 30]], count: 30, spread: [8,30], color: SON, timing: [[0.15,0],[0.75,1]] }], progress: p0, visible: () => clock.near("hoi-xuan") }));
  // 2. "day-keo": sợi dây (chuỗi đốm ngà) căng ngang sân; đốm son ở giữa dây (khăn đỏ) (diễn hoạ).
  const p1 = run("day-keo", 28);
  { const S: Pt[] = [[-55, 40], [-45, 40], [-35, 40], [-25, 40], [-15, 40], [-5, 40], [5, 40], [15, 40], [25, 40], [35, 40], [45, 40], [55, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("day-keo") })); }
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: "#e2563a", size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("day-keo") })); }
  // 3. "keo": theo thanh kéo, hai phe (son, ngà) nắm dây; phe bên trái kéo cả hai hàng người dịch dần về phía mình; đốm vàng sáng bên phe thắng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["keo"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 2096, groups: [{ path: [[-8, 40], [-58, 40]], count: 16, spread: [1,3], color: SON, drop: true, timing: [[0,0],[0.05,1]] }, { path: [[8, 40], [58, 40]], count: 16, spread: [1,3], color: NGHIA, drop: true, timing: [[0,0],[0.05,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("keo") }));
  world.add(createCrowd({ size: 6, height: ground, seed: 2106, groups: [{ path: [[0, 40], [-30, 40]], count: 1, spread: [1,1], color: "#e2563a", timing: [[0.1,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("keo") }));
  { const S: Pt[] = [[-70, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("keo") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2126, groups: [{ path: [[75, 40], [70, 66], [57, 88], [38, 105], [13, 114], [-13, 114], [-37, 105], [-57, 88], [-70, 66], [-75, 40], [-70, 14], [-57, -8], [-38, -25], [-13, -34], [13, -34], [38, -25], [57, -8], [70, 14], [75, 40]], count: 50, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("keo") }));
  // 4. "ve-sau": bốn đốm vàng (bốn nước cùng ghi danh) sáng quanh rìa; đốm vàng ở đình (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[198, 176], [-136, 238], [-198, -96], [136, -158]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.15, 0.35 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
