import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BIEN_GIOI_L, BON_MAN, LUANG_PRABANG } from "./terrain";

type Pt = [number, number];

// Cuộc chiến Đại Việt – Lan Xang — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bien-gioi","nam-dao","luang-prabang","rut-quan"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BIEN_GIOI_L, 24], [BON_MAN, 32], [LUANG_PRABANG, 32]];

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
    seed: 1479,
  });

  // 1. "bien-gioi": các toán quân nhỏ (ngà và son) giao tranh rồi rút ở miền biên giới; đốm ngà ở Bồn Man (diễn hoạ).
  const p0 = run("bien-gioi", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1489, groups: [{ path: [[255, 13], [188, -8], [255, 13]], count: 10, spread: [4,12], color: NGHIA, timing: [[0.03,0],[0.95,1]] }, { path: [[69, 55], [121, 7], [69, 55]], count: 10, spread: [4,12], color: NGHIA, timing: [[0.03,0],[0.95,1]] }, { path: [[126, -127], [141, -59], [126, -127]], count: 10, spread: [4,12], color: NGHIA, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("bien-gioi") }));
  { const S: Pt[] = [[20, -80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bien-gioi") })); }
  // 2. "nam-dao": theo thanh kéo, năm đạo quân (son) theo năm ngả từ phía đông vượt núi sang phía tây (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-dao"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1509, groups: [{ path: [[330, 220], [100, 160], [-130, 130]], count: 24, spread: [4,12], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[330, 120], [150, 90], [-40, 60]], count: 20, spread: [4,12], color: SON, timing: [[0.05,0],[0.85,1]] }, { path: [[330, 20], [180, 0], [30, -70]], count: 24, spread: [4,12], color: SON, timing: [[0.02,0],[0.9,1]] }, { path: [[330, -80], [160, -90], [40, -90]], count: 20, spread: [4,12], color: SON, timing: [[0.05,0],[0.85,1]] }, { path: [[330, -180], [150, -160], [30, -100]], count: 20, spread: [4,12], color: SON, timing: [[0.08,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-dao") }));
  // 3. "luang-prabang": giao tranh trên đồi (lửa); đoàn thuyền (ngà) rời kinh đô xuôi sông; đoàn quân (son) vào Luang Prabang (diễn hoạ).
  const p2 = run("luang-prabang", 28);
  world.add(createFires({ sites: [[-60, 120], [-80, 140], [-50, 100]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("luang-prabang") * smoothstep(0.05, 0.9, p2()), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1529, groups: [{ path: [[-180, 130], [-190, -50], [-250, -300]], count: 6, spread: [3,8], color: NGHIA, timing: [[0.3,0],[0.9,1]] }], progress: p2, visible: () => clock.near("luang-prabang") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1539, groups: [{ path: [[-40, 110], [-140, 130]], count: 40, spread: [4,14], color: SON, timing: [[0.4,0],[0.95,1]] }], progress: p2, visible: () => clock.near("luang-prabang") }));
  // 4. "rut-quan": đoàn quân (son) rút về phía đông; đoàn người (ngà) trở lại kinh đô; một đốm vàng ở phía bắc (nhà Minh) (diễn hoạ).
  const p3 = run("rut-quan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1549, groups: [{ path: [[-140, 130], [60, 80], [330, 40]], count: 50, spread: [6,16], color: SON, timing: [[0.02,0],[0.8,1]] }], progress: p3, visible: () => clock.near("rut-quan") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1559, groups: [{ path: [[-250, -200], [-180, 0], [-140, 130]], count: 30, spread: [4,12], color: NGHIA, timing: [[0.3,0],[0.95,1]] }], progress: p3, visible: () => clock.near("rut-quan") }));
  { const S: Pt[] = [[0, 300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("rut-quan") })); }
};

export default setup;
