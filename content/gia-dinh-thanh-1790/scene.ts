import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANH, BEN_NGHE, THANH_PHUNG } from "./terrain";

type Pt = [number, number];

// Thành Bát Quái Gia Định — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Thành Bát Quái cách điệu: tám cạnh, tám cửa; không vẽ kiến trúc bên trong.
const WALLS: Wall[] = [
  { at: poly(0, 20, 110, 8, 0.39269908169872414), base: 12, top: 7, height: 6, gates: [{ at: 1.3707963267948966, width: 10 }, { at: 1.7707963267948965, width: 10 }, { at: -1.7707963267948965, width: 10 }, { at: -1.3707963267948966, width: 10 }, { at: 0.2, width: 10 }, { at: -0.2, width: 10 }, { at: 2.941592653589793, width: 10 }, { at: 3.3415926535897933, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ben-nghe","xay-thanh","thanh-phung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANH, 112]];

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
    seed: 1790,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("xay-thanh") + 0.5 ? 1 : ctx.t > world.beat("xay-thanh") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["xay-thanh"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a7a60", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "ben-nghe": ghe thuyền (chấm ngà) tấp nập ở bến Nghé; đoàn thuyền (son) vào sông (diễn hoạ).
  const p0 = run("ben-nghe", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1800, groups: [{ path: [[-400, -220], [120, -190]], count: 14, spread: [8,200], color: NGHIA, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("ben-nghe") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1810, groups: [{ path: [[330, 400], [300, 0], [140, -185]], count: 10, spread: [8,100], color: SON, timing: [[0.3,0],[0.95,1]] }], progress: p0, visible: () => clock.near("ben-nghe") }));
  // 2. "xay-thanh": theo thanh kéo, người (son) đắp thành theo tám cạnh; vòng thành tám cạnh dựng lên; tám đốm vàng (tám cửa) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-thanh"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1820, groups: [{ path: [[92, 58], [71, 91], [38, 112], [0, 120], [-38, 112], [-71, 91], [-92, 58], [-100, 20], [-92, -18], [-71, -51], [-38, -72], [0, -80], [38, -72], [71, -51], [92, -18], [100, 20], [100, 20]], count: 60, spread: [8,600], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-thanh") }));
  { const S: Pt[] = [[110, 20], [78, 98], [0, 130], [-78, 98], [-110, 20], [-78, -58], [0, -90], [78, -58]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.03, 0.75 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-thanh") })); }
  // 3. "thanh-phung": lửa trong thành cũ (bị phá); đốm vàng (thành Phụng nhỏ hơn) sáng ở đông bắc (diễn hoạ).
  const p2 = run("thanh-phung", 28);
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(THANH, 60, (i / 8) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("thanh-phung") * smoothstep(0.05, 0.9, p2()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[190, 160], [181, 181], [160, 190], [139, 181], [130, 160], [139, 139], [160, 130], [181, 139]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.03, 0.7000000000000001 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-phung") })); }
  // 4. "ve-sau": tàu (xanh nhạt) theo sông vào; lửa bùng ở thành Phụng rồi tắt, chỉ còn đốm mờ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1860, groups: [{ path: [[330, 400], [300, 0], [200, -100]], count: 6, spread: [10,60], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(THANH_PHUNG, 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.4, 0.9, p3()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[160, 160]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.4 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
