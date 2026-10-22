import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, BO_CO, MO_DO, NORTH, SOUTH, WATER, bankDist, colorize, height, riverX } from "./terrain";

type Pt = [number, number];

// Nhà Hậu Trần — cảnh CÁCH ĐIỆU. Người = chấm dáng người, vua / tướng = đốm sáng; không vẽ trang phục, cờ, vũ khí, trống, thuyền.
// Vị trí Mô Độ, Bô Cô, các đồn, hướng quân đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều.
// Son = quân Hậu Trần, mực = quân Minh, ngà = vua / tướng, vàng = quầng sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const onRiver = (z: number, dx = 0): Pt => [riverX(z) + dx, z];

/** Các đồn, thành quân Minh đóng (diễn hoạ). */
const OUTPOSTS: Pt[] = [
  [-260, 260],
  [-90, 300],
  [150, 330],
  [-200, 90],
  [180, 120],
  [-60, 0],
  [240, -60],
  [-60, -140],
  [10, -280],
];
/** Nơi nghĩa quân đóng ở phía nam, những năm cuối (diễn hoạ). */
const CAMPS: Pt[] = [
  [-200, -330],
  [-130, -280],
  [-60, -320],
  [-170, -230],
  [-90, -200],
  [-20, -250],
];
const TQ: Pt = [-110, -260];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["giao-chi", "mo-do", "bo-co", "nghi-ky", "trung-quang", "nhung-ngay-cuoi", "thuat-hoai"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - BO_CO[0], z - BO_CO[1]) > 60 && Math.hypot(x - MO_DO[0], z - MO_DO[1]) > 40,
    water: { deep: "#2b4640", shallow: "#7b9680" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 480, bushes: 640, grass: 4200, reeds: 1800 },
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 200 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 1408,
  });

  // 1. "giao-chi": quân Minh (mực) từ phía bắc toả xuống các đồn; tới đâu đồn ấy thắp đuốc. Về cuối, ở vài làng xuất hiện những
  //    nhóm nhỏ (son) tụ lại — người nổi lên chống lại (diễn hoạ).
  const GC = 24;
  const gc = run("giao-chi", GC);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 41,
      groups: OUTPOSTS.map((p, k) => ({ path: [NORTH, [(NORTH[0] + p[0]) / 2, (NORTH[1] + p[1]) / 2 + 30], p] as Pt[], count: 12, spread: [14, 24], color: INK, timing: [[0.02 + k * 0.03, 0], [0.5 + k * 0.03, 1]] as [number, number][] })),
      progress: gc,
      visible: () => clock.near("giao-chi"),
    }),
  );
  world.add(
    createFires({
      sites: OUTPOSTS.map(([x, z], i) => ({ x: x + 6, y: height(x + 6, z) + 1.5, z, order: i / OUTPOSTS.length, size: 1.6 })),
      lit: () => clock.near("giao-chi") * smoothstep(0.45, 0.85, gc()),
      size: 4,
      glow: () => 0.6,
    }),
  );
  const RISE: Pt[] = [[-300, -60], [120, -200], [-150, 200], [280, 40]];
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 42,
      groups: RISE.map((p, k) => ({ path: [[p[0] + 40, p[1] + 30], p] as Pt[], count: 10, spread: [16, 16], color: SON, timing: [[0.55 + k * 0.06, 0], [0.85 + k * 0.03, 1]] as [number, number][], show: [0.55 + k * 0.06, 2] as [number, number] })),
      progress: gc,
      visible: () => clock.near("giao-chi"),
    }),
  );

  // 2. "mo-do": nghĩa quân (son) từ ba phía tụ về thung lũng Mô Độ quanh một đốm sáng — Giản Định Đế; về sau hai toán quân có tướng dẫn đầu
  //    (ngà) từ phía nam tới hợp — Đặng Tất, Nguyễn Cảnh Chân theo về (diễn hoạ; thật ra họ gặp nhau ở Nghệ An).
  const MD = 24;
  const md = run("mo-do", MD);
  const [mx, mz] = MO_DO;
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 43,
      groups: [
        { path: [[mx + 160, mz + 120], [mx + 60, mz + 40], [mx + 10, mz + 8]], count: 26, spread: [16, 18], color: SON, timing: [[0.03, 0], [0.45, 1]] },
        { path: [[mx - 60, mz + 190], [mx - 20, mz + 70], [mx - 6, mz + 12]], count: 22, spread: [16, 18], color: SON, timing: [[0.06, 0], [0.5, 1]] },
        { path: [[mx + 150, mz - 60], [mx + 50, mz - 20], [mx + 10, mz - 6]], count: 22, spread: [16, 18], color: SON, timing: [[0.09, 0], [0.5, 1]] },
        { path: [[SOUTH[0] + 40, SOUTH[1]], [mx + 60, mz - 120], [mx + 20, mz - 16]], count: 30, spread: [18, 40], color: SON, timing: [[0.45, 0], [0.92, 1]] },
        { path: [[SOUTH[0] + 40, SOUTH[1]], [mx + 60, mz - 120], [mx + 20, mz - 16]], count: 2, spread: [6, 2], color: IVORY, size: 1.3, timing: [[0.47, 0], [0.94, 1]] },
      ],
      progress: md,
      visible: () => clock.near("mo-do"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 22,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(mx, height(mx, mz) + 7, mz);
        return smoothstep(0.3, 0.45, md()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.5));
      },
      visible: () => clock.near("mo-do"),
    }),
  );

  // 3. "bo-co": quân Minh (mực) đóng ở bến Bô Cô và trên mặt sông; nghĩa quân (son) nấp hai bên. Người xem kéo thanh: nghĩa quân xông vào
  //    từ ba phía, quân Minh ngã dần, số còn lại chạy lên phía bắc. Đốm sáng nhấp nháy phía sau là chỗ vua đánh trống thúc quân (diễn hoạ).
  const attack = (ctx: FrameCtx) => clamp((ctx.inputs["tien-cong"] ?? 0) / 0.85);
  const sinceWin = (ctx: FrameCtx) => (ctx.completedAt["tien-cong"] ? (ctx.now - ctx.completedAt["tien-cong"]) / 1000 : 0);
  const [bx, bz] = BO_CO;
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 44,
      groups: [
        { path: [[bx - 10, bz + 10], [bx, bz]], count: 90, spread: [60, 60], color: INK, mortal: true },
        { path: [onRiver(bz + 40), onRiver(bz - 20)], count: 40, spread: [24, 70], color: INK, mortal: true },
      ],
      progress: () => 1,
      // phần còn lại "ngã" (khuất đi) đúng lúc toán chạy về bắc hiện ra bên dưới
      fall: (ctx) => 0.7 * smoothstep(0.25, 1, attack(ctx)) + 0.3 * smoothstep(0, 1.5, sinceWin(ctx)),
      visible: () => clock.near("bo-co"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 45,
      groups: [
        { path: [[bx - 120, bz + 90], [bx - 70, bz + 50], [bx - 20, bz + 14]], count: 45, spread: [36, 20], color: SON },
        { path: [[bx - 140, bz - 70], [bx - 80, bz - 40], [bx - 24, bz - 10]], count: 45, spread: [36, 20], color: SON },
        { path: [[bx - 60, bz - 130], [bx - 30, bz - 70], [bx - 4, bz - 24]], count: 35, spread: [30, 20], color: SON },
      ],
      progress: (ctx) => 0.12 + 0.88 * attack(ctx),
      visible: () => clock.near("bo-co"),
    }),
  );
  // quân Minh còn sống chạy về phía bắc sau khi người xem kéo xong
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 46,
      groups: [{ path: [[bx + 6, bz + 30], [bx - 10, bz + 150], NORTH], count: 30, spread: [30, 40], color: INK }],
      progress: (ctx) => clamp(sinceWin(ctx) / 14),
      visible: (ctx) => clock.near("bo-co") * smoothstep(0, 0.5, sinceWin(ctx)),
    }),
  );
  const DRUM: Pt = [bx - 150, bz - 10];
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 18,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(DRUM[0], height(DRUM[0], DRUM[1]) + 6, DRUM[1]);
        // nhịp trống: nhanh dần khi xông lên
        const beat = 0.5 + 0.5 * Math.sin(ctx.time * (3 + attack(ctx) * 6));
        return 0.55 + 0.45 * beat * (0.3 + 0.7 * attack(ctx));
      },
      visible: () => clock.near("bo-co"),
    }),
  );

  // 4. "nghi-ky": quân Hậu Trần đóng gần bến; hai đốm sáng — hai tướng — tắt dần; rồi quân chia hai: một toán theo vua đi lên phía bắc,
  //    một toán theo con hai tướng bỏ đi về phía nam (diễn hoạ).
  const NK = 22;
  const nk = run("nghi-ky", NK);
  const camp: Pt = [bx - 50, bz - 40];
  const generals: Pt[] = [
    [camp[0] - 14, camp[1] + 6],
    [camp[0] + 14, camp[1] - 6],
  ];
  world.add(
    createGlows({
      count: 3,
      color: (i) => (i === 0 ? GOLD : IVORY),
      size: (i) => (i === 0 ? 20 : 14),
      minPx: 18,
      place: (i, ctx, out) => {
        const p = i === 0 ? camp : generals[i - 1];
        out.set(p[0], height(p[0], p[1]) + 6, p[1]);
        if (i === 0) return 0.8 * (1 - smoothstep(0.6, 0.95, nk()));
        return 1 - smoothstep(0.2, 0.38, nk());
      },
      visible: () => clock.near("nghi-ky"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 47,
      groups: [
        { path: [camp, [camp[0] - 20, camp[1] + 120], [-80, 300]], count: 50, spread: [40, 50], color: SON, timing: [[0.45, 0], [1, 1]] },
        { path: [camp, [camp[0] - 60, camp[1] - 140], [-120, -300], SOUTH], count: 50, spread: [40, 50], color: SON, timing: [[0.5, 0], [1, 0.9]] },
        { path: [camp, [camp[0] - 60, camp[1] - 140], [-120, -300], SOUTH], count: 2, spread: [5, 2], color: IVORY, size: 1.3, timing: [[0.5, -0.02], [1, 0.9]] },
      ],
      progress: nk,
      visible: () => clock.near("nghi-ky"),
    }),
  );

  // 5. "trung-quang": ở phía nam, nghĩa quân tụ lại quanh một đốm sáng mới — Trùng Quang Đế; một cánh quân Minh tiến xuống, bị đánh lui,
  //    một số ngã xuống — những trận thắng trong mấy năm đầu (diễn hoạ).
  const TQS = 24;
  const tq = run("trung-quang", TQS);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 48,
      groups: [
        { path: [[TQ[0] - 80, TQ[1] - 140], [TQ[0] - 10, TQ[1] - 12]], count: 30, spread: [24, 30], color: SON, timing: [[0.02, 0], [0.4, 1]] },
        { path: [[TQ[0] + 140, TQ[1] - 100], [TQ[0] + 12, TQ[1] - 6]], count: 30, spread: [24, 30], color: SON, timing: [[0.05, 0], [0.45, 1]] },
        { path: [[TQ[0] + 20, TQ[1] + 10], [TQ[0] + 60, TQ[1] + 80]], count: 50, spread: [70, 20], color: SON, timing: [[0.5, 0], [0.75, 1]], show: [0.48, 2] },
      ],
      progress: tq,
      visible: () => clock.near("trung-quang"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 49,
      groups: [{ path: [[-60, 120], [-40, 0], [TQ[0] + 70, TQ[1] + 110]], count: 60, spread: [60, 50], color: INK, mortal: true, timing: [[0.3, 0], [0.75, 1], [1, 0.82]] }],
      progress: tq,
      fall: () => 0.55 * smoothstep(0.72, 0.95, tq()),
      visible: () => clock.near("trung-quang"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 22,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(TQ[0], height(TQ[0], TQ[1]) + 7, TQ[1]);
        return smoothstep(0.08, 0.3, tq()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.5));
      },
      visible: () => clock.near("trung-quang"),
    }),
  );

  // 6. "nhung-ngay-cuoi": quân Minh (mực) tràn xuống thành một làn rộng; nghĩa quân (son) lùi dần về phía nam, một số ngã xuống;
  //    lửa ở các trại nghĩa quân tắt dần từng đốm; đốm sáng của vua lùi ra phía biển rồi tắt (diễn hoạ).
  const NC = 28;
  const nc = run("nhung-ngay-cuoi", NC);
  world.add(
    createCrowd({
      size: 8,
      height: ground,
      seed: 50,
      groups: [
        { path: [[-60, 430], [-40, 150], [-60, -200]], count: 150, spread: [460, 80], color: INK, timing: [[0.02, 0], [0.9, 1]] },
        { path: [[-80, -140], [-90, -260], [-110, -430]], count: 70, spread: [320, 40], color: SON, mortal: true, timing: [[0.15, 0], [1, 0.9]] },
      ],
      progress: nc,
      fall: () => 0.5 * smoothstep(0.3, 0.9, nc()),
      visible: () => clock.near("nhung-ngay-cuoi"),
    }),
  );
  world.add(
    createFires({
      sites: CAMPS.map(([x, z], i) => ({ x, y: height(x, z) + 1.5, z, order: i / CAMPS.length, size: 1.8 })),
      lit: () => clock.near("nhung-ngay-cuoi") * (1 - smoothstep(0.2, 0.85, nc())),
      size: 4,
      glow: () => 0.8,
    }),
  );
  const SEA: Pt = [300, -330];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 6,
      groups: [{ path: [TQ, [60, -320], SEA], count: 1, color: GOLD, size: 1.5, timing: [[0.3, 0], [0.85, 1]] }],
      progress: nc,
      visible: () => clock.near("nhung-ngay-cuoi") * (1 - smoothstep(0.88, 1, nc())),
    }),
  );

  // 7. "thuat-hoai": đêm, bên bờ sông một người đứng lặng (ngà); trăng (đốm sáng) lên dần trên mặt nước (diễn hoạ).
  const TH = 18;
  const th = run("thuat-hoai", TH);
  const SHORE: Pt = [riverX(-200) - 40, -200];
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 51,
      groups: [{ path: [[SHORE[0] - 30, SHORE[1] + 20], SHORE], count: 1, color: IVORY, size: 1.3, timing: [[0.05, 0], [0.4, 1]] }],
      progress: th,
      visible: () => clock.near("thuat-hoai"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: "#fff1c8",
      size: 40,
      minPx: 26,
      place: (_, __, out) => {
        out.set(riverX(-260) + 160, 40 + 50 * smoothstep(0, 1, th()), -330);
        return 0.3 + 0.6 * smoothstep(0, 0.6, th());
      },
      visible: () => clock.near("thuat-hoai"),
    }),
  );
};

export default setup;
