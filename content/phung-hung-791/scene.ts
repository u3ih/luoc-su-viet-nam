import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DUONG_LAM, TONG_BINH, LANG_A, LANG_B } from "./terrain";

type Pt = [number, number];

// Phùng Hưng 791 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nghĩa quân; xanh nhạt = phía đối diện; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["duong-lam", "nam-791", "bo-cai", "nguon-su"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DUONG_LAM, 55], [TONG_BINH, 55], [LANG_A, 55], [LANG_B, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 791,
  });

  // 1. "duong-lam": các nhóm người (son) từ làng quanh tụ về Đường Lâm, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("duong-lam", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 791, groups: [{ path: [[-300, 260], [-240, 200], DUONG_LAM], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[-120, 40], [-160, 90], DUONG_LAM], count: 14, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("duong-lam") }));
  { const S: Pt[] = [DUONG_LAM]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("duong-lam") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(DUONG_LAM, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("duong-lam") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "nam-791": các nhóm người (son) từ Đường Lâm và các làng khác tụ về Tống Bình theo thanh kéo; đốm xanh nhạt sáng ở Tống Bình (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["vay-phu"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 801, groups: [{ path: [DUONG_LAM, [-100, 90], [-20, 40], TONG_BINH], count: 26, spread: [30,60], color: SON, timing: [[0,0],[1,0.95]] }, { path: [LANG_A, [-30, -30], TONG_BINH], count: 16, spread: [24,40], color: SON, timing: [[0,0],[1,0.95]] }, { path: [LANG_B, [90, 60], TONG_BINH], count: 16, spread: [24,40], color: SON, timing: [[0,0],[1,0.95]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("nam-791") }));
  { const S: Pt[] = [TONG_BINH]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nam-791") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(TONG_BINH, 36, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: (ctx) => clock.near("nam-791") * smoothstep(0.1, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "bo-cai": một quầng ngà sáng dần ở Tống Bình, các nhóm người (son) đến đứng quanh (diễn hoạ).
  const p2 = run("bo-cai", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 811, groups: [{ path: [[-100, 70], [-30, 35], TONG_BINH], count: 20, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[110, 100], [70, 50], TONG_BINH], count: 14, spread: [26,50], color: SON, timing: [[0.12,0],[0.85,1]] }], progress: p2, visible: () => clock.near("bo-cai") }));
  { const S: Pt[] = [TONG_BINH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("bo-cai") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(TONG_BINH, 34, (i / 6) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("bo-cai") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  // 4. "nguon-su": các đốm sáng mờ ở ba nơi (các chỗ nguồn khác nhau) sáng dần rồi dịu lại (diễn hoạ).
  const p3 = run("nguon-su", 28);
  { const S: Pt[] = [DUONG_LAM, TONG_BINH, LANG_B]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.2, 0.25 + i * 0.2, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguon-su") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 822, groups: [{ path: [[-260, 200], DUONG_LAM], count: 12, spread: [24,30], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p3, visible: () => clock.near("nguon-su") }));
};

export default setup;
