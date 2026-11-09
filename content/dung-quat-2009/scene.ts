import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NHA_MAY, CANG } from "./terrain";

type Pt = [number, number];

// Nhà máy lọc dầu Dung Quất — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dia-diem","xay-dung","san-pham","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[NHA_MAY, 88]];

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
    seed: 2013,
  });

  // 1. "dia-diem": địa điểm bên vịnh (đốm ngà); tàu (chấm xanh nhạt) tới thăm dò rồi rời đi (diễn hoạ).
  const p0 = run("dia-diem", 28);
  { const S: Pt[] = [[20, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dia-diem") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2033, groups: [{ path: [[380, -200], [210, 0], [380, 250]], count: 2, spread: [6,30], color: DICH, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("dia-diem") }));
  // 2. "xay-dung": theo thanh kéo, các phân xưởng (đốm vàng) lần lượt sáng; đê chắn sóng và cảng (chuỗi đốm ngà) vươn ra biển; công nhân (son) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["xay-dung"] ?? 0) / 0.9);
  { const S: Pt[] = [[-44, -12], [-12, -12], [20, -12], [52, -12], [84, -12], [-44, 20], [-12, 20], [20, 20], [52, 20], [84, 20], [-44, 52], [-12, 52], [20, 52], [52, 52], [84, 52]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  { const S: Pt[] = [[120, 90], [152, 86], [184, 82], [208, 68], [224, 44], [240, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.3 + i * 0.08, 0.44999999999999996 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("xay-dung") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2063, groups: [{ path: [[-150, -60], [0, 0]], count: 30, spread: [10,80], color: SON, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("xay-dung") }));
  // 3. "san-pham": dòng sản phẩm đầu tiên: ngọn đuốc cháy; tàu chở sản phẩm (chấm ngà) rời cảng (diễn hoạ).
  const p2 = run("san-pham", 28);
  { const S: Pt[] = [[-44, -12], [-12, -12], [20, -12], [52, -12], [84, -12], [-44, 20], [-12, 20], [20, 20], [52, 20], [84, 20], [-44, 52], [-12, 52], [20, 52], [52, 52], [84, 52]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("san-pham") })); }
  world.add(createFires({ sites: [[60, 60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.6 })), lit: () => clock.near("san-pham") * smoothstep(0.05, 0.9, p2()), size: 5, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2093, groups: [{ path: [[210, 40], [380, -100]], count: 2, spread: [6,60], color: NGHIA, timing: [[0.3,0],[1,1]] }], progress: p2, visible: () => clock.near("san-pham") }));
  // 4. "ve-sau": nhà máy sáng đèn; tàu (chấm ngà) ra vào cảng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-44, -12], [-12, -12], [20, -12], [52, -12], [84, -12], [-44, 20], [-12, 20], [20, 20], [52, 20], [84, 20], [-44, 52], [-12, 52], [20, 52], [52, 52], [84, 52]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.002, 0.15 + i * 0.002, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createFires({ sites: [[60, 60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.6 })), lit: () => clock.near("ve-sau") * smoothstep(0, 0.9, p3()), size: 5, glow: () => 0.8 }));
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2123, groups: [{ path: [[380, 250], [210, 45], [380, -150]], count: 4, spread: [6,200], color: NGHIA, timing: [[0.02,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
