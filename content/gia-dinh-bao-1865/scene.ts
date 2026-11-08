import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TOA_SOAN } from "./terrain";

type Pt = [number, number];

// Gia Định báo — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nghi-dinh","so-dau","truong-vinh-ky","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TOA_SOAN, 56]];

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
    seed: 1865,
  });

  // 1. "nghi-dinh": đốm ngà (Trương Vĩnh Ký) từ bến sông về; đốm vàng (nghị định) sáng ở tòa soạn (diễn hoạ).
  const p0 = run("nghi-dinh", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1875, groups: [{ path: [[330, -400], [240, -100], [40, 40]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.6,1]] }], progress: p0, visible: () => clock.near("nghi-dinh") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 29, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nghi-dinh") })); }
  // 2. "so-dau": theo thanh kéo, những vòng đốm vàng (số báo) lan từ tòa soạn ra các tỉnh; học trò (son) ở các trường đọc báo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["so-dau"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 32, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("so-dau") })); }
  { const S: Pt[] = [[80, 40], [57, 97], [0, 120], [-57, 97], [-80, 40], [-57, -17], [0, -40], [57, -17], [169, 57], [138, 139], [70, 195], [-17, 209], [-99, 178], [-155, 110], [-169, 23], [-138, -59], [-70, -115], [17, -129], [99, -98], [155, -30], [265, 94], [224, 191], [149, 265], [52, 305], [-54, 305], [-151, 264], [-225, 189], [-265, 92], [-265, -14], [-224, -111], [-149, -185], [-52, -225], [54, -225], [151, -184], [225, -109], [265, -12]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.025, 0.2 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("so-dau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1915, groups: [{ path: [[-250, 200], [-170, 120]], count: 10, spread: [26,50], color: SON, timing: [[0.4,0],[0.9,1]] }, { path: [[-200, -250], [-140, -150]], count: 10, spread: [26,50], color: SON, timing: [[0.5,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("so-dau") }));
  // 3. "truong-vinh-ky": hai đốm ngà (Trương Vĩnh Ký, Huỳnh Tịnh Của) ở tòa soạn; nhiều đốm vàng nhỏ (khảo cứu, thơ văn, truyện) quanh (diễn hoạ).
  const p2 = run("truong-vinh-ky", 28);
  { const S: Pt[] = [[-8, 40], [8, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truong-vinh-ky") })); }
  { const S: Pt[] = [[24, 40], [21, 52], [12, 61], [0, 64], [-12, 61], [-21, 52], [-24, 40], [-21, 28], [-12, 19], [0, 16], [12, 19], [21, 28]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.04, 0.44999999999999996 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truong-vinh-ky") })); }
  // 4. "ve-sau": nhiều đốm ngà (người đọc chữ Quốc ngữ) sáng dần khắp vùng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-200, 100], [-100, 250], [150, 200], [180, 50], [-250, -100], [100, -200], [-50, -300], [150, -300], [-300, 300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.09, 0.2 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
