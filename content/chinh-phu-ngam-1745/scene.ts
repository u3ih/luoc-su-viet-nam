import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, LANG, CAU, BIEN_AI } from "./terrain";

type Pt = [number, number];

// Chinh phụ ngâm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguyen-tac","tien-dua","ban-dich","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[LANG, 48]];

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
    seed: 1745,
  });

  // 1. "nguyen-tac": đêm ở làng, một đốm ngà nhỏ (người chinh phụ) bên ánh đèn; các đốm vàng nhỏ (câu thơ) hiện dần (diễn hoạ).
  const p0 = run("nguyen-tac", 28);
  { const S: Pt[] = [[0, -150]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-tac") })); }
  { const S: Pt[] = [[22.5, -157.5], [27.5, -157.5], [32.5, -157.5], [37.5, -157.5], [22.5, -152.5], [27.5, -152.5], [32.5, -152.5], [37.5, -152.5], [22.5, -147.5], [27.5, -147.5], [32.5, -147.5], [37.5, -147.5], [22.5, -142.5], [27.5, -142.5], [32.5, -142.5], [37.5, -142.5]]; world.add(createGlows({ count: S.length, color: GOLD, size: 4, minPx: 7, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.04, 0.35 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nguyen-tac") })); }
  // 2. "tien-dua": đoàn quân (son) qua cầu rời làng đi về biên ải, xa dần theo thanh kéo; một đốm ngà đứng lại ở đầu cầu (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["tien-dua"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1775, groups: [{ path: [LANG, CAU, [0, 100], [0, 250], BIEN_AI], count: 30, spread: [10,80], color: SON, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("tien-dua") }));
  { const S: Pt[] = [[0, -90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tien-dua") })); }
  // 3. "ban-dich": bảy đốm ngà (bảy bản dịch) sáng lần lượt quanh làng (diễn hoạ).
  const p2 = run("ban-dich", 28);
  { const S: Pt[] = [[40, -150], [25, -119], [-9, -111], [-36, -133], [-36, -167], [-9, -189], [25, -181]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.05 + i * 0.1, 0.2 + i * 0.1, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-dich") })); }
  { const S: Pt[] = [[0, -150]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-dich") })); }
  // 4. "ve-sau": trời rạng; một đốm ngà ở đầu cầu vẫn chờ; xa xa nơi biên ải một đốm vàng mờ (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[0, -90]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[0, 360]]; world.add(createGlows({ count: S.length, color: GOLD, size: 12, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 20, S[i][1]); const k = p3(); return 0.5 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
};

export default setup;
