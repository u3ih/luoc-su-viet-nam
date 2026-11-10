import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, CAU_GIAY, HA_YEN, PHU_HOAI } from "./terrain";

type Pt = [number, number];

// Trận Cầu Giấy lần thứ hai — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
  { at: square(170, 30, 46, 0), base: 8, top: 5, height: 4, gates: [{ at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["bac-ky","khieu-chien","phuc-kich","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 64], [HA_YEN, 28], [PHU_HOAI, 32]];

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
    seed: 1883,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "bac-ky": tàu, quân Pháp (xanh nhạt) theo sông Hồng vào thành Hà Nội; quân Cờ Đen (son) tụ ở phía tây (diễn hoạ).
  const p0 = run("bac-ky", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1893, groups: [{ path: [[300, -300], [290, -100], [280, 20]], count: 6, spread: [6,40], color: DICH, timing: [[0.03,0],[0.6,1]] }], progress: p0, visible: () => clock.near("bac-ky") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1903, groups: [{ path: [[280, 25], [170, 30]], count: 30, spread: [10,40], color: DICH, timing: [[0.5,0],[0.9,1]] }], progress: p0, visible: () => clock.near("bac-ky") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1913, groups: [{ path: [[-350, 60], [-280, 60]], count: 40, spread: [14,60], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: p0, visible: () => clock.near("bac-ky") }));
  // 2. "khieu-chien": yết thị (đốm ngà) trong thành; tàu tiếp viện (chấm sáng xanh nhạt) tới; quân Cờ Đen và quân triều Nguyễn (son) phục ở làng Hạ Yên Quyết (diễn hoạ).
  const p1 = run("khieu-chien", 28);
  { const S: Pt[] = [[150, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khieu-chien") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1933, groups: [{ path: [[300, -250], [285, 20]], count: 4, spread: [6,30], color: DICH, timing: [[0.2,0],[0.7,1]] }], progress: p1, visible: () => clock.near("khieu-chien") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1943, groups: [{ path: [[-280, 60], [-90, 100]], count: 30, spread: [10,40], color: SON, timing: [[0.3,0],[0.9,1]] }, { path: [[-280, 50], [-60, -10]], count: 24, spread: [10,40], color: SON, timing: [[0.35,0],[0.95,1]] }], progress: p1, visible: () => clock.near("khieu-chien") }));
  // 3. "phuc-kich": theo thanh kéo, quân Pháp (xanh nhạt) ra khỏi thành tới Cầu Giấy; quân phục kích (son) từ làng và cánh nam khép vòng hai bên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["phuc-kich"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1953, groups: [{ path: [[150, 30], [40, 40], [-30, 40]], count: 40, spread: [10,30], color: DICH, timing: [[0,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("phuc-kich") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1963, groups: [{ path: [[-90, 110], [-50, 60]], count: 30, spread: [10,30], color: SON, timing: [[0.45,0],[0.95,1]] }, { path: [[-60, -20], [-30, 25]], count: 24, spread: [10,30], color: SON, timing: [[0.5,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("phuc-kich") }));
  { const S: Pt[] = [[-40, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phuc-kich") })); }
  // 4. "ve-sau": quân Pháp (xanh nhạt) rút về thành, một số ngã lại ở Cầu Giấy; thành Hà Nội cố thủ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1983, groups: [{ path: [[-30, 40], [60, 40], [150, 30]], count: 30, spread: [10,30], color: DICH, timing: [[0.03,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1993, groups: [{ path: [[-40, 40], [-40, 40]], count: 14, spread: [8,20], color: DICH, mortal: true, timing: [[0,1],[1,1]] }], progress: p3, fall: (ctx) => smoothstep(0.05, 0.9, p3()), visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[170, 30]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
