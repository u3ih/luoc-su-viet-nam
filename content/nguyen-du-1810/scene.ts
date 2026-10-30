import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, TIEN_DIEN, THANG_LONG, QUANG_BINH } from "./terrain";

type Pt = [number, number];

// Nguyễn Du — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tien-dien", "gio-bui", "truyen-kieu", "thoi-diem", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TIEN_DIEN, 55], [THANG_LONG, 55], [QUANG_BINH, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1810,
  });

  // 1. "tien-dien": các nhóm người (son) tụ về làng Tiên Điền, một đốm ngà sáng dần, lửa bật lên (diễn hoạ).
  const p0 = run("tien-dien", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1810, groups: [{ path: [[-200, 70], [-60, 40], TIEN_DIEN], count: 18, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [[60, -150], [90, -80], TIEN_DIEN], count: 12, spread: [26,50], color: SON, timing: [[0.1,0],[0.85,1]] }], progress: p0, visible: () => clock.near("tien-dien") }));
  { const S: Pt[] = [TIEN_DIEN]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("tien-dien") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(TIEN_DIEN, 28, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("tien-dien") * smoothstep(0.3, 0.9, p0()), size: 3, glow: () => 0.8 }));
  // 2. "gio-bui": một nhóm người (son) đi từ Tiên Điền ra Thăng Long, đốm vàng sáng ở Thăng Long (diễn hoạ).
  const p1 = run("gio-bui", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1820, groups: [{ path: [TIEN_DIEN, [60, 120], [20, 250], THANG_LONG], count: 12, spread: [26,40], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p1, visible: () => clock.near("gio-bui") }));
  { const S: Pt[] = [THANG_LONG]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("gio-bui") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(THANG_LONG, 30, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("gio-bui") * smoothstep(0.3, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "truyen-kieu": những đốm sáng ngà hiện dần theo một đường cong phía trước làng theo thanh kéo, tượng trưng độ dài của tác phẩm (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["cau-tho"] ?? 0) / 0.9);
  { const S: Pt[] = [[92.79220884557458, 98.64571746546514], [65.73780559730253, 90.70182792113467], [41.591706956874575, 76.14119480786111], [21.94046349832034, 55.92054331624814], [8.075285534902136, 31.36849744924598], [0.9072024790506958, 4.098281067320153], [0.9072024790506958, -24.09828106732022], [8.07528553490215, -51.36849744924601], [21.940463498320355, -75.92054331624816], [41.59170695687452, -96.14119480786107], [65.73780559730255, -110.70182792113468], [92.79220884557468, -118.64571746546517]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0 + i * 0.07, 0.15 + i * 0.07, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truyen-kieu") })); }
  { const S: Pt[] = [TIEN_DIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truyen-kieu") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1830, groups: [{ path: [[-80, 120], TIEN_DIEN], count: 10, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("truyen-kieu") }));
  world.add(createFires({ sites: Array.from({ length: 4 }, (_, i) => { const [x, z] = ring(TIEN_DIEN, 28, (i / 4) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.1 }; }), lit: (ctx) => clock.near("truyen-kieu") * smoothstep(0.1, 0.9, inp2(ctx)), size: 3, glow: () => 0.8 }));
  // 4. "thoi-diem": một nhóm người (son) đi từ Tiên Điền xuống Quảng Bình, đốm vàng sáng ở Quảng Bình (diễn hoạ).
  const p3 = run("thoi-diem", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1840, groups: [{ path: [TIEN_DIEN, [100, -120], [70, -230], QUANG_BINH], count: 12, spread: [26,40], color: SON, timing: [[0.04,0],[0.85,1]] }], progress: p3, visible: () => clock.near("thoi-diem") }));
  { const S: Pt[] = [QUANG_BINH]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thoi-diem") })); }
  world.add(createFires({ sites: Array.from({ length: 5 }, (_, i) => { const [x, z] = ring(QUANG_BINH, 28, (i / 5) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 }; }), lit: () => clock.near("thoi-diem") * smoothstep(0.3, 0.9, p3()), size: 3, glow: () => 0.8 }));
  // 5. "ve-sau": quầng vàng dịu ở Tiên Điền, các nhóm người (son) về đứng lặng, lửa bật dần (diễn hoạ).
  const p4 = run("ve-sau", 28);
  { const S: Pt[] = [TIEN_DIEN]; world.add(createGlows({ count: S.length, color: GOLD, size: 20, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 8, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1850, groups: [{ path: [[-80, 100], [40, 40], TIEN_DIEN], count: 16, spread: [26,50], color: SON, timing: [[0.04,0],[0.85,1]] }, { path: [QUANG_BINH, [90, -130], TIEN_DIEN], count: 10, spread: [26,50], color: SON, timing: [[0.14,0],[0.85,1]] }], progress: p4, visible: () => clock.near("ve-sau") }));
  world.add(createFires({ sites: Array.from({ length: 8 }, (_, i) => { const [x, z] = ring(TIEN_DIEN, 36, (i / 8) * Math.PI * 2 + 0.3); return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 }; }), lit: () => clock.near("ve-sau") * smoothstep(0.3, 0.9, p4()), size: 3, glow: () => 0.8 }));
};

export default setup;
