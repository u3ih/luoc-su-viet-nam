import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HANG_NAU, TRUONG_THI, MOM_SONG } from "./terrain";

type Pt = [number, number];

// Tú Xương và thành Nam — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hang-nau","tam-khoa","thuong-vo","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HANG_NAU, 48], [TRUONG_THI, 64]];

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
    seed: 1900,
  });

  // 1. "hang-nau": phố Hàng Nâu: người (son) qua lại; một đốm ngà nhỏ (cậu bé) trong phố (diễn hoạ).
  const p0 = run("hang-nau", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 1910, groups: [{ path: [[-150, 20], [80, 20]], count: 16, spread: [20,40], color: SON, timing: [[0.03,0],[0.95,1]] }], progress: p0, visible: () => clock.near("hang-nau") }));
  { const S: Pt[] = [[-40, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hang-nau") })); }
  // 2. "tam-khoa": theo thanh kéo, tám lần sĩ tử (son) dồn về trường thi; tám đốm vàng (tám khoa) lần lượt sáng; đốm thứ tư sáng hơn (đỗ tú tài) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tam-khoa"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1930, groups: [{ path: [[-300, 300], [30, 200]], count: 40, spread: [60,60], color: SON, timing: [[0,0],[0.15,1],[0.3,0],[0.45,1],[0.6,0],[0.75,1],[0.9,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tam-khoa") }));
  { const S: Pt[] = [[0, 240], [11, 240], [23, 240], [34, 240], [46, 240], [57, 240], [69, 240], [80, 240]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tam-khoa") })); }
  { const S: Pt[] = [[34, 240]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.42 + i * 0.12, 0.57 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tam-khoa") })); }
  // 3. "thuong-vo": đốm ngà (bà Tú) đi lại buôn bán ở bến sông; thuyền (chấm ngà) qua lại (diễn hoạ).
  const p2 = run("thuong-vo", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1960, groups: [{ path: [HANG_NAU, [60, -60], MOM_SONG, [60, -60], HANG_NAU], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.98,1]] }], progress: p2, visible: () => clock.near("thuong-vo") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1970, groups: [{ path: [[-300, -110], [300, -210]], count: 4, spread: [6,120], color: NGHIA, timing: [[0.05,0],[1,1]] }], progress: p2, visible: () => clock.near("thuong-vo") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 1980, groups: [{ path: [[120, -110], [150, -120]], count: 10, spread: [30,16], color: SON, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("thuong-vo") }));
  // 4. "ve-sau": đốm ngà ở Hàng Nâu lịm; các đốm vàng nhỏ (bài thơ) còn sáng khắp phố (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-40, 30]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.3, 0.55, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[20, 20], [14, 46], [-3, 67], [-27, 78], [-53, 78], [-77, 67], [-94, 46], [-100, 20], [-94, -6], [-77, -27], [-53, -38], [-27, -38], [-3, -27], [14, -6]]; world.add(createGlows({ count: S.length, color: GOLD, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.03, 0.55 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
