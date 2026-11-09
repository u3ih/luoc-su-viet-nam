import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GIA_DINH, PHU_QUOC, PONDI, LORIENT, VERSAILLES } from "./terrain";

type Pt = [number, number];

// Hiệp ước Versailles 1787 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["the-cung","duong-sang","ky-ket","ve-sau"]);
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
    counts: { trees: 220, bushes: 300, grass: 900, reeds: 200 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1787,
  });

  // 1. "the-cung": thuyền Nguyễn Ánh (đốm ngà) chạy từ Gia Định ra đảo Phú Quốc; thuyền Tây Sơn (xanh nhạt) đuổi theo (diễn hoạ).
  const p0 = run("the-cung", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1797, groups: [{ path: [[-260, 140], [-250, -100]], count: 2, spread: [4,8], color: NGHIA, timing: [[0.03,0],[0.55,1]] }], progress: p0, visible: () => clock.near("the-cung") }));
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 1807, groups: [{ path: [[-200, 160], [-215, -60]], count: 5, spread: [8,30], color: DICH, timing: [[0.2,0],[0.75,1]] }], progress: p0, visible: () => clock.near("the-cung") }));
  { const S: Pt[] = [[-280, 230]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("the-cung") })); }
  // 2. "duong-sang": theo thanh kéo, con tàu (đốm ngà) đi từ Phú Quốc qua Pondichéry tới cảng Lorient (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["duong-sang"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1827, groups: [{ path: [[-200, -150], [10, -150], [60, -80], [120, 60], [150, 150]], count: 1, spread: [3,3], color: NGHIA, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("duong-sang") }));
  { const S: Pt[] = [[60, -130], [150, 160]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.5, 0.5 + i * 0.5, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("duong-sang") })); }
  // 3. "ky-ket": ở Versailles (đốm vàng), hai bên ký hiệp ước: chấm ngà (Bá Đa Lộc, hoàng tử Cảnh) gặp người Pháp (xanh nhạt) (diễn hoạ).
  const p2 = run("ky-ket", 28);
  { const S: Pt[] = [[220, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  world.add(createCrowd({ size: 7, height: ground, seed: 1857, groups: [{ path: [[150, 165], [212, 222]], count: 2, spread: [3,4], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p2, visible: () => clock.near("ky-ket") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1867, groups: [{ path: [[300, 330], [230, 240]], count: 12, spread: [6,20], color: DICH, timing: [[0.1,0],[0.6,1]] }], progress: p2, visible: () => clock.near("ky-ket") }));
  // 4. "ve-sau": tàu (đốm ngà) trở lại Pondichéry chờ mãi; quân không đến (đốm xanh nhạt ở Pháp lịm); cuối cùng tàu về Gia Định (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[220, 230]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (1 - smoothstep(0.3, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 2, seed: 1887, groups: [{ path: [[150, 150], [120, 60], [60, -80], [-150, 0], [-260, 150]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.05,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
