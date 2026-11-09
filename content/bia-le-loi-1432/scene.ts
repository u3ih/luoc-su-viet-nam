import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MUONG_LE, VACH, DEN } from "./terrain";

type Pt = [number, number];

// Bia Lê Lợi bên sông Đà — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["muong-le","than-chinh","khac-da","ve-sau"]);
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
    seed: 1432,
  });

  // 1. "muong-le": đốm ngà (châu Mường Lễ) ở thượng nguồn; một đoàn (xanh nhạt) rời Mường Lễ đi về phía tây nam (diễn hoạ).
  const p0 = run("muong-le", 28);
  { const S: Pt[] = [[-300, 300]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muong-le") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1452, groups: [{ path: [[-300, 290], [-360, 150], [-380, 50]], count: 20, spread: [8,60], color: DICH, timing: [[0.3,0],[0.9,1]] }], progress: p0, visible: () => clock.near("muong-le") }));
  // 2. "than-chinh": theo thanh kéo, đoàn quân (son) đi bộ và đoàn thuyền (đốm vàng) cùng ngược sông Đà lên Mường Lễ (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["than-chinh"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1462, groups: [{ path: [[390, -275], [200, -120], [0, 30], [-200, 150], [-300, 230]], count: 8, spread: [10,200], color: GOLD, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("than-chinh") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1472, groups: [{ path: [[380, -200], [220, -60], [40, 70], [-150, 190], [-280, 270]], count: 40, spread: [10,220], color: SON, timing: [[0,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("than-chinh") }));
  // 3. "khac-da": đốm vàng (bài thơ khắc trên vách đá) sáng bên bờ bắc; quân (son) dừng chân dưới vách (diễn hoạ).
  const p2 = run("khac-da", 28);
  { const S: Pt[] = [[10, 72]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khac-da") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1492, groups: [{ path: [[150, -80], [30, 50]], count: 26, spread: [8,60], color: SON, timing: [[0.02,0],[0.4,1]] }], progress: p2, visible: () => clock.near("khac-da") }));
  // 4. "ve-sau": đốm vàng (khối bia) chuyển lên đền thờ trên cao; khách (son) tới viếng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  world.add(createCrowd({ glow: true, size: 9, height: (x, z) => ground(x, z) + 10, seed: 1502, groups: [{ path: [[10, 72], [40, 95], [60, 110]], count: 1, spread: [2,2], color: GOLD, timing: [[0.05,0],[0.5,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
  { const S: Pt[] = [[60, 110]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1522, groups: [{ path: [[200, -100], [70, 100]], count: 20, spread: [6,60], color: SON, timing: [[0.4,0],[0.95,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
