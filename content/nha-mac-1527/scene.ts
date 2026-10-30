import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { AI, BOUNDS, CAO_BANG, DUONG_AI, DUONG_CAO, DUONG_LE, THANG_LONG, THANH_HOA, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Nhà Mạc — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật và các phe = đốm sáng; không vẽ cung điện, cờ hiệu, trang phục, ấn. Vị trí Thăng Long, Cao Bằng, ải biên giới, Thanh Hoá và đường đi là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = Mạc Đăng Dung / nhà Mạc; xanh nhạt = phe Lê – Trịnh; xám xanh = phía nhà Minh; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const IVORY = "#f0e2b8";
const LE = "#a8c8f0";
const MINH = "#b9c4d4";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const lerpPath = (path: Pt[], t: number): Pt => {
  const n = path.length - 1;
  const f = clamp(t) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
};

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi", "nha-minh", "nam-bac", "mat-thang-long", "cao-bang"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 55], [CAO_BANG, 50], [AI, 40]];

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
    counts: { trees: 380, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1527,
  });

  // 1. "len-ngoi": từng nhóm người (son) từ các hướng đổ về Thăng Long; một đốm ngà (nhà Mạc) sáng dần ở giữa; đèn quanh kinh thành bật dần (diễn hoạ).
  const LN = 26;
  const ln = run("len-ngoi", LN);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1521,
      groups: [
        { path: [[-130, 110], [-40, 70], ring(THANG_LONG, 16, 2.9)], count: 22, spread: [26, 56], color: SON, timing: [[0.03, 0], [0.8, 1]] },
        { path: [[-140, -90], [-30, -40], ring(THANG_LONG, 16, 3.6)], count: 18, spread: [26, 56], color: SON, timing: [[0.08, 0], [0.85, 1]] },
        { path: [[60, 230], [58, 110], ring(THANG_LONG, 14, 1.6)], count: 14, spread: [26, 46], color: SON, timing: [[0.12, 0], [0.9, 1]] },
      ],
      progress: ln,
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 18,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(THANG_LONG[0], ground(THANG_LONG[0], THANG_LONG[1]) + 8, THANG_LONG[1]);
        return 0.8 * smoothstep(0.3, 0.8, ln()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 7 }, (_, i) => {
        const [x, z] = ring(THANG_LONG, 30 + (i % 2) * 12, (i / 7) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.2 };
      }),
      lit: () => clock.near("len-ngoi") * smoothstep(0.4, 0.95, ln()),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 2. "nha-minh": một đốm ngà (nhà Mạc) đi từ Thăng Long tới ải biên giới và dừng lại; ở ải có nhóm đốm xám xanh (phía nhà Minh) và vài người (son) (diễn hoạ).
  const NM = 28;
  const nm = run("nha-minh", NM);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 4,
      groups: [{ path: DUONG_AI, count: 1, color: IVORY, size: 1.6, timing: [[0.05, 0], [0.8, 1]] }],
      progress: nm,
      visible: () => clock.near("nha-minh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1522,
      groups: [{ path: [[AI[0] + 60, AI[1] + 40], ring(AI, 18, 0.8)], count: 14, spread: [30, 24], color: MINH, size: 1.2, timing: [[0, 0], [0.5, 1]] }],
      progress: nm,
      visible: () => clock.near("nha-minh"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1523,
      groups: [{ path: DUONG_AI, count: 10, spread: [20, 40], color: SON, timing: [[0.1, 0], [0.8, 0.95]] }],
      progress: nm,
      visible: () => clock.near("nha-minh"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(AI, 28, (i / 5) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 };
      }),
      lit: () => clock.near("nha-minh") * smoothstep(0.3, 0.9, nm()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 3. "nam-bac": hai nhóm người đi lại ở giữa — nhóm xanh nhạt (phe Lê – Trịnh) từ phía nam, nhóm son (nhà Mạc) từ Thăng Long; hai đốm sáng đứng hai đầu, giằng co qua lại (diễn hoạ).
  const NB = 30;
  const nb = run("nam-bac", NB);
  const swing = (ctx: FrameCtx, phase: number) => 0.5 + 0.5 * Math.sin(ctx.time * 0.35 + phase);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1524,
      groups: [{ path: [[THANH_HOA[0] + 20, THANH_HOA[1] + 40], [-10, -170], [20, -80]], count: 22, spread: [30, 60], color: SON, timing: [[0, 0.1], [1, 0.8]] }],
      progress: (ctx) => 0.15 + 0.85 * swing(ctx, 0) * smoothstep(0, 0.2, nb()),
      visible: () => clock.near("nam-bac"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1525,
      groups: [{ path: [[THANG_LONG[0] - 8, THANG_LONG[1] - 18], [30, -60], [10, -130]], count: 16, spread: [28, 50], color: IVORY, size: 1.2 }],
      progress: (ctx) => 0.15 + 0.8 * swing(ctx, 2.2) * smoothstep(0, 0.2, nb()),
      visible: () => clock.near("nam-bac"),
    }),
  );
  world.add(
    createGlows({
      count: 2,
      color: (i) => (i === 0 ? LE : IVORY),
      size: 16,
      minPx: 16,
      place: (i, ctx, out) => {
        const p = i === 0 ? THANH_HOA : THANG_LONG;
        out.set(p[0], ground(p[0], p[1]) + 8, p[1]);
        return 0.7 * smoothstep(0, 0.2, nb()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.6 + i));
      },
      visible: () => clock.near("nam-bac"),
    }),
  );

  // 4. "mat-thang-long": người xem kéo thanh — đoàn xanh nhạt (quân Lê – Trịnh) đi từ phía nam ra Thăng Long; đốm ngà (nhà Mạc) lùi dần lên phía bắc theo đường lên Cao Bằng (diễn hoạ).
  const tien = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1526,
      groups: [{ path: DUONG_LE, count: 30, spread: [30, 70], color: LE, size: 1.1 }],
      progress: (ctx) => 0.02 + 0.98 * tien(ctx),
      visible: () => clock.near("mat-thang-long"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 16,
      minPx: 16,
      place: (_, ctx, out) => {
        const [x, z] = lerpPath(DUONG_CAO, smoothstep(0.55, 1, tien(ctx)) * 0.55);
        out.set(x, ground(x, z) + 8, z);
        return 0.8 * (1 - 0.5 * smoothstep(0.7, 1, tien(ctx))) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("mat-thang-long"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(THANG_LONG, 30, (i / 6) * Math.PI * 2 + 0.5);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 };
      }),
      lit: (ctx) => clock.near("mat-thang-long") * smoothstep(0.1, 0.9, tien(ctx)),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 5. "cao-bang": một đốm ngà sáng ở Cao Bằng; từng nhóm người (son) đi lên theo đường từ Thăng Long và tụ lại; ánh lửa trong núi bật dần (diễn hoạ).
  const CB = 28;
  const cb = run("cao-bang", CB);
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 24,
      minPx: 24,
      place: (_, ctx, out) => {
        out.set(CAO_BANG[0], ground(CAO_BANG[0], CAO_BANG[1]) + 10, CAO_BANG[1]);
        return 0.85 * smoothstep(0.03, 0.3, cb()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("cao-bang"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1527,
      groups: [
        { path: DUONG_CAO, count: 24, spread: [26, 60], color: SON, timing: [[0.03, 0], [0.8, 1]] },
        { path: [[-20, 30], [-60, 130], [-110, 220], ring(CAO_BANG, 20, 4.2)], count: 14, spread: [24, 44], color: SON, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: cb,
      visible: () => clock.near("cao-bang"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(CAO_BANG, 26 + (i % 2) * 10, (i / 8) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 };
      }),
      lit: () => clock.near("cao-bang") * smoothstep(0.3, 0.9, cb()),
      size: 3,
      glow: () => 0.8,
    }),
  );
};

export default setup;
