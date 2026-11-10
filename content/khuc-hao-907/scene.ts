import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LA_THANH, QUANG_CHAU, CUC_BO } from "./terrain";

type Pt = [number, number];

// Khúc Hạo cải cách — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// La Thành (Đại La) cách điệu thành vòng tường vuông.
const WALLS: Wall[] = [
  { at: square(60, 20, 40, 0), base: 9, top: 5, height: 5, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ke-nghiep","giap","thue","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LA_THANH, 64]];

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
    seed: 907,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "ke-nghiep": Khúc Hạo (chấm ngà) đến La Thành (đốm vàng); xa phía đông bắc, đốm xanh nhạt (họ Lưu ở Quảng Châu) (diễn hoạ).
  const p0 = run("ke-nghiep", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 917, groups: [{ path: [[220, -250], [120, -100], [60, 0]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("ke-nghiep") }));
  { const S: Pt[] = [[60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-nghiep") })); }
  { const S: Pt[] = [[330, 330]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ke-nghiep") })); }
  // 2. "giap": các giáp (đốm ngà) lần lượt sáng khắp đồng bằng (diễn hoạ).
  const p1 = run("giap", 28);
  { const S: Pt[] = [[-190, -112.5], [-115, -112.5], [-40, -112.5], [35, -112.5], [110, -112.5], [-190, -37.5], [-115, -37.5], [-40, -37.5], [35, -37.5], [110, -37.5], [-190, 37.5], [-115, 37.5], [-40, 37.5], [-190, 112.5], [-115, 112.5], [-40, 112.5], [35, 112.5], [110, 112.5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giap") })); }
  { const S: Pt[] = [[60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giap") })); }
  // 3. "thue": theo thanh kéo, dân (son) các làng về giáp ghi sổ hộ khẩu; các giáp chuyển sang đốm vàng (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["thue"] ?? 0) / 0.9);
  { const S: Pt[] = [[-190, -112.5], [-115, -112.5], [-40, -112.5], [35, -112.5], [110, -112.5], [-190, -37.5], [-115, -37.5], [-40, -37.5], [35, -37.5], [110, -37.5], [-190, 37.5], [-115, 37.5], [-40, 37.5], [-190, 112.5], [-115, 112.5], [-40, 112.5], [35, 112.5], [110, 112.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.035, 0.25 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thue") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 977, groups: [{ path: [[-200, 150], [-190, 110]], count: 14, spread: [8,40], color: SON, timing: [[0,0],[0.5,1]] }, { path: [[-220, -150], [-190, -110]], count: 14, spread: [8,40], color: SON, timing: [[0.1,0],[0.6,1]] }, { path: [[0, -200], [-40, -110]], count: 14, spread: [8,40], color: SON, timing: [[0.2,0],[0.7,1]] }, { path: [[-60, 200], [-40, 110]], count: 14, spread: [8,40], color: SON, timing: [[0.3,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("thue") }));
  // 4. "ve-sau": sứ đoàn Khúc Thừa Mỹ (chấm ngà) từ La Thành sang Quảng Châu; đốm xanh nhạt ở Quảng Châu sáng mạnh hơn (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 987, groups: [{ path: [[60, 20], [200, 180], [320, 320]], count: 8, spread: [4,16], color: NGHIA, timing: [[0.05,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[330, 330]]; world.add(createGlows({ count: S.length, color: DICH, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
