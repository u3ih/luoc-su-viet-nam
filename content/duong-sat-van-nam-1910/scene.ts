import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HAI_PHONG, HA_NOI, LAO_CAI, VAN_NAM } from "./terrain";

type Pt = [number, number];

// Đường sắt Hải Phòng – Vân Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["truoc-day","khoi-cong","chien-tranh","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HAI_PHONG, 32], [HA_NOI, 40], [LAO_CAI, 24]];

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
    seed: 1910,
  });

  // 1. "truoc-day": thuyền (chấm ngà) ngược sông Hồng chậm chạp nhiều ngày, rồi đoàn người (son) đi bộ lên cao nguyên (diễn hoạ).
  const p0 = run("truoc-day", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1920, groups: [{ path: [[230, -150], [150, -120], [-40, 40], [-200, 220]], count: 3, spread: [2,6], color: NGHIA, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("truoc-day") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1930, groups: [{ path: [[-200, 220], [-325, 335]], count: 12, spread: [2,6], color: SON, timing: [[0.7,0],[0.98,1]] }], progress: p0, visible: () => clock.near("truoc-day") }));
  // 2. "khoi-cong": theo thanh kéo, chuỗi đốm vàng (đường ray) nối dài từ cảng Hải Phòng qua Hà Nội, Lào Cai lên Vân Nam; thợ (son) dọc tuyến (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khoi-cong"] ?? 0) / 0.9);
  { const S: Pt[] = [[230, -150], [194, -126], [159, -101], [123, -77], [87, -53], [51, -29], [16, -4], [-20, 20], [-49, 50], [-77, 80], [-106, 110], [-134, 140], [-163, 170], [-191, 200], [-220, 230], [-236, 246], [-251, 261], [-267, 277], [-283, 293], [-299, 309], [-314, 324], [-330, 340]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khoi-cong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1950, groups: [{ path: [[230, -150], [-20, 20], [-220, 230], [-330, 340]], count: 80, spread: [4,12], color: SON, drop: true, timing: [[0,0],[0.92,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khoi-cong") }));
  // 3. "chien-tranh": đoạn đường gần biên giới (đốm vàng) tắt dần (1940), về sau sáng lại (1957) (diễn hoạ).
  const p2 = run("chien-tranh", 28);
  { const S: Pt[] = [[-220, 230], [-242, 252], [-264, 274], [-286, 296], [-308, 318], [-330, 340]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.35, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chien-tranh") })); }
  { const S: Pt[] = [[-220, 230], [-242, 252], [-264, 274], [-286, 296], [-308, 318], [-330, 340]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7 + i * 0.03, 0.85 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chien-tranh") })); }
  { const S: Pt[] = [[-20, 20], [-49, 50], [-77, 80], [-106, 110], [-134, 140], [-163, 170], [-191, 200], [-220, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chien-tranh") })); }
  // 4. "ngay-nay": hai tuyến ngày nay (đốm ngà) Hà Nội – Lào Cai và Hà Nội – Hải Phòng; tàu (chấm vàng) chạy (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[230, -150], [197, -127], [163, -105], [130, -82], [97, -59], [63, -37], [30, -14], [-3, 9], [-33, 34], [-60, 62], [-87, 90], [-113, 118], [-140, 146], [-167, 174], [-193, 202], [-220, 230]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 6, seed: 2000, groups: [{ path: [[230, -150], [-15, 20]], count: 2, spread: [1,3], color: GOLD, timing: [[0.05,0],[0.6,1]] }, { path: [[-20, 20], [-215, 225]], count: 2, spread: [1,3], color: GOLD, timing: [[0.3,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
