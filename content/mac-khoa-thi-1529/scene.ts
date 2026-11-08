import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, VAN_MIEU } from "./terrain";

type Pt = [number, number];

// Nhà Mạc mở khoa thi — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hoàng thành cách điệu.
const WALLS: Wall[] = [
  { at: square(0, 60, 60, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dinh-phep","khoa-thi","cac-khoa","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 80], [VAN_MIEU, 32]];

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
    seed: 1529,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "dinh-phep": đốm vàng (vua) trong hoàng thành; các đốm ngà (các vệ, các phủ) sáng thành vòng quanh (diễn hoạ).
  const p0 = run("dinh-phep", 28);
  { const S: Pt[] = [[0, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dinh-phep") })); }
  { const S: Pt[] = [[90, 60], [69, 118], [16, 149], [-45, 138], [-85, 91], [-85, 29], [-45, -18], [16, -29], [69, 2]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.06, 0.35 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dinh-phep") })); }
  // 2. "khoa-thi": theo thanh kéo, sĩ tử (son) từ các trấn đổ về kinh thành; 28 đốm vàng nhỏ (người trúng tuyển) sáng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoa-thi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1559, groups: [{ path: [[-350, -300], [-20, 20]], count: 24, spread: [10,120], color: SON, timing: [[0,0],[0.8,1]] }, { path: [[350, -300], [20, 20]], count: 24, spread: [10,120], color: SON, timing: [[0.05,0],[0.85,1]] }, { path: [[-300, 350], [-10, 70]], count: 24, spread: [10,120], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoa-thi") }));
  { const S: Pt[] = [[-18, 51], [-12, 51], [-6, 51], [0, 51], [6, 51], [12, 51], [18, 51], [-18, 57], [-12, 57], [-6, 57], [0, 57], [6, 57], [12, 57], [18, 57], [-18, 63], [-12, 63], [-6, 63], [0, 63], [6, 63], [12, 63], [18, 63], [-18, 69], [-12, 69], [-6, 69], [0, 69], [6, 69], [12, 69], [18, 69]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.005, 0.9500000000000001 + i * 0.005, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoa-thi") })); }
  // 3. "cac-khoa": ba đợt đốm vàng (các khoa 1532, 1535, 1538), mỗi đợt có một đốm sáng hơn (người đỗ đầu) (diễn hoạ).
  const p2 = run("cac-khoa", 28);
  { const S: Pt[] = [[-50, 20], [-37, 20], [-25, 20], [-12, 20], [0, 20], [13, 20], [25, 20], [38, 20], [50, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.01, 0.2 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cac-khoa") })); }
  { const S: Pt[] = [[-50, 40], [-40, 40], [-30, 40], [-20, 40], [-10, 40], [0, 40], [10, 40], [20, 40], [30, 40], [40, 40], [50, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.01, 0.5 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cac-khoa") })); }
  { const S: Pt[] = [[-50, 60], [-41, 60], [-32, 60], [-23, 60], [-14, 60], [-5, 60], [5, 60], [14, 60], [23, 60], [32, 60], [41, 60], [50, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.65 + i * 0.01, 0.8 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cac-khoa") })); }
  { const S: Pt[] = [[-55, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cac-khoa") })); }
  // 4. "ve-sau": hàng đốm ngà (bia tiến sĩ) ở Văn Miếu (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-70, -110], [-63, -110], [-57, -110], [-50, -110], [-43, -110], [-37, -110], [-30, -110], [-23, -110], [-17, -110], [-10, -110], [-70, -90], [-63, -90], [-57, -90], [-50, -90], [-43, -90], [-37, -90], [-30, -90], [-23, -90], [-17, -90], [-10, -90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.02, 0.2 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
