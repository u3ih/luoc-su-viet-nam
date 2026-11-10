import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, THIEN_TRUONG, BACH_HAC, HOAN_AI } from "./terrain";

type Pt = [number, number];

// Trần Thánh Tông — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Hoàng thành Thăng Long cách điệu.
const WALLS: Wall[] = [
  { at: square(80, 150, 44, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nhuong-ngoi","thien-truong","khoa-thi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 56], [THIEN_TRUONG, 40]];

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
    seed: 1263,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "nhuong-ngoi": đốm vàng (vua mới) sáng giữa hoàng thành; tôn thất (chấm ngà) tụ về quây quần (diễn hoạ).
  const p0 = run("nhuong-ngoi", 28);
  { const S: Pt[] = [[80, 160]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhuong-ngoi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1283, groups: [{ path: [[-40, 60], [70, 140]], count: 20, spread: [6,20], color: NGHIA, timing: [[0.05,0],[0.6,1]] }, { path: [[200, 250], [90, 160]], count: 20, spread: [6,20], color: NGHIA, timing: [[0.1,0],[0.65,1]] }], progress: p0, visible: () => clock.near("nhuong-ngoi") }));
  // 2. "thien-truong": vua (chấm ngà) về Thiên Trường; ba đốm vàng (cung Trùng Quang, Trùng Hoa, chùa Phổ Minh) sáng lên (diễn hoạ).
  const p1 = run("thien-truong", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1293, groups: [{ path: [[80, 130], [150, -40], [195, -190]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.5,1]] }], progress: p1, visible: () => clock.near("thien-truong") }));
  { const S: Pt[] = [[180, -190], [220, -200], [200, -225]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.5 + i * 0.1, 0.65 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thien-truong") })); }
  // 3. "khoa-thi": theo thanh kéo, sĩ tử (son) từ phía bắc và từ châu Hoan, Ái kéo về kinh; hai đốm vàng (kinh trạng nguyên, trại trạng nguyên) sáng lên (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["khoa-thi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1313, groups: [{ path: [[-150, 380], [40, 220], [70, 150]], count: 24, spread: [8,30], color: SON, timing: [[0,0],[0.7,1]] }, { path: [[-250, -340], [-60, -60], [70, 130]], count: 24, spread: [8,30], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("khoa-thi") }));
  { const S: Pt[] = [[60, 170], [100, 170]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.08, 0.9500000000000001 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoa-thi") })); }
  // 4. "ve-sau": đinh tráng (son) tụ về các bãi sông Bạch Hạc tập trận; chín đốm ngà dọc bãi; thuyền chiến (chấm sáng) trên sông (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-300, 320], [-275, 305], [-250, 290], [-225, 275], [-200, 260], [-172, 245], [-145, 230], [-117, 215], [-90, 200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1343, groups: [{ path: [[-300, 120], [-200, 240]], count: 40, spread: [10,50], color: SON, timing: [[0.1,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1353, groups: [{ path: [[-60, 190], [-260, 290]], count: 6, spread: [6,30], color: NGHIA, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
