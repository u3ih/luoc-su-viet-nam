import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BA_THE, OC_EO, NGOAI_KHOI } from "./terrain";

type Pt = [number, number];

// Văn hóa Óc Eo — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["go-oc-eo","nha-san","cang-thi","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[OC_EO, 40]];

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
    counts: { trees: 380, bushes: 600, grass: 2400, reeds: 1100 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 150,
  });

  // 1. "go-oc-eo": vài chấm ngà (người khảo cổ) đến gò đất; các đốm vàng nhỏ (di vật) lộ ra trên gò (diễn hoạ).
  const p0 = run("go-oc-eo", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 160, groups: [{ path: [[200, -150], [40, 30]], count: 4, spread: [6,10], color: NGHIA, timing: [[0.02,0],[0.4,1]] }], progress: p0, visible: () => clock.near("go-oc-eo") }));
  { const S: Pt[] = [[48, 40], [46, 49], [39, 56], [30, 58], [21, 56], [14, 49], [12, 40], [14, 31], [21, 24], [30, 22], [39, 24], [46, 31]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.03, 0.55 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("go-oc-eo") })); }
  // 2. "nha-san": thuyền (chấm ngà) đi lại trên kênh rạch; người (son) làm ruộng hai bên kênh (diễn hoạ).
  const p1 = run("nha-san", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 180, groups: [{ path: [[-300, -195], [60, -40], [400, 60]], count: 10, spread: [6,300], color: NGHIA, timing: [[0.02,0],[1,1]] }, { path: [[-300, 300], [60, -40], [200, -400]], count: 8, spread: [6,300], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p1, visible: () => clock.near("nha-san") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 190, groups: [{ path: [[100, 40], [140, 10]], count: 16, spread: [80,50], color: SON, timing: [[0,1],[1,1]] }, { path: [[-60, -150], [-20, -110]], count: 14, spread: [80,50], color: SON, timing: [[0,1],[1,1]] }], progress: p1, visible: () => clock.near("nha-san") }));
  // 3. "cang-thi": theo thanh kéo, đoàn thuyền buôn (chấm vàng và xanh nhạt) từ biển xa nhiều hướng vào kênh, tụ về gò Óc Eo (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["cang-thi"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 200, groups: [{ path: [NGOAI_KHOI, [-300, -195], [-150, -120], [20, 30]], count: 16, spread: [12,80], color: GOLD, timing: [[0,0],[1,1]] }, { path: [[-395, 100], [-330, 0], [-150, -120], [25, 35]], count: 12, spread: [12,80], color: DICH, timing: [[0.1,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("cang-thi") }));
  { const S: Pt[] = [OC_EO]; world.add(createGlows({ count: S.length, color: GOLD, size: 38, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cang-thi") })); }
  // 4. "ve-sau": các đốm vàng (đền thờ thần) sáng trên những gò cao quanh Óc Eo và chân núi Ba Thê (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[30, 40], [-80, 110], [-160, 120], [120, 120], [-40, -60], [150, -100]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 230, groups: [{ path: [[200, 100], [40, 50]], count: 12, spread: [26,50], color: SON, timing: [[0.2,0],[0.9,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
