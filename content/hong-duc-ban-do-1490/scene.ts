import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH } from "./terrain";

type Pt = [number, number];

// Bản đồ Hồng Đức — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lenh-ve","thua-tuyen","nam-tap","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 56]];

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
    seed: 1490,
  });

  // 1. "lenh-ve": đốm vàng (vua) ở kinh; các chấm ngà (sứ mang lệnh) tỏa ra mười ba hướng (diễn hoạ).
  const p0 = run("lenh-ve", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lenh-ve") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1510, groups: [{ path: [[0, 20], [-300, 200]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.2,0],[1,1]] }, { path: [[0, 20], [250, 250]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.25,0],[1,1]] }, { path: [[0, 20], [-250, -250]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.3,0],[1,1]] }, { path: [[0, 20], [200, -300]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.35,0],[1,1]] }, { path: [[0, 20], [-350, 0]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.4,0],[1,1]] }, { path: [[0, 20], [0, -350]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.45,0],[1,1]] }], progress: p0, visible: () => clock.near("lenh-ve") }));
  // 2. "thua-tuyen": theo thanh kéo, mười ba đốm vàng (bản đồ thừa tuyên) sáng ở mười ba nơi rồi chấm ngà mang về kinh; kinh thành sáng dần (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thua-tuyen"] ?? 0) / 0.9);
  { const S: Pt[] = [[270, 20], [239, 145], [153, 242], [33, 288], [-96, 272], [-202, 199], [-262, 85], [-262, -45], [-202, -159], [-96, -232], [33, -248], [153, -202], [239, -105]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thua-tuyen") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1530, groups: [{ path: [[270, 20], [0, 20]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.5,0],[0.9,1]] }, { path: [[-96, 272], [0, 20]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.55,0],[0.92,1]] }, { path: [[-202, -159], [0, 20]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.6,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thua-tuyen") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 42, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thua-tuyen") })); }
  // 3. "nam-tap": năm đốm vàng (năm tập) xếp hàng ở kinh; tập đầu sáng nhất (diễn hoạ).
  const p2 = run("nam-tap", 28);
  { const S: Pt[] = [[-40, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-tap") })); }
  { const S: Pt[] = [[-15, 30], [5, 30], [25, 30], [45, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.6 * smoothstep(0.3 + i * 0.1, 0.44999999999999996 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-tap") })); }
  // 4. "ve-sau": đốm vàng gốc lịm (bản gốc thất truyền); mười đốm ngà nhỏ (mười bản chép) sáng quanh (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.15, 0.4, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 20], [32, 44], [12, 58], [-12, 58], [-32, 44], [-40, 20], [-32, -4], [-12, -18], [12, -18], [32, -4]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45 + i * 0.04, 0.6 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
