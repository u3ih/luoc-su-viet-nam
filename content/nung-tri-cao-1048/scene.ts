import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, QUANG_NGUYEN, UNG_CHAU, QUANG_CHAU_N, THANG_LONG_N } from "./terrain";

type Pt = [number, number];

// Nùng Trí Cao — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quang-nguyen","dai-lich","quang-chau","dich-thanh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUANG_NGUYEN, 24], [UNG_CHAU, 24], [QUANG_CHAU_N, 24], [THANG_LONG_N, 24]];

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
    seed: 1048,
  });

  // 1. "quang-nguyen": đốm vàng nhỏ (mỏ vàng, bạc) quanh châu Quảng Nguyên; hai đốm ở xa (Thăng Long phía nam, Ung Châu phía bắc) (diễn hoạ).
  const p0 = run("quang-nguyen", 28);
  { const S: Pt[] = [[-82, -48], [-111, -21], [-149, -33], [-158, -72], [-129, -99], [-91, -87]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quang-nguyen") })); }
  { const S: Pt[] = [[-60, -170], [-20, 120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.15, 0.44999999999999996 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quang-nguyen") })); }
  // 2. "dai-lich": đoàn người (son) dựng nước ở Quảng Nguyên; quân Lý (ngà) từ Thăng Long lên đưa Trí Cao về rồi trả lại (diễn hoạ).
  const p1 = run("dai-lich", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1078, groups: [{ path: [[-98, -60], [-102, -47], [-113, -39], [-127, -39], [-138, -47], [-142, -60], [-138, -73], [-127, -81], [-113, -81], [-102, -73], [-98, -60]], count: 30, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("dai-lich") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1088, groups: [{ path: [[-60, -170], [-110, -70], [-60, -170]], count: 30, spread: [4,12], color: NGHIA, timing: [[0.15,0],[0.9,1]] }], progress: p1, visible: () => clock.near("dai-lich") }));
  // 3. "quang-chau": theo thanh kéo, đoàn quân (son) từ Ung Châu tiến xuống phía đông, vây Quảng Châu (đốm ngà) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["quang-chau"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1098, groups: [{ path: [[-120, -60], [-20, 120], [80, 80], [150, 50]], count: 70, spread: [6,18], color: SON, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("quang-chau") }));
  { const S: Pt[] = [[150, 50]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quang-chau") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring([150, 50], 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: (ctx) => clock.near("quang-chau") * smoothstep(0.8, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "dich-thanh": đoàn quân Tống (xanh nhạt) từ phía bắc xuống; đoàn quân (son) tan, chạy về phía tây; đốm vàng (đền thờ) sáng ở Cao Bằng về sau (diễn hoạ).
  const p3 = run("dich-thanh", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1128, groups: [{ path: [[60, 380], [20, 200], [-20, 130]], count: 50, spread: [6,18], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: p3, visible: () => clock.near("dich-thanh") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1138, groups: [{ path: [[-20, 120], [-200, 80], [-380, 60]], count: 40, spread: [6,18], color: SON, timing: [[0.4,0],[0.95,1]] }], progress: p3, visible: () => clock.near("dich-thanh") }));
  { const S: Pt[] = [[-120, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dich-thanh") })); }
};

export default setup;
