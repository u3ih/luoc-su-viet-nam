import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH, VO_MIEU, DON_THUY, O_QUAN_CHUONG, CUA_BAC, CUA_DONG, CUA_TAY, CUA_NAM } from "./terrain";

type Pt = [number, number];

// Hoàng Diệu và thành Hà Nội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Hà Nội cách điệu: một vòng tường vuông với bốn quãng trống làm cửa; không vẽ cổng, vọng lâu.
const WALLS: Wall[] = [
  { at: square(-60, 40, 100, 0), base: 14, top: 8, height: 6, gates: [{ at: 0, width: 12 }, { at: 1.5707963267948966, width: 12 }, { at: 3.141592653589793, width: 12 }, { at: -1.5707963267948966, width: 12 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tong-doc","don-thuy","buoi-sang","vo-mieu","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH, 112], [DON_THUY, 28]];

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
    counts: { trees: 380, bushes: 600, grass: 2200, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1882,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8d8577", top: "#76845a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "tong-doc": đốm ngà sáng giữa thành; người (son) đi tuần dọc tường; đốm vàng ở Ô Quan Chưởng (tấm bia) (diễn hoạ).
  const p0 = run("tong-doc", 28);
  { const S: Pt[] = [THANH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tong-doc") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1902, groups: [{ path: [[-150, -50], [30, -50], [30, 130], [-150, 130], [-150, -40]], count: 16, spread: [8,30], color: SON, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("tong-doc") }));
  { const S: Pt[] = [O_QUAN_CHUONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tong-doc") })); }
  // 2. "don-thuy": các chấm xanh nhạt (tàu) ngược sông Hồng lên Đồn Thủy, quân (xanh nhạt) đóng ở đồn; người (son) tụ vào thành, lửa thề bật giữa thành (diễn hoạ).
  const p1 = run("don-thuy", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1922, groups: [{ path: [[280, -400], [250, -220], [235, -160]], count: 6, spread: [10,30], color: DICH, timing: [[0.02,0],[0.5,1]] }, { path: [[230, -170], DON_THUY], count: 20, spread: [30,30], color: DICH, size: 0.8, timing: [[0.4,0],[0.9,1]] }], progress: p1, visible: () => clock.near("don-thuy") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1932, groups: [{ path: [[-260, 40], CUA_TAY, THANH], count: 20, spread: [30,50], color: SON, timing: [[0.05,0],[0.7,1]] }], progress: p1, visible: () => clock.near("don-thuy") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(THANH, 14, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("don-thuy") * smoothstep(0.6, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "buoi-sang": theo thanh kéo (5 giờ sáng → 11 giờ trưa): người (son) giữ bốn cửa thành; tàu (xanh nhạt) áp sát bờ sông, lửa bùng dần trên tường đông; quân (xanh nhạt) đổ bộ tiến vào thành (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["buoi-sang"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1952, groups: [{ path: [[-60, 120], CUA_BAC], count: 10, spread: [30,10], color: SON, timing: [[0,1],[1,1]] }, { path: [[20, 40], CUA_DONG], count: 8, spread: [30,10], color: SON, timing: [[0,1],[1,1]] }, { path: [[-140, 40], CUA_TAY], count: 8, spread: [30,10], color: SON, timing: [[0,1],[1,1]] }, { path: [[-60, -40], CUA_NAM], count: 8, spread: [30,10], color: SON, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("buoi-sang") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1962, groups: [{ path: [[235, -150], [225, 0], [222, 60]], count: 4, spread: [10,40], color: DICH, timing: [[0,0],[0.4,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("buoi-sang") }));
  world.add(createFires({ sites: [[40, 100], [40, 70], [40, 10], [40, -20], [10, 140], [-30, 140]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("buoi-sang") * smoothstep(0.45, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1982, groups: [{ path: [DON_THUY, [120, -40], [80, 40], CUA_DONG, THANH], count: 30, spread: [20,50], color: DICH, timing: [[0.75,0],[1,0.9]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("buoi-sang") }));
  // 4. "vo-mieu": đốm ngà ở Võ Miếu lịm dần; người (son) đến rồi lặng lẽ rước ra khỏi thành (diễn hoạ).
  const p3 = run("vo-mieu", 28);
  { const S: Pt[] = [VO_MIEU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.2, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vo-mieu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2002, groups: [{ path: [[-200, -120], VO_MIEU, CUA_NAM, [-60, -180], [-40, -300]], count: 20, spread: [10,40], color: SON, timing: [[0.15,0],[0.4,0.3],[1,1]] }], progress: p3, visible: () => clock.near("vo-mieu") }));
  // 5. "ve-sau": đốm vàng dịu giữa thành; vài nhóm người (son) đi qua lại; tàu (xanh nhạt) đậu bên sông (diễn hoạ).
  const p4 = run("ve-sau", 28);
  { const S: Pt[] = [THANH, VO_MIEU]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.1 + i * 0.3, 0.25 + i * 0.3, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2022, groups: [{ path: [[235, -120], [232, -60]], count: 3, spread: [8,30], color: DICH, timing: [[0,1],[1,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 2032, groups: [{ path: [[-140, 100], [20, 100]], count: 10, spread: [20,20], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
};

export default setup;
