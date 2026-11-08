import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG, HO, GIANG_KHIEM, DUONG_XUAN, KINH } from "./terrain";

type Pt = [number, number];

// Lăng Tự Đức — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// La thành cách điệu (thật dài hơn 1.800 m, cao 2,5 m, ba cửa); không vẽ điện, đình bên trong.
const WALLS: Wall[] = [
  { at: square(0, 10, 130, 0), base: 6, top: 3, height: 3, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 0, width: 10 }, { at: 3.141592653589793, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chon-dat","xay-lang","khiem-cung","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG, 56]];

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
    seed: 1873,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("xay-lang") + 0.5 ? 1 : ctx.t > world.beat("xay-lang") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["xay-lang"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8a8476", top: "#76845a" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "chon-dat": đốm vàng (vua) từ kinh thành xa về thung lũng; đốm vàng nhỏ đánh dấu nơi chọn đất (diễn hoạ).
  const p0 = run("chon-dat", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 4, seed: 1883, groups: [{ path: [KINH, [100, 250], [10, 20]], count: 1, spread: [3,3], color: GOLD, timing: [[0.03,0],[0.7,1]] }], progress: p0, visible: () => clock.near("chon-dat") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chon-dat") })); }
  // 2. "xay-lang": theo thanh kéo, từng đợt lính và dân phu (son) kéo về đắp la thành; vòng thành cao dần; vài đốm son nhấp nháy (oán giận) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-lang"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1903, groups: [{ path: [[-300, 395], [-130, 140], [-130, -120]], count: 30, spread: [8,120], color: SON, timing: [[0,0],[1,1]] }, { path: [[300, 395], [130, 140], [130, -120]], count: 30, spread: [8,120], color: SON, timing: [[0.1,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-lang") }));
  { const S: Pt[] = [[-120, 40], [120, 60], [-60, 130], [80, -100]]; world.add(createGlows({ count: S.length, color: SON, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.6 * smoothstep(0.6 + i * 0.06, 0.75 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-lang") })); }
  // 3. "khiem-cung": gần năm mươi đốm vàng nhỏ (các công trình mang chữ Khiêm) sáng dần trong la thành; hồ phản chiếu (diễn hoạ).
  const p2 = run("khiem-cung", 28);
  { const S: Pt[] = [[-77, -15], [-55, -15], [-33, -15], [-11, -15], [11, -15], [33, -15], [55, -15], [77, -15], [-77, 7], [-55, 7], [-33, 7], [-11, 7], [11, 7], [33, 7], [55, 7], [77, 7], [-77, 29], [-55, 29], [-33, 29], [-11, 29], [11, 29], [33, 29], [55, 29], [77, 29], [-77, 51], [-55, 51], [-33, 51], [-11, 51], [11, 51], [33, 51], [55, 51], [77, 51], [-77, 73], [-55, 73], [-33, 73], [-11, 73], [11, 73], [33, 73], [55, 73], [77, 73], [-77, 95], [-55, 95], [-33, 95], [-11, 95], [11, 95], [33, 95], [55, 95], [77, 95]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.012, 0.18 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khiem-cung") })); }
  // 4. "ve-sau": đốm ngà lớn (bia Khiêm Cung ký) sáng; về sau đốm vàng (vua) lịm (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[30, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.6, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
