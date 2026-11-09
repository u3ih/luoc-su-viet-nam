import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CHO, BAN_A, BAN_B, BAN_C, BAN_D } from "./terrain";

type Pt = [number, number];

// Cao nguyên đá Đồng Văn — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cao-nguyen","hoa-thach","dan-toc","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CHO, 48]];

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
    seed: 2019,
  });

  // 1. "cao-nguyen": các bản (đốm ngà) giữa núi đá; người (son) đi trên đường đá (diễn hoạ).
  const p0 = run("cao-nguyen", 28);
  { const S: Pt[] = [[-140, 120], [150, 110], [-160, -60], [170, -70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cao-nguyen") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2039, groups: [{ path: [[-140, 120], [-60, 60], [150, 110]], count: 12, spread: [4,120], color: SON, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("cao-nguyen") }));
  // 2. "hoa-thach": theo thanh kéo, các điểm hóa thạch (đốm vàng nhỏ) lần lượt hiện ra khắp cao nguyên (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["hoa-thach"] ?? 0) / 0.9);
  { const S: Pt[] = [[-90, 60], [80, 70], [-60, -40], [100, -30], [0, 110], [-130, 10], [140, 20], [30, -60], [-30, 150], [60, 160]]; world.add(createGlows({ count: S.length, color: GOLD, size: 9, minPx: 10, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.03 + i * 0.08, 0.18 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-thach") })); }
  // 3. "dan-toc": người từ các bản (son, ngà, xanh nhạt) đổ về chợ phiên (đốm vàng) (diễn hoạ).
  const p2 = run("dan-toc", 28);
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dan-toc") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2069, groups: [{ path: [[-140, 120], [-10, 25]], count: 14, spread: [6,40], color: SON, timing: [[0.03,0],[0.7,1]] }, { path: [[150, 110], [10, 25]], count: 14, spread: [6,40], color: NGHIA, timing: [[0.08,0],[0.75,1]] }, { path: [[-160, -60], [-10, 12]], count: 14, spread: [6,40], color: DICH, timing: [[0.12,0],[0.8,1]] }, { path: [[170, -70], [10, 12]], count: 14, spread: [6,40], color: SON, timing: [[0.16,0],[0.85,1]] }], progress: p2, visible: () => clock.near("dan-toc") }));
  // 4. "ve-sau": đốm vàng lớn (công viên địa chất toàn cầu) trên cao nguyên; các bản sáng quanh (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[-140, 120], [150, 110], [-160, -60], [170, -70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.25 + i * 0.08, 0.4 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
