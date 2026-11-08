import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, AN_CU, THANH_TUYEN, DO_TUNG } from "./terrain";

type Pt = [number, number];

// Truyền kỳ mạn lục — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["roi-quan","viet-sach","danh-gia","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[AN_CU, 40], [THANH_TUYEN, 32], [DO_TUNG, 32]];

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
    counts: { trees: 800, bushes: 700, grass: 1800, reeds: 500 },
    forestAt: 0.45,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1550,
  });

  // 1. "roi-quan": đốm ngà rời huyện Thanh Tuyền, theo đường núi về nơi ẩn cư ở xứ Thanh (diễn hoạ).
  const p0 = run("roi-quan", 28);
  { const S: Pt[] = [THANH_TUYEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.2, 0.4, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("roi-quan") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1570, groups: [{ path: [THANH_TUYEN, [150, 100], [0, 40], AN_CU], count: 1, spread: [3,3], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("roi-quan") }));
  // 2. "viet-sach": hai mươi đốm vàng nhỏ (hai mươi truyện) lần lượt sáng ở nơi ẩn cư theo thanh kéo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["viet-sach"] ?? 0) / 0.9);
  { const S: Pt[] = [[-80, 20]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("viet-sach") })); }
  { const S: Pt[] = [[-92, 31], [-86, 31], [-80, 31], [-74, 31], [-68, 31], [-92, 37], [-86, 37], [-80, 37], [-74, 37], [-68, 37], [-92, 43], [-86, 43], [-80, 43], [-74, 43], [-68, 43], [-92, 49], [-86, 49], [-80, 49], [-74, 49], [-68, 49]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.045, 0.16999999999999998 + i * 0.045, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("viet-sach") })); }
  // 3. "danh-gia": những đốm ngà (người đời sau đọc và bình) sáng dần ở nhiều nơi xa (diễn hoạ).
  const p2 = run("danh-gia", 28);
  { const S: Pt[] = [[300, 250], [330, 50], [250, -250], [-300, 300], [-350, -100], [150, 330], [0, -350]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.11, 0.2 + i * 0.11, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("danh-gia") })); }
  { const S: Pt[] = [[-92, 31], [-86, 31], [-80, 31], [-74, 31], [-68, 31], [-92, 37], [-86, 37], [-80, 37], [-74, 37], [-68, 37], [-92, 43], [-86, 43], [-80, 43], [-74, 43], [-68, 43], [-92, 49], [-86, 49], [-80, 49], [-74, 49], [-68, 49]]; world.add(createGlows({ count: S.length, color: GOLD, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0.003, 0.15 + i * 0.003, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("danh-gia") })); }
  // 4. "ve-sau": trời rạng; các đốm vàng (truyện) lan theo đường ra đồng bằng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[-80, 20], [-33, -7], [13, -33], [60, -60], [107, -53], [153, -47], [200, -40], [250, -27], [300, -13], [350, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.08, 0.2 + i * 0.08, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
