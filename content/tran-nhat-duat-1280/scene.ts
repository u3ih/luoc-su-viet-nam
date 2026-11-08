import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DOANH, TRAI, BA_GIA, KINH } from "./terrain";

type Pt = [number, number];

// Trần Nhật Duật ở Đà Giang — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nhieu-tieng","da-giang","mot-ngua","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DOANH, 40], [TRAI, 40], [BA_GIA, 32], [KINH, 32]];

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
    counts: { trees: 850, bushes: 700, grass: 1800, reeds: 400 },
    forestAt: 0.45,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1280,
  });

  // 1. "nhieu-tieng": đốm ngà (Chiêu Văn vương) đi thăm thôn Bà Già; người làng (son) ra đón, ở lại vài ngày (diễn hoạ).
  const p0 = run("nhieu-tieng", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1290, groups: [{ path: [KINH, [350, 0], BA_GIA], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p0, visible: () => clock.near("nhieu-tieng") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1300, groups: [{ path: [[300, -260], [325, -205]], count: 14, spread: [30,20], color: SON, timing: [[0.3,0],[0.7,1]] }], progress: p0, visible: () => clock.near("nhieu-tieng") }));
  // 2. "da-giang": trại Giác Mật (xanh nhạt) ở phía tây giữa núi; doanh trại triều đình (son) dựng ở phía đông; đốm ngà ở doanh trại (diễn hoạ).
  const p1 = run("da-giang", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1310, groups: [{ path: [[-200, 140], [-180, 120]], count: 30, spread: [60,40], color: DICH, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("da-giang") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1320, groups: [{ path: [[350, 80], DOANH], count: 26, spread: [50,40], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p1, visible: () => clock.near("da-giang") }));
  { const S: Pt[] = [[180, 90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-giang") })); }
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring(TRAI, 30, (i / 4) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: () => clock.near("da-giang") * smoothstep(0.2, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "mot-ngua": đốm ngà cùng vài người hầu (son) rời doanh trại đi vào trại Giác Mật theo thanh kéo; người trại (xanh nhạt) vây vòng rồi tụ quanh trò chuyện (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["mot-ngua"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1350, groups: [{ path: [DOANH, [50, 110], [-160, 120]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("mot-ngua") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1360, groups: [{ path: [DOANH, [50, 110], [-150, 118]], count: 6, spread: [6,10], color: SON, timing: [[0,0],[0.8,0.97]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("mot-ngua") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1370, groups: [{ path: [[-146, 120], [-149, 135], [-159, 147], [-172, 153], [-188, 153], [-201, 147], [-211, 135], [-214, 120], [-211, 105], [-201, 93], [-188, 87], [-172, 87], [-159, 93], [-149, 105], [-146, 120]], count: 30, spread: [4,60], color: DICH, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("mot-ngua") }));
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring(TRAI, 30, (i / 4) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: (ctx) => clock.near("mot-ngua") * smoothstep(0, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "ve-sau": đoàn người (xanh nhạt và son) theo đốm ngà xuôi về kinh đô; đốm vàng ở kinh đô (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1390, groups: [{ path: [TRAI, [0, 70], [250, 80], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1400, groups: [{ path: [TRAI, [0, 70], [250, 80], [340, 190]], count: 14, spread: [8,40], color: DICH, timing: [[0.05,0],[0.92,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
