import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRUNG_TAM, GO_A, GO_B, GO_C, GO_D } from "./terrain";

type Pt = [number, number];

// Thánh địa Cát Tiên — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ban-dia","khai-quat","hien-vat","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUNG_TAM, 32], [GO_A, 16], [GO_B, 16], [GO_C, 16], [GO_D, 16]];

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
    counts: { trees: 900, bushes: 700, grass: 1600, reeds: 500 },
    forestAt: 0.4,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 450,
  });

  // 1. "ban-dia": vài chấm ngà (cán bộ bảo tàng) đi dọc bờ sông; đốm vàng mờ (di vật người dân nhặt được) rải rác (diễn hoạ).
  const p0 = run("ban-dia", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 460, groups: [{ path: [[-300, 120], [-100, 30], [0, 20]], count: 4, spread: [6,10], color: NGHIA, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("ban-dia") }));
  { const S: Pt[] = [[-100, 10], [60, 10], [-30, 60], [130, 80], [10, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.5 * smoothstep(0.3 + i * 0.08, 0.44999999999999996 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-dia") })); }
  // 2. "khai-quat": theo thanh kéo, từng gò lần lượt được khai quật: nền đền (cụm đốm vàng) hiện ra, lối đốm ngà dẫn xuống bờ sông (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khai-quat"] ?? 0) / 0.9);
  { const S: Pt[] = [[-105, 5], [-100, 5], [-95, 5], [-105, 10], [-100, 10], [-95, 10], [-105, 15], [-100, 15], [-95, 15]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[55, 5], [60, 5], [65, 5], [55, 10], [60, 10], [65, 10], [55, 15], [60, 15], [65, 15]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.25 + i * 0.01, 0.4 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[-35, 55], [-30, 55], [-25, 55], [-35, 60], [-30, 60], [-25, 60], [-35, 65], [-30, 65], [-25, 65]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.01, 0.65 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[125, 75], [130, 75], [135, 75], [125, 80], [130, 80], [135, 80], [125, 85], [130, 85], [135, 85]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.01, 0.85 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  { const S: Pt[] = [[10, 30], [10, 20], [10, 10], [10, 0], [10, -10], [10, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.02, 1 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  // 3. "hien-vat": hàng trăm đốm vàng li ti (mảnh vàng chạm thần linh) lấp lánh quanh trung tâm (diễn hoạ).
  const p2 = run("hien-vat", 28);
  { const S: Pt[] = [[24, 30], [24, 34], [22, 37], [20, 40], [17, 42], [14, 44], [10, 44], [6, 44], [3, 42], [0, 40], [-2, 37], [-4, 34], [-4, 30], [-4, 26], [-2, 23], [0, 20], [3, 18], [6, 16], [10, 16], [14, 16], [17, 18], [20, 20], [22, 23], [24, 26], [32, 32], [31, 37], [29, 41], [26, 45], [23, 48], [19, 50], [15, 51], [10, 52], [6, 52], [1, 50], [-3, 48], [-6, 45], [-9, 41], [-11, 37], [-12, 32], [-12, 28], [-11, 23], [-9, 19], [-6, 15], [-3, 12], [1, 10], [5, 9], [10, 8], [14, 8], [19, 10], [23, 12], [26, 15], [29, 19], [31, 23], [32, 28]]; world.add(createGlows({ count: S.length, color: GOLD, size: 5, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.008, 0.18 + i * 0.008, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hien-vat") })); }
  // 4. "ve-sau": các gò còn sáng mờ; ba đốm câu hỏi (ngà) lơ lửng trên thánh địa (chủ nhân còn tranh luận) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-100, 10], [60, 10], [-30, 60], [130, 80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.5 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-40, 30], [10, 40], [60, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
