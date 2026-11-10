import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls, type Wall } from "@/core/world/walls";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CUNG } from "./terrain";

type Pt = [number, number];

// Lê Hiến Tông — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
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
// Kinh thành cách điệu.
const WALLS: Wall[] = [
  { at: square(20, 200, 44, 0), base: 8, top: 5, height: 4, gates: [{ at: -1.5707963267948966, width: 10 }, { at: 3.141592653589793, width: 10 }, { at: 0, width: 10 }] },
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thai-tu","on-hoa","nong-tang","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CUNG, 56]];

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
    seed: 1497,
  });

  // ---- thành (chỉ khối tường theo mặt bằng) ----
  const builtAt = (ctx: FrameCtx) => 1;
  world.add(createWalls({ walls: WALLS, height, quality: world.quality, colors: { side: "#8f8a7a", top: "#7e8c58" }, built: (k, ctx) => clamp(builtAt(ctx) * 1 - k * 0.6), wear: () => 0 }));

  // 1. "thai-tu": đốm vàng (vua mới) sáng giữa kinh thành; các quan (chấm ngà) vào chầu (diễn hoạ).
  const p0 = run("thai-tu", 28);
  { const S: Pt[] = [[20, 210]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thai-tu") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1517, groups: [{ path: [[20, 80], [20, 180]], count: 30, spread: [6,20], color: NGHIA, timing: [[0.05,0],[0.7,1]] }], progress: p0, visible: () => clock.near("thai-tu") }));
  // 2. "on-hoa": sứ (chấm ngà) đi khắp các xã; người (son) từ trong núi trở về làng làm ăn (diễn hoạ).
  const p1 = run("on-hoa", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 1527, groups: [{ path: [[20, 180], [-150, 0], [-80, -200]], count: 2, spread: [6,20], color: NGHIA, timing: [[0.03,0],[0.8,1]] }, { path: [[20, 180], [200, 20], [120, -200]], count: 2, spread: [6,20], color: NGHIA, timing: [[0.05,0],[0.85,1]] }], progress: p1, visible: () => clock.near("on-hoa") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1537, groups: [{ path: [[-330, -60], [-150, -80]], count: 24, spread: [8,40], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p1, visible: () => clock.near("on-hoa") }));
  // 3. "nong-tang": theo thanh kéo, đê ven sông (chuỗi đốm ngà) đắp dần; ngòi lạch (chuỗi đốm vàng) khơi ra đồng; dân (son) ra đắp đê (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["nong-tang"] ?? 0) / 0.9);
  { const S: Pt[] = [[250, 300], [245, 232], [239, 164], [234, 95], [232, 27], [237, -41], [243, -109], [248, -177], [259, -233], [273, -282], [286, -331], [300, -380]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.03 + i * 0.04, 0.18 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nong-tang") })); }
  { const S: Pt[] = [[220, -40], [180, -46], [140, -51], [100, -57], [54, -57], [3, -51], [-49, -46], [-100, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.45 + i * 0.05, 0.6 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nong-tang") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1567, groups: [{ path: [[0, -120], [200, -100]], count: 30, spread: [8,40], color: SON, timing: [[0,0],[0.6,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("nong-tang") }));
  // 4. "ve-sau": đốm vàng ở kinh thành lịm dần (vua mất năm 1504) (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[20, 210]]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.55, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1587, groups: [{ path: [[20, 170], [20, 170]], count: 30, spread: [8,30], color: NGHIA, timing: [[0,1],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
