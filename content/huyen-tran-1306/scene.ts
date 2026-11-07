import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, THANG_LONG, HO_SON, BO_CHINH, O_CHAU, LY_CHAU, NGU_PHONG, HAI_VAN, CHIEM } from "./terrain";

type Pt = [number, number];

// Công chúa Huyền Trân — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["van-du","ban-cai","hon-le","tro-ve","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 48], [BO_CHINH, 40], [O_CHAU, 36], [LY_CHAU, 36], [CHIEM, 48]];

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
    counts: { trees: 520, bushes: 600, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1306,
  });

  // 1. "van-du": một đốm ngà cùng vài người (son) đi từ Bố Chính về phương nam tới Chiêm Thành, đốm vàng sáng ở Chiêm Thành (diễn hoạ).
  const p0 = run("van-du", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1316, groups: [{ path: [BO_CHINH, [80, 40], [160, -120], [200, -230], CHIEM], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.8,1]] }], progress: p0, visible: () => clock.near("van-du") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1326, groups: [{ path: [BO_CHINH, [80, 40], [160, -120], [200, -230], CHIEM], count: 8, spread: [10,30], color: SON, timing: [[0.03,0],[0.8,0.98]] }], progress: p0, visible: () => clock.near("van-du") }));
  { const S: Pt[] = [CHIEM]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("van-du") })); }
  // 2. "ban-cai": các nhóm sứ (xanh nhạt) từ phương nam đi lên Thăng Long; người (son) trong triều tụ lại, chia hai phía (diễn hoạ).
  const p1 = run("ban-cai", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1346, groups: [{ path: [[150, 30], [30, 200], THANG_LONG], count: 4, spread: [10,20], color: DICH, timing: [[0.02,0],[0.5,1]] }, { path: [[200, -100], [80, 120], [-60, 280], THANG_LONG], count: 4, spread: [10,20], color: DICH, timing: [[0.35,0],[0.95,1]] }], progress: p1, visible: () => clock.near("ban-cai") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1356, groups: [{ path: [[-280, 360], [-180, 345]], count: 18, spread: [30,20], color: SON, timing: [[0.05,0],[0.5,1]] }, { path: [[-60, 380], [-120, 350]], count: 4, spread: [12,10], color: SON, timing: [[0.05,0],[0.5,1]] }], progress: p1, visible: () => clock.near("ban-cai") }));
  // 3. "hon-le": đoàn đưa công chúa (đốm ngà + người son) đi từ Thăng Long về phương nam theo thanh kéo; vùng châu Ô, châu Lý sáng dần (vàng) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["hon-le"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1366, groups: [{ path: [THANG_LONG, [-40, 230], BO_CHINH, [70, 40], [160, -120], [200, -230], CHIEM], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("hon-le") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1376, groups: [{ path: [THANG_LONG, [-40, 230], BO_CHINH, [70, 40], [160, -120], [200, -230], CHIEM], count: 24, spread: [14,60], color: SON, timing: [[0,0],[1,0.97]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("hon-le") }));
  { const S: Pt[] = [O_CHAU, [70, -30], LY_CHAU, [20, -60], [110, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.5 + i * 0.08, 0.65 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hon-le") })); }
  // 4. "tro-ve": một chấm ngà (thuyền) rời bờ Chiêm Thành ra biển rồi chậm rãi đi lên phía bắc dọc bờ (diễn hoạ).
  const p3 = run("tro-ve", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1396, groups: [{ path: [[230, -300], [320, -250], [330, -50], [320, 150], [270, 270]], count: 3, spread: [6,12], color: NGHIA, timing: [[0.03,0],[1,1]] }], progress: p3, visible: () => clock.near("tro-ve") }));
  { const S: Pt[] = [CHIEM]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-ve") })); }
  // 5. "ve-sau": đốm vàng sáng ở Hổ Sơn và ở Ngũ Phong, các nhóm người (son) đến đứng lặng (diễn hoạ).
  const p4 = run("ve-sau", 28);
  { const S: Pt[] = [HO_SON, NGU_PHONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.1 + i * 0.25, 0.25 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1426, groups: [{ path: [[-150, 280], HO_SON], count: 12, spread: [26,40], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[20, 40], NGU_PHONG], count: 12, spread: [26,40], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
};

export default setup;
