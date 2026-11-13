import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PANDURANGA, LANG_CHAM, HUE_P } from "./terrain";

type Pt = [number, number];

// Trấn Thuận Thành — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["panduranga","nam-1693","tu-tri","nam-1832"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PANDURANGA, 32], [LANG_CHAM, 24]];

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
    seed: 1693,
  });

  // 1. "panduranga": đốm vàng (kinh đô Panduranga); các làng Chăm (đốm ngà); thuyền buôn (ngà) ra biển nối với thế giới Mã Lai (diễn hoạ).
  const p0 = run("panduranga", 28);
  { const S: Pt[] = [[20, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("panduranga") })); }
  { const S: Pt[] = [[-60, -90], [80, -80], [-90, 30], [60, 60], [-20, -150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.15 + i * 0.05, 0.3 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("panduranga") })); }
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1723, groups: [{ path: [[150, -20], [280, -100], [380, -200]], count: 4, spread: [4,10], color: NGHIA, timing: [[0.2,0],[0.9,1]] }], progress: p0, visible: () => clock.near("panduranga") }));
  // 2. "nam-1693": theo thanh kéo, quân chúa Nguyễn (son) từ phía bắc tiến vào Panduranga; các làng Chăm (ngà) dấy lên, vòng người quanh các làng (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["nam-1693"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1733, groups: [{ path: [[60, 380], [40, 150], [20, -10]], count: 60, spread: [6,18], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-1693") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1743, groups: [{ path: [[-42, -90], [-45, -79], [-54, -73], [-66, -73], [-75, -79], [-78, -90], [-75, -101], [-66, -107], [-54, -107], [-45, -101], [-42, -90]], count: 20, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }, { path: [[-74, 30], [-77, 39], [-85, 45], [-95, 45], [-103, 39], [-106, 30], [-103, 21], [-95, 15], [-85, 15], [-77, 21], [-74, 30]], count: 16, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }, { path: [[96, -80], [93, -71], [85, -65], [75, -65], [67, -71], [64, -80], [67, -89], [75, -95], [85, -95], [93, -89], [96, -80]], count: 16, spread: [1,6], color: NGHIA, drop: true, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-1693") }));
  { const S: Pt[] = [[20, -20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.5, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1693") })); }
  { const S: Pt[] = [[20, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1693") })); }
  // 3. "tu-tri": đốm ngà (trấn Thuận Thành tự trị) sáng lâu dài; về sau giao tranh (lửa) thời Tây Sơn – Nguyễn Ánh (diễn hoạ).
  const p2 = run("tu-tri", 28);
  { const S: Pt[] = [[20, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-tri") })); }
  { const S: Pt[] = [[70, -20], [55, 15], [20, 30], [-15, 15], [-30, -20], [-15, -55], [20, -70], [55, -55]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.1 + i * 0.004, 0.25 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-tri") })); }
  { const S: Pt[] = [[108, -2], [87, 40], [49, 65], [2, 68], [-40, 47], [-65, 9], [-68, -38], [-47, -80], [-9, -105], [38, -108], [80, -87], [105, -49]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.25 + i * 0.004, 0.4 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tu-tri") })); }
  world.add(createFires({ sites: [[-60, -90], [60, 60], [-90, 30]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("tu-tri") * smoothstep(0.6, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "nam-1832": đốm ngà (vua Chăm) bị đưa về phía bắc (Huế); đốm ngà ở kinh đô tắt; lửa ở các làng (các cuộc nổi dậy bị đàn áp) (diễn hoạ).
  const p3 = run("nam-1832", 28);
  world.add(createCrowd({ size: 6, height: ground, seed: 1813, groups: [{ path: [[20, -20], [40, 120], [60, 230]], count: 4, spread: [1,3], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("nam-1832") }));
  { const S: Pt[] = [[20, -20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.4, 0.6, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-1832") })); }
  world.add(createFires({ sites: [[-60, -90], [-90, 30], [80, -80], [-20, -150]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nam-1832") * smoothstep(0.55, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
