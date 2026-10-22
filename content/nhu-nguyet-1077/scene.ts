import { clamp, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires, type FireSite } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createStakeField, type StakeLine } from "@/core/world/stakes";
import config from "./scene.config";
import { BOUNDS, CAMP_N, CAMP_S, KHAM, LIEM, PASS_E, PASS_W, TEMPLE, UNG, WATER, bankDist, colorize, height, riverZ } from "./terrain";

type Pt = [number, number];

// Phòng tuyến Như Nguyệt — cảnh CÁCH ĐIỆU. Người = chấm dáng người (sang sông = chấm đi trên mặt nước); thành, đền = đốm sáng; không vẽ thuyền, bè, luỹ tre,
// doanh trại, cờ, vũ khí, trang phục (chưa có hiện vật/hình ảnh đủ chắc). Vị trí, đường quân đi là diễn hoạ, không phải bản đồ trận. Son = quân Đại Việt,
// mực = quân Tống, ngà = người đứng đầu / sứ giả, vàng = ánh sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const onWater = (x: number, z: number) => Math.max(height(x, z), WATER);
const at = (c: Pt, dx: number, dz: number): Pt => [c[0] + dx, c[1] + dz];
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
/** Đi vòng quanh `c` bán kính `r`, `laps` vòng. */
const circle = (c: Pt, r: number, laps: number): Pt[] => Array.from({ length: laps * 16 + 1 }, (_, i) => [c[0] + Math.cos((i / 16) * Math.PI * 2) * r, c[1] + Math.sin((i / 16) * Math.PI * 2) * r]);

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["tien-phat", "ung-chau", "phong-tuyen", "quach-quy", "tho-than", "phan-cong", "hoa-nghi"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - TEMPLE[0], z - TEMPLE[1]) > 30 && Math.hypot(x - CAMP_N[0], z - CAMP_N[1]) > 75,
    water: { deep: "#2b4640", shallow: "#7b9680" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 480, bushes: 650, grass: 4500, reeds: 1800 },
    birds: { center: { x: 0, y: 0, z: 30 }, radius: 190 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 31,
  });

  // ---- cọc dưới sông (dựng khi người xem kéo ở "phong-tuyen"), giữ nguyên từ đó trở đi ----
  const BEAT_PT = world.beat("phong-tuyen");
  const lines: StakeLine[] = [];
  for (let x = -260; x < 260; x += 65) lines.push({ from: [x, riverZ(x) - 14], to: [x + 65, riverZ(x + 65) - 14] });
  world.add(
    await createStakeField({
      lines,
      rows: 3,
      height,
      top: WATER + 0.7,
      toward: [0, 1],
      seed: 1077,
      built: (ctx) => Math.max(smoothstep(0, 0.95, (ctx.inputs.dung ?? 0) / 0.9) * smoothstep(BEAT_PT - 1.2, BEAT_PT - 0.5, ctx.t), smoothstep(BEAT_PT + 0.3, BEAT_PT + 0.6, ctx.t)),
    }),
  );

  // 1. "tien-phat": hai đạo quân (ba cánh) rời bờ nam, qua sông, vượt dải đồi biên giới tới ba thành; hai thành Khâm, Liêm bốc lửa khi quân tới (diễn hoạ).
  const TP = 28;
  const tp = run("tien-phat", TP);
  world.add(
    createCrowd({
      size: 12,
      height: onWater,
      seed: 61,
      groups: [
        { path: [at(CAMP_S, -190, -10), [-190, 40], PASS_W, [-150, 290], UNG], count: 60, spread: [24, 40], color: SON, timing: [[0.04, 0], [0.9, 1]] },
        { path: [at(CAMP_S, 250, -10), [230, 40], PASS_E, [240, 300], KHAM], count: 60, spread: [24, 40], color: SON, timing: [[0.04, 0], [0.9, 1]] },
        { path: [at(CAMP_S, 90, -20), [110, 40], [150, 190], PASS_E, [150, 310], LIEM], count: 50, spread: [24, 40], color: SON, timing: [[0.08, 0], [0.92, 1]] },
      ],
      progress: tp,
      visible: () => clock.near("tien-phat"),
    }),
  );
  const forts = [UNG, LIEM, KHAM];
  world.add(
    createGlows({
      count: 3,
      color: GOLD,
      size: 40,
      minPx: 30,
      place: (i, ctx, out) => {
        out.set(forts[i][0], height(forts[i][0], forts[i][1]) + 10, forts[i][1]);
        return 0.75 + 0.1 * Math.sin(ctx.time * 1.6 + i);
      },
      visible: () => Math.max(clock.near("tien-phat"), clock.near("ung-chau")),
    }),
  );
  const fortFires: FireSite[] = [
    { x: KHAM[0], y: height(KHAM[0], KHAM[1]) + 0.3, z: KHAM[1], order: 0.1, size: 1.8 },
    { x: LIEM[0], y: height(LIEM[0], LIEM[1]) + 0.3, z: LIEM[1], order: 0.3, size: 1.8 },
    { x: UNG[0], y: height(UNG[0], UNG[1]) + 0.3, z: UNG[1], order: 0.9, size: 2.2 },
  ];
  world.add(
    createFires({
      sites: fortFires,
      size: 3.2,
      lit: () => Math.max(clock.near("tien-phat") * smoothstep(0.75, 0.95, tp()) * 0.55, clock.near("ung-chau") * (0.55 + 0.45 * smoothstep(0.5, 0.65, run("ung-chau", 32)()))),
      glow: (ctx) => 0.3 + smoothstep(1.5, 3, ctx.params.mood) * 0.7,
    }),
  );

  // 2. "ung-chau": quân Việt (chấm son) đi vòng quanh thành Ung (vây thành), quân giữ thành (chấm mực) ngã dần; thành bốc lửa; rồi quân Việt rút về phía nam.
  const UC = 32;
  const uc = run("ung-chau", UC);
  world.add(
    createCrowd({
      size: 6,
      height: onWater,
      seed: 62,
      groups: [
        { path: circle(UNG, 44, 3), count: 70, spread: [6, 14], color: SON, timing: [[0.02, 0], [0.62, 1]], show: [0, 0.66] },
        { path: [UNG, at(UNG, 0.2, 0)], count: 26, spread: [24, 22], color: INK, mortal: true },
        { path: [at(UNG, 0, -40), [-160, 200], PASS_W, [-190, 40], at(CAMP_S, -200, -10)], count: 70, spread: [24, 34], color: SON, timing: [[0.7, 0], [0.99, 1]], show: [0.68, 2] },
      ],
      progress: uc,
      fall: () => 0.95 * smoothstep(0.5, 0.66, uc()),
      visible: () => clock.near("ung-chau"),
    }),
  );

  // 3. "phong-tuyen": tương tác — kéo thanh thì cọc trồi lên dưới sông (xem createStakeField ở trên), trong lúc một toán quân Việt (chấm) đi lại dọc bờ nam.
  const PT = 30;
  const pt = run("phong-tuyen", PT);
  const bank: Pt[] = [[-230, -30], [-100, -26], [50, -34], [220, -28]];
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 63,
      groups: [
        { path: [...bank, ...rev(bank).slice(1)], count: 36, spread: [8, 10], color: SON, timing: [[0.02, 0], [0.98, 1]] },
        { path: [...rev(bank), ...bank.slice(1)], count: 36, spread: [8, 10], color: SON, timing: [[0.02, 0], [0.98, 1]] },
      ],
      progress: pt,
      visible: () => clock.near("phong-tuyen"),
    }),
  );

  // 4. "quach-quy": quân Tống (chấm mực) kéo xuống đông dần ở bờ bắc; hai đợt "bè" (chấm đi trên mặt nước) vượt sông, bị chặn ở cọc và ngã xuống; quân Việt giữ bờ nam.
  const QQ = 36;
  const qq = run("quach-quy", QQ);
  const raft = (x: number): Pt[] => [[x, 66], [x - 2, 14], [x - 4, -28]];
  world.add(
    createCrowd({
      size: 9,
      height: onWater,
      seed: 64,
      groups: [
        { path: [PASS_E, [130, 160], CAMP_N], count: 150, spread: [70, 60], color: INK, timing: [[0.02, 0], [0.3, 1]] },
        { path: raft(10), count: 40, spread: [34, 8], color: INK, mortal: true, timing: [[0.34, 0], [0.48, 0.85], [0.52, 0.85], [0.6, 0.05]], show: [0.32, 0.66] },
        { path: raft(70), count: 40, spread: [34, 8], color: INK, mortal: true, timing: [[0.64, 0], [0.78, 0.85], [0.82, 0.85], [0.9, 0.05]], show: [0.62, 0.96] },
        { path: [[-70, -42], [90, -46]], count: 70, spread: [150, 14], color: SON },
      ],
      progress: qq,
      fall: () => 0.4 * smoothstep(0.46, 0.52, qq()) + 0.45 * smoothstep(0.76, 0.82, qq()),
      visible: () => clock.near("quach-quy"),
    }),
  );

  // 5. "tho-than": đêm; một đốm sáng bay lên từ đền bên sông (tượng trưng truyền thuyết bài thơ), quân Việt tụ quanh đền, lửa trại quân Tống leo lét bên kia sông.
  const campFires: FireSite[] = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const x = CAMP_N[0] + Math.cos(a) * (28 + (i % 3) * 18);
    const z = CAMP_N[1] + Math.sin(a) * (22 + (i % 2) * 24);
    return { x, y: height(x, z) + 0.25, z, order: i / 10, size: 1 };
  });
  const TT = 26;
  const tt = run("tho-than", TT);
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 16,
      minPx: 30,
      place: (_i, ctx, out) => {
        const e = clock.elapsed("tho-than");
        out.set(TEMPLE[0], height(TEMPLE[0], TEMPLE[1]) + 3 + smoothstep(2, 14, e) * 34, TEMPLE[1]);
        return smoothstep(0, 2, e) * (0.85 + 0.1 * Math.sin(ctx.time * 1.4));
      },
      visible: () => clock.near("tho-than"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 65,
      groups: [
        { path: [at(TEMPLE, -90, -80), at(TEMPLE, -20, -22), at(TEMPLE, -6, -8)], count: 40, spread: [20, 16], color: SON, timing: [[0.05, 0], [0.55, 1]] },
        { path: [at(TEMPLE, 90, -70), at(TEMPLE, 24, -20), at(TEMPLE, 8, -8)], count: 30, spread: [18, 14], color: SON, timing: [[0.1, 0], [0.6, 1]] },
        { path: [CAMP_N, at(CAMP_N, 0.2, 0)], count: 90, spread: [70, 60], color: INK },
      ],
      progress: tt,
      visible: () => clock.near("tho-than"),
    }),
  );

  // 6. "phan-cong": đêm; một cánh quân Việt (chấm son, chấm ngà dẫn đầu) vượt sông ở phía tây đánh vào cánh quân Tống ở bờ bắc; cánh ấy ngã dần (diễn hoạ).
  const PC = 28;
  const pc = run("phan-cong", PC);
  world.add(
    createCrowd({
      size: 8,
      height: onWater,
      seed: 66,
      groups: [
        { path: [[-150, -96], [-140, -20], [-128, 66], [-122, 98]], count: 80, spread: [30, 20], color: SON, timing: [[0.08, 0], [0.55, 1]] },
        { path: [[-150, -96], [-140, -20], [-128, 66], [-122, 98]], count: 1, color: IVORY, size: 1.5, timing: [[0.08, 0], [0.55, 1]] },
        { path: [[-120, 108], [-120, 108.2]], count: 110, spread: [40, 28], color: INK, mortal: true },
        { path: [CAMP_N, at(CAMP_N, 0.2, 0)], count: 90, spread: [70, 60], color: INK },
      ],
      progress: pc,
      fall: () => 0.88 * smoothstep(0.4, 0.85, pc()),
      visible: () => clock.near("phan-cong"),
    }),
  );
  world.add(
    createFires({
      sites: campFires,
      size: 2,
      lit: () => Math.max(clock.near("tho-than") * 0.85, clock.near("phan-cong") * (0.9 - 0.4 * smoothstep(0.5, 1, pc())), clock.near("hoa-nghi") * 0.4 * (1 - smoothstep(0, 0.5, run("hoa-nghi", 28)()))),
      glow: (ctx) => 0.3 + smoothstep(1.5, 3, ctx.params.mood) * 0.7,
    }),
  );

  // 7. "hoa-nghi": quân Tống thu quân kéo về phía bắc qua lối đông; một toán nhỏ sứ giả (chấm ngà) từ bờ nam sang bờ bắc gặp tướng bên kia (diễn hoạ).
  const HN = 28;
  const hn = run("hoa-nghi", HN);
  world.add(
    createCrowd({
      size: 9,
      height: onWater,
      seed: 67,
      groups: [
        { path: [CAMP_N, [120, 165], PASS_E, [225, 300], [240, 420]], count: 140, spread: [60, 50], color: INK, timing: [[0.2, 0], [0.97, 1]] },
        { path: [[2, -62], [6, 8], [10, 62]], count: 5, spread: [4, 6], color: IVORY, size: 1.2, timing: [[0.04, 0], [0.4, 1]] },
        { path: [[-70, -42], [90, -46]], count: 60, spread: [150, 14], color: SON },
      ],
      progress: hn,
      visible: () => clock.near("hoa-nghi"),
    }),
  );
};

export default setup;
