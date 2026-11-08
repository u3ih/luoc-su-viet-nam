import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, NUI_THAY, THUY_KHUE, HUE } from "./terrain";

type Pt = [number, number];

// Lịch triều hiến chương loại chí — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["kep-thay","soan-sach","dang-sach","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THUY_KHUE, 48]];

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
    seed: 1821,
  });

  // 1. "kep-thay": đốm ngà (Phan Huy Chú) ở làng; hai lần đi thi (chấm ngà ra đi, về), mỗi lần một đốm vàng nhỏ (đỗ tú tài) (diễn hoạ).
  const p0 = run("kep-thay", 28);
  { const S: Pt[] = [[0, 80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kep-thay") })); }
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1841, groups: [{ path: [[0, 80], [200, 0], [0, 80], [200, 0], [0, 80]], count: 1, spread: [3,3], color: NGHIA, timing: [[0.1,0],[0.9,1]] }], progress: p0, visible: () => clock.near("kep-thay") }));
  { const S: Pt[] = [[190, 10], [210, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.35, 0.44999999999999996 + i * 0.35, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kep-thay") })); }
  // 2. "soan-sach": theo thanh kéo, mười đốm vàng (mười phần sách) lần lượt sáng thành vòng quanh đốm ngà (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["soan-sach"] ?? 0) / 0.9);
  { const S: Pt[] = [[0, 80]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 22, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("soan-sach") })); }
  { const S: Pt[] = [[26, 80], [21, 95], [8, 105], [-8, 105], [-21, 95], [-26, 80], [-21, 65], [-8, 55], [8, 55], [21, 65]]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.02 + i * 0.09, 0.16999999999999998 + i * 0.09, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("soan-sach") })); }
  // 3. "dang-sach": đốm ngà mang mười đốm vàng đi về phía nam (kinh đô Huế) (diễn hoạ).
  const p2 = run("dang-sach", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 3, seed: 1881, groups: [{ path: [THUY_KHUE, [60, -100], [100, -250], HUE], count: 1, spread: [3,3], color: NGHIA, timing: [[0.03,0],[0.9,1]] }], progress: p2, visible: () => clock.near("dang-sach") }));
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1891, groups: [{ path: [THUY_KHUE, [60, -100], [100, -250], HUE], count: 10, spread: [4,30], color: GOLD, timing: [[0.05,0],[0.92,1]] }], progress: p2, visible: () => clock.near("dang-sach") }));
  // 4. "ve-sau": các đốm vàng (bản in, bản dịch) lan ra khắp vùng (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[120, 0], [85, 85], [0, 120], [-85, 85], [-120, 0], [-85, -85], [0, -120], [85, -85], [225, 46], [172, 152], [73, 218], [-46, 225], [-152, 172], [-218, 73], [-225, -46], [-172, -152], [-73, -218], [46, -225], [152, -172], [218, -73]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.04, 0.2 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
