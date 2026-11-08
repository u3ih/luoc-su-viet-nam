import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_XUAN, NUI_BAN, DAN_DUONG } from "./terrain";

type Pt = [number, number];

// Những năm cuối của vua Quang Trung — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","cai-cach","bang-ha","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_XUAN, 96]];

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
    seed: 1792,
  });

  // 1. "len-ngoi": đàn Nam Giao trên núi Bân: đốm vàng sáng rực; người (son) đứng quanh; rồi đoàn quân (son) lên đường ra Bắc (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  { const S: Pt[] = [[-60, -255]]; world.add(createGlows({ count: S.length, color: GOLD, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1812, groups: [{ path: [[-30, -255], [-33, -242], [-41, -232], [-53, -226], [-67, -226], [-79, -232], [-87, -242], [-90, -255], [-87, -268], [-79, -278], [-67, -284], [-53, -284], [-41, -278], [-33, -268], [-30, -255]], count: 24, spread: [4,40], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1822, groups: [{ path: [[-60, -200], [-20, 30], [-100, 300], [-150, 400]], count: 30, spread: [16,80], color: SON, timing: [[0.5,0],[1,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "cai-cach": các đốm vàng (trường học, chữ Nôm, khuyến nông) lan từ Phú Xuân ra khắp vùng theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["cai-cach"] ?? 0) / 0.9);
  { const S: Pt[] = [[-20, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cai-cach") })); }
  { const S: Pt[] = [[100, 30], [65, 115], [-20, 150], [-105, 115], [-140, 30], [-105, -55], [-20, -90], [65, -55], [215, 78], [160, 189], [56, 258], [-68, 265], [-179, 210], [-248, 106], [-255, -18], [-200, -129], [-96, -198], [28, -205], [139, -150], [208, -46]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.045, 0.2 + i * 0.045, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cai-cach") })); }
  // 3. "bang-ha": đêm; đốm vàng ở Phú Xuân chập chờn rồi lịm (diễn hoạ).
  const p2 = run("bang-ha", 28);
  { const S: Pt[] = [[-20, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.5, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bang-ha") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1862, groups: [{ path: [[-20, -10], [-20, 15]], count: 16, spread: [40,20], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("bang-ha") }));
  // 4. "ve-sau": người (son) đưa tang về cung Đan Dương; một chấm ngà (sứ báo tang) đi về phương bắc (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1872, groups: [{ path: [PHU_XUAN, [-100, -40], DAN_DUONG], count: 24, spread: [10,60], color: SON, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [DAN_DUONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1892, groups: [{ path: [PHU_XUAN, [-100, 200], [-150, 395]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
