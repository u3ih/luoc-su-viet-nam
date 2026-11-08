import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, THUONG_BAC, HA_TRUNG, QUANG_NGAI, RA_KHOI } from "./terrain";

type Pt = [number, number];

// Vua Duy Tân rời hoàng cung — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành và Hoàng thành cách điệu (xem chương kinh-thanh-hue-1805); không vẽ cổng, cung điện.
const WALLS: Wall[] = [
  { at: square(-20, 20, 110, 0), base: 21, top: 12, height: 7, gates: [{ at: 0, width: 12 }, { at: 1.5707963267948966, width: 12 }, { at: 3.141592653589793, width: 12 }, { at: -1.5707963267948966, width: 12 }, { at: 0.7853981633974483, width: 12 }, { at: 2.356194490192345, width: 12 }, { at: -0.7853981633974483, width: 12 }, { at: -2.356194490192345, width: 12 }] },
  { at: square(-20, 10, 42, 0), base: 6, top: 4, height: 4, gates: [{ at: -1.5707963267948966, width: 8 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi","hen-gio","dem-thang-5","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 112], [HA_TRUNG, 32]];

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
    seed: 1916,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 2 - k * 0.6), wear: () => 0 }));

  // 1. "len-ngoi": đốm vàng (ngai vua) sáng giữa Hoàng thành; quân Pháp (xanh nhạt) đứng quanh (diễn hoạ).
  const p0 = run("len-ngoi", 28);
  { const S: Pt[] = [[-20, 15]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("len-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1936, groups: [{ path: [[-80, -40], [-20, -45]], count: 20, spread: [80,10], color: DICH, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("len-ngoi") }));
  // 2. "hen-gio": các đốm ngà (hội viên Quang phục Hội) sáng dần ở nhiều nơi; một chấm xanh nhạt (tin bị lộ) chạy từ phía nam ra kinh đô (diễn hoạ).
  const p1 = run("hen-gio", 28);
  { const S: Pt[] = [[150, -250], [-150, -300], [250, -200], [-250, 100], [200, 250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hen-gio") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1956, groups: [{ path: [QUANG_NGAI, [60, -250], [-10, -40]], count: 1, spread: [3,3], color: DICH, timing: [[0.5,0],[0.95,1]] }], progress: p1, visible: () => clock.near("hen-gio") }));
  // 3. "dem-thang-5": trong đêm, một chấm ngà (thuyền đón vua) rời bến Thương Bạc xuôi sông về làng Hà Trung theo thanh kéo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dem-thang-5"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1966, groups: [{ path: [THUONG_BAC, [180, -90], [260, -40], [300, 60], HA_TRUNG], count: 3, spread: [4,8], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dem-thang-5") }));
  { const S: Pt[] = [HA_TRUNG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-thang-5") })); }
  // 4. "ve-sau": quân Pháp (xanh nhạt) vây làng Hà Trung; một chấm ngà rời đi ra biển xa; về sau đốm vàng sáng lại ở Huế (thi hài vua được đưa về năm 1987) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1986, groups: [{ path: [[150, 250], [270, 140]], count: 24, spread: [40,40], color: DICH, timing: [[0.02,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1996, groups: [{ path: [HA_TRUNG, [350, 90], RA_KHOI], count: 1, spread: [3,3], color: NGHIA, timing: [[0.35,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-60, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
