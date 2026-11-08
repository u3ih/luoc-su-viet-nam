import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, KINH, HO_TAY, DONG_CUU, THAO_GIANG, NAM_QUAN } from "./terrain";

type Pt = [number, number];

// Lê Văn Thịnh, người đỗ đầu khoa thi đầu tiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
  { at: square(0, 20, 60, 0), base: 8, top: 5, height: 4, gates: [{ at: 0, width: 10 }, { at: 1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: -1.5707963267948966, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["than-dong","khoa-thi","ban-cuong-gioi","ve-sau"]);
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
    seed: 1075,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "than-dong": đốm ngà nhỏ (cậu bé) sáng trong làng Đông Cứu; trẻ (son) tụ về lớp học (diễn hoạ).
  const p0 = run("than-dong", 28);
  { const S: Pt[] = [[330, 100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("than-dong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1095, groups: [{ path: [[250, 0], [325, 95]], count: 14, spread: [30,40], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("than-dong") }));
  // 2. "khoa-thi": theo thanh kéo, sĩ tử (son) từ nhiều hướng về kinh thành dự thi; cuối cùng một đốm vàng (người đỗ đầu) sáng giữa hoàng thành (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoa-thi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1105, groups: [{ path: [DONG_CUU, [100, 60], [15, 25]], count: 16, spread: [8,60], color: SON, timing: [[0,0],[0.8,1]] }, { path: [[-300, -300], [-15, 15]], count: 16, spread: [8,60], color: SON, timing: [[0.05,0],[0.85,1]] }, { path: [[-300, 300], [-15, 30]], count: 16, spread: [8,60], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoa-thi") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoa-thi") })); }
  // 3. "ban-cuong-gioi": đốm ngà đi lên phía bắc bàn việc cương giới, rồi trở về; đốm vàng (chức Thái sư) sáng ở kinh (diễn hoạ).
  const p2 = run("ban-cuong-gioi", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 4, seed: 1125, groups: [{ path: [KINH, [60, 200], NAM_QUAN, [60, 200], [5, 25]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.85,1]] }], progress: p2, visible: () => clock.near("ban-cuong-gioi") }));
  { const S: Pt[] = [[10, 25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-cuong-gioi") })); }
  // 4. "ve-sau": sương mù (đốm xanh nhạt) phủ mặt hồ; chấm sáng (thuyền vua) giữa hồ; về sau đốm ngà rời kinh đi về phía tây (Thao Giang) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-194, 137], [-172, 137], [-150, 137], [-128, 137], [-106, 137], [-194, 159], [-172, 159], [-150, 159], [-128, 159], [-106, 159], [-194, 181], [-172, 181], [-150, 181], [-128, 181], [-106, 181], [-194, 203], [-172, 203], [-150, 203], [-128, 203], [-106, 203]]; world.add(createGlows({ count: S.length, color: DICH, size: 35, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (1 - smoothstep(0.5, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 1, seed: 1155, groups: [{ path: [[-120, 150], [-150, 170]], count: 1, spread: [3,3], color: GOLD, timing: [[0.05,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1165, groups: [{ path: [[-20, 20], [-200, 10], THAO_GIANG], count: 1, spread: [3,3], color: NGHIA, timing: [[0.6,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
