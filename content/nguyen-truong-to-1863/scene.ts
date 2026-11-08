import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, XA_DOAI, KENH_SAT, HUE, RA_KHOI } from "./terrain";

type Pt = [number, number];

// Những bản điều trần của Nguyễn Trường Tộ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thay-lan","ra-ngoai","dieu-tran","sang-phap","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[XA_DOAI, 40], [HUE, 56]];

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
    seed: 1863,
  });

  // 1. "thay-lan": đốm ngà (thầy giáo) ở Xã Đoài; học trò (son) tụ lại (diễn hoạ).
  const p0 = run("thay-lan", 28);
  { const S: Pt[] = [XA_DOAI]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thay-lan") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1883, groups: [{ path: [[-200, 150], XA_DOAI], count: 14, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[100, 330], XA_DOAI], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("thay-lan") }));
  // 2. "ra-ngoai": chấm ngà theo thuyền ra biển xa, rồi trở về theo đường biển phía nam (diễn hoạ).
  const p1 = run("ra-ngoai", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1893, groups: [{ path: [[60, 220], [240, 200], [330, 150], RA_KHOI, [360, -100], [330, -350]], count: 2, spread: [5,10], color: NGHIA, timing: [[0.03,0],[0.97,1]] }], progress: p1, visible: () => clock.near("ra-ngoai") }));
  // 3. "dieu-tran": các đốm vàng (những bản điều trần) lần lượt đi từ Xã Đoài vào kinh đô Huế theo thanh kéo; đốm vàng ở Huế vẫn mờ (không được phúc đáp); một vệt sáng dọc kênh Sắt (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dieu-tran"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1903, groups: [{ path: [XA_DOAI, [-20, 100], [20, -60], HUE], count: 6, spread: [4,120], color: GOLD, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dieu-tran") }));
  { const S: Pt[] = [HUE]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.35 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dieu-tran") })); }
  { const S: Pt[] = [[0, 245], [20, 250], [40, 255], [60, 258]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.6 + i * 0.06, 0.75 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dieu-tran") })); }
  // 4. "sang-phap": chấm ngà (phái đoàn) rời Huế ra biển đi xa rồi trở về sau tám tháng (diễn hoạ).
  const p3 = run("sang-phap", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1933, groups: [{ path: [HUE, [250, -180], [360, -120], RA_KHOI, [360, -120], [250, -180], HUE], count: 3, spread: [6,12], color: NGHIA, timing: [[0.03,0],[0.97,1]] }], progress: p3, visible: () => clock.near("sang-phap") }));
  // 5. "ve-sau": đốm ngà đi gấp vào Huế, đốm vàng ở Huế chập chờn rồi lịm; người (son) ở Huế bàn đi tính lại (diễn hoạ).
  const p4 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1943, groups: [{ path: [XA_DOAI, [-20, 100], HUE], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [HUE]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (1 - smoothstep(0.7, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1963, groups: [{ path: [[0, -230], [20, -210]], count: 18, spread: [40,20], color: SON, timing: [[0,1],[1,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
};

export default setup;
