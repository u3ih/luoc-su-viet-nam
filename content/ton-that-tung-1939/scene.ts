import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HA_NOI, PHU_DOAN, HUE, MAT } from "./terrain";

type Pt = [number, number];

// Tôn Thất Tùng và lá gan — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["xuat-than","noi-tru","la-gan","mo-gan-kho"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 40], [HUE, 24], [MAT, 72]];

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
    seed: 1939,
  });

  // 1. "xuat-than": đốm vàng nhỏ (cậu bé) ở Huế; chấm ngà đi ra Hà Nội học (diễn hoạ).
  const p0 = run("xuat-than", 28);
  { const S: Pt[] = [[180, -300]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-than") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1959, groups: [{ path: [[180, -300], [60, -120], [-75, 35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.25,0],[0.85,1]] }], progress: p0, visible: () => clock.near("xuat-than") }));
  { const S: Pt[] = [[-80, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xuat-than") })); }
  // 2. "noi-tru": sinh viên (son) tụ trước bệnh viện Phủ Doãn; một đốm ngà (người trúng tuyển nội trú) sáng lên (diễn hoạ).
  const p1 = run("noi-tru", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1979, groups: [{ path: [[-160, -60], [-65, 15]], count: 30, spread: [3,14], color: SON, timing: [[0.04,0],[0.55,1]] }], progress: p1, visible: () => clock.near("noi-tru") }));
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("noi-tru") })); }
  // 3. "la-gan": theo thanh kéo, các đốm vàng nối nhau thành cây mạch máu phân nhánh (bản đồ mạch máu của gan, cách điệu) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["la-gan"] ?? 0) / 0.9);
  { const S: Pt[] = [[80, -60], [80, -45], [80, -30], [80, -15], [80, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.04, 0.16999999999999998 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-gan") })); }
  { const S: Pt[] = [[80, 0], [67, 13], [53, 27], [40, 40], [80, 0], [93, 13], [107, 27], [120, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.25 + i * 0.03, 0.4 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-gan") })); }
  { const S: Pt[] = [[40, 40], [30, 55], [20, 70], [40, 40], [48, 58], [55, 75], [120, 40], [113, 58], [105, 75], [120, 40], [133, 55], [145, 70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 17, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.5 + i * 0.025, 0.65 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-gan") })); }
  { const S: Pt[] = [[10, 85], [25, 92], [55, 92], [100, 92], [130, 90], [155, 82]]; world.add(createGlows({ count: S.length, color: DICH, size: 19, minPx: 17, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.75 + i * 0.03, 0.9 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("la-gan") })); }
  // 4. "mo-gan-kho": cột đốm vàng (các công trình) cao dần; thế hệ học trò (son) tỏa đi (diễn hoạ).
  const p3 = run("mo-gan-kho", 28);
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-gan-kho") })); }
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 15, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.15000000000000002 + i * 0.12, 0.30000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-gan-kho") })); }
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 24, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-gan-kho") })); }
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35000000000000003 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-gan-kho") })); }
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 41, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45 + i * 0.12, 0.6 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-gan-kho") })); }
  { const S: Pt[] = [[-60, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("mo-gan-kho") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2099, groups: [{ path: [[-60, 20], [100, -80]], count: 14, spread: [3,10], color: SON, timing: [[0.2,0],[0.8,1]] }, { path: [[-60, 20], [-200, -60]], count: 14, spread: [3,10], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p3, visible: () => clock.near("mo-gan-kho") }));
};

export default setup;
