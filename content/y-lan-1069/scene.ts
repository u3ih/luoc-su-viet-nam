import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, THO_LOI, BA_CHAU, NHAT_LE, PHAT_THE } from "./terrain";

type Pt = [number, number];

// Nguyên phi Ỷ Lan — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tua-lan","nam-chinh","ba-chau","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 56], [THO_LOI, 32], [BA_CHAU, 40], [PHAT_THE, 48]];

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
    seed: 1069,
  });

  // 1. "tua-lan": dân (son) đổ ra xem đoàn ngự giá; một đốm ngà đứng riêng; đốm vàng (vua) dừng lại rồi cùng về kinh (diễn hoạ).
  const p0 = run("tua-lan", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1079, groups: [{ path: [[0, 300], [30, 330]], count: 24, spread: [60,20], color: SON, timing: [[0.02,0],[0.5,1]] }], progress: p0, visible: () => clock.near("tua-lan") }));
  { const S: Pt[] = [[70, 350]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tua-lan") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1099, groups: [{ path: [THANG_LONG, [20, 330], [60, 345], [20, 330], THANG_LONG], count: 1, spread: [3,3], color: GOLD, timing: [[0.05,0],[0.95,1]] }], progress: p0, visible: () => clock.near("tua-lan") }));
  // 2. "nam-chinh": đoàn thuyền (ngà) rời Thăng Long theo đường biển xuống phương nam theo thanh kéo; đốm ngà (Nguyên phi) sáng ở Thăng Long (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-chinh"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1109, groups: [{ path: [THANG_LONG, [100, 270], [280, 250], [300, 100], NHAT_LE, [300, -150], [250, -300], PHAT_THE], count: 30, spread: [20,120], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-chinh") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-chinh") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(PHAT_THE, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("nam-chinh") * smoothstep(0.85, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "ba-chau": ba đốm vàng (ba châu) sáng dần ở giữa dải đất; đoàn thuyền (ngà) trở về phương bắc (diễn hoạ).
  const p2 = run("ba-chau", 28);
  { const S: Pt[] = [[40, 160], [100, 110], [60, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.15, 0.25 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-chau") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1149, groups: [{ path: [PHAT_THE, [300, -150], [300, 100], [280, 250], THANG_LONG], count: 20, spread: [20,100], color: NGHIA, timing: [[0.2,0],[1,1]] }], progress: p2, visible: () => clock.near("ba-chau") }));
  // 4. "ve-sau": đốm ngà (Nguyên phi) sáng ở Thăng Long; người (son) tụ về; đốm vàng nhỏ ở các chùa quanh kinh (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-56, 347], [-111, 389], [-176, 362], [-184, 293], [-129, 251], [-64, 278]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.08, 0.44999999999999996 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1179, groups: [{ path: [[-300, 200], THANG_LONG], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[50, 200], THANG_LONG], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
