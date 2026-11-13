import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, COC_BO, PAC_BO, KHUOI_NAM, BAN } from "./terrain";

type Pt = [number, number];

// Pác Bó và Mặt trận Việt Minh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["coc-bo","khuoi-nam","lan-rong","giai-phong-quan"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PAC_BO, 32], [KHUOI_NAM, 24], [BAN, 32]];

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
    seed: 1941,
  });

  // 1. "coc-bo": một đốm ngà (Nguyễn Ái Quốc) cùng vài người (son) qua biên giới vào hang Cốc Bó; đốm vàng ở cửa hang, bàn đá bên suối (diễn hoạ).
  const p0 = run("coc-bo", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1951, groups: [{ path: [[-30, 330], [-40, 200], [-30, 128]], count: 5, spread: [2,4], color: SON, timing: [[0.02,0],[0.6,1]] }], progress: p0, visible: () => clock.near("coc-bo") }));
  { const S: Pt[] = [[-30, 128]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("coc-bo") })); }
  { const S: Pt[] = [[-14, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("coc-bo") })); }
  // 2. "khuoi-nam": theo thanh kéo, các đại biểu (ngà) từ nhiều ngả tụ về lán họp trong rừng Khuổi Nậm (đốm vàng) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["khuoi-nam"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1981, groups: [{ path: [[225, 95], [110, 60]], count: 4, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[112, 180], [110, 60]], count: 4, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[-4, 99], [110, 60]], count: 4, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[38, -36], [110, 60]], count: 4, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }, { path: [[179, -38], [110, 60]], count: 4, spread: [4,16], color: NGHIA, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("khuoi-nam") }));
  { const S: Pt[] = [[110, 60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khuoi-nam") })); }
  // 3. "lan-rong": từ Pác Bó, các đốm ngà (hội cứu quốc) lần lượt sáng ở các bản xa dần; người (son) đi lại giữa các bản (diễn hoạ).
  const p2 = run("lan-rong", 28);
  { const S: Pt[] = [[-10, 40], [110, 60], [30, -120], [-180, -40], [200, -60], [-120, -220], [160, -240], [-260, 40], [280, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("lan-rong") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2011, groups: [{ path: [[-10, 40], [30, -120], [-120, -220]], count: 20, spread: [3,10], color: SON, timing: [[0.1,0],[0.9,1]] }, { path: [[110, 60], [200, -60], [160, -240]], count: 20, spread: [3,10], color: SON, timing: [[0.2,0],[0.95,1]] }], progress: p2, visible: () => clock.near("lan-rong") }));
  // 4. "giai-phong-quan": 34 chấm người (son) đứng thành hàng trong khu rừng; đốm vàng sáng giữa đội (diễn hoạ).
  const p3 = run("giai-phong-quan", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2021, groups: [{ path: [[18, -132], [42, -132], [18, -108], [42, -108], [18, -132]], count: 34, spread: [1,5], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("giai-phong-quan") }));
  { const S: Pt[] = [[30, -120]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("giai-phong-quan") })); }
};

export default setup;
