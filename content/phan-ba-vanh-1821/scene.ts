import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRA_LU, TRA_LY, LAN_HAI, CON_TIEN, GIAO_THUY } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Phan Bá Vành — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-doi","tra-lu","hoi-tieu","ket-cuc"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRA_LU, 56]];

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
    counts: { trees: 320, bushes: 500, grass: 2600, reeds: 1100 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1821,
  });

  // 1. "nam-doi": người đói (son) từ các làng tụ về Trà Lũ, đốm ngà sáng ở Trà Lũ (diễn hoạ).
  const p0 = run("nam-doi", 28);
  { const S: Pt[] = [TRA_LU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-doi") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1841, groups: [{ path: [[-300, 250], TRA_LU], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[100, 250], TRA_LU], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }, { path: [[-320, 0], TRA_LU], count: 14, spread: [26,50], color: SON, timing: [[0.15,0],[0.92,1]] }], progress: p0, visible: () => clock.near("nam-doi") }));
  // 2. "tra-lu": nghĩa quân (son) từ Trà Lũ tỏa về các đồn Trà Lý, Lân Hải, Cồn Tiên theo thanh kéo, lửa bùng lên ở các đồn (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tra-lu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1851, groups: [{ path: [TRA_LU, TRA_LY], count: 24, spread: [20,50], color: SON, timing: [[0,0],[0.5,1]] }, { path: [TRA_LU, [100, -80], LAN_HAI], count: 20, spread: [20,50], color: SON, timing: [[0.15,0],[0.75,1]] }, { path: [TRA_LU, [120, -120], CON_TIEN], count: 20, spread: [20,50], color: SON, timing: [[0.3,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tra-lu") }));
  world.add(createFires({ sites: [TRA_LY, LAN_HAI, CON_TIEN].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("tra-lu") * smoothstep(0.45, 0.9, inp1(ctx)), size: 4, glow: () => 0.8 }));
  // 3. "hoi-tieu": quân triều đình (xanh nhạt) từ phía bắc kéo xuống Giao Thủy; thuyền triều đình (xanh nhạt) theo biển vào cửa sông (diễn hoạ).
  const p2 = run("hoi-tieu", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1871, groups: [{ path: [[-100, 400], [-200, 150], GIAO_THUY], count: 40, spread: [30,90], color: DICH, timing: [[0.03,0],[0.85,1]] }], progress: p2, visible: () => clock.near("hoi-tieu") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1881, groups: [{ path: [[400, -300], [100, -260], [-180, -230]], count: 14, spread: [20,40], color: DICH, timing: [[0.1,0],[0.95,1]] }], progress: p2, visible: () => clock.near("hoi-tieu") }));
  // 4. "ket-cuc": quân triều đình (xanh nhạt) khép vòng về Trà Lũ, đốm ngà lịm dần, lửa bùng ở Trà Lũ (diễn hoạ).
  const p3 = run("ket-cuc", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1891, groups: [{ path: [[-250, -100], TRA_LU], count: 26, spread: [30,60], color: DICH, timing: [[0.03,0],[0.7,0.9]] }, { path: [[150, 150], TRA_LU], count: 26, spread: [30,60], color: DICH, timing: [[0.06,0],[0.75,0.9]] }], progress: p3, visible: () => clock.near("ket-cuc") }));
  { const S: Pt[] = [TRA_LU]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.4, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ket-cuc") })); }
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(TRA_LU, 40, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ket-cuc") * smoothstep(0.65, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
