import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TRUNG_TAM, KHAM_THIEN, BACH_MAI, TRAN_DIA } from "./terrain";

type Pt = [number, number];

// Mười hai ngày đêm — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ban-dam-phan","b52","kham-thien","tro-lai-paris"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRUNG_TAM, 40], [KHAM_THIEN, 24], [BACH_MAI, 20]];

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
    seed: 19722,
  });

  // 1. "ban-dam-phan": hai đốm (son và xanh nhạt) tiến lại gần nhau trên cao giữa thành phố rồi tắt (đàm phán đổ vỡ) (diễn hoạ).
  const p0 = run("ban-dam-phan", 28);
  { const S: Pt[] = [[-60, 0]]; world.add(createGlows({ count: S.length, color: SON, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-dam-phan") })); }
  { const S: Pt[] = [[60, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.65, 0.85, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-dam-phan") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.3 + i * 0.12, 0.44999999999999996 + i * 0.12, k) * (1 - smoothstep(0.55, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-dam-phan") })); }
  // 2. "b52": theo thanh kéo, các tốp máy bay (đốm xanh nhạt, cách điệu) bay ngang trên cao; các cột đốm son (tên lửa) vút lên từ trận địa; lửa trên mặt đất (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["b52"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 14, height: (x, z) => ground(x, z) + 120, seed: 19762, groups: [{ path: [[-380, 260], [0, 40], [380, -200]], count: 12, spread: [20,40], color: DICH, timing: [[0.02,0],[0.9,1]] }], progress: (ctx) => 0.02 + 0.98 * inp1(ctx), visible: () => clock.near("b52") }));
  { const S: Pt[] = [[-140, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[-140, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.24000000000000002 + i * 0.12, 0.39 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[-140, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.28 + i * 0.12, 0.43000000000000005 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[-140, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.32 + i * 0.12, 0.47 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[-140, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 90, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.36 + i * 0.12, 0.51 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[-140, 60]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 110, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[100, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[100, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.38999999999999996 + i * 0.12, 0.5399999999999999 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[100, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.43 + i * 0.12, 0.58 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[100, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.47 + i * 0.12, 0.62 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[100, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 90, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.51 + i * 0.12, 0.66 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[100, 120]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 110, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.55 + i * 0.12, 0.7000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[60, -160]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[60, -160]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 30, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.54 + i * 0.12, 0.6900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[60, -160]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 50, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.58 + i * 0.12, 0.73 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[60, -160]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.62 + i * 0.12, 0.77 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[60, -160]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 90, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.66 + i * 0.12, 0.81 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  { const S: Pt[] = [[60, -160]]; world.add(createGlows({ count: S.length, color: SON, size: 10, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 110, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("b52") })); }
  world.add(createFires({ sites: [[-50, -40], [20, -110], [80, 60], [-100, 120]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("b52") * smoothstep(0.4, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  // 3. "kham-thien": lửa dọc dãy phố Khâm Thiên và ở bệnh viện Bạch Mai; các đốm ngà (nhà dân) tắt (diễn hoạ).
  const p2 = run("kham-thien", 28);
  world.add(createFires({ sites: [[-110, -20], [-90, -27], [-70, -33], [-50, -40], [-30, -47], [-10, -53], [10, -60]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("kham-thien") * smoothstep(0.05, 0.9, p2()), size: 3, glow: () => 0.8 }));
  world.add(createFires({ sites: [[20, -110], [30, -100]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("kham-thien") * smoothstep(0.3, 0.9, p2()), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[-110, -30], [-93, -36], [-76, -41], [-59, -47], [-41, -53], [-24, -59], [-7, -64], [10, -70]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 12, minPx: 12, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p2(); return 0.8 * smoothstep(0 + i * 0, 0.15 + i * 0, k) * (1 - smoothstep(0.2, 0.5, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("kham-thien") })); }
  // 4. "tro-lai-paris": thành phố yên lại; hai đốm (son, xanh nhạt) lại gặp nhau, đốm vàng sáng (hiệp định) (diễn hoạ).
  const p3 = run("tro-lai-paris", 28);
  { const S: Pt[] = [[-50, 0]]; world.add(createGlows({ count: S.length, color: SON, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-lai-paris") })); }
  { const S: Pt[] = [[50, 0]]; world.add(createGlows({ count: S.length, color: DICH, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-lai-paris") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: GOLD, size: 24, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 40, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tro-lai-paris") })); }
};

export default setup;
