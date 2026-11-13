import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG_SON, MO_NHAI, DO_LUONG, VINH_N, NAM_KY } from "./terrain";

type Pt = [number, number];

// Bắc Sơn, Nam Kỳ và Đô Lương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lang-son","bac-son","nam-ky","do-luong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG_SON, 24], [MO_NHAI, 24], [VINH_N, 24], [NAM_KY, 40]];

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
    seed: 1940,
  });

  // 1. "lang-son": quân Nhật (xanh nhạt) từ biên giới phía bắc tràn xuống Lạng Sơn; đồn Pháp (đốm ngà) tắt; tàn quân (ngà) chạy về phía nam (diễn hoạ).
  const p0 = run("lang-son", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1950, groups: [{ path: [[50, 390], [50, 250], [50, 160]], count: 60, spread: [6,20], color: DICH, timing: [[0.02,0],[0.55,1]] }], progress: p0, visible: () => clock.near("lang-son") }));
  { const S: Pt[] = [[50, 160], [10, 190], [90, 200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (1 - smoothstep(0.45, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lang-son") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1970, groups: [{ path: [[50, 160], [-40, 60], [-60, -60]], count: 40, spread: [4,16], color: NGHIA, timing: [[0.45,0],[0.95,1]] }], progress: p0, visible: () => clock.near("lang-son") }));
  // 2. "bac-son": theo thanh kéo, người các bản (son) kéo về đồn Mỏ Nhài; lửa đốt sổ sách ở đồn (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["bac-son"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1980, groups: [{ path: [[44, 98], [-80, 60]], count: 24, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-78, 190], [-80, 60]], count: 24, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-203, 102], [-80, 60]], count: 24, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-158, -44], [-80, 60]], count: 24, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[-5, -46], [-80, 60]], count: 24, spread: [4,16], color: SON, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("bac-son") }));
  world.add(createFires({ sites: [[-80, 60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("bac-son") * smoothstep(0.7, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-80, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bac-son") })); }
  // 3. "nam-ky": đêm 22 tháng 11, đốm son lần lượt bừng lên ở nhiều làng Nam Kỳ; vài nơi có lửa (diễn hoạ).
  const p2 = run("nam-ky", 28);
  { const S: Pt[] = [[90, -150], [40, -120], [150, -110], [20, -190], [130, -200], [60, -230], [170, -170], [0, -140], [110, -90]]; world.add(createGlows({ count: S.length, color: SON, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-ky") })); }
  world.add(createFires({ sites: [[40, -120], [130, -200], [0, -140]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nam-ky") * smoothstep(0.4, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "do-luong": lính (son) từ đồn Chợ Rạng chiếm đồn Đô Lương rồi theo đường về Vinh; đốm vàng ở Vinh tắt (kế hoạch không thành) (diễn hoạ).
  const p3 = run("do-luong", 28);
  { const S: Pt[] = [[-130, -60]]; world.add(createGlows({ count: S.length, color: SON, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-luong") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 2040, groups: [{ path: [[-200, 0], [-130, -60], [-30, -90]], count: 20, spread: [2,6], color: SON, timing: [[0.05,0],[0.8,1]] }], progress: p3, visible: () => clock.near("do-luong") }));
  { const S: Pt[] = [[-30, -90]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (1 - smoothstep(0.8, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-luong") })); }
};

export default setup;
