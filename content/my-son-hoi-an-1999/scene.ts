import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MY_SON, HOI_AN, BA_LAN } from "./terrain";

type Pt = [number, number];

// Mỹ Sơn, Hội An và kiến trúc sư Kazik — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["kazik","my-son","hoi-an","ghi-danh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[MY_SON, 36], [HOI_AN, 40]];

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
    seed: 1999,
  });

  // 1. "kazik": một chấm ngà (Kazik) từ phương xa tới thung lũng Mỹ Sơn; các tháp (đốm xanh nhạt mờ) còn lại giữa rừng (diễn hoạ).
  const p0 = run("kazik", 28);
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 6, seed: 2009, groups: [{ path: [[-360, 360], [-250, 200], [-175, 70]], count: 1, spread: [2,2], color: NGHIA, timing: [[0.05,0],[0.6,1]] }], progress: p0, visible: () => clock.near("kazik") }));
  { const S: Pt[] = [[-200, 50], [-180, 50], [-160, 50], [-140, 50], [-200, 70], [-180, 70], [-160, 70], [-140, 70]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p0(); return 0.6 * smoothstep(0.3 + i * 0.04, 0.44999999999999996 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kazik") })); }
  // 2. "my-son": theo thanh kéo, từng ngọn tháp (đốm vàng) được gia cố, sáng lần lượt; đoàn trùng tu (son) làm việc (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["my-son"] ?? 0) / 0.9);
  { const S: Pt[] = [[-200, 50], [-180, 50], [-160, 50], [-140, 50], [-200, 70], [-180, 70], [-160, 70], [-140, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 7, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("my-son") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2039, groups: [{ path: [[-230, 20], [-170, 50]], count: 16, spread: [4,16], color: SON, drop: true, timing: [[0,0],[0.4,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("my-son") }));
  // 3. "hoi-an": những ngôi nhà gỗ phố cổ (lưới đốm ngà) sáng dọc bờ sông; người qua lại (son) (diễn hoạ).
  const p2 = run("hoi-an", 28);
  { const S: Pt[] = [[140, -6], [156, -6], [172, -6], [188, -6], [204, -6], [220, -6], [140, 10], [156, 10], [172, 10], [188, 10], [204, 10], [220, 10], [140, 26], [156, 26], [172, 26], [188, 26], [204, 26], [220, 26]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.025, 0.2 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoi-an") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2059, groups: [{ path: [[120, -20], [240, -20]], count: 24, spread: [3,10], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p2, visible: () => clock.near("hoi-an") }));
  // 4. "ghi-danh": cả hai nơi bừng sáng (đốm vàng lớn ở Mỹ Sơn và Hội An); vòng người (son) quanh (diễn hoạ).
  const p3 = run("ghi-danh", 28);
  { const S: Pt[] = [[-170, 60], [180, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.25, 0.25 + i * 0.25, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
  { const S: Pt[] = [[-200, 50], [-180, 50], [-160, 50], [-140, 50], [-200, 70], [-180, 70], [-160, 70], [-140, 70]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 7, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0, 0.2 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
  { const S: Pt[] = [[140, -6], [156, -6], [172, -6], [188, -6], [204, -6], [220, -6], [140, 10], [156, 10], [172, 10], [188, 10], [204, 10], [220, 10], [140, 26], [156, 26], [172, 26], [188, 26], [204, 26], [220, 26]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 5, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.3 + i * 0, 0.44999999999999996 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ghi-danh") })); }
};

export default setup;
