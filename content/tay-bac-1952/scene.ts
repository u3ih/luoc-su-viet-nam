import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NGHIA_LO, MOC_CHAU, SON_LA, NA_SAN, SAM_NUA } from "./terrain";

type Pt = [number, number];

// Tây Bắc và Thượng Lào — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nghia-lo","song-da","na-san","thuong-lao"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NGHIA_LO, 24], [MOC_CHAU, 24], [NA_SAN, 32]];

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
    seed: 1952,
  });

  // 1. "nghia-lo": các đại đoàn (son) vượt sông Hồng tiến về Nghĩa Lộ; hai đồn (đốm xanh nhạt) tắt, lửa bùng (diễn hoạ).
  const p0 = run("nghia-lo", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1962, groups: [{ path: [[330, 200], [240, 160], [140, 115]], count: 60, spread: [6,20], color: SON, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("nghia-lo") }));
  { const S: Pt[] = [[130, 110], [118, 125]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghia-lo") })); }
  world.add(createFires({ sites: [[130, 110], [118, 125]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("nghia-lo") * smoothstep(0.6, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "song-da": theo thanh kéo, các đoàn quân (son) vượt sông Đà tiến lên Mộc Châu và Sơn La; đồn Sơn La (đốm xanh nhạt) tắt (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["song-da"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1992, groups: [{ path: [[60, 60], [70, 0], [70, -110]], count: 40, spread: [4,14], color: SON, timing: [[0.02,0],[0.8,1]] }, { path: [[-20, 70], [-50, 10], [-90, -40]], count: 40, spread: [4,14], color: SON, timing: [[0.05,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("song-da") }));
  { const S: Pt[] = [[-90, -40], [70, -110]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("song-da") })); }
  // 3. "na-san": vòng điểm tựa (đốm xanh nhạt) quanh lòng chảo Nà Sản; các mũi quân (son) đánh vào rồi lui lại; lửa trên các đồi (diễn hoạ).
  const p2 = run("na-san", 28);
  { const S: Pt[] = [[-8, -126], [-16, -105], [-33, -92], [-54, -88], [-75, -96], [-88, -113], [-92, -134], [-84, -155], [-67, -168], [-46, -172], [-25, -164], [-12, -147]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("na-san") })); }
  { const S: Pt[] = [[-50, -130]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("na-san") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2032, groups: [{ path: [[74, -92], [-2, -115], [74, -92]], count: 14, spread: [4,12], color: SON, timing: [[0.03,0],[0.95,1]] }, { path: [[-48, 0], [-49, -80], [-48, 0]], count: 14, spread: [4,12], color: SON, timing: [[0.03,0],[0.95,1]] }, { path: [[-173, -88], [-97, -114], [-173, -88]], count: 14, spread: [4,12], color: SON, timing: [[0.03,0],[0.95,1]] }, { path: [[-128, -234], [-80, -170], [-128, -234]], count: 14, spread: [4,12], color: SON, timing: [[0.03,0],[0.95,1]] }, { path: [[25, -236], [-21, -171], [25, -236]], count: 14, spread: [4,12], color: SON, timing: [[0.03,0],[0.95,1]] }], progress: p2, visible: () => clock.near("na-san") }));
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([-50, -130], 42, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("na-san") * smoothstep(0.35, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "thuong-lao": các đại đoàn (son) tiến sang phía tây tới Sầm Nưa (đốm ngà) rồi quay về (diễn hoạ).
  const p3 = run("thuong-lao", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2052, groups: [{ path: [[40, -20], [-90, 30], [-180, 60], [-90, 30], [40, -20]], count: 60, spread: [6,18], color: SON, timing: [[0.02,0],[0.95,1]] }], progress: p3, visible: () => clock.near("thuong-lao") }));
  { const S: Pt[] = [[-180, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thuong-lao") })); }
};

export default setup;
