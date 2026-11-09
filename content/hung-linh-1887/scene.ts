import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HUNG_LINH, BA_DINH, VAN_LAI, NIEN_KY } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Hùng Lĩnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["sau-ba-dinh","tro-ve","van-lai","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUNG_LINH, 44], [VAN_LAI, 40]];

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
    seed: 1887,
  });

  // 1. "sau-ba-dinh": lửa ở Ba Đình phía đông nam (căn cứ thất thủ); nghĩa quân (son) lui lên thượng nguồn sông Mã (diễn hoạ).
  const p0 = run("sau-ba-dinh", 28);
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring([330, -310], 24, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("sau-ba-dinh") * smoothstep(0.05, 0.9, p0()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1907, groups: [{ path: [[320, -300], [160, -120], [0, -30]], count: 30, spread: [10,60], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("sau-ba-dinh") }));
  // 2. "tro-ve": theo thanh kéo, nghĩa quân hai bờ sông Mã (son) tụ về căn cứ Hùng Lĩnh; đốm vàng (căn cứ) sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tro-ve"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1917, groups: [{ path: [[-250, -150], [-30, -40]], count: 18, spread: [10,40], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[-200, 200], [-40, 0]], count: 18, spread: [10,40], color: SON, timing: [[0.05,0],[0.75,1]] }, { path: [[200, 60], [0, -20]], count: 18, spread: [10,40], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tro-ve") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1927, groups: [{ path: [[-80, 60], [-30, -20]], count: 2, spread: [4,4], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tro-ve") }));
  { const S: Pt[] = [[-20, -30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-ve") })); }
  // 3. "van-lai": quân Pháp (xanh nhạt) tiến từ phía đông; nghĩa quân (son) chuyển về Vạn Lại; lửa ở đồn phía nam (diễn hoạ).
  const p2 = run("van-lai", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1947, groups: [{ path: [[400, -40], [120, -60]], count: 30, spread: [16,60], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("van-lai") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1957, groups: [{ path: [[-20, -30], [80, -140], [140, -190]], count: 24, spread: [10,40], color: SON, timing: [[0.15,0],[0.7,1]] }], progress: p2, visible: () => clock.near("van-lai") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([200, -250], 18, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("van-lai") * smoothstep(0.65, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": nhóm nghĩa quân còn lại (son) lui vào núi phía tây bắc rồi giải tán; đốm ngà (Tống Duy Tân) ở hang Niên Kỷ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1977, groups: [{ path: [[0, -20], [-150, 120], [-240, 240]], count: 12, spread: [6,30], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-250, 260]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
