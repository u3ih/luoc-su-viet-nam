import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BAN_SON, BOUNDS, DONG_DA, HA_HOI, NGHE_AN, NGOC_HOI, NORTH, ROUTE, TAM_DIEP, THANG_LONG, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Ngọc Hồi – Đống Đa — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng; không vẽ voi, thành luỹ, mộc ván, trang phục, cờ, vũ khí.
// Vị trí các đồn, Thăng Long, Tam Điệp, núi Bân và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số quân.
// Son = quân Tây Sơn, mực = quân Thanh, ngà = vua Lê Chiêu Thống / Quang Trung, vàng = ánh sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cau-vien", "len-ngoi", "tam-diep", "ha-hoi", "ngoc-hoi", "thang-long"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[THANG_LONG, 70], [NGOC_HOI, 45], [HA_HOI, 40], [DONG_DA, 40], [TAM_DIEP, 40], [NGHE_AN, 50]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#35504a", shallow: "#88a078" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 520, bushes: 600, grass: 3200, reeds: 1200 },
    forestAt: 0.55,
    birds: { center: { x: 0, y: 0, z: 100 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.0 },
    seed: 1789,
  });

  // 1. "cau-vien": đốm ngà (vua Lê Chiêu Thống) rời Thăng Long đi lên phía bắc; rồi một đoàn người (mực) từ phía bắc đổ xuống, vào thành;
  //    một quầng sáng vàng nổi lên giữa thành (diễn hoạ).
  const CV = 26;
  const cv = run("cau-vien", CV);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [[THANG_LONG[0] - 10, THANG_LONG[1] + 10], [100, 380], NORTH], count: 1, color: IVORY, size: 1.5, timing: [[0.03, 0], [0.4, 1]] }],
      progress: cv,
      visible: () => clock.near("cau-vien"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 111,
      groups: [
        { path: [[NORTH[0] + 40, 440], [THANG_LONG[0] + 70, 360], [THANG_LONG[0] + 10, THANG_LONG[1] + 10]], count: 70, spread: [40, 80], color: INK, timing: [[0.4, 0], [0.9, 1]], show: [0.38, 2] },
        { path: [[NORTH[0] - 60, 440], [THANG_LONG[0] + 20, 350], [THANG_LONG[0] - 14, THANG_LONG[1] + 4]], count: 50, spread: [40, 70], color: INK, timing: [[0.45, 0], [0.92, 1]], show: [0.43, 2] },
      ],
      progress: cv,
      visible: () => clock.near("cau-vien"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(THANG_LONG[0], ground(THANG_LONG[0], THANG_LONG[1]) + 8, THANG_LONG[1]);
        return smoothstep(0.82, 0.96, cv()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("cau-vien"),
    }),
  );

  // 2. "len-ngoi": người từ nhiều ngả tụ về quanh núi Bân; một quầng sáng vàng nổi lên trên đỉnh; rồi một đoàn rời núi đi ra phía bắc, qua Nghệ An (diễn hoạ).
  const LN = 26;
  const ln = run("len-ngoi", LN);
  const [bx, bz] = BAN_SON;
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 112,
      groups: [
        { path: [[bx - 220, bz + 40], [bx - 100, bz + 14], [bx - 20, bz + 2]], count: 30, spread: [24, 50], color: SON, timing: [[0.03, 0], [0.5, 1]] },
        { path: [[bx + 200, bz + 60], [bx + 100, bz + 24], [bx + 22, bz + 4]], count: 30, spread: [24, 50], color: SON, timing: [[0.06, 0], [0.52, 1]] },
        { path: [[bx + 20, bz + 200], [bx + 10, bz + 90], [bx + 4, bz + 28]], count: 24, spread: [24, 40], color: SON, timing: [[0.08, 0], [0.54, 1]] },
        { path: [[bx, bz + 30], [NGHE_AN[0], NGHE_AN[1]], [NGHE_AN[0] + 10, NGHE_AN[1] + 80]], count: 70, spread: [26, 90], color: SON, timing: [[0.66, 0], [1, 1]], show: [0.64, 2] },
      ],
      progress: ln,
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(bx, height(bx, bz) + 9, bz);
        return smoothstep(0.5, 0.68, ln()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(BAN_SON, 40, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("len-ngoi") * smoothstep(0.4, 0.8, ln()),
      size: 3.6,
      glow: () => 0.8,
    }),
  );

  // 3. "tam-diep": lửa trại sáng ở Tam Điệp (ăn Tết sớm); người xem kéo thanh — đoàn quân (son) đi theo đường lên phía bắc, qua Hà Hồi, tới sát
  //    Ngọc Hồi; lửa trại tắt dần khi đoàn đi (diễn hoạ).
  const march = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(TAM_DIEP, 30, (i / 8) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.5 };
      }),
      lit: (ctx) => clock.near("tam-diep") * (1 - smoothstep(0.05, 0.45, march(ctx))),
      size: 3.8,
      glow: () => 0.95,
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 113,
      groups: [
        { path: ROUTE, count: 120, spread: [24, 110], color: SON },
        { path: ROUTE, count: 1, color: IVORY, size: 1.5, timing: [[0, -0.03], [1, 0.97]] },
      ],
      progress: (ctx) => 0.03 + 0.97 * march(ctx),
      visible: () => clock.near("tam-diep"),
    }),
  );

  // 4. "ha-hoi": ban đêm, quân Tây Sơn (son) từ phía nam lặng lẽ tiến sát đồn Hà Hồi, nơi quân Thanh (mực) đứng quanh đống lửa; sau đó một cánh khác
  //    (son) từ phía tây tiến tới Khương Thượng; hai điểm lửa sáng lên (diễn hoạ — không vẽ cảnh đầu hàng hay giao chiến cụ thể).
  const HH = 28;
  const hh = run("ha-hoi", HH);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 114,
      groups: [
        { path: [ring(HA_HOI, 18, 0.3), ring(HA_HOI, 20, 0.35)], count: 36, spread: [36, 36], color: INK },
        { path: [ring(DONG_DA, 16, 0.3), ring(DONG_DA, 18, 0.35)], count: 28, spread: [30, 30], color: INK },
        { path: [[HA_HOI[0] - 20, HA_HOI[1] - 190], [HA_HOI[0] - 8, HA_HOI[1] - 90], [HA_HOI[0], HA_HOI[1] - 36]], count: 70, spread: [22, 70], color: SON, timing: [[0.03, 0], [0.55, 1]] },
        { path: [[DONG_DA[0] - 150, DONG_DA[1] - 110], [DONG_DA[0] - 70, DONG_DA[1] - 50], [DONG_DA[0] - 10, DONG_DA[1] - 20]], count: 44, spread: [20, 50], color: SON, timing: [[0.45, 0], [0.92, 1]], show: [0.43, 2] },
      ],
      progress: hh,
      visible: () => clock.near("ha-hoi"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(HA_HOI, 28, (i / 4) * Math.PI * 2 + 0.4);
          return { x, y: height(x, z) + 1, z, order: 0, size: 1.4 };
        }),
        ...Array.from({ length: 3 }, (_, i) => {
          const [x, z] = ring(DONG_DA, 26, (i / 3) * Math.PI * 2 + 0.9);
          return { x, y: height(x, z) + 1, z, order: 0.6 + i * 0.1, size: 1.4 };
        }),
      ],
      lit: () => clock.near("ha-hoi") * smoothstep(0.1, 0.35, hh()),
      size: 3.6,
      glow: () => 0.9,
    }),
  );

  // 5. "ngoc-hoi": đoàn quân Tây Sơn (son) dồn thành một khối chặt từ phía nam tiến vào đồn Ngọc Hồi; quân Thanh (mực) ở đồn ngã dần; cùng lúc cánh phía tây
  //    đánh vỡ Khương Thượng (diễn hoạ — không vẽ mộc ván, voi, vũ khí).
  const NH = 30;
  const nh = run("ngoc-hoi", NH);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 115,
      groups: [
        { path: [ring(NGOC_HOI, 24, 1.1), ring(NGOC_HOI, 26, 1.15)], count: 56, spread: [40, 40], color: INK, mortal: true },
        { path: [[NGOC_HOI[0] - 10, NGOC_HOI[1] - 190], [NGOC_HOI[0] - 8, NGOC_HOI[1] - 90], [NGOC_HOI[0] - 4, NGOC_HOI[1] - 20], [NGOC_HOI[0], NGOC_HOI[1]]], count: 100, spread: [12, 60], color: SON, timing: [[0.05, 0], [0.62, 1]] },
      ],
      progress: nh,
      fall: () => smoothstep(0.55, 0.8, nh()),
      visible: () => clock.near("ngoc-hoi"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 116,
      groups: [
        { path: [ring(DONG_DA, 14, 0.3), ring(DONG_DA, 16, 0.35)], count: 24, spread: [26, 26], color: INK, mortal: true },
        { path: [[DONG_DA[0] - 80, DONG_DA[1] - 60], [DONG_DA[0] - 30, DONG_DA[1] - 24], [DONG_DA[0] - 2, DONG_DA[1] - 2]], count: 46, spread: [18, 40], color: SON, timing: [[0.1, 0], [0.55, 1]] },
      ],
      progress: nh,
      fall: () => smoothstep(0.5, 0.75, nh()),
      visible: () => clock.near("ngoc-hoi"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(NGOC_HOI, 30, (i / 4) * Math.PI * 2 + 0.6);
          return { x, y: height(x, z) + 1, z, order: i / 8 + 0.5, size: 1.5 };
        }),
        ...Array.from({ length: 3 }, (_, i) => {
          const [x, z] = ring(DONG_DA, 26, (i / 3) * Math.PI * 2 + 0.3);
          return { x, y: height(x, z) + 1, z, order: i / 8 + 0.5, size: 1.5 };
        }),
      ],
      lit: () => clock.near("ngoc-hoi") * smoothstep(0.55, 0.9, nh()),
      size: 4,
      glow: () => 0.85,
    }),
  );

  // 6. "thang-long": quân Tây Sơn (son) từ phía nam vào Thăng Long; một đoàn người (mực) cùng đốm ngà (Lê Chiêu Thống) rời thành đi lên phía bắc;
  //    ánh sáng trong thành sáng dần; một đốm son từ thành đi lên phía bắc (sứ giảng hoà) (diễn hoạ).
  const TL = 28;
  const tl = run("thang-long", TL);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 117,
      groups: [
        { path: [[NGOC_HOI[0] + 10, NGOC_HOI[1] + 10], [THANG_LONG[0] - 20, THANG_LONG[1] - 90], [THANG_LONG[0] - 4, THANG_LONG[1] - 6]], count: 80, spread: [30, 80], color: SON, timing: [[0.03, 0], [0.55, 1]] },
        { path: [[THANG_LONG[0] + 4, THANG_LONG[1] + 14], [THANG_LONG[0] + 40, 360], NORTH, [NORTH[0] + 10, 440]], count: 60, spread: [40, 80], color: INK, timing: [[0.1, 0], [0.8, 1]] },
      ],
      progress: tl,
      visible: () => clock.near("thang-long"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [
        { path: [[THANG_LONG[0] + 4, THANG_LONG[1] + 14], [THANG_LONG[0] + 40, 360], NORTH, [NORTH[0] + 10, 440]], count: 1, color: IVORY, size: 1.5, timing: [[0.1, 0.02], [0.8, 1.02]] },
        { path: [[THANG_LONG[0] - 6, THANG_LONG[1] + 6], [THANG_LONG[0] + 30, 350], NORTH], count: 1, color: GOLD, size: 1.3, timing: [[0.62, 0], [1, 1]], show: [0.6, 2] },
      ],
      progress: tl,
      visible: () => clock.near("thang-long"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 9 }, (_, i) => {
        const [x, z] = ring(THANG_LONG, 30 + (i % 3) * 14, (i / 9) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 9, size: 1.5 };
      }),
      lit: () => clock.near("thang-long") * smoothstep(0.45, 0.95, tl()),
      size: 4,
      glow: () => 0.8,
    }),
  );
};

export default setup;
