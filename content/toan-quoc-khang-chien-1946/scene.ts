import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, PHO_CO, LONG_BIEN, BAI_GIUA, VAN_PHUC, HANG_TRAM } from "./terrain";

type Pt = [number, number];

// Toàn quốc kháng chiến — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hoa-hoan","dem-19-12","loi-keu-goi","vuot-song"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHO_CO, 56], [VAN_PHUC, 32]];

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
    seed: 19461,
  });

  // 1. "hoa-hoan": quân Pháp (xanh nhạt) vào đóng ở Hà Nội theo hiệp định; các vị trí (đốm xanh nhạt) xen với khu phố (đốm ngà) (diễn hoạ).
  const p0 = run("hoa-hoan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19471, groups: [{ path: [[200, 330], [130, 150], [40, 80]], count: 40, spread: [4,14], color: DICH, timing: [[0.02,0],[0.7,1]] }], progress: p0, visible: () => clock.near("hoa-hoan") }));
  { const S: Pt[] = [[-10, 30], [60, 100], [30, -20], [-30, 110]]; world.add(createGlows({ count: S.length, color: DICH, size: 15, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.5 + i * 0.06, 0.65 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-hoan") })); }
  { const S: Pt[] = [[79, 72], [53, 110], [8, 119], [-30, 93], [-39, 48], [-13, 10], [32, 1], [70, 27]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.03, 0.25 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoa-hoan") })); }
  // 2. "dem-19-12": theo thanh kéo, đèn thành phố (đốm vàng) vụt tắt, các điểm giao tranh (lửa) bùng lên ở nhiều vị trí (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["dem-19-12"] ?? 0) / 0.9);
  { const S: Pt[] = [[-52, 6], [-16, 6], [20, 6], [56, 6], [92, 6], [-52, 42], [-16, 42], [20, 42], [56, 42], [92, 42], [-52, 78], [-16, 78], [20, 78], [56, 78], [92, 78], [-52, 114], [-16, 114], [20, 114], [56, 114], [92, 114]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp1(ctx); return 0.9 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.15, 0.3, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("dem-19-12") })); }
  world.add(createFires({ sites: [[-10, 30], [60, 100], [30, -20], [-30, 110], [80, 40]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("dem-19-12") * smoothstep(0.3, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "loi-keu-goi": từ hang Trầm (đốm vàng) lời kêu gọi lan ra (vòng đốm ngà); người dân (son) các làng ra đường (diễn hoạ).
  const p2 = run("loi-keu-goi", 28);
  { const S: Pt[] = [[-270, -60]]; world.add(createGlows({ count: S.length, color: GOLD, size: 22, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.02 + i * 0.12, 0.16999999999999998 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("loi-keu-goi") })); }
  { const S: Pt[] = [[-210, -60], [-240, -8], [-300, -8], [-330, -60], [-300, -112], [-240, -112]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.15 + i * 0.004, 0.3 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("loi-keu-goi") })); }
  { const S: Pt[] = [[-152, -36], [-189, 28], [-256, 59], [-329, 44], [-379, -10], [-388, -84], [-351, -148], [-284, -179], [-211, -164], [-161, -110]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.35 + i * 0.004, 0.5 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("loi-keu-goi") })); }
  { const S: Pt[] = [[-104, 10], [-151, 75], [-221, 113], [-301, 117], [-375, 86], [-428, 26], [-450, -51], [-436, -130], [-389, -195], [-319, -233], [-239, -237], [-165, -206], [-112, -146], [-90, -69]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.55 + i * 0.004, 0.7000000000000001 + i * 0.004, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("loi-keu-goi") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 19561, groups: [{ path: [[-114, -120], [-119, -105], [-132, -95], [-148, -95], [-161, -105], [-166, -120], [-161, -135], [-148, -145], [-132, -145], [-119, -135], [-114, -120]], count: 40, spread: [1,6], color: SON, drop: true, timing: [[0,1],[1,1]] }], progress: p2, visible: () => clock.near("loi-keu-goi") }));
  // 4. "vuot-song": từng toán nhỏ (son) lặng lẽ rời khu phố cổ, qua bãi giữa dưới gầm cầu Long Biên sang bờ bắc (diễn hoạ).
  const p3 = run("vuot-song", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 19571, groups: [{ path: [[30, 70], [110, 92], [130, 92], [180, 140], [240, 250]], count: 60, spread: [2,6], color: SON, timing: [[0.02,0],[0.92,1]] }], progress: p3, visible: () => clock.near("vuot-song") }));
  { const S: Pt[] = [[90, 80], [104, 84], [118, 88], [132, 92], [146, 96], [160, 100]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("vuot-song") })); }
};

export default setup;
