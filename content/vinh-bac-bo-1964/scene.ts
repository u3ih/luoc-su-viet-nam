import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HON_ME, VINH_H } from "./terrain";

type Pt = [number, number];

// Sự kiện Vịnh Bắc Bộ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hon-me","mung-2","dem-4","nghi-quyet"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VINH_H, 24]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#1d4a58", shallow: "#5f9aa0" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1964,
  });

  // 1. "hon-me": đêm, các thuyền biệt kích (xanh nhạt) từ phía nam lao tới đảo Hòn Mê rồi rút ra; lửa trên đảo (diễn hoạ).
  const p0 = run("hon-me", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1974, groups: [{ path: [[180, -220], [80, 60], [55, 110], [180, -220]], count: 4, spread: [3,8], color: DICH, timing: [[0.02,0],[0.95,1]] }], progress: p0, visible: () => clock.near("hon-me") }));
  world.add(createFires({ sites: [[50, 125]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("hon-me") * smoothstep(0.35, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "mung-2": theo thanh kéo, ba tàu phóng lôi (son) từ bờ lao ra phía tàu khu trục (đốm xanh nhạt lớn) ngoài khơi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["mung-2"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 16, height: (x, z) => ground(x, z) + 2, seed: 1994, groups: [{ path: [[260, 80], [250, 160], [240, 240]], count: 1, spread: [0,1], color: DICH, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mung-2") }));
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2004, groups: [{ path: [[-60, 60], [80, 120], [210, 170]], count: 3, spread: [6,12], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("mung-2") }));
  // 3. "dem-4": đêm, hai tàu khu trục (xanh nhạt) ngoài khơi; những đốm xanh lục (tín hiệu ra-đa) loé lên rồi tắt quanh — không có tàu nào (diễn hoạ).
  const p2 = run("dem-4", 28);
  world.add(createCrowd({ glow: true, size: 14, height: (x, z) => ground(x, z) + 2, seed: 2014, groups: [{ path: [[260, -40], [250, 40]], count: 2, spread: [10,20], color: DICH, timing: [[0.02,0],[0.95,1]] }], progress: p2, visible: () => clock.near("dem-4") }));
  { const S: Pt[] = [[180, 60], [140, -40], [200, -100], [120, 30], [230, 100], [160, -140]]; world.add(createGlows({ count: S.length, color: "#9be37a", size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (1 - smoothstep(0.7, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-4") })); }
  // 4. "nghi-quyet": máy bay (đốm xanh nhạt, cách điệu) từ ngoài khơi bay vào bờ; lửa ở các căn cứ và kho dầu Vinh (diễn hoạ).
  const p3 = run("nghi-quyet", 28);
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 60, seed: 2034, groups: [{ path: [[380, 40], [100, -20], [-120, -60]], count: 10, spread: [10,30], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("nghi-quyet") }));
  world.add(createFires({ sites: [[-130, -70], [-110, -85], [-145, -55], [-120, -50], [-150, -85]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nghi-quyet") * smoothstep(0.55, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
