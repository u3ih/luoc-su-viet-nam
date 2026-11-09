import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CUA_DONG, KE_BANG, TIEN_SON } from "./terrain";

type Pt = [number, number];

// Phong Nha – Kẻ Bàng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["da-voi","dong-phong-nha","tham-hiem","ve-sau"]);
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
    water: { deep: "#2f4a48", shallow: "#86997a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 600, bushes: 600, grass: 1200, reeds: 200 },
    forestAt: 0.45,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2008,
  });

  // 1. "da-voi": thuyền nhỏ (chấm ngà) trên sông Son giữa vùng núi đá vôi (diễn hoạ).
  const p0 = run("da-voi", 28);
  world.add(createCrowd({ glow: true, size: 4, height: (x, z) => ground(x, z) + 2, seed: 2018, groups: [{ path: [[390, -60], [200, -30], [40, -10]], count: 4, spread: [6,160], color: NGHIA, timing: [[0.03,0],[1,1]] }], progress: p0, visible: () => clock.near("da-voi") }));
  // 2. "dong-phong-nha": theo thanh kéo, thuyền (son) ngược sông Son vào cửa động; văn tự Chăm (đốm ngà) sáng trên vách cửa động (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dong-phong-nha"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 2028, groups: [{ path: [[300, -50], [150, -25], [20, -8], [-40, 0]], count: 5, spread: [6,60], color: SON, timing: [[0,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dong-phong-nha") }));
  { const S: Pt[] = [[-46, 13], [-58, 11], [-62, 0], [-54, -9], [-42, -7], [-38, 4]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 7, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.06, 0.65 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dong-phong-nha") })); }
  // 3. "tham-hiem": đoàn thám hiểm (chấm ngà) lên động Tiên Sơn; đốm vàng lần lượt sáng dọc lòng động (7.729 m) vào khối núi (diễn hoạ).
  const p2 = run("tham-hiem", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2048, groups: [{ path: [[60, -60], [-20, 10], [-65, 45]], count: 18, spread: [4,40], color: NGHIA, timing: [[0.02,0],[0.5,1]] }], progress: p2, visible: () => clock.near("tham-hiem") }));
  { const S: Pt[] = [[-45, 0], [-64, 4], [-84, 9], [-104, 16], [-126, 24], [-147, 31], [-169, 36], [-190, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.07, 0.5 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tham-hiem") })); }
  // 4. "ve-sau": đốm vàng lớn (di sản thế giới) trên vùng núi; các cửa động (đốm vàng) quanh khối núi (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-140, 30]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-32, 52], [-79, 122], [-162, 138], [-232, 91], [-248, 8], [-201, -62], [-118, -78], [-48, -31]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.07, 0.4 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
