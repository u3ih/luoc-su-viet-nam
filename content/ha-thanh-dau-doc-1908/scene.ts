import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH, DOANH_TRAI, NGOAI, COT_CO } from "./terrain";

type Pt = [number, number];

// Vụ Hà Thành đầu độc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Thành Hà Nội cách điệu.
const WALLS: Wall[] = [
  { at: square(-60, 40, 100, 0), base: 14, top: 8, height: 6, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh","bua-toi","bi-lo","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH, 112]];

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
    seed: 1908,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8d8577", top: "#76845a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "boi-canh": các đốm ngà (người tuyên truyền) đi qua các đền, làng; nghĩa quân (son) tụ ở vùng ngoài thành phía bắc (diễn hoạ).
  const p0 = run("boi-canh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1918, groups: [{ path: [[-300, -100], [-200, 100], [0, 200], [150, 100]], count: 3, spread: [10,60], color: NGHIA, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1928, groups: [{ path: [[-300, 390], NGOAI], count: 30, spread: [60,40], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("boi-canh") }));
  // 2. "bua-toi": theo thanh kéo (20 giờ → 21 giờ): lính Pháp (xanh nhạt) trong doanh trại ngã dần; bồi bếp, lính người Việt (son) chờ hiệu lệnh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bua-toi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1938, groups: [{ path: [[-60, 60], [-40, 60]], count: 40, spread: [60,40], color: DICH, mortal: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), fall: (ctx) => smoothstep(0.05, 0.9, inp1(ctx)), visible: () => clock.near("bua-toi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1948, groups: [{ path: [[-100, 0], [-80, 20]], count: 20, spread: [40,20], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("bua-toi") }));
  // 3. "bi-lo": một chấm ngà đi ra khỏi thành (tố giác); quân Pháp (xanh nhạt) đổ ra các cửa thành; nghĩa quân (son) ở ngoài lui đi (diễn hoạ).
  const p2 = run("bi-lo", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1958, groups: [{ path: [[-60, 40], [-60, -80], [100, -150]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.3,1]] }], progress: p2, visible: () => clock.near("bi-lo") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1968, groups: [{ path: [[-60, 40], [-60, 150]], count: 30, spread: [40,30], color: DICH, timing: [[0.35,0],[0.8,1]] }, { path: [[-60, 40], [50, 40]], count: 20, spread: [30,30], color: DICH, timing: [[0.4,0],[0.85,1]] }], progress: p2, visible: () => clock.near("bi-lo") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1978, groups: [{ path: [NGOAI, [-300, 390]], count: 30, spread: [60,40], color: SON, timing: [[0.5,0],[1,1]] }], progress: p2, visible: () => clock.near("bi-lo") }));
  // 4. "ve-sau": ba đốm ngà trước cột cờ lịm dần; người (son) đứng lặng xa xa (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-70, -50], [-60, -50], [-50, -50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1998, groups: [{ path: [[-60, -120], [-60, -100]], count: 16, spread: [60,20], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
