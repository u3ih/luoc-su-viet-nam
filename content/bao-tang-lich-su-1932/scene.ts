import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BAO_TANG, NHA_HAT } from "./terrain";

type Pt = [number, number];

// Bảo tàng Louis Finot — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Đa giác đều n cạnh, bán kính đỉnh r
const poly = (cx: number, cz: number, r: number, n: number, rot: number) => (a: number): [number, number] => {
  const k = (2 * Math.PI) / n;
  const t = (((a - rot) % k) + k) % k;
  const d = (r * Math.cos(Math.PI / n)) / Math.cos(t - Math.PI / n);
  return [cx + Math.cos(a) * d, cz + Math.sin(a) * d];
};
// Sảnh bát giác: vòng tường thấp tám cạnh cách điệu (chỉ khối theo mặt bằng)
const WALLS: Wall[] = [
  { at: poly(20, 0, 30, 8, 0.39269908169872414), base: 6, top: 4, height: 8, gates: [{ at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thiet-ke","sanh-bat-giac","ban-giao","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAO_TANG, 64], [NHA_HAT, 32]];

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
    seed: 1932,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("sanh-bat-giac") + 0.5 ? 1 : ctx.t > world.beat("sanh-bat-giac") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["sanh-bat-giac"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#c9b98f", top: "#8e5a3a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "thiet-ke": bản vẽ (vòng đốm ngà tám cạnh mờ) hiện ở khu đất sau Nhà hát Lớn; thợ (son) tới làm móng (diễn hoạ).
  const p0 = run("thiet-ke", 28);
  { const S: Pt[] = [[-120, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thiet-ke") })); }
  { const S: Pt[] = [[48, 11], [31, 28], [9, 28], [-8, 11], [-8, -11], [9, -28], [31, -28], [48, -11]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thiet-ke") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1962, groups: [{ path: [[-100, -80], [10, -20]], count: 30, spread: [3,14], color: SON, drop: true, timing: [[0.4,0],[0.9,1]] }], progress: p0, visible: () => clock.near("thiet-ke") }));
  // 2. "sanh-bat-giac": theo thanh kéo, vòng tường tám cạnh dựng lên; ba tầng vòng đốm vàng (ba lớp mái) lần lượt sáng phía trên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["sanh-bat-giac"] ?? 0) / 0.9);
  { const S: Pt[] = [[46, 11], [31, 26], [9, 26], [-6, 11], [-6, -11], [9, -26], [31, -26], [46, -11]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.01, 0.55 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sanh-bat-giac") })); }
  { const S: Pt[] = [[38, 8], [28, 18], [12, 18], [2, 8], [2, -8], [12, -18], [28, -18], [38, -8]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.01, 0.75 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sanh-bat-giac") })); }
  { const S: Pt[] = [[30, 4], [24, 10], [16, 10], [10, 4], [10, -4], [16, -10], [24, -10], [30, -4]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.78 + i * 0.01, 0.93 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sanh-bat-giac") })); }
  { const S: Pt[] = [[20, 0]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 38, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.9 + i * 0.12, 1.05 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sanh-bat-giac") })); }
  // 3. "ban-giao": các hiện vật Đông Nam Á (đốm xanh nhạt) trong bảo tàng; năm 1958 đốm vàng (Bảo tàng Lịch sử Việt Nam) sáng (diễn hoạ).
  const p2 = run("ban-giao", 28);
  { const S: Pt[] = [[6.5, -13.5], [15.5, -13.5], [24.5, -13.5], [33.5, -13.5], [6.5, -4.5], [15.5, -4.5], [24.5, -4.5], [33.5, -4.5], [6.5, 4.5], [15.5, 4.5], [24.5, 4.5], [33.5, 4.5], [6.5, 13.5], [15.5, 13.5], [24.5, 13.5], [33.5, 13.5]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (1 - smoothstep(0.55, 0.65, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-giao") })); }
  { const S: Pt[] = [[6.5, -13.5], [15.5, -13.5], [24.5, -13.5], [33.5, -13.5], [6.5, -4.5], [15.5, -4.5], [24.5, -4.5], [33.5, -4.5], [6.5, 4.5], [15.5, 4.5], [24.5, 4.5], [33.5, 4.5], [6.5, 13.5], [15.5, 13.5], [24.5, 13.5], [33.5, 13.5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.65 + i * 0.015, 0.8 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-giao") })); }
  { const S: Pt[] = [[20, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-giao") })); }
  // 4. "ngay-nay": những hiện vật quý (đốm vàng: trống đồng, cọc Bạch Đằng…) sáng; khách tham quan (son) xếp hàng vào (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[36, 0], [28, 14], [12, 14], [4, 0], [12, -14], [28, -14]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2052, groups: [{ path: [[-120, -60], [15, -32]], count: 40, spread: [2,8], color: SON, timing: [[0.02,0],[0.8,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
