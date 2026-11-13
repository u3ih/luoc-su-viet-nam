import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAI_GON, CAY_MAI, TSN, MIEN_TAY } from "./terrain";

type Pt = [number, number];

// Nam Bộ kháng chiến — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quan-anh","cay-mai","vay-thanh","lan-rong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAI_GON, 48], [CAY_MAI, 32], [TSN, 32]];

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
    seed: 19459,
  });

  // 1. "quan-anh": đoàn quân Anh và Pháp (xanh nhạt) từ phía sông tiến vào Sài Gòn; các công sở (đốm ngà) đổi màu (diễn hoạ).
  const p0 = run("quan-anh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19469, groups: [{ path: [[170, 200], [100, 60], [60, 40]], count: 50, spread: [4,14], color: DICH, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("quan-anh") }));
  { const S: Pt[] = [[60, 40], [30, 70], [90, 10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (1 - smoothstep(0.6, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-anh") })); }
  { const S: Pt[] = [[60, 40], [30, 70], [90, 10]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.03, 0.85 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quan-anh") })); }
  // 2. "cay-mai": theo thanh kéo, các lãnh đạo Nam Bộ (ngà) rời Sài Gòn tụ về phố Cây Mai (đốm vàng) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["cay-mai"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 6, height: ground, seed: 19499, groups: [{ path: [[5, 45], [-110, 10]], count: 3, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[-108, 130], [-110, 10]], count: 3, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[-224, 49], [-110, 10]], count: 3, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[-182, -86], [-110, 10]], count: 3, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[-41, -88], [-110, 10]], count: 3, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("cay-mai") }));
  { const S: Pt[] = [[-110, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cay-mai") })); }
  // 3. "vay-thanh": tự vệ (son) từ ngoại ô khép vòng quanh Sài Gòn; lửa ở chợ Bến Thành; dân (ngà) tản cư ra nông thôn (diễn hoạ).
  const p2 = run("vay-thanh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19519, groups: [{ path: [[279, 62], [60, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.55,1]] }, { path: [[150, 241], [60, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.55,1]] }, { path: [[-68, 219], [60, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.55,1]] }, { path: [[-159, 18], [60, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.55,1]] }, { path: [[-30, -161], [60, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.55,1]] }, { path: [[188, -139], [60, 40]], count: 18, spread: [4,16], color: SON, timing: [[0.02,0],[0.55,1]] }], progress: p2, visible: () => clock.near("vay-thanh") }));
  world.add(createFires({ sites: [[70, 20]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("vay-thanh") * smoothstep(0.3, 0.9, p2()), size: 4, glow: () => 0.8 }));
  world.add(createCrowd({ size: 4, height: ground, seed: 19539, groups: [{ path: [[60, 40], [-150, -60]], count: 30, spread: [4,16], color: NGHIA, timing: [[0.2,0],[0.9,1]] }, { path: [[60, 40], [-60, 220]], count: 30, spread: [4,16], color: NGHIA, timing: [[0.25,0],[0.95,1]] }], progress: p2, visible: () => clock.near("vay-thanh") }));
  // 4. "lan-rong": đoàn quân Nam tiến (son) từ phía bắc xuống; các tỉnh miền Tây (đốm xanh nhạt) lần lượt bị chiếm; lực lượng kháng chiến (son) rút vào chiến khu (diễn hoạ).
  const p3 = run("lan-rong", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19549, groups: [{ path: [[-100, 390], [-60, 250], [-110, 30]], count: 40, spread: [4,14], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("lan-rong") }));
  { const S: Pt[] = [[-60, -140], [-160, -180], [-260, -230], [-330, -150], [-220, -320]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.1, 0.35 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lan-rong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 19569, groups: [{ path: [[-260, -230], [-340, -340]], count: 25, spread: [4,14], color: SON, timing: [[0.6,0],[0.98,1]] }], progress: p3, visible: () => clock.near("lan-rong") }));
};

export default setup;
