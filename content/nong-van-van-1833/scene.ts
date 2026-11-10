import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, VAN_TRUNG, CAO_BANG, LANG_SON, TUYEN_QUANG, THAM_PAT } from "./terrain";

type Pt = [number, number];

// Cuộc nổi dậy Nông Văn Vân — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["luu-quan","van-trung","ba-mat","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VAN_TRUNG, 44], [CAO_BANG, 36], [LANG_SON, 36], [TUYEN_QUANG, 36]];

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
    forestAt: 0.48,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1840,
  });

  // 1. "luu-quan": các thành tỉnh (đốm xanh nhạt) có lưu quan; dân các châu (son) trong núi (diễn hoạ).
  const p0 = run("luu-quan", 28);
  { const S: Pt[] = [[200, 180], [240, -40], [-120, -180]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luu-quan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1860, groups: [{ path: [[-160, 190], [-140, 210]], count: 18, spread: [10,60], color: SON, timing: [[0,1],[1,1]] }, { path: [[40, 100], [60, 120]], count: 14, spread: [10,60], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("luu-quan") }));
  // 2. "van-trung": theo thanh kéo, thổ mục và dân chúng (son) từ các châu tụ về Vân Trung; đốm vàng sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["van-trung"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1870, groups: [{ path: [[-300, 120], [-160, 190]], count: 20, spread: [8,50], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[0, 300], [-140, 210]], count: 20, spread: [8,50], color: SON, timing: [[0.05,0],[0.75,1]] }, { path: [[0, 60], [-130, 190]], count: 20, spread: [8,50], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("van-trung") }));
  { const S: Pt[] = [[-150, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-trung") })); }
  // 3. "ba-mat": quân nổi dậy (son) vây Cao Bằng, Lạng Sơn; ba đạo quân triều (xanh nhạt) từ ba phía tiến về Vân Trung (diễn hoạ).
  const p2 = run("ba-mat", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1890, groups: [{ path: [[-150, 200], [180, 170]], count: 16, spread: [8,40], color: SON, timing: [[0.02,0],[0.4,1]] }, { path: [[-150, 200], [220, -30]], count: 16, spread: [8,40], color: SON, timing: [[0.04,0],[0.42,1]] }], progress: p2, visible: () => clock.near("ba-mat") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1900, groups: [{ path: [[-120, -180], [-140, 170]], count: 30, spread: [10,60], color: DICH, timing: [[0.4,0],[0.95,1]] }, { path: [[200, 180], [-120, 200]], count: 30, spread: [10,60], color: DICH, timing: [[0.45,0],[0.95,1]] }, { path: [[240, -40], [-120, 180]], count: 30, spread: [10,60], color: DICH, timing: [[0.5,0],[0.95,1]] }], progress: p2, visible: () => clock.near("ba-mat") }));
  // 4. "ve-sau": một nhóm nhỏ (son) lui vào rừng Thẩm Pát; quân triều (xanh nhạt) vây; lửa đốt rừng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1910, groups: [{ path: [[-60, -60], [120, -230]], count: 8, spread: [4,20], color: SON, timing: [[0.02,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1920, groups: [{ path: [[300, -330], [150, -240]], count: 30, spread: [10,60], color: DICH, timing: [[0.2,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 7 }, (_, i) => { const [x, z] = ring([130, -240], 30, (i / 7) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 7, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.55, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
