import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THIEN_BAN, KINH, LANG_A, LANG_B, LANG_C } from "./terrain";

type Pt = [number, number];

// Trạng Lường Lương Thế Vinh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["do-trang","toan-phap","cheo","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THIEN_BAN, 48], [KINH, 56]];

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
    seed: 1463,
  });

  // 1. "do-trang": đốm ngà đi từ Thiên Bản lên kinh đô; ba đốm vàng (Tam khôi) sáng (diễn hoạ).
  const p0 = run("do-trang", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1473, groups: [{ path: [THIEN_BAN, [0, 0], KINH], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.55,1]] }], progress: p0, visible: () => clock.near("do-trang") }));
  { const S: Pt[] = [[40, 270], [60, 275], [80, 270]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.08, 0.7000000000000001 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-trang") })); }
  // 2. "toan-phap": các đốm vàng (lớp học dùng sách toán) lan dần từ kinh đô ra các làng theo thanh kéo; học trò (son) tụ lại mỗi nơi (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["toan-phap"] ?? 0) / 0.9);
  { const S: Pt[] = [KINH, [0, 180], LANG_A, LANG_B, [-80, 20], [80, 0], LANG_C, THIEN_BAN, [-260, -60], [280, -50]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.08, 0.16999999999999998 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("toan-phap") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1503, groups: [{ path: [[-300, 200], LANG_A], count: 10, spread: [26,50], color: SON, timing: [[0.2,0],[0.9,1]] }, { path: [[350, 180], LANG_B], count: 10, spread: [26,50], color: SON, timing: [[0.3,0],[0.95,1]] }, { path: [[330, -250], LANG_C], count: 10, spread: [26,50], color: SON, timing: [[0.45,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("toan-phap") }));
  // 3. "cheo": một vòng người (son) quây quanh chiếu chèo ở kinh đô; đốm vàng giữa vòng chập chờn (diễn hoạ).
  const p2 = run("cheo", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1513, groups: [{ path: [[86, 250], [84, 260], [78, 268], [70, 274], [60, 276], [50, 274], [42, 268], [36, 260], [34, 250], [36, 240], [42, 232], [50, 226], [60, 224], [70, 226], [78, 232], [84, 240], [86, 250]], count: 22, spread: [4,40], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("cheo") }));
  { const S: Pt[] = [[60, 250]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cheo") })); }
  // 4. "ve-sau": đốm ngà về quê Thiên Bản; đốm vàng nhỏ (cánh diều) bay trên làng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1533, groups: [{ path: [KINH, [0, 0], THIEN_BAN], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 40, seed: 1543, groups: [{ path: [[-90, -260], [-40, -220], [-80, -200], [-30, -250]], count: 1, spread: [3,3], color: GOLD, timing: [[0.5,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
