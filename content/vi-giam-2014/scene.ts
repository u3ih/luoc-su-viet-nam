import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, SAN, RUONG, LANG } from "./terrain";

type Pt = [number, number];

// Dân ca ví, giặm Nghệ Tĩnh — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["doi-thuong","hat-vi","hat-giam","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAN, 40], [RUONG, 64], [LANG, 40]];

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
    seed: 2016,
  });

  // 1. "doi-thuong": phường cấy (son) trên ruộng; phường vải (ngà) trong làng (diễn hoạ).
  const p0 = run("doi-thuong", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2026, groups: [{ path: [[-60, -160], [40, -170]], count: 24, spread: [10,100], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: p0, visible: () => clock.near("doi-thuong") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2036, groups: [{ path: [[-160, 50], [-140, 70]], count: 10, spread: [6,30], color: NGHIA, timing: [[0,1],[1,1]] }], progress: p0, visible: () => clock.near("doi-thuong") }));
  { const S: Pt[] = [[-150, 60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("doi-thuong") })); }
  // 2. "hat-vi": theo thanh kéo, hai phường hát (son, ngà) kéo về hai bên sân làng đối đáp; trăng (đốm vàng) lên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hat-vi"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 2056, groups: [{ path: [[-150, 60], [-50, 30]], count: 10, spread: [6,24], color: NGHIA, timing: [[0,0],[0.7,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hat-vi") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 2066, groups: [{ path: [[100, -60], [10, 30]], count: 10, spread: [6,24], color: SON, timing: [[0.05,0],[0.75,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("hat-vi") }));
  { const S: Pt[] = [[-20, 130]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hat-vi") })); }
  // 3. "hat-giam": hai nhóm đứng đối diện hát giặm; tiếng hát xen kẽ (đốm ngà, đốm son nhấp nháy) (diễn hoạ).
  const p2 = run("hat-giam", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2086, groups: [{ path: [[-60, 30], [-50, 30]], count: 8, spread: [4,20], color: NGHIA, timing: [[0,1],[1,1]] }, { path: [[0, 30], [10, 30]], count: 8, spread: [4,20], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("hat-giam") }));
  { const S: Pt[] = [[-50, 30], [10, 30], [-50, 30], [10, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.2, 0.2 + i * 0.2, k) * (1 - smoothstep(0.85, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hat-giam") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2106, groups: [{ path: [[-200, -40], [-30, 0]], count: 20, spread: [10,60], color: SON, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("hat-giam") }));
  // 4. "ve-sau": đò (chấm ngà) trên sông Lam — ví đò đưa; trăng (đốm vàng) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2116, groups: [{ path: [[-380, 165], [380, 160]], count: 4, spread: [8,200], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[0, 260]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 60, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
