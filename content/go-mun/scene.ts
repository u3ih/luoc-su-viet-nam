import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, GO_MUN, GO_B, GO_C, GO_D } from "./terrain";

type Pt = [number, number];

// Văn hóa Gò Mun — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["khai-quat","lang-go","do-dong","ve-sau"]);
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
    seed: 850,
  });

  // 1. "khai-quat": vài chấm ngà (nhà khảo cổ) lên gò; các đốm vàng nhỏ (hiện vật) lộ ra trên gò (diễn hoạ).
  const p0 = run("khai-quat", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 860, groups: [{ path: [[150, -50], [10, 35]], count: 6, spread: [8,14], color: NGHIA, timing: [[0.02,0],[0.4,1]] }], progress: p0, visible: () => clock.near("khai-quat") }));
  { const S: Pt[] = [[-14, 29.5], [-7, 29.5], [0, 29.5], [7, 29.5], [14, 29.5], [-14, 36.5], [-7, 36.5], [0, 36.5], [7, 36.5], [14, 36.5], [-14, 43.5], [-7, 43.5], [0, 43.5], [7, 43.5], [14, 43.5], [-14, 50.5], [-7, 50.5], [0, 50.5], [7, 50.5], [14, 50.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 8, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.015, 0.55 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("khai-quat") })); }
  // 2. "lang-go": người (son) trên các gò xuống đồng trồng lúa, ra sông đánh cá (thuyền chấm ngà) (diễn hoạ).
  const p1 = run("lang-go", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 880, groups: [{ path: [GO_MUN, [60, 120]], count: 14, spread: [30,50], color: SON, timing: [[0.03,0],[0.8,1]] }, { path: [GO_B, [-60, 200]], count: 12, spread: [30,50], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [GO_C, [-100, -200]], count: 12, spread: [30,50], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: p1, visible: () => clock.near("lang-go") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 890, groups: [{ path: [[330, 400], [260, 100], [300, -150]], count: 5, spread: [8,200], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p1, visible: () => clock.near("lang-go") }));
  // 3. "do-dong": theo thanh kéo, các lò đúc (lửa) lần lượt đỏ trên các gò; đốm vàng (đồ đồng) sáng cạnh lò (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["do-dong"] ?? 0) / 0.9);
  world.add(createFires({ sites: [[10, 40], [-150, 120], [-190, -120], [140, -120]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("do-dong") * smoothstep(0.02, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[18, 46], [-142, 126], [-182, -114], [148, -114]]; world.add(createGlows({ count: S.length, color: GOLD, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("do-dong") })); }
  // 4. "ve-sau": chuỗi bốn đốm vàng (Phùng Nguyên – Đồng Đậu – Gò Mun – Đông Sơn) nối nhau theo thời gian, đốm cuối lớn nhất (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-300, -250], [-100, -100], [0, 40], [200, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.18, 0.2 + i * 0.18, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[200, 200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 42, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.65 + i * 0.12, 0.8 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
