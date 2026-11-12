import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TAN_VU, LACH_HUYEN } from "./terrain";

type Pt = [number, number];

// Cầu vượt biển Tân Vũ – Lạch Huyện — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["pha-xa-lan","thi-cong","khanh-thanh","ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TAN_VU, 32]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#24505a", shallow: "#6aa0a0" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2017,
  });

  // 1. "pha-xa-lan": phà, xà lan (chấm ngà) chậm chạp qua lại giữa đất liền và đảo; tàu (chấm xanh nhạt) chen nhau trên kênh (diễn hoạ).
  const p0 = run("pha-xa-lan", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2027, groups: [{ path: [[-170, 10], [160, 10]], count: 3, spread: [3,8], color: NGHIA, timing: [[0,0],[0.9,1]] }, { path: [[160, -10], [-170, -10]], count: 3, spread: [3,8], color: NGHIA, timing: [[0.1,0],[1,1]] }], progress: p0, visible: () => clock.near("pha-xa-lan") }));
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2037, groups: [{ path: [[0, 300], [0, -300]], count: 6, spread: [4,30], color: DICH, timing: [[0,0],[1,1]] }], progress: p0, visible: () => clock.near("pha-xa-lan") }));
  // 2. "thi-cong": theo thanh kéo, các nhịp cầu (chuỗi đốm vàng) lần lượt nối từ đất liền ra đảo; xà lan (chấm ngà) bên cạnh (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["thi-cong"] ?? 0) / 0.9);
  { const S: Pt[] = [[-200, 0], [-186, 0], [-172, 0], [-159, 0], [-145, 0], [-131, 0], [-117, 0], [-103, 0], [-90, 0], [-76, 0], [-62, 0], [-48, 0], [-34, 0], [-21, 0], [-7, 0], [7, 0], [21, 0], [34, 0], [48, 0], [62, 0], [76, 0], [90, 0], [103, 0], [117, 0], [131, 0], [145, 0], [159, 0], [172, 0], [186, 0], [200, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.03, 0.16999999999999998 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-cong") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 2, seed: 2057, groups: [{ path: [[-180, 18], [180, 18]], count: 4, spread: [4,20], color: NGHIA, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("thi-cong") }));
  // 3. "khanh-thanh": cầu sáng trọn (đốm vàng); xe (chấm ngà) chạy qua từ Tân Vũ tới cảng Lạch Huyện (diễn hoạ).
  const p2 = run("khanh-thanh", 28);
  { const S: Pt[] = [[-200, 0], [-186, 0], [-172, 0], [-159, 0], [-145, 0], [-131, 0], [-117, 0], [-103, 0], [-90, 0], [-76, 0], [-62, 0], [-48, 0], [-34, 0], [-21, 0], [-7, 0], [7, 0], [21, 0], [34, 0], [48, 0], [62, 0], [76, 0], [90, 0], [103, 0], [117, 0], [131, 0], [145, 0], [159, 0], [172, 0], [186, 0], [200, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 13, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khanh-thanh") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 9, seed: 2077, groups: [{ path: [[-240, 3], [225, 3]], count: 10, spread: [2,4], color: NGHIA, timing: [[0,0],[0.95,1]] }], progress: p2, visible: () => clock.near("khanh-thanh") }));
  { const S: Pt[] = [[230, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khanh-thanh") })); }
  // 4. "ngay-nay": dòng xe hai chiều (chấm ngà, vàng) trên cầu; tàu biển (đốm xanh nhạt) cập cảng (diễn hoạ).
  const p3 = run("ngay-nay", 28);
  { const S: Pt[] = [[-200, 0], [-186, 0], [-172, 0], [-159, 0], [-145, 0], [-131, 0], [-117, 0], [-103, 0], [-90, 0], [-76, 0], [-62, 0], [-48, 0], [-34, 0], [-21, 0], [-7, 0], [7, 0], [21, 0], [34, 0], [48, 0], [62, 0], [76, 0], [90, 0], [103, 0], [117, 0], [131, 0], [145, 0], [159, 0], [172, 0], [186, 0], [200, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-nay") })); }
  world.add(createCrowd({ glow: true, size: 7, height: (x, z) => ground(x, z) + 9, seed: 2107, groups: [{ path: [[-240, 3], [225, 3]], count: 8, spread: [2,4], color: NGHIA, timing: [[0,0],[1,1]] }, { path: [[225, -3], [-240, -3]], count: 8, spread: [2,4], color: GOLD, timing: [[0,0],[1,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
  world.add(createCrowd({ glow: true, size: 10, height: (x, z) => ground(x, z) + 2, seed: 2117, groups: [{ path: [[400, -300], [250, -60]], count: 2, spread: [4,10], color: DICH, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ngay-nay") }));
};

export default setup;
