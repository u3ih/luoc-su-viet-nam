import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOA_LU, PHU_LAN, AI_CHAU, TONG } from "./terrain";

type Pt = [number, number];

// Lê Long Đĩnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tranh-ngoi","dep-loan","kinh-sach","danh-gia"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOA_LU, 36], [PHU_LAN, 28], [AI_CHAU, 28], [TONG, 24]];

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
    seed: 1005,
  });

  // 1. "tranh-ngoi": bốn toán quân của các hoàng tử (son, ngà, xanh nhạt) kéo về Hoa Lư giằng co; cuối cùng một đốm vàng (ngôi vua) sáng ở kinh đô (diễn hoạ).
  const p0 = run("tranh-ngoi", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1015, groups: [{ path: [[-230, -40], [-90, 40]], count: 22, spread: [6,20], color: SON, timing: [[0.03,0],[0.55,1]] }, { path: [[90, 190], [-50, 80]], count: 22, spread: [6,20], color: DICH, timing: [[0.05,0],[0.6,1]] }, { path: [[60, -110], [-50, 40]], count: 22, spread: [6,20], color: NGHIA, timing: [[0.08,0],[0.6,1]] }], progress: p0, visible: () => clock.near("tranh-ngoi") }));
  { const S: Pt[] = [[-70, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tranh-ngoi") })); }
  // 2. "dep-loan": quân triều đình (son) từ Hoa Lư đánh trại Phù Lan (lửa vòng quanh trại), rồi xuống Ái Châu (diễn hoạ).
  const p1 = run("dep-loan", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1035, groups: [{ path: [[-70, 60], [140, 120]], count: 30, spread: [6,22], color: SON, timing: [[0.04,0],[0.45,1]] }, { path: [[-70, 60], [-30, -190]], count: 26, spread: [6,22], color: SON, timing: [[0.5,0],[0.95,1]] }], progress: p1, visible: () => clock.near("dep-loan") }));
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring([150, 130], 26, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("dep-loan") * smoothstep(0.2, 0.9, p1()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-30, -200]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dep-loan") })); }
  // 3. "kinh-sach": theo thanh kéo, đoàn sứ (chấm ngà) đi từ Hoa Lư sang nhà Tống rồi mang kinh sách (đốm vàng) về; dân Ái Châu (son) đào kênh (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["kinh-sach"] ?? 0) / 0.9);
  { const S: Pt[] = [[290, 300]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kinh-sach") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1075, groups: [{ path: [[-70, 60], [100, 170], [280, 290], [110, 185], [-60, 70]], count: 5, spread: [3,8], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("kinh-sach") }));
  { const S: Pt[] = [[-70, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.88 + i * 0.12, 1.03 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kinh-sach") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1095, groups: [{ path: [[-120, -60], [80, -60]], count: 30, spread: [3,10], color: SON, drop: true, timing: [[0.05,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("kinh-sach") }));
  // 4. "danh-gia": đốm vàng ở Hoa Lư lụi dần (vua mất); một đốm ngà (Lý Công Uẩn) sáng lên giữa vòng triều thần (son) (diễn hoạ).
  const p3 = run("danh-gia", 28);
  { const S: Pt[] = [[-70, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.35, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("danh-gia") })); }
  { const S: Pt[] = [[-70, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("danh-gia") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1125, groups: [{ path: [[-34, 60], [-37, 74], [-45, 85], [-56, 93], [-70, 96], [-84, 93], [-95, 85], [-103, 74], [-106, 60], [-103, 46], [-95, 35], [-84, 27], [-70, 24], [-56, 27], [-45, 35], [-37, 46], [-34, 60]], count: 40, spread: [1,3], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("danh-gia") }));
};

export default setup;
