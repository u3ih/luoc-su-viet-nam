import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, AP_BAC, TAN_THOI, TAN_HIEP } from "./terrain";

type Pt = [number, number];

// Trận Ấp Bắc — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tan-thoi","bo-ruong","truc-thang","rut-dem"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[AP_BAC, 32], [TAN_THOI, 32], [TAN_HIEP, 32]];

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
    seed: 1963,
  });

  // 1. "tan-thoi": đốm vàng nhỏ (đài vô tuyến) ở Tân Thới; ba cánh quân (xanh nhạt) từ ba hướng tiến lại (diễn hoạ).
  const p0 = run("tan-thoi", 28);
  { const S: Pt[] = [[-10, 100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tan-thoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1983, groups: [{ path: [[10, -250], [10, -60]], count: 40, spread: [4,14], color: DICH, timing: [[0.05,0],[0.8,1]] }, { path: [[-250, 140], [-80, 110]], count: 30, spread: [4,14], color: DICH, timing: [[0.1,0],[0.85,1]] }, { path: [[250, 160], [80, 110]], count: 30, spread: [4,14], color: DICH, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("tan-thoi") }));
  // 2. "bo-ruong": hàng công sự (son) dọc bờ kênh dưới hàng cây; tiểu đoàn bảo an (xanh nhạt) tiến từ phía nam bị chặn cách bờ kênh vài chục mét (diễn hoạ).
  const p1 = run("bo-ruong", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1993, groups: [{ path: [[-70, 30], [-40, 30], [-10, 30], [20, 30], [50, 30], [80, 30]], count: 40, spread: [1,3], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("bo-ruong") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2003, groups: [{ path: [[10, -200], [10, -10]], count: 50, spread: [6,20], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: p1, visible: () => clock.near("bo-ruong") }));
  { const S: Pt[] = [[-70, 34], [-49, 34], [-27, 34], [-6, 34], [16, 34], [37, 34], [59, 34], [80, 34]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.55 + i * 0.01, 0.7000000000000001 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bo-ruong") })); }
  // 3. "truc-thang": theo thanh kéo, mười lăm trực thăng (đốm xanh nhạt, cách điệu) bay từ Tân Hiệp tới, đổ quân xuống ruộng trước công sự; lửa ở năm chỗ (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["truc-thang"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 12, height: (x, z) => ground(x, z) + 40, seed: 2023, groups: [{ path: [[190, -60], [100, -40], [30, -30]], count: 15, spread: [6,16], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("truc-thang") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2033, groups: [{ path: [[30, -30], [20, -15]], count: 40, spread: [6,18], color: DICH, timing: [[0.6,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("truc-thang") }));
  world.add(createFires({ sites: [[40, -35], [20, -40], [0, -28], [55, -22], [-15, -38]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("truc-thang") * smoothstep(0.65, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "rut-dem": đêm, quân Giải phóng (son) rời hàng công sự, rút về phía tây bắc; ruộng chìm trong bóng tối (diễn hoạ).
  const p3 = run("rut-dem", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2053, groups: [{ path: [[10, 30], [-80, 80], [-220, 160]], count: 40, spread: [3,10], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("rut-dem") }));
  world.add(createFires({ sites: [[40, -35], [0, -28]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("rut-dem") * smoothstep(0, 0.9, p3()), size: 2, glow: () => 0.8 }));
};

export default setup;
