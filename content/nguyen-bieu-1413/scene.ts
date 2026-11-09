import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DOANH, TRAI_PHU, CAU, BINH_HO } from "./terrain";

type Pt = [number, number];

// Sứ thần Nguyễn Biểu — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["binh-ho","di-su","doi-dap","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DOANH, 44], [TRAI_PHU, 48], [BINH_HO, 32]];

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
    seed: 1413,
  });

  // 1. "binh-ho": làng Bình Hồ (đốm ngà); nghĩa quân nhà Hậu Trần (son) đóng ở doanh trại; chấm ngà (Nguyễn Biểu) tới doanh trại (diễn hoạ).
  const p0 = run("binh-ho", 28);
  { const S: Pt[] = [[-260, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("binh-ho") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1433, groups: [{ path: [[-120, -170], [-100, -150]], count: 30, spread: [12,50], color: SON, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("binh-ho") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1443, groups: [{ path: [[-260, -120], [-110, -140]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.1,0],[0.7,1]] }], progress: p0, visible: () => clock.near("binh-ho") }));
  // 2. "di-su": theo thanh kéo, thuyền sứ thần (đốm ngà) qua sông sang trại Trương Phụ (quân xanh nhạt) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["di-su"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1453, groups: [{ path: [[70, 100], [100, 130]], count: 40, spread: [16,60], color: DICH, timing: [[0,1],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("di-su") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1463, groups: [{ path: [[-90, -40], [0, 0], [70, 60]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("di-su") }));
  { const S: Pt[] = [[90, 110]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-su") })); }
  // 3. "doi-dap": đốm ngà (Nguyễn Biểu) bên chân cầu; nước triều dâng — đốm ngà lịm dần; quân (xanh nhạt) đứng trên bờ (diễn hoạ).
  const p2 = run("doi-dap", 28);
  { const S: Pt[] = [[180, -30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.65, 0.95, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-dap") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1493, groups: [{ path: [[150, 30], [175, 10]], count: 16, spread: [8,30], color: DICH, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("doi-dap") }));
  // 4. "ve-sau": đền thờ ông (đốm vàng) ở Bình Hồ và bên sông Lam; người đến viếng (son) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-260, -120], [-20, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.25, 0.25 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1513, groups: [{ path: [[-200, -260], [-250, -130]], count: 14, spread: [8,30], color: SON, timing: [[0.1,0],[0.7,1]] }, { path: [[60, -160], [-20, -70]], count: 14, spread: [8,30], color: SON, timing: [[0.3,0],[0.85,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
