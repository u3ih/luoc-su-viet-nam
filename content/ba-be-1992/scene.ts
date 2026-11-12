import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HO, LANG } from "./terrain";

type Pt = [number, number];

// Hồ Ba Bể — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ho-tren-nui","vuon-quoc-gia","da-dang","song-nang"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG, 32]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#1f4a4a", shallow: "#5f9488" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1992,
  });

  // 1. "ho-tren-nui": mặt hồ giữa núi đá; dải đốm ngà chạy dọc chiều dài hồ (8 km, cách điệu) (diễn hoạ).
  const p0 = run("ho-tren-nui", 28);
  { const S: Pt[] = [[-170, 30], [-140, 20], [-110, 10], [-80, 0], [-40, 7], [0, 13], [40, 20], [70, 10], [100, 0], [130, -10]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.05, 0.2 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ho-tren-nui") })); }
  // 2. "vuon-quoc-gia": theo thanh kéo, vòng đốm vàng (ranh giới vườn quốc gia) khép dần quanh hồ; vòng trong (phân khu bảo vệ nghiêm ngặt) sáng sau (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["vuon-quoc-gia"] ?? 0) / 0.9);
  { const S: Pt[] = [[170, 10], [164, 55], [148, 98], [122, 136], [88, 166], [47, 188], [3, 199], [-43, 199], [-87, 188], [-128, 166], [-162, 136], [-188, 98], [-204, 55], [-210, 10], [-204, -35], [-188, -78], [-162, -116], [-128, -146], [-87, -168], [-43, -179], [3, -179], [47, -168], [88, -146], [122, -116], [148, -78], [164, -35]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.022, 0.16999999999999998 + i * 0.022, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-quoc-gia") })); }
  { const S: Pt[] = [[88, 32], [71, 71], [41, 102], [1, 118], [-42, 118], [-81, 101], [-112, 71], [-128, 31], [-128, -12], [-111, -51], [-81, -82], [-41, -98], [2, -98], [41, -81], [72, -51], [88, -11]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.65 + i * 0.015, 0.8 + i * 0.015, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuon-quoc-gia") })); }
  // 3. "da-dang": các loài (đốm xanh nhạt: cá dưới hồ; đốm ngà: lan trên vách; đốm vàng: chim) rải quanh hồ (diễn hoạ).
  const p2 = run("da-dang", 28);
  { const S: Pt[] = [[-160, 25], [-138, 18], [-116, 11], [-95, 5], [-69, 2], [-36, 7], [-4, 11], [29, 16], [56, 13], [81, 6], [105, -1], [130, -8]]; world.add(createGlows({ count: S.length, color: DICH, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 1, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.03, 0.2 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-dang") })); }
  { const S: Pt[] = [[54, 41], [33, 70], [2, 87], [-34, 89], [-67, 75], [-90, 48], [-100, 14], [-94, -21], [-73, -50], [-42, -67], [-6, -69], [27, -55], [50, -28], [60, 6]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.3 + i * 0.03, 0.44999999999999996 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("da-dang") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 22, seed: 2052, groups: [{ path: [[110, 10], [85, 86], [20, 134], [-60, 134], [-125, 86], [-150, 10], [-125, -66], [-60, -114], [20, -114], [85, -66], [110, 10]], count: 20, spread: [10,26], color: GOLD, timing: [[0,0],[1,1]] }], progress: p2, visible: () => clock.near("da-dang") }));
  // 4. "song-nang": thuyền độc mộc (chấm ngà) đi trên hồ ra sông Năng; làng ven hồ (đốm vàng) sáng đèn (diễn hoạ).
  const p3 = run("song-nang", 28);
  world.add(createCrowd({ glow: true, size: 8, height: (x, z) => ground(x, z) + 1, seed: 2062, groups: [{ path: [[-150, 25], [-60, 2], [60, 15], [200, -20], [330, -35]], count: 4, spread: [3,10], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: p3, visible: () => clock.near("song-nang") }));
  { const S: Pt[] = [[2, -80], [-6, -63], [-25, -59], [-40, -70], [-40, -90], [-25, -101], [-6, -97]]; world.add(createGlows({ count: S.length, color: GOLD, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.2 + i * 0.05, 0.35 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("song-nang") })); }
};

export default setup;
