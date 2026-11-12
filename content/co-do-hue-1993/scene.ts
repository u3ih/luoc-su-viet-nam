import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH_THANH, LANG, NUI_NGU } from "./terrain";

type Pt = [number, number];

// Cố đô Huế thành di sản thế giới — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành: vòng thành vuông cách điệu (chỉ khối tường theo mặt bằng, không vẽ chi tiết)
const WALLS: Wall[] = [
  { at: square(20, 70, 95, 0), base: 10, top: 6, height: 6, gates: [{ at: 0, width: 12 }, { at: 1.5707963267948966, width: 12 }, { at: 3.141592653589793, width: 12 }, { at: -1.5707963267948966, width: 12 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["kinh-do","tan-pha","ghi-danh","trung-tu"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH_THANH, 96], [LANG, 32]];

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
    seed: 1993,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8e8a78", top: "#6f7d52" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "kinh-do": các công trình trong Kinh thành (đốm vàng) sáng thành lưới; các lăng vua (đốm ngà) ở vùng đồi tây nam (diễn hoạ).
  const p0 = run("kinh-do", 28);
  { const S: Pt[] = [[-32, 41], [-6, 41], [20, 41], [46, 41], [72, 41], [-32, 67], [-6, 67], [20, 67], [46, 67], [72, 67], [-32, 93], [-6, 93], [20, 93], [46, 93], [72, 93], [-32, 119], [-6, 119], [20, 119], [46, 119], [72, 119]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kinh-do") })); }
  { const S: Pt[] = [[-180, -200], [-220, -150], [-130, -250], [-250, -220], [-150, -160], [-100, -210], [-200, -260]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.05, 0.65 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kinh-do") })); }
  // 2. "tan-pha": phần lớn các đốm trong Kinh thành tắt dần, chỉ còn vài đốm (những công trình còn lại) (diễn hoạ).
  const p1 = run("tan-pha", 28);
  { const S: Pt[] = [[-32, 41], [-6, 41], [46, 41], [72, 41], [-32, 67], [-6, 67], [46, 67], [72, 67], [-32, 93], [-6, 93], [46, 93], [72, 93], [-32, 119], [20, 119], [46, 119], [72, 119]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.15, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tan-pha") })); }
  { const S: Pt[] = [[20, 41], [20, 67], [20, 93], [-6, 119]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tan-pha") })); }
  // 3. "ghi-danh": theo thanh kéo, các công trình trong Kinh thành và các lăng lần lượt sáng lại (di sản thế giới) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ghi-danh"] ?? 0) / 0.9);
  { const S: Pt[] = [[20, 41], [20, 67], [20, 93], [-6, 119]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
  { const S: Pt[] = [[-32, 41], [-6, 41], [46, 41], [72, 41], [-32, 67], [-6, 67], [46, 67], [72, 67], [-32, 93], [-6, 93], [46, 93], [72, 93], [-32, 119], [20, 119], [46, 119], [72, 119]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.035, 0.2 + i * 0.035, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
  { const S: Pt[] = [[-180, -200], [-220, -150], [-130, -250], [-250, -220], [-150, -160], [-100, -210], [-200, -260]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.04, 0.75 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
  // 4. "trung-tu": thợ trùng tu (son) làm việc trong hoàng thành; hai khuyết đài (đốm ngà) phía tây và đông lần lượt dựng lại (diễn hoạ).
  const p3 = run("trung-tu", 28);
  { const S: Pt[] = [[-32, 41], [-6, 41], [20, 41], [46, 41], [72, 41], [-32, 67], [-6, 67], [20, 67], [46, 67], [72, 67], [-32, 93], [-6, 93], [20, 93], [46, 93], [72, 93], [-32, 119], [-6, 119], [20, 119], [46, 119], [72, 119]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trung-tu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2083, groups: [{ path: [[-60, 20], [20, 75]], count: 30, spread: [4,26], color: SON, drop: true, timing: [[0.04,0],[0.6,1]] }], progress: p3, visible: () => clock.near("trung-tu") }));
  { const S: Pt[] = [[-20, 80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trung-tu") })); }
  { const S: Pt[] = [[60, 80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trung-tu") })); }
};

export default setup;
