import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, DAP, TP_HCM } from "./terrain";

type Pt = [number, number];

// Thuỷ điện Trị An — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Đập Trị An cách điệu: khối tường hẹp nằm ngang dòng sông.
const WALLS: Wall[] = [
  { at: square(0, 0, 4, -0.7353981633974482, 22), base: 10, top: 6, height: 10, gates: [] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["song-dong-nai","dap","phat-dien","ve-sau"]);
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
    seed: 1988,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => ctx.t >= world.beat("dap") + 0.5 ? 1 : ctx.t > world.beat("dap") - 0.6 ? smoothstep(0, 0.9, ctx.inputs["dap"] ?? 0) : 0;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#9a958a", top: "#8a8678" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "song-dong-nai": chuyên gia (ngà) và công nhân (son) tụ về hai bờ sông Đồng Nai (diễn hoạ).
  const p0 = run("song-dong-nai", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1998, groups: [{ path: [[200, -100], [30, -30]], count: 20, spread: [10,50], color: SON, timing: [[0.05,0],[0.7,1]] }, { path: [[-150, 150], [-30, 30]], count: 20, spread: [10,50], color: SON, timing: [[0.1,0],[0.75,1]] }], progress: p0, visible: () => clock.near("song-dong-nai") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 2008, groups: [{ path: [[-200, 60], [-20, 20]], count: 6, spread: [4,16], color: NGHIA, timing: [[0.15,0],[0.8,1]] }], progress: p0, visible: () => clock.near("song-dong-nai") }));
  // 2. "dap": theo thanh kéo, đập đất đá (khối tường) đắp dần chắn ngang sông; công nhân (son) trên đập (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dap"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 2018, groups: [{ path: [[40, -50], [0, 0]], count: 20, spread: [6,40], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [[-40, 50], [0, 0]], count: 20, spread: [6,40], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("dap") }));
  // 3. "phat-dien": bốn tổ máy (đốm vàng) lần lượt sáng; điện (chuỗi đốm vàng) toả về phía tây nam (diễn hoạ).
  const p2 = run("phat-dien", 28);
  { const S: Pt[] = [[-25, 15], [-12, 2], [2, -12], [15, -25]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.15, 0.2 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phat-dien") })); }
  { const S: Pt[] = [[-20, -20], [-66, -66], [-111, -111], [-157, -157], [-201, -201], [-244, -244], [-287, -287], [-330, -330]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 16, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.7 + i * 0.025, 0.85 + i * 0.025, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phat-dien") })); }
  // 4. "ve-sau": nước tưới (đốm ngà) toả xuống đồng ruộng hạ lưu; thuyền (chấm ngà) trên sông (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-240, -140], [-200, -140], [-160, -140], [-120, -140], [-80, -140], [-240, -100], [-200, -100], [-160, -100], [-120, -100], [-80, -100], [-240, -60], [-200, -60], [-160, -60], [-120, -60], [-80, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.04, 0.25 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ glow: true, size: 6, height: (x, z) => ground(x, z) + 2, seed: 2058, groups: [{ path: [[-60, -50], [-300, -230]], count: 3, spread: [4,100], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
