import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LUOI_LIEM, AN_VINH } from "./terrain";

type Pt = [number, number];

// Hải chiến Hoàng Sa — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hai-nhom-dao","cang-thang","ngay-19-1","sau-1974"]);
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
    water: { deep: "#1d4a58", shallow: "#5f9aa0" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1974,
  });

  // 1. "hai-nhom-dao": đốm vàng (đài khí tượng) trên một đảo nhóm Lưỡi Liềm; đốm xanh nhạt ở nhóm An Vĩnh phía đông bắc (diễn hoạ).
  const p0 = run("hai-nhom-dao", 28);
  { const S: Pt[] = [[-10, -40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-nhom-dao") })); }
  { const S: Pt[] = [[200, 200], [240, 150]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.1, 0.44999999999999996 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hai-nhom-dao") })); }
  // 2. "cang-thang": tàu cá (xanh nhạt) tới gần các đảo; bốn chiến hạm (ngà) lần lượt tới; những đốm nhỏ (cờ) xuất hiện rồi bị nhổ trên các đảo (diễn hoạ).
  const p1 = run("cang-thang", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 2, seed: 2004, groups: [{ path: [[300, 300], [120, 120], [60, 60]], count: 6, spread: [10,30], color: DICH, timing: [[0.02,0],[0.6,1]] }], progress: p1, visible: () => clock.near("cang-thang") }));
  world.add(createCrowd({ glow: true, size: 11, height: (x, z) => ground(x, z) + 2, seed: 2014, groups: [{ path: [[-380, -200], [-150, -80], [-40, 0]], count: 4, spread: [8,20], color: NGHIA, timing: [[0.2,0],[0.8,1]] }], progress: p1, visible: () => clock.near("cang-thang") }));
  { const S: Pt[] = [[70, 40], [10, 80], [50, -30]]; world.add(createGlows({ count: S.length, color: DICH, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.3 + i * 0.05, 0.44999999999999996 + i * 0.05, k) * (1 - smoothstep(0.7, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("cang-thang") })); }
  // 3. "ngay-19-1": theo thanh kéo, các chiến hạm (ngà) và tàu (xanh nhạt) tiến vào vùng nước giữa nhóm đảo; một tàu bốc cháy rồi tắt (Nhật Tảo) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ngay-19-1"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 11, height: (x, z) => ground(x, z) + 2, seed: 2034, groups: [{ path: [[-200, -60], [-40, 0], [10, 20]], count: 4, spread: [10,20], color: NGHIA, timing: [[0.02,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ngay-19-1") }));
  world.add(createCrowd({ glow: true, size: 11, height: (x, z) => ground(x, z) + 2, seed: 2044, groups: [{ path: [[240, 150], [100, 70], [40, 30]], count: 4, spread: [10,20], color: DICH, timing: [[0.02,0],[0.8,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ngay-19-1") }));
  world.add(createFires({ sites: [[20, 15]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("ngay-19-1") * smoothstep(0.75, 0.9, inp2(ctx)), size: 4, glow: () => 0.8 }));
  // 4. "sau-1974": các đốm xanh nhạt sáng trên tất cả các đảo; vòng đốm vàng nhỏ trên mặt nước (tưởng niệm những người tử trận) (diễn hoạ).
  const p3 = run("sau-1974", 28);
  { const S: Pt[] = [[-60, 40], [-10, -40], [50, -30], [70, 40], [10, 80]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-1974") })); }
  { const S: Pt[] = [[49, 18], [42, 34], [28, 46], [11, 50], [-6, 46], [-21, 36], [-29, 20], [-29, 2], [-22, -14], [-8, -26], [9, -30], [26, -26], [41, -16], [49, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.45 + i * 0.02, 0.6 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("sau-1974") })); }
};

export default setup;
