import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAP, TUONG_NIEM, BO_BAC, BO_NAM } from "./terrain";

type Pt = [number, number];

// Thuỷ điện Hoà Bình — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Đập chắn sông cách điệu: một khối tường hẹp nằm ngang dòng sông.
const WALLS: Wall[] = [
  { at: square(0, 0, 4, 1.4007963267948966, 26), base: 10, top: 6, height: 12, gates: [] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khoi-cong","ngan-song","phat-dien","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TUONG_NIEM, 24]];

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
    seed: 1979,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("ngan-song") + 0.5 ? 1 : ctx.t > world.beat("ngan-song") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["ngan-song"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#9a958a", top: "#8a8678" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "khoi-cong": công nhân, chuyên gia (son, ngà) tụ về hai bờ sông Đà; mũi khoan thăm dò (đốm ngà) (diễn hoạ).
  const p0 = run("khoi-cong", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1989, groups: [{ path: [[150, 200], [10, 60]], count: 24, spread: [10,50], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[150, -220], [-10, -60]], count: 24, spread: [10,50], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("khoi-cong") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1999, groups: [{ path: [[200, 80], [20, 40]], count: 8, spread: [6,20], color: NGHIA, timing: [[0.15,0],[0.8,1]] }], progress: p0, visible: () => clock.near("khoi-cong") }));
  { const S: Pt[] = [[10, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  // 2. "ngan-song": theo thanh kéo, con đập (khối tường) khép dần dòng sông; công nhân (son) trên đập (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["ngan-song"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2019, groups: [{ path: [[10, 60], [0, 0]], count: 20, spread: [6,50], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [[-10, -60], [0, 0]], count: 20, spread: [6,50], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("ngan-song") }));
  // 3. "phat-dien": tám tổ máy (đốm vàng) lần lượt sáng; điện (chuỗi đốm vàng) toả về phía đông (diễn hoạ).
  const p2 = run("phat-dien", 28);
  { const S: Pt[] = [[20, -50], [21, -37], [23, -24], [24, -11], [26, 1], [27, 14], [29, 27], [30, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.09, 0.2 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phat-dien") })); }
  { const S: Pt[] = [[40, 0], [86, -11], [131, -23], [177, -34], [226, -46], [277, -57], [329, -69], [380, -80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.8 + i * 0.02, 0.9500000000000001 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phat-dien") })); }
  // 4. "ve-sau": đài tưởng niệm (đốm ngà) bên hạ lưu; người đến viếng (son) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[80, -40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2059, groups: [{ path: [[250, -150], [90, -50]], count: 16, spread: [8,30], color: SON, timing: [[0.1,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
