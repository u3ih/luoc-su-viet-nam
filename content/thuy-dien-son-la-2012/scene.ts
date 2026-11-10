import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAP, BAN_CU, TDC_A, TDC_B } from "./terrain";

type Pt = [number, number];

// Thuỷ điện Sơn La — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const square = (cx: number, cz: number, half: number, rot: number, ax = 1) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const r = half / Math.pow(Math.pow(Math.abs(c), 14) + Math.pow(Math.abs(s), 14), 1 / 14);
  const x = c * r * ax;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};
// Đập Sơn La cách điệu: một khối tường hẹp nằm ngang dòng sông.
const WALLS: Wall[] = [
  { at: square(0, 0, 4, 1.3207963267948966, 30), base: 10, top: 6, height: 14, gates: [] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khao-sat","tai-dinh-cu","dap","ve-sau"]);
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
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 2021,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("dap") + 0.5 ? 1 : ctx.t > world.beat("dap") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["dap"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#9a958a", top: "#8a8678" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "khao-sat": các đoàn chuyên gia (chấm ngà) lần theo sông Đà khảo sát; điểm đặt đập (đốm ngà) (diễn hoạ).
  const p0 = run("khao-sat", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 2031, groups: [{ path: [[300, -70], [100, -30], [10, 20]], count: 8, spread: [4,20], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("khao-sat") }));
  { const S: Pt[] = [[10, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.12, 0.75 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khao-sat") })); }
  // 2. "tai-dinh-cu": dân các bản ven sông phía thượng lưu (son) dời lên các khu tái định cư trên đồi (đốm ngà) (diễn hoạ).
  const p1 = run("tai-dinh-cu", 28);
  { const S: Pt[] = [[-220, 60], [-300, 80], [-150, 30]]; world.add(createGlows({ count: S.length, color: SON, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.02 + i * 0.02, 0.16999999999999998 + i * 0.02, k) * (1 - smoothstep(0.5, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tai-dinh-cu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2061, groups: [{ path: [[-220, 60], [-160, 200], [-120, 290]], count: 20, spread: [8,50], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [[-200, 40], [-170, -150], [-150, -290]], count: 20, spread: [8,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p1, visible: () => clock.near("tai-dinh-cu") }));
  { const S: Pt[] = [[-120, 300], [-150, -300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.75 + i * 0.05, 0.9 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tai-dinh-cu") })); }
  // 3. "dap": theo thanh kéo, con đập (khối tường) dâng lên chắn ngang sông; công nhân (son) trên đập (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["dap"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2081, groups: [{ path: [[10, 80], [0, 0]], count: 20, spread: [6,60], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [[-10, -80], [0, 0]], count: 20, spread: [6,60], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("dap") }));
  // 4. "ve-sau": sáu tổ máy (đốm vàng) lần lượt sáng; dòng điện (chuỗi đốm vàng) toả về phía đông (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[20, -50], [22, -32], [24, -14], [26, 4], [28, 22], [30, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 15, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[40, 0], [86, -11], [131, -23], [177, -34], [226, -46], [277, -57], [329, -69], [380, -80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 18, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.8 + i * 0.02, 0.9500000000000001 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
