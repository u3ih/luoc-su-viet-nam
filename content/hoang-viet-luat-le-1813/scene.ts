import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, BAC_THANH } from "./terrain";

type Pt = [number, number];

// Hoàng Việt luật lệ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành Huế cách điệu (xem chương kinh-thanh-hue-1805).
const WALLS: Wall[] = [
  { at: square(-20, 100, 90, 0), base: 14, top: 8, height: 6, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["soan-luat","hai-muoi-hai-quyen","noi-dung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 80]];

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
    seed: 1813,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "soan-luat": đốm vàng (vua) trong kinh thành; đốm ngà (Nguyễn Văn Thành) từ Bắc thành về, cùng hai đốm ngà nhỏ (diễn hoạ).
  const p0 = run("soan-luat", 28);
  { const S: Pt[] = [[-20, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("soan-luat") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1833, groups: [{ path: [BAC_THANH, [-100, 250], [-10, 100]], count: 3, spread: [6,10], color: NGHIA, timing: [[0.15,0],[0.85,1]] }], progress: p0, visible: () => clock.near("soan-luat") }));
  // 2. "hai-muoi-hai-quyen": theo thanh kéo, hai mươi hai đốm vàng (22 quyển) xếp thành hàng lần lượt sáng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hai-muoi-hai-quyen"] ?? 0) / 0.9);
  { const S: Pt[] = [[-55, 96.5], [-48, 96.5], [-41, 96.5], [-34, 96.5], [-27, 96.5], [-20, 96.5], [-13, 96.5], [-6, 96.5], [1, 96.5], [8, 96.5], [15, 96.5], [-55, 103.5], [-48, 103.5], [-41, 103.5], [-34, 103.5], [-27, 103.5], [-20, 103.5], [-13, 103.5], [-6, 103.5], [1, 103.5], [8, 103.5], [15, 103.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 17, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-muoi-hai-quyen") })); }
  // 3. "noi-dung": sáu nhóm đốm vàng (sáu loại luật ứng sáu bộ) quanh một đốm ngà (danh lệ) (diễn hoạ).
  const p2 = run("noi-dung", 28);
  { const S: Pt[] = [[-20, 100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-dung") })); }
  { const S: Pt[] = [[20, 100], [0, 135], [-40, 135], [-60, 100], [-40, 65], [0, 65]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.1, 0.35 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-dung") })); }
  // 4. "ve-sau": các đốm vàng nhỏ (bộ luật) lan ra các trấn khắp vùng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, 100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[140, 100], [109, 194], [29, 252], [-69, 252], [-149, 194], [-180, 100], [-149, 6], [-69, -52], [29, -52], [109, 6], [254, 156], [203, 269], [108, 349], [-13, 380], [-135, 355], [-235, 280], [-291, 169], [-294, 44], [-243, -69], [-148, -149], [-27, -180], [95, -155], [195, -80], [251, 31]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
