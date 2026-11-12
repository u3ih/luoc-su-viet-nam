import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRUONG, HUE, SAI_GON, PHNOM_PENH, VIENTIANE, TRIEN_LAM, PHU_LY, SON_TAY, DA_LAT } from "./terrain";

type Pt = [number, number];

// Trường Mỹ thuật Đông Dương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thanh-lap","thi-tuyen","trien-lam","so-tan"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUONG, 40], [TRIEN_LAM, 32]];

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
    seed: 1925,
  });

  // 1. "thanh-lap": đốm vàng (trường) sáng ở Hà Nội; sinh viên (son) tụ về (diễn hoạ).
  const p0 = run("thanh-lap", 28);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thanh-lap") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1945, groups: [{ path: [[-150, -60], [-5, 35]], count: 20, spread: [3,14], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[150, 120], [5, 45]], count: 20, spread: [3,14], color: SON, timing: [[0.2,0],[0.8,1]] }], progress: p0, visible: () => clock.near("thanh-lap") }));
  // 2. "thi-tuyen": năm nơi tuyển sinh (đốm xanh nhạt) cùng sáng; bài thi (chấm ngà) từ các nơi gửi về Hà Nội (diễn hoạ).
  const p1 = run("thi-tuyen", 28);
  { const S: Pt[] = [[0, 40], [120, -150], [220, -310], [-40, -300], [-210, -110]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-tuyen") })); }
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1965, groups: [{ path: [[120, -150], [5, 35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.3,0],[0.8,1]] }, { path: [[220, -310], [5, 35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.3,0],[0.85,1]] }, { path: [[-40, -300], [0, 35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.3,0],[0.85,1]] }, { path: [[-210, -110], [-5, 35]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.3,0],[0.8,1]] }], progress: p1, visible: () => clock.near("thi-tuyen") }));
  // 3. "trien-lam": theo thanh kéo, tranh (chấm vàng) lên đường từ Hà Nội tới các phòng triển lãm (đốm ngà) ở góc tây bắc, sáng lần lượt (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["trien-lam"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trien-lam") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 1985, groups: [{ path: [[0, 40], [-140, 170], [-265, 275]], count: 6, spread: [3,8], color: GOLD, timing: [[0.02,0],[0.5,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("trien-lam") }));
  { const S: Pt[] = [[-270, 280], [-330, 210], [-210, 330], [-340, 320], [-220, 220], [-300, 350]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.5 + i * 0.07, 0.65 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("trien-lam") })); }
  // 4. "so-tan": sinh viên (son) rời Hà Nội chia ba ngả: Phủ Lý, Sơn Tây, Đà Lạt; đốm vàng của trường tắt (1945) (diễn hoạ).
  const p3 = run("so-tan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2005, groups: [{ path: [[0, 40], [60, -60]], count: 12, spread: [3,10], color: SON, timing: [[0.05,0],[0.5,1]] }, { path: [[0, 40], [-120, 80]], count: 14, spread: [3,10], color: SON, timing: [[0.05,0],[0.5,1]] }, { path: [[0, 40], [170, -250]], count: 14, spread: [3,10], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p3, visible: () => clock.near("so-tan") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.75, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("so-tan") })); }
};

export default setup;
