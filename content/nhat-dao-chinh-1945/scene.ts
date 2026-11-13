import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI_D, LANG_SON_D, HUE_D, BA_TO } from "./terrain";

type Pt = [number, number];

// Đêm 9 tháng 3 năm 1945 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dem-9-3","ba-to","de-quoc","thoai-vi"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI_D, 32], [HUE_D, 32], [BA_TO, 24]];

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
    seed: 19453,
  });

  // 1. "dem-9-3": theo thanh kéo, quân Nhật (xanh nhạt) cùng lúc đánh vào các đồn Pháp (đốm ngà) khắp sơ đồ; đồn tắt dần, lửa ở Lạng Sơn (diễn hoạ).
  const inp0 = (ctx: FrameCtx) => clamp((ctx.inputs["dem-9-3"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 19463, groups: [{ path: [[7, 151], [-60, 130]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[-111, 178], [-60, 130]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[-76, 62], [-60, 130]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[137, 181], [70, 160]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[19, 208], [70, 160]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[54, 92], [70, 160]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[87, 11], [20, -10]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[-31, 38], [20, -10]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[4, -78], [20, -10]], count: 14, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[97, -119], [30, -140]], count: 12, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }, { path: [[-37, -161], [30, -140]], count: 12, spread: [4,16], color: DICH, timing: [[0.02,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp0(ctx), visible: () => clock.near("dem-9-3") }));
  { const S: Pt[] = [[-60, 130], [70, 160], [20, -10], [30, -140], [-100, 40], [100, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp0(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-9-3") })); }
  world.add(createFires({ sites: [[70, 160], [60, 175]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("dem-9-3") * smoothstep(0.5, 0.9, inp0(ctx)), size: 3, glow: () => 0.8 }));
  // 2. "ba-to": đoàn biểu tình (son) từ sân trại giam kéo tới vây đồn Ba Tơ; đốm ngà ở đồn tắt, đốm vàng sáng (diễn hoạ).
  const p1 = run("ba-to", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19493, groups: [{ path: [[-20, -100], [10, -120], [30, -140]], count: 50, spread: [3,12], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[97, -119], [30, -140]], count: 10, spread: [4,16], color: SON, timing: [[0.3,0],[0.75,1]] }, { path: [[9, -73], [30, -140]], count: 10, spread: [4,16], color: SON, timing: [[0.3,0],[0.75,1]] }, { path: [[-37, -161], [30, -140]], count: 10, spread: [4,16], color: SON, timing: [[0.3,0],[0.75,1]] }, { path: [[51, -207], [30, -140]], count: 10, spread: [4,16], color: SON, timing: [[0.3,0],[0.75,1]] }], progress: p1, visible: () => clock.near("ba-to") }));
  { const S: Pt[] = [[30, -140]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-to") })); }
  { const S: Pt[] = [[30, -140]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-to") })); }
  // 3. "de-quoc": đốm vàng ở kinh đô Huế; một dòng người nhỏ (ngà) chở gạo từ nam ra bắc chậm chạp; các làng phía bắc (đốm ngà) mờ dần (nạn đói) (diễn hoạ).
  const p2 = run("de-quoc", 28);
  { const S: Pt[] = [[20, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("de-quoc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 19533, groups: [{ path: [[40, -260], [30, -140], [20, -10], [-60, 130]], count: 30, spread: [2,6], color: NGHIA, timing: [[0.05,0],[0.95,0.6]] }], progress: p2, visible: () => clock.near("de-quoc") }));
  { const S: Pt[] = [[-60, 130], [-120, 100], [0, 120], [-90, 180], [-20, 180]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (1 - smoothstep(0.5, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("de-quoc") })); }
  // 4. "thoai-vi": đốm vàng ở Huế mờ đi; các đốm son lần lượt sáng ở Hà Nội, Huế và nhiều nơi khác (diễn hoạ).
  const p3 = run("thoai-vi", 28);
  { const S: Pt[] = [[20, -10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.4, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thoai-vi") })); }
  { const S: Pt[] = [[-60, 130], [20, -10], [30, -140], [70, 160], [-100, 40], [100, 60], [-20, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.07, 0.35 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thoai-vi") })); }
};

export default setup;
