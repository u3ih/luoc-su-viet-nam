import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HAI_PHONG, VUNG_RO, VAM_LUNG } from "./terrain";

type Pt = [number, number];

// Đoàn tàu không số — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phuong-dong-1","nguy-trang","vung-ro","doan-125"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HAI_PHONG, 24], [VAM_LUNG, 24]];

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
    seed: 1962,
  });

  // 1. "phuong-dong-1": theo thanh kéo, con tàu (đốm vàng) rời bến Hải Phòng, đi xa bờ ra khơi rồi vòng vào bến Vàm Lũng (đốm ngà) (diễn hoạ).
  const inp0 = (ctx: FrameCtx) => clamp((ctx.inputs["phuong-dong-1"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 14, height: (x, z) => ground(x, z) + 2, seed: 1972, groups: [{ path: [[-90, 330], [80, 250], [160, 0], [100, -250], [-100, -300]], count: 1, spread: [0,1], color: GOLD, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp0(ctx), visible: () => clock.near("phuong-dong-1") }));
  { const S: Pt[] = [[-110, 330], [-120, -300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp0(ctx); return 0.8 * smoothstep(0.02 + i * 0.8, 0.16999999999999998 + i * 0.8, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phuong-dong-1") })); }
  // 2. "nguy-trang": con tàu (đốm vàng) lẫn giữa đoàn thuyền đánh cá (chấm ngà) ngoài khơi (diễn hoạ).
  const p1 = run("nguy-trang", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1992, groups: [{ path: [[0, 200], [80, 120], [140, 0]], count: 10, spread: [10,30], color: NGHIA, timing: [[0.02,0],[0.9,1]] }], progress: p1, visible: () => clock.near("nguy-trang") }));
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2002, groups: [{ path: [[20, 190], [90, 110], [140, -5]], count: 1, spread: [0,1], color: GOLD, timing: [[0.02,0],[0.9,1]] }], progress: p1, visible: () => clock.near("nguy-trang") }));
  // 3. "vung-ro": tàu (đốm vàng) neo sát vách núi Vũng Rô; máy bay (đốm xanh nhạt) lượn trên cao; ánh lửa khi huỷ tàu (diễn hoạ).
  const p2 = run("vung-ro", 28);
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.55, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vung-ro") })); }
  { const S: Pt[] = [[-5, 43], [-108, 56], [-67, -40]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vung-ro") })); }
  world.add(createFires({ sites: [[-80, 20]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("vung-ro") * smoothstep(0.55, 0.9, p2()), size: 4, glow: () => 0.8 }));
  // 4. "doan-125": nhiều chuyến tàu (đốm vàng) đi vòng xa bờ tới nhiều bến (đốm ngà) dọc bờ phía nam (diễn hoạ).
  const p3 = run("doan-125", 28);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2042, groups: [{ path: [[-90, 330], [200, 200], [300, -100], [-60, -280]], count: 3, spread: [2,8], color: GOLD, timing: [[0.02,0],[0.9,1]] }, { path: [[-90, 330], [250, 150], [280, -50], [-60, 0]], count: 2, spread: [2,8], color: GOLD, timing: [[0.2,0],[0.95,1]] }], progress: p3, visible: () => clock.near("doan-125") }));
  { const S: Pt[] = [[-120, -300], [-110, -150], [-100, 0], [-110, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.1, 0.44999999999999996 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doan-125") })); }
};

export default setup;
