import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, QUOC_SU_QUAN, VAN_MIEU_HN } from "./terrain";

type Pt = [number, number];

// Mộc bản triều Nguyễn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành Huế cách điệu.
const WALLS: Wall[] = [
  { at: square(-20, 100, 90, 0), base: 14, top: 8, height: 6, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quoc-su-quan","khac-ban","van-mieu","ve-sau"]);
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
    seed: 2011,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "quoc-su-quan": đốm vàng (vua phê duyệt) truyền sang đốm ngà (Quốc sử quán); người (son, thợ khắc) tụ về (diễn hoạ).
  const p0 = run("quoc-su-quan", 28);
  { const S: Pt[] = [[-10, 100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-su-quan") })); }
  { const S: Pt[] = [[-40, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-su-quan") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2041, groups: [{ path: [[100, 0], [-35, 115]], count: 16, spread: [8,60], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("quoc-su-quan") }));
  // 2. "khac-ban": theo thanh kéo, lưới đốm ngà (ván khắc) lần lượt hoàn thành, xếp thành từng dãy (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khac-ban"] ?? 0) / 0.9);
  { const S: Pt[] = [[-53.5, 112.5], [-50.5, 112.5], [-47.5, 112.5], [-44.5, 112.5], [-41.5, 112.5], [-38.5, 112.5], [-35.5, 112.5], [-32.5, 112.5], [-29.5, 112.5], [-26.5, 112.5], [-53.5, 115.5], [-50.5, 115.5], [-47.5, 115.5], [-44.5, 115.5], [-41.5, 115.5], [-38.5, 115.5], [-35.5, 115.5], [-32.5, 115.5], [-29.5, 115.5], [-26.5, 115.5], [-53.5, 118.5], [-50.5, 118.5], [-47.5, 118.5], [-44.5, 118.5], [-41.5, 118.5], [-38.5, 118.5], [-35.5, 118.5], [-32.5, 118.5], [-29.5, 118.5], [-26.5, 118.5], [-53.5, 121.5], [-50.5, 121.5], [-47.5, 121.5], [-44.5, 121.5], [-41.5, 121.5], [-38.5, 121.5], [-35.5, 121.5], [-32.5, 121.5], [-29.5, 121.5], [-26.5, 121.5], [-53.5, 124.5], [-50.5, 124.5], [-47.5, 124.5], [-44.5, 124.5], [-41.5, 124.5], [-38.5, 124.5], [-35.5, 124.5], [-32.5, 124.5], [-29.5, 124.5], [-26.5, 124.5], [-53.5, 127.5], [-50.5, 127.5], [-47.5, 127.5], [-44.5, 127.5], [-41.5, 127.5], [-38.5, 127.5], [-35.5, 127.5], [-32.5, 127.5], [-29.5, 127.5], [-26.5, 127.5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 5, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.015, 0.16999999999999998 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khac-ban") })); }
  // 3. "van-mieu": những đốm ngà (ván in ở Văn Miếu Hà Nội) theo đường dài về Huế (diễn hoạ).
  const p2 = run("van-mieu", 28);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 3, seed: 2061, groups: [{ path: [VAN_MIEU_HN, [-150, 250], [-40, 125]], count: 12, spread: [6,60], color: NGHIA, timing: [[0.02,0],[0.9,1]] }], progress: p2, visible: () => clock.near("van-mieu") }));
  // 4. "ve-sau": khối đốm ngà (34.618 tấm) sáng dịu; đốm vàng lớn (ghi danh) phía trên (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-53.5, 112.5], [-50.5, 112.5], [-47.5, 112.5], [-44.5, 112.5], [-41.5, 112.5], [-38.5, 112.5], [-35.5, 112.5], [-32.5, 112.5], [-29.5, 112.5], [-26.5, 112.5], [-53.5, 115.5], [-50.5, 115.5], [-47.5, 115.5], [-44.5, 115.5], [-41.5, 115.5], [-38.5, 115.5], [-35.5, 115.5], [-32.5, 115.5], [-29.5, 115.5], [-26.5, 115.5], [-53.5, 118.5], [-50.5, 118.5], [-47.5, 118.5], [-44.5, 118.5], [-41.5, 118.5], [-38.5, 118.5], [-35.5, 118.5], [-32.5, 118.5], [-29.5, 118.5], [-26.5, 118.5], [-53.5, 121.5], [-50.5, 121.5], [-47.5, 121.5], [-44.5, 121.5], [-41.5, 121.5], [-38.5, 121.5], [-35.5, 121.5], [-32.5, 121.5], [-29.5, 121.5], [-26.5, 121.5], [-53.5, 124.5], [-50.5, 124.5], [-47.5, 124.5], [-44.5, 124.5], [-41.5, 124.5], [-38.5, 124.5], [-35.5, 124.5], [-32.5, 124.5], [-29.5, 124.5], [-26.5, 124.5], [-53.5, 127.5], [-50.5, 127.5], [-47.5, 127.5], [-44.5, 127.5], [-41.5, 127.5], [-38.5, 127.5], [-35.5, 127.5], [-32.5, 127.5], [-29.5, 127.5], [-26.5, 127.5]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 5, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-40, 120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
