import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, NORTH, QUY_NHON, TAY_SON, TRAM, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Tây Sơn — cảnh CÁCH ĐIỆU. Người = chấm dáng người, ba anh em = đốm sáng; không vẽ trang phục, cờ, voi, cái cũi, dinh luỹ.
// Vị trí ấp Tây Sơn, thành Quy Nhơn, trạm thu thuế và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều.
// Đất = dân làng, son = quân Tây Sơn, mực = quân giữ thành / quân Trịnh, ngà = Nguyễn Nhạc và các anh em, vàng = chúa Nguyễn / quyền thần.

const EARTH = "#8a7a5a";
const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
const shuttle = (pts: Pt[], n: number): Pt[] => Array.from({ length: n }, () => roundTrip(pts).slice(0, -1)).flat().concat([pts[0]]);
const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);

/** Phía bắc: nơi quân từ phía bắc vào, và nơi chúa Nguyễn lùi về (Phú Xuân → Quảng Nam, diễn hoạ). */
const PHU_XUAN: Pt = [NORTH[0], 330];
const QUANG_NAM: Pt = [95, 190];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["chua-suy", "ba-anh-em", "tay-son", "quy-nhon", "ba-ben"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - TAY_SON[0], z - TAY_SON[1]) > 55 && Math.hypot(x - QUY_NHON[0], z - QUY_NHON[1]) > 55 && Math.hypot(x - TRAM[0], z - TRAM[1]) > 50,
    water: { deep: "#2a4a52", shallow: "#82a08c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 50, z: 320 } },
    counts: { trees: 650, bushes: 600, grass: 3500, reeds: 900 },
    forestAt: 0.52,
    birds: { center: { x: 0, y: 0, z: 100 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1771,
  });

  // 1. "chua-suy": dân từ các làng đi về một điểm giữa đồng bằng rồi quay lại, nhiều lượt; một quầng sáng vàng đứng ở điểm ấy (diễn hoạ).
  const CS = 26;
  const cs = run("chua-suy", CS);
  const villages: Pt[] = [[-30, 230], [-70, 30], [210, 150], [150, -80], [140, 270]];
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 81,
      groups: villages.map(([x, z], i) => ({
        path: shuttle([[x, z], [TRAM[0] + (x - TRAM[0]) * 0.12, TRAM[1] + (z - TRAM[1]) * 0.12]], 2),
        count: 16,
        spread: [26, 28],
        color: EARTH,
        timing: [[0.03 + i * 0.05, 0], [0.95, 1]] as [number, number][],
      })),
      progress: cs,
      visible: () => clock.near("chua-suy"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 14,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(TRAM[0], height(TRAM[0], TRAM[1]) + 7, TRAM[1]);
        return smoothstep(0.02, 0.15, cs()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("chua-suy"),
    }),
  );

  // 2. "ba-anh-em": ba đốm sáng (ngà) ở ấp Tây Sơn; một đốm đi từ đồng bằng về ấp rồi cả ba đứng cạnh nhau; dân làng quanh ấp qua lại (diễn hoạ).
  const BA = 26;
  const ba = run("ba-anh-em", BA);
  const [ax, az] = TAY_SON;
  const post: Pt = [ax + 190, az + 55];
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 82,
      groups: [
        { path: shuttle([ring(TAY_SON, 18, 0.3), ring(TAY_SON, 70, 0.5)], 3), count: 14, spread: [18, 12], color: EARTH },
        { path: shuttle([ring(TAY_SON, 20, 2.2), ring(TAY_SON, 80, 2.0)], 3), count: 14, spread: [18, 12], color: EARTH, timing: [[0.1, 0], [1, 1]] },
        { path: shuttle([ring(TAY_SON, 22, 4.1), ring(TAY_SON, 75, 4.4)], 3), count: 12, spread: [16, 12], color: EARTH, timing: [[0.2, 0], [1, 1]] },
      ],
      progress: ba,
      visible: () => clock.near("ba-anh-em"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [post, [ax + 90, az + 30], [ax + 8, az + 4]], count: 1, color: IVORY, size: 1.3, timing: [[0.05, 0], [0.55, 1]] }],
      progress: ba,
      visible: () => clock.near("ba-anh-em"),
    }),
  );
  world.add(
    createGlows({
      count: 2,
      color: IVORY,
      size: 12,
      minPx: 16,
      place: (i, ctx, out) => {
        const [x, z] = ring(TAY_SON, 10, 2.4 + i * 1.6);
        out.set(x, height(x, z) + 5, z);
        return smoothstep(0.1, 0.3, ba()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.9 + i));
      },
      visible: () => clock.near("ba-anh-em"),
    }),
  );

  // 3. "tay-son": người xem kéo thanh — dân từ các làng (đất) tụ về đồn trại, đổi dần sang màu son khi tới nơi; kéo xong thì lửa trại sáng lên.
  const gather = (ctx: FrameCtx) => clamp((ctx.inputs["keo-ve"] ?? 0) / 0.9);
  const sinceIn = (ctx: FrameCtx) => (ctx.completedAt["keo-ve"] ? (ctx.now - ctx.completedAt["keo-ve"]) / 1000 : 0);
  const from: Pt[][] = [
    [[ax + 230, az + 80], [ax + 110, az + 40], [ax + 16, az + 4]],
    [[ax + 60, az + 230], [ax + 30, az + 110], [ax + 6, az + 14]],
    [[ax + 150, az - 120], [ax + 70, az - 40], [ax + 12, az - 4]],
    [[ax - 60, az - 150], [ax - 24, az - 60], [ax - 6, az - 8]],
  ];
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 83,
      groups: from.map((path, i) => ({ path, count: 26, spread: [24, 40], color: EARTH, arrive: SON, timing: [[0, -0.02 * i], [1, 1]] as [number, number][] })),
      progress: (ctx) => 0.02 + 0.98 * gather(ctx),
      visible: () => clock.near("tay-son"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 14,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(ax, height(ax, az) + 6, az);
        return (0.45 + 0.4 * gather(ctx)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("tay-son"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 7 }, (_, i) => {
        const [x, z] = ring(TAY_SON, 30, (i / 7) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.4 };
      }),
      lit: (ctx) => clock.near("tay-son") * smoothstep(0.3, 6, sinceIn(ctx)),
      size: 3.6,
      glow: () => 0.9,
    }),
  );

  // 4. "quy-nhon": một nhóm nhỏ đi vào cổng thành giữa đêm, quân giữ thành (mực) đứng quanh; rồi quân Tây Sơn (son) từ phía tây tràn vào,
  //    quân giữ thành tan đi, lửa trong thành sáng lên (diễn hoạ — không vẽ cái cũi, cổng thành, vũ khí).
  const QN = 26;
  const qn = run("quy-nhon", QN);
  const [qx, qz] = QUY_NHON;
  const gate: Pt = [qx - 55, qz + 6];
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 84,
      groups: [{ path: [ring(QUY_NHON, 38, 0.2), ring(QUY_NHON, 40, 0.25)], count: 36, spread: [60, 60], color: INK, show: [0, 0.62] }],
      progress: qn,
      visible: () => clock.near("quy-nhon"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => ground(x, z) + 4,
      groups: [{ path: [[qx - 200, qz + 40], [qx - 110, qz + 24], gate, [qx - 20, qz + 4]], count: 1, color: IVORY, size: 1.3, timing: [[0.03, 0], [0.5, 1]] }],
      progress: qn,
      visible: () => clock.near("quy-nhon"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 85,
      groups: [
        { path: [[qx - 230, qz + 50], [qx - 120, qz + 26], gate, [qx - 5, qz + 2]], count: 40, spread: [20, 50], color: SON, timing: [[0.52, 0], [0.9, 1]], show: [0.5, 2] },
        { path: [[qx - 230, qz - 40], [qx - 120, qz - 24], [gate[0], gate[1] - 14], [qx + 5, qz - 8]], count: 30, spread: [18, 44], color: SON, timing: [[0.55, 0], [0.93, 1]], show: [0.53, 2] },
      ],
      progress: qn,
      visible: () => clock.near("quy-nhon"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(QUY_NHON, 24, (i / 6) * Math.PI * 2 + 0.5);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.5 };
      }),
      lit: () => clock.near("quy-nhon") * smoothstep(0.7, 0.95, qn()),
      size: 3.8,
      glow: () => 0.9,
    }),
  );

  // 5. "ba-ben": quân từ phía bắc (mực) tiến xuống, đẩy quầng sáng vàng (chúa Nguyễn) lùi từ Phú Xuân vào Quảng Nam; quân Tây Sơn (son) giữ Quy Nhơn
  //    và đông dần; cuối cùng một quầng sáng lớn nổi lên ở Quy Nhơn (diễn hoạ — các thế lực chỉ là chấm và ánh sáng, không có đường biên).
  const BB = 28;
  const bb = run("ba-ben", BB);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 86,
      groups: [
        { path: [[NORTH[0] + 10, 430], PHU_XUAN, [QUANG_NAM[0] + 30, QUANG_NAM[1] + 60]], count: 60, spread: [60, 70], color: INK, timing: [[0.05, 0], [0.7, 1]] },
        { path: [[qx - 60, qz - 20], [qx - 30, qz - 4]], count: 28, spread: [60, 40], color: SON },
        { path: [[qx - 220, qz + 100], [qx - 110, qz + 40], [qx - 20, qz + 4]], count: 34, spread: [30, 50], color: SON, timing: [[0.3, 0], [0.9, 1]], show: [0.28, 2] },
      ],
      progress: bb,
      visible: () => clock.near("ba-ben"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 6,
      groups: [{ path: [PHU_XUAN, [(PHU_XUAN[0] + QUANG_NAM[0]) / 2, (PHU_XUAN[1] + QUANG_NAM[1]) / 2], QUANG_NAM], count: 1, color: GOLD, size: 1.6, timing: [[0.25, 0], [0.7, 1]] }],
      progress: bb,
      visible: () => clock.near("ba-ben"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 26,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(qx, height(qx, qz) + 9, qz);
        return smoothstep(0.78, 0.95, bb()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.6));
      },
      visible: () => clock.near("ba-ben"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(QUY_NHON, 24, (i / 6) * Math.PI * 2 + 0.5);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.5 };
      }),
      lit: () => clock.near("ba-ben") * smoothstep(0.1, 0.5, bb()),
      size: 3.8,
      glow: () => 0.85,
    }),
  );
};

export default setup;
