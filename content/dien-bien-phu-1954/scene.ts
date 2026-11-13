import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MUONG_THANH, SAN_BAY, HIM_LAM, A1, ISABELLE, PHA_SONG } from "./terrain";

type Pt = [number, number];

// Điện Biên Phủ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["long-chao","keo-phao","ba-dot","ngay-7-5"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[MUONG_THANH, 64], [SAN_BAY, 40], [ISABELLE, 24]];

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
    seed: 1954,
  });

  // 1. "long-chao": lính dù (đốm xanh nhạt) rơi xuống lòng chảo; các cụm cứ điểm (đốm xanh nhạt) lần lượt dựng quanh sân bay (diễn hoạ).
  const p0 = run("long-chao", 28);
  { const S: Pt[] = [[50, 65], [32, 99], [-5, 110], [-39, 92], [-50, 55], [-32, 21], [5, 10], [39, 28]]; world.add(createGlows({ count: S.length, color: DICH, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 80, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.02 + i * 0.01, 0.16999999999999998 + i * 0.01, k) * (1 - smoothstep(0.3, 0.45, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-chao") })); }
  { const S: Pt[] = [[-10, 120], [150, 120], [120, 10], [-90, 80], [0, 20], [60, -40], [-60, -30], [10, -200]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.4 + i * 0.05, 0.55 + i * 0.05, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("long-chao") })); }
  // 2. "keo-phao": theo thanh kéo, đoàn dân công (son) và đoàn kéo pháo (ngà) vượt núi Pha Sông vào các sườn núi quanh lòng chảo (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["keo-phao"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 4, height: ground, seed: 1984, groups: [{ path: [[390, 380], [300, 300], [230, 220], [180, 160]], count: 80, spread: [3,10], color: SON, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("keo-phao") }));
  world.add(createCrowd({ size: 7, height: ground, seed: 1994, groups: [{ path: [[380, 360], [300, 300], [210, 190]], count: 6, spread: [2,4], color: NGHIA, timing: [[0.05,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("keo-phao") }));
  // 3. "ba-dot": các đơn vị (son) đào hào vây lấn từ chân núi vào các cụm (đốm xanh nhạt) — Him Lam, rồi A1 — các cụm lần lượt tắt (diễn hoạ).
  const p2 = run("ba-dot", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2004, groups: [{ path: [[229, 60], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[157, 195], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[10, 239], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[-125, 167], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[-169, 20], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[-97, -115], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[50, -159], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }, { path: [[185, -87], [30, 40]], count: 14, spread: [4,16], color: SON, timing: [[0.02,0],[0.8,0.6]] }], progress: p2, visible: () => clock.near("ba-dot") }));
  { const S: Pt[] = [[150, 120], [-10, 120], [-90, 80], [120, 10]]; world.add(createGlows({ count: S.length, color: DICH, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.9, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-dot") })); }
  { const S: Pt[] = [[120, 10]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 14, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.85 + i * 0.12, 1 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ba-dot") })); }
  // 4. "ngay-7-5": các đơn vị (son) từ bốn phía tiến vào khu trung tâm Mường Thanh; hầm chỉ huy (đốm xanh nhạt) tắt, đốm vàng sáng (diễn hoạ).
  const p3 = run("ngay-7-5", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2034, groups: [{ path: [[124, 58], [0, 20]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[29, 147], [0, 20]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-95, 108], [0, 20]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-124, -18], [0, 20]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[-29, -107], [0, 20]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }, { path: [[95, -68], [0, 20]], count: 20, spread: [4,16], color: SON, timing: [[0.02,0],[0.75,1]] }], progress: p3, visible: () => clock.near("ngay-7-5") }));
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.6, 0.75, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-7-5") })); }
  { const S: Pt[] = [[0, 20]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 12, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.75 + i * 0.12, 0.9 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ngay-7-5") })); }
};

export default setup;
