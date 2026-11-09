import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, AI_CHAU, TRANG_AN, TUYEN_CHAU } from "./terrain";

type Pt = [number, number];

// Khương Công Phụ, trạng nguyên đất Ái Châu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["que-huong","do-dau","can-gian","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[AI_CHAU, 48], [TRANG_AN, 60]];

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
    seed: 780,
  });

  // 1. "que-huong": làng Ái Châu (đốm ngà); dân làng (son); hai chấm ngà (hai anh em) đi quanh làng (diễn hoạ).
  const p0 = run("que-huong", 28);
  { const S: Pt[] = [[-40, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("que-huong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 800, groups: [{ path: [[-80, -230], [-40, -200]], count: 20, spread: [10,50], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("que-huong") }));
  world.add(createCrowd({ size: 6, height: ground, seed: 810, groups: [{ path: [[-80, -180], [-20, -170], [0, -210]], count: 2, spread: [3,4], color: NGHIA, timing: [[0.1,0],[0.8,1]] }], progress: p0, visible: () => clock.near("que-huong") }));
  // 2. "do-dau": theo thanh kéo, hai chấm ngà đi từ Ái Châu lên Tràng An; sĩ tử (xanh nhạt) tụ ở kinh thành; đốm vàng (đỗ đầu) sáng lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["do-dau"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 820, groups: [{ path: [[-40, -200], [-20, -60], [30, 80], [60, 210]], count: 2, spread: [3,4], color: NGHIA, timing: [[0,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("do-dau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 830, groups: [{ path: [[200, 330], [70, 240]], count: 20, spread: [10,40], color: DICH, timing: [[0.05,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("do-dau") }));
  { const S: Pt[] = [[60, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-dau") })); }
  // 3. "can-gian": quân (xanh nhạt) kéo tới kinh thành; trong thành, đốm ngà (Khương Công Phụ) bên đốm vàng (vua); quân trong thành gom lại (diễn hoạ).
  const p2 = run("can-gian", 28);
  { const S: Pt[] = [[60, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("can-gian") })); }
  { const S: Pt[] = [[75, 220]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("can-gian") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 870, groups: [{ path: [[-300, 380], [10, 260]], count: 30, spread: [20,60], color: DICH, timing: [[0.15,0],[0.7,1]] }], progress: p2, visible: () => clock.near("can-gian") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 880, groups: [{ path: [[180, 300], [70, 235]], count: 16, spread: [8,30], color: NGHIA, timing: [[0.35,0],[0.8,1]] }], progress: p2, visible: () => clock.near("can-gian") }));
  // 4. "ve-sau": chấm ngà rời kinh thành đi Tuyền Châu ở phía đông; đền thờ ông (đốm vàng) ở Tuyền Châu và ở Ái Châu (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 6, height: ground, seed: 890, groups: [{ path: [[60, 230], [180, 150], [245, 85]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[250, 80], [-40, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
