import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHU_DONG, TRAU_SON, SOC_SON, KINH } from "./terrain";

type Pt = [number, number];

// Thánh Gióng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["sach-chep","vuon-vai","ve-troi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_DONG, 48]];

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
    seed: 680,
  });

  // 1. "sach-chep": ba đốm ngà (ba sách chép truyện) sáng trên làng; chấm sáng (sứ giả) từ kinh đô tới làng (diễn hoạ).
  const p0 = run("sach-chep", 28);
  { const S: Pt[] = [[-140, -100], [-120, -95], [-100, -100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sach-chep") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 700, groups: [{ path: [KINH, [-250, -40], [-125, -115]], count: 1, spread: [3,3], color: GOLD, timing: [[0.4,0],[0.95,1]] }], progress: p0, visible: () => clock.near("sach-chep") }));
  // 2. "vuon-vai": theo thanh kéo, cột đốm ngà (cậu bé) lớn vụt lên; dân làng (son) mang cơm tới; cuối cùng đốm vàng (Gióng) phi về phía núi Trâu Sơn (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["vuon-vai"] ?? 0) / 0.9);
  { const S: Pt[] = [[-120, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-vai") })); }
  { const S: Pt[] = [[-120, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-vai") })); }
  { const S: Pt[] = [[-120, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.18 + i * 0.12, 0.32999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-vai") })); }
  { const S: Pt[] = [[-120, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.26 + i * 0.12, 0.41000000000000003 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-vai") })); }
  { const S: Pt[] = [[-120, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.34 + i * 0.12, 0.49 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-vai") })); }
  { const S: Pt[] = [[-120, -120]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 22, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.42000000000000004 + i * 0.12, 0.5700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-vai") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 770, groups: [{ path: [[-250, -60], [-125, -115]], count: 20, spread: [8,80], color: SON, timing: [[0.05,0],[0.6,1]] }, { path: [[0, -150], [-115, -120]], count: 16, spread: [8,80], color: SON, timing: [[0.1,0],[0.65,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("vuon-vai") }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 10, seed: 780, groups: [{ path: [[-120, -120], [40, -60], [180, 10]], count: 1, spread: [3,3], color: GOLD, timing: [[0.75,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("vuon-vai") }));
  // 3. "ve-troi": giặc (xanh nhạt) tan chạy ở chân núi Trâu Sơn; đốm vàng (Gióng) đuổi tới núi Sóc rồi bay lên trời và lịm (diễn hoạ).
  const p2 = run("ve-troi", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 790, groups: [{ path: [[200, 0], [395, -100]], count: 30, spread: [30,80], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p2, visible: () => clock.near("ve-troi") }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 10, seed: 800, groups: [{ path: [[180, 10], [100, 150], [40, 270]], count: 1, spread: [3,3], color: GOLD, timing: [[0.1,0],[0.55,1]] }], progress: p2, visible: () => clock.near("ve-troi") }));
  { const S: Pt[] = [[40, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (1 - smoothstep(0.9, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-troi") })); }
  { const S: Pt[] = [[40, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 110, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6100000000000001 + i * 0.12, 0.7600000000000001 + i * 0.12, k) * (1 - smoothstep(0.9, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-troi") })); }
  { const S: Pt[] = [[40, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 140, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.67 + i * 0.12, 0.8200000000000001 + i * 0.12, k) * (1 - smoothstep(0.9, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-troi") })); }
  { const S: Pt[] = [[40, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 170, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.73 + i * 0.12, 0.88 + i * 0.12, k) * (1 - smoothstep(0.9, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-troi") })); }
  { const S: Pt[] = [[40, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 200, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.79 + i * 0.12, 0.9400000000000001 + i * 0.12, k) * (1 - smoothstep(0.9, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-troi") })); }
  { const S: Pt[] = [[40, 280]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 230, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.8500000000000001 + i * 0.12, 1 + i * 0.12, k) * (1 - smoothstep(0.9, 1, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-troi") })); }
  // 4. "ve-sau": hội Gióng: đoàn rước (son, 120 phù giá) quanh đền; 28 chấm xanh nhạt (vai tướng giặc); đốm vàng (cờ lệnh) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 870, groups: [{ path: [[-70, -110], [-74, -91], [-85, -75], [-101, -64], [-120, -60], [-139, -64], [-155, -75], [-166, -91], [-170, -110], [-166, -129], [-155, -145], [-139, -156], [-120, -160], [-101, -156], [-85, -145], [-74, -129], [-70, -110]], count: 120, spread: [4,300], color: SON, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 880, groups: [{ path: [[-120, -150], [-100, -150]], count: 28, spread: [30,12], color: DICH, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[-120, -110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
