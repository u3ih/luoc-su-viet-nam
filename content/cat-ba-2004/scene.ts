import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CAT_BA, CAT_ONG } from "./terrain";

type Pt = [number, number];

// Quần đảo Cát Bà — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dao-ngoc","sinh-quyen","vooc","di-san"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#1f4a52", shallow: "#5f9a92" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2011,
  });

  // 1. "dao-ngoc": đốm ngà (Các Bà) sáng trên đảo lớn, đốm vàng (Các Ông) ở đảo bên cạnh; thuyền (chấm ngà) qua lại hai đảo (diễn hoạ).
  const p0 = run("dao-ngoc", 28);
  { const S: Pt[] = [[20, 10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-ngoc") })); }
  { const S: Pt[] = [[260, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.25 + i * 0.12, 0.4 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dao-ngoc") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2041, groups: [{ path: [[100, 15], [240, 20]], count: 3, spread: [3,8], color: NGHIA, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("dao-ngoc") }));
  // 2. "sinh-quyen": theo thanh kéo, các vùng sinh thái lần lượt sáng: rừng trên đảo (đốm xanh lá), rừng ngập mặn ven bờ (đốm ngà), rạn san hô ngoài khơi (đốm xanh nhạt) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["sinh-quyen"] ?? 0) / 0.9);
  { const S: Pt[] = [[-45, -45], [-15, -45], [15, -45], [45, -45], [-45, -15], [-15, -15], [15, -15], [45, -15], [-45, 15], [-15, 15], [15, 15], [45, 15], [-45, 45], [-15, 45], [15, 45], [45, 45]]; world.add(createGlows({ count: S.length, color: "#9be37a", size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.015, 0.16999999999999998 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sinh-quyen") })); }
  { const S: Pt[] = [[115, 0], [106, 44], [81, 81], [44, 106], [0, 115], [-44, 106], [-81, 81], [-106, 44], [-115, 0], [-106, -44], [-81, -81], [-44, -106], [0, -115], [44, -106], [81, -81], [106, -44]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.012, 0.5 + i * 0.012, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sinh-quyen") })); }
  { const S: Pt[] = [[167, 34], [148, 84], [115, 125], [71, 155], [19, 169], [-34, 167], [-84, 148], [-125, 115], [-155, 71], [-169, 19], [-167, -34], [-148, -84], [-115, -125], [-71, -155], [-19, -169], [34, -167], [84, -148], [125, -115], [155, -71], [169, -19]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.01, 0.8 + i * 0.01, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sinh-quyen") })); }
  // 3. "vooc": vài đốm vàng (voọc Cát Bà) di chuyển trên vách núi đá của đảo lớn (diễn hoạ).
  const p2 = run("vooc", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 45, seed: 2081, groups: [{ path: [[50, 0], [35, 35], [0, 50], [-35, 35], [-50, 0], [-35, -35], [0, -50], [35, -35], [50, 0]], count: 6, spread: [3,12], color: GOLD, timing: [[0,0],[1,1]] }], progress: p2, visible: () => clock.near("vooc") }));
  { const S: Pt[] = [[30, 0], [9, 29], [-24, 18], [-24, -18], [9, -29]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.08, 0.44999999999999996 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vooc") })); }
  // 4. "di-san": toàn quần đảo bừng sáng (đốm vàng trên mọi hòn đảo) — di sản thiên nhiên thế giới cùng vịnh Hạ Long (diễn hoạ).
  const p3 = run("di-san", 28);
  { const S: Pt[] = [[0, 0], [-150, 160], [170, 120], [200, -120], [-170, -150], [110, 230], [-60, -230], [260, 20], [-250, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.07, 0.2 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("di-san") })); }
};

export default setup;
