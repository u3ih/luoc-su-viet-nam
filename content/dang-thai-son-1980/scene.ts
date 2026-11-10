import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, YEN_DUNG, MOSKVA, WARSZAWA } from "./terrain";

type Pt = [number, number];

// Đặng Thái Sơn đoạt giải Chopin — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tuoi-tho","moskva","chopin","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [MOSKVA, 40], [WARSZAWA, 64]];

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
    seed: 1980,
  });

  // 1. "tuoi-tho": đốm vàng nhỏ (cậu bé học đàn) ở Hà Nội; theo nhạc viện (chấm người son) sơ tán về Yên Dũng (diễn hoạ).
  const p0 = run("tuoi-tho", 28);
  { const S: Pt[] = [[-240, -180]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuoi-tho") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2000, groups: [{ path: [[-240, -180], [-110, -110]], count: 20, spread: [6,20], color: SON, timing: [[0.3,0],[0.8,1]] }], progress: p0, visible: () => clock.near("tuoi-tho") }));
  { const S: Pt[] = [[-110, -110]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tuoi-tho") })); }
  // 2. "moskva": chấm vàng (Đặng Thái Sơn) đi từ Hà Nội lên Moskva; đốm ngà (nhạc viện) sáng lên (diễn hoạ).
  const p1 = run("moskva", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2020, groups: [{ path: [[-240, -180], [-150, 40], [-50, 240]], count: 1, spread: [3,3], color: GOLD, timing: [[0.05,0],[0.7,1]] }], progress: p1, visible: () => clock.near("moskva") }));
  { const S: Pt[] = [[-40, 250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("moskva") })); }
  // 3. "chopin": theo thanh kéo, khán phòng (vòng đốm ngà) sáng dần; đốm vàng giữa sân khấu bừng sáng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["chopin"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 2040, groups: [{ path: [[-40, 240], [170, 85]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[0.3,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chopin") }));
  { const S: Pt[] = [[206, 80], [204, 90], [198, 98], [190, 104], [180, 106], [170, 104], [162, 98], [156, 90], [154, 80], [156, 70], [162, 62], [170, 56], [180, 54], [190, 56], [198, 62], [204, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.004, 0.44999999999999996 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chopin") })); }
  { const S: Pt[] = [[223, 89], [219, 100], [213, 109], [204, 117], [194, 122], [183, 124], [171, 123], [160, 119], [151, 113], [143, 104], [138, 94], [136, 83], [137, 71], [141, 60], [147, 51], [156, 43], [166, 38], [177, 36], [189, 37], [200, 41], [209, 47], [217, 56], [222, 66], [224, 77]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.44999999999999996 + i * 0.004, 0.6 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chopin") })); }
  { const S: Pt[] = [[237, 104], [231, 115], [224, 124], [214, 132], [203, 137], [192, 141], [180, 142], [167, 141], [156, 137], [145, 131], [136, 124], [128, 114], [123, 103], [119, 92], [118, 80], [119, 67], [123, 56], [129, 45], [136, 36], [146, 28], [157, 23], [168, 19], [180, 18], [193, 19], [204, 23], [215, 29], [224, 36], [232, 46], [237, 57], [241, 68], [242, 80], [241, 93]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.004, 0.75 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chopin") })); }
  { const S: Pt[] = [[180, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chopin") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2090, groups: [{ path: [[252, 80], [247, 108], [231, 131], [208, 147], [180, 152], [152, 147], [129, 131], [113, 108], [108, 80], [113, 52], [129, 29], [152, 13], [180, 8], [208, 13], [231, 29], [247, 52], [252, 80]], count: 60, spread: [2,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("chopin") }));
  // 4. "ve-sau": các đốm vàng (những khán phòng trên thế giới) lần lượt sáng thành vòng lớn (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[274, 56], [244, 138], [189, 206], [116, 255], [32, 278], [-56, 274], [-138, 244], [-206, 189], [-255, 116], [-278, 32], [-274, -56], [-244, -138], [-189, -206], [-116, -255], [-32, -278], [56, -274], [138, -244], [206, -189], [255, -116], [278, -32]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[180, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
