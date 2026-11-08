import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, DIEN } from "./terrain";

type Pt = [number, number];

// Bộ luật Hình thư — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hoàng thành cách điệu: một vòng tường vuông.
const WALLS: Wall[] = [
  { at: square(0, 30, 60, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["kien-tung","hinh-thu","luat-khac","ve-sau"]);
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
    seed: 1042,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "kien-tung": các nhóm người (son) từ các làng kéo về kinh thành kiện tụng, chen chúc ở cửa thành (diễn hoạ).
  const p0 = run("kien-tung", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1052, groups: [{ path: [[-300, -200], [0, -40]], count: 16, spread: [30,50], color: SON, timing: [[0.03,0],[0.8,1]] }, { path: [[-320, 250], [-70, 30]], count: 14, spread: [30,50], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [[200, -300], [0, -45]], count: 14, spread: [30,50], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: p0, visible: () => clock.near("kien-tung") }));
  // 2. "hinh-thu": các đốm vàng nhỏ (điều khoản) lần lượt sáng thành hàng trong điện theo thanh kéo; đốm vàng lớn (sách Hình thư) sáng ở cuối (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hinh-thu"] ?? 0) / 0.9);
  { const S: Pt[] = [[-17.5, 32.5], [-12.5, 32.5], [-7.5, 32.5], [-2.5, 32.5], [2.5, 32.5], [7.5, 32.5], [12.5, 32.5], [17.5, 32.5], [-17.5, 37.5], [-12.5, 37.5], [-7.5, 37.5], [-2.5, 37.5], [2.5, 37.5], [7.5, 37.5], [12.5, 37.5], [17.5, 37.5], [-17.5, 42.5], [-12.5, 42.5], [-7.5, 42.5], [-2.5, 42.5], [2.5, 42.5], [7.5, 42.5], [12.5, 42.5], [17.5, 42.5], [-17.5, 47.5], [-12.5, 47.5], [-7.5, 47.5], [-2.5, 47.5], [2.5, 47.5], [7.5, 47.5], [12.5, 47.5], [17.5, 47.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.025, 0.16999999999999998 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hinh-thu") })); }
  { const S: Pt[] = [[0, 58]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hinh-thu") })); }
  // 3. "luat-khac": các đốm ngà (trạm, quan giám sát) sáng ở các ngả đường quanh kinh; người (son) đi lại yên ổn (diễn hoạ).
  const p2 = run("luat-khac", 28);
  { const S: Pt[] = [[-200, 100], [150, 150], [-150, -150], [200, -100], [-280, 0], [0, -250]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("luat-khac") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1092, groups: [{ path: [[-250, -150], [-100, -60]], count: 10, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }, { path: [[200, 200], [80, 90]], count: 10, spread: [26,50], color: SON, timing: [[0.2,0],[0.95,1]] }], progress: p2, visible: () => clock.near("luat-khac") }));
  // 4. "ve-sau": hai đốm vàng (lầu chuông) hai bên thềm điện; một người (son) đến đánh chuông, đốm sáng bừng lên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-20, 40], [20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1112, groups: [{ path: [[0, -40], [-15, 35]], count: 1, spread: [2,2], color: SON, timing: [[0.2,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-20, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 42, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (1 - smoothstep(0.8, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
