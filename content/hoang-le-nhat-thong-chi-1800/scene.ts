import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TA_THANH_OAI, KINH } from "./terrain";

type Pt = [number, number];

// Hoàng Lê nhất thống chí — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ngo-gia","muoi-bay-hoi","gia-tri","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TA_THANH_OAI, 56]];

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
    seed: 1800,
  });

  // 1. "ngo-gia": các đốm ngà (người dòng họ Ngô Thì) sáng trong làng Tả Thanh Oai; người làng (son) qua lại (diễn hoạ).
  const p0 = run("ngo-gia", 28);
  { const S: Pt[] = [[-20, -70], [0, -60], [20, -70], [10, -90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngo-gia") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 1820, groups: [{ path: [[-80, -120], [60, -40]], count: 14, spread: [20,30], color: SON, timing: [[0.05,0],[0.95,1]] }], progress: p0, visible: () => clock.near("ngo-gia") }));
  // 2. "muoi-bay-hoi": mười bảy đốm vàng (mười bảy hồi) nối nhau thành hàng theo thanh kéo: bảy đốm đầu (ngà), mười đốm sau (vàng) (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["muoi-bay-hoi"] ?? 0) / 0.9);
  { const S: Pt[] = [[-60, -60], [-40, -60], [-20, -60], [0, -60], [20, -60], [40, -60], [60, -60]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.05, 0.16999999999999998 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muoi-bay-hoi") })); }
  { const S: Pt[] = [[-60, -80], [-47, -80], [-33, -80], [-20, -80], [-7, -80], [7, -80], [20, -80], [33, -80], [47, -80], [60, -80]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("muoi-bay-hoi") })); }
  // 3. "gia-tri": những đốm sáng (người đời đương thời) rải giữa làng và kinh thành; đốm vàng mờ ở kinh thành (biến cố cuối Lê) (diễn hoạ).
  const p2 = run("gia-tri", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1850, groups: [{ path: [[0, -60], [40, 100], [80, 280]], count: 20, spread: [12,100], color: SON, timing: [[0.05,0],[0.9,1]] }], progress: p2, visible: () => clock.near("gia-tri") }));
  { const S: Pt[] = [KINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p2(); return 0.5 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gia-tri") })); }
  // 4. "ve-sau": mười hai đốm ngà nhỏ (mười hai bản chép tay) tỏa ra quanh làng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[40, -80], [35, -60], [20, -45], [0, -40], [-20, -45], [-35, -60], [-40, -80], [-35, -100], [-20, -115], [0, -120], [20, -115], [35, -100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 11, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.06, 0.2 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
