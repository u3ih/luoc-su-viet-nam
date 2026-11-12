import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VIET_NAM, PLAY_OFF, WORLD_CUP } from "./terrain";

type Pt = [number, number];

// World Cup nữ đầu tiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dong-nam-a","play-off","world-cup","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VIET_NAM, 40], [PLAY_OFF, 48]];

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
    seed: 2023,
  });

  // 1. "dong-nam-a": cột đốm vàng (các chức vô địch Đông Nam Á) cao dần; một đốm xanh nhạt (trận thua ở vòng loại World Cup 2015) lụi (diễn hoạ).
  const p0 = run("dong-nam-a", 28);
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.13 + i * 0.12, 0.28 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.21000000000000002 + i * 0.12, 0.36 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 29, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.29 + i * 0.12, 0.43999999999999995 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 37, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.37 + i * 0.12, 0.52 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 45, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 52, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.53 + i * 0.12, 0.68 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-220, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6100000000000001 + i * 0.12, 0.7600000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  { const S: Pt[] = [[-160, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (1 - smoothstep(0.85, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-nam-a") })); }
  // 2. "play-off": theo thanh kéo, đội tuyển (chấm ngà) đi qua hai trận play-off (đốm vàng) rồi hướng ra biển tới World Cup (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["play-off"] ?? 0) / 0.9);
  { const S: Pt[] = [[-40, 0], [40, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("play-off") })); }
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 2133, groups: [{ path: [[-220, 40], [-40, 0], [40, 0], [200, 0]], count: 12, spread: [3,8], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("play-off") }));
  { const S: Pt[] = [[-40, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("play-off") })); }
  { const S: Pt[] = [[40, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("play-off") })); }
  // 3. "world-cup": ba đốm xanh nhạt lớn (ba đối thủ mạnh) sáng; đội tuyển (ngà) có mặt giữa các đội (diễn hoạ).
  const p2 = run("world-cup", 28);
  { const S: Pt[] = [[260, 50], [320, 0], [260, -50]]; world.add(createGlows({ count: S.length, color: DICH, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.25, 0.2 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("world-cup") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2173, groups: [{ path: [[180, 0], [270, 0]], count: 12, spread: [3,8], color: NGHIA, timing: [[0,0],[0.4,1]] }], progress: p2, visible: () => clock.near("world-cup") }));
  { const S: Pt[] = [[290, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("world-cup") })); }
  // 4. "ve-sau": các bé gái, nữ sinh (son) ra sân tập ở trường học khắp nơi (đốm ngà) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-90, 40], [-111, 105], [-166, 145], [-234, 145], [-289, 105], [-310, 40], [-289, -25], [-234, -65], [-166, -65], [-111, -25]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2203, groups: [{ path: [[-200, 40], [-300, 140]], count: 14, spread: [3,10], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[-200, 40], [-90, -40]], count: 14, spread: [3,10], color: SON, timing: [[0.2,0],[0.8,1]] }, { path: [[-200, 40], [-110, 140]], count: 14, spread: [3,10], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
