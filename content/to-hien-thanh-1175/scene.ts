import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, VEN_BIEN, MIEN_NUI } from "./terrain";

type Pt = [number, number];

// Tô Hiến Thành giữ di chiếu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hoàng thành cách điệu: một vòng tường vuông; không vẽ cung điện.
const WALLS: Wall[] = [
  { at: square(-120, 220, 55, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["van-vo","khai-hoang","mam-vang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 72], [VEN_BIEN, 48]];

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
    seed: 1175,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "van-vo": quân triều (son) từ kinh thành lên miền núi; đốm ngà (Tô Hiến Thành) dẫn đầu; nhóm nổi loạn (xanh nhạt) tan, được tha (diễn hoạ).
  const p0 = run("van-vo", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1185, groups: [{ path: [KINH, [-220, 80], MIEN_NUI], count: 30, spread: [20,60], color: SON, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("van-vo") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1195, groups: [{ path: [KINH, [-220, 80], [-280, -40]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("van-vo") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1205, groups: [{ path: [[-360, -150], [-310, -80]], count: 18, spread: [40,30], color: DICH, timing: [[0,0],[0.5,1]] }], progress: p0, visible: () => clock.near("van-vo") }));
  // 2. "khai-hoang": các toán người (son) khai hoang dàn hàng dọc bờ biển (đê); ruộng mới sáng dần (vàng) (diễn hoạ).
  const p1 = run("khai-hoang", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1215, groups: [{ path: [[60, -120], [150, -230], [300, -240]], count: 40, spread: [8,8], color: SON, drop: true, timing: [[0.03,0],[0.9,1]] }], progress: p1, visible: () => clock.near("khai-hoang") }));
  { const S: Pt[] = [[130, -180], [180, -190], [230, -200], [160, -150], [220, -160]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.07, 0.65 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-hoang") })); }
  // 3. "mam-vang": một đốm vàng nhỏ (mâm vàng) đến gần rồi lui đi theo thanh kéo; đốm ngà (Tô Hiến Thành) đứng giữa điện; đốm vàng lớn (ấu chúa) sáng dần (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["di-chieu"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1235, groups: [{ path: [[-60, 160], [-110, 210], [-60, 160], [-20, 120]], count: 1, spread: [3,3], color: GOLD, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("mam-vang") }));
  { const S: Pt[] = [[-120, 225]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mam-vang") })); }
  { const S: Pt[] = [[-120, 240]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mam-vang") })); }
  // 4. "ve-sau": đốm ngà lịm dần; một đốm ngà khác (người kế nhiệm) sáng lên; triều thần (son) đứng quanh (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-120, 225]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-100, 215]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1285, groups: [{ path: [[-120, 180], [-120, 200]], count: 16, spread: [40,14], color: SON, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
