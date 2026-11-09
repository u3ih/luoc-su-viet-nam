import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_BI, DEN, BAI_TAN } from "./terrain";

type Pt = [number, number];

// Yết Kiêu, người thủy quân tài lặn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["song-quat","bai-tan","duc-thuyen","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_BI, 40]];

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
    seed: 1287,
  });

  // 1. "song-quat": thuyền chài nhỏ (chấm ngà) trên sông Quát; người (son) ở bến đò (diễn hoạ).
  const p0 = run("song-quat", 28);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 1297, groups: [{ path: [[-260, 380], [-230, 200], [-205, 70]], count: 4, spread: [6,150], color: NGHIA, timing: [[0.03,0],[0.9,1]] }], progress: p0, visible: () => clock.near("song-quat") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1307, groups: [{ path: [[-280, 200], [-245, 190]], count: 14, spread: [8,20], color: SON, timing: [[0.05,0],[0.5,1]] }], progress: p0, visible: () => clock.near("song-quat") }));
  // 2. "bai-tan": thuyền (đốm vàng) neo chờ ở Bãi Tân; vài chấm (son) từ chân núi tìm về bến (diễn hoạ).
  const p1 = run("bai-tan", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1317, groups: [{ path: [[40, -40], [80, -45]], count: 8, spread: [20,30], color: GOLD, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("bai-tan") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1327, groups: [{ path: [[-150, -300], [0, -150], [55, -75]], count: 6, spread: [4,20], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p1, visible: () => clock.near("bai-tan") }));
  // 3. "duc-thuyen": theo thanh kéo, đốm ngà (Yết Kiêu) lặn qua hàng thuyền giặc (xanh nhạt); các thuyền lần lượt chìm (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["duc-thuyen"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1337, groups: [{ path: [[50, -5], [140, -20]], count: 16, spread: [30,70], color: DICH, mortal: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), fall: (ctx) => smoothstep(0.05, 0.9, inp2(ctx)), visible: () => clock.near("duc-thuyen") }));
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 1, seed: 1347, groups: [{ path: [[-60, 20], [40, 0], [100, -15], [160, -25]], count: 1, spread: [2,2], color: NGHIA, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("duc-thuyen") }));
  // 4. "ve-sau": đền Quát (đốm vàng) bên sông; thuyền đua (son) trên sông Quát (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-200, 150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 1367, groups: [{ path: [[-260, 380], [-230, 200], [-205, 70]], count: 6, spread: [6,30], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1377, groups: [{ path: [[-200, 150], [-180, 160]], count: 30, spread: [30,30], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
