import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TINH, NHA_LAO, TRAI_LINH, DON_KHO_DO, TAM_DAO, NUI_PHAO } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Thái Nguyên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Tỉnh lỵ cách điệu: một vòng tường vuông; không vẽ cổng, công sở.
const WALLS: Wall[] = [
  { at: square(0, 0, 70, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nha-lao","dem-30","sau-ngay","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TINH, 96]];

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
    counts: { trees: 600, bushes: 700, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1917,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8d8577", top: "#76845a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "nha-lao": đốm ngà (Lương Ngọc Quyến) trong nhà lao; lính khố xanh (son) ở trại gần đó (diễn hoạ).
  const p0 = run("nha-lao", 28);
  { const S: Pt[] = [NHA_LAO]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nha-lao") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1937, groups: [{ path: [[20, 25], TRAI_LINH], count: 18, spread: [30,20], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("nha-lao") }));
  // 2. "dem-30": trong đêm, lính (son) từ trại kéo đến nhà lao, tù nhân (son) được giải ra rồi tỏa khắp tỉnh lỵ theo thanh kéo; lửa bùng vài nơi, đồn khố đỏ (xanh nhạt) cố thủ bên sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dem-30"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1947, groups: [{ path: [TRAI_LINH, NHA_LAO, [-40, 40], [20, -40]], count: 30, spread: [30,50], color: SON, timing: [[0,0],[1,1]] }, { path: [NHA_LAO, [-50, -50], [40, 10]], count: 30, spread: [40,40], color: SON, timing: [[0.3,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dem-30") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1957, groups: [{ path: [[90, 40], DON_KHO_DO], count: 14, spread: [16,20], color: DICH, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dem-30") }));
  world.add(createFires({ sites: [[-40, -40], [40, -30], [-30, 40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("dem-30") * smoothstep(0.4, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [TINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-30") })); }
  // 3. "sau-ngay": quân Pháp (xanh nhạt) từ phía nam và phía đông kéo đến vây tỉnh lỵ; đốm ngà lịm dần; lửa bùng quanh thành (diễn hoạ).
  const p2 = run("sau-ngay", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1987, groups: [{ path: [[0, -380], [0, -90]], count: 40, spread: [80,60], color: DICH, timing: [[0.03,0],[0.7,1]] }, { path: [[380, -60], [100, -20]], count: 30, spread: [40,80], color: DICH, timing: [[0.1,0],[0.75,1]] }], progress: p2, visible: () => clock.near("sau-ngay") }));
  { const S: Pt[] = [NHA_LAO]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.55, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-ngay") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(TINH, 72, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("sau-ngay") * smoothstep(0.6, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": nghĩa quân (son, đốm ngà dẫn đầu) rút khỏi tỉnh lỵ lên Đại Từ, Tam Đảo rồi vòng về núi Pháo; đốm ngà lịm ở núi Pháo (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2017, groups: [{ path: [TINH, [-150, 150], TAM_DAO, [-330, 50], [-230, -150]], count: 30, spread: [12,80], color: SON, timing: [[0.03,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 2027, groups: [{ path: [TINH, [-150, 150], TAM_DAO, [-330, 50], NUI_PHAO], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
