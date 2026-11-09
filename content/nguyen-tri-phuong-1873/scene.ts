import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH, CUA_NAM, DONG_DA, BEN } from "./terrain";

type Pt = [number, number];

// Nguyễn Tri Phương giữ thành Hà Nội — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Thành Hà Nội cách điệu.
const WALLS: Wall[] = [
  { at: square(0, 60, 60, 0), base: 12, top: 7, height: 6, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["xuat-than","garnier","thanh-ha-noi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH, 88]];

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
    seed: 1875,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "xuat-than": chấm ngà (Nguyễn Tri Phương) từ phương nam ra trấn giữ thành Hà Nội (đốm vàng) (diễn hoạ).
  const p0 = run("xuat-than", 28);
  world.add(createCrowd({ size: 7, height: ground, seed: 1885, groups: [{ path: [[-100, -380], [-40, -150], [0, 40]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.8,1]] }], progress: p0, visible: () => clock.near("xuat-than") }));
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-than") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1905, groups: [{ path: [[-20, 40], [20, 80]], count: 30, spread: [10,50], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("xuat-than") }));
  // 2. "garnier": tàu, pháo thuyền (xanh nhạt) ngược sông Hồng tới Hà Nội; một nhóm lính (xanh nhạt) lên bờ (diễn hoạ).
  const p1 = run("garnier", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1915, groups: [{ path: [[350, -380], [300, -150], [290, 20]], count: 3, spread: [6,40], color: DICH, timing: [[0.03,0],[0.7,1]] }], progress: p1, visible: () => clock.near("garnier") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1925, groups: [{ path: [[280, 20], [180, 10]], count: 14, spread: [6,20], color: DICH, timing: [[0.6,0],[0.95,1]] }], progress: p1, visible: () => clock.near("garnier") }));
  // 3. "thanh-ha-noi": theo thanh kéo, pháo thuyền (đốm xanh nhạt) nháy sáng; lính Pháp (xanh nhạt) từ bờ sông tiến vào cửa nam; quân giữ thành (son) rút ra cửa tây (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["thanh-ha-noi"] ?? 0) / 0.9);
  { const S: Pt[] = [[285, 0], [290, 40], [292, 70]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-ha-noi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1945, groups: [{ path: [[180, 10], [60, -20], [0, 20]], count: 20, spread: [6,30], color: DICH, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("thanh-ha-noi") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1955, groups: [{ path: [[0, 60], [-60, 60], [-220, 70]], count: 40, spread: [10,60], color: SON, timing: [[0.4,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("thanh-ha-noi") }));
  // 4. "ve-sau": đốm ngà trong thành lịm dần; đền Trung Liệt trên gò Đống Đa (đốm vàng) sáng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.35, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-200, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
