import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CAN_TRAM, LE_HOA, MA_YEN, PHO_CAT, ROAD, WATER, XUONG_GIANG, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Chi Lăng – Xương Giang — cảnh CÁCH ĐIỆU. Người = chấm dáng người; không vẽ thành Xương Giang (chưa rõ hình dạng), luỹ trại, trang phục,
// cờ, vũ khí. Vị trí ải, thung lũng, các trận và đường quân của Mộc Thạnh là diễn hoạ, khoảng cách thu ngắn rất nhiều.
// Son = nghĩa quân Lam Sơn, mực = quân Minh, ngà = tướng chỉ huy.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";

const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
/** Vòng quanh c; nửa phía nam ép dẹt để không đi qua sông Thương ngay sau lưng thành. */
const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * (Math.sin(a) < 0 ? 0.2 : 1)];
/** Đoạn đường cái giữa hai độ z (đi từ bắc xuống nam). */
function roadBetween(zFrom: number, zTo: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < ROAD.length - 1; i++) {
    const [ax, az] = ROAD[i];
    const [bx, bz] = ROAD[i + 1];
    for (let k = 0; k < 8; k++) {
      const f = k / 8;
      const z = az + (bz - az) * f;
      if (z <= zFrom && z >= zTo) pts.push([ax + (bx - ax) * f, z]);
    }
  }
  return pts.length > 1 ? pts : [ROAD[0], ROAD[1]];
}
const [gx, gz] = XUONG_GIANG;
const CAMP: Pt = [gx + 10, gz + 60];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thanh-xuong-giang", "vien-binh", "chi-lang", "can-tram", "xuong-giang", "moc-thanh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - gx, z - gz) > 110 && Math.hypot(x - MA_YEN[0], z - MA_YEN[1]) > 28,
    water: { deep: "#2b4640", shallow: "#7b9680" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 50, z: 320 } },
    counts: { trees: 640, bushes: 700, grass: 4200, reeds: 1200 },
    forestAt: 0.5,
    birds: { center: { x: MA_YEN[0], y: 0, z: MA_YEN[1] }, radius: 180 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1427,
  });

  // 1. "thanh-xuong-giang": nghĩa quân (son) khép vòng quanh thành Xương Giang (quân giữ thành = khối chấm mực); khi thành bị hạ, quân giữ
  //    thành ngã xuống và lửa bốc lên quanh thành (diễn hoạ).
  const TX = 24;
  const tx = run("thanh-xuong-giang", TX);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 91,
      groups: [
        ...Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return { path: [ring(XUONG_GIANG, 190, a), ring(XUONG_GIANG, 60, a)] as Pt[], count: 16, spread: [40, 14] as [number, number], color: SON, timing: [[0.02 + k * 0.02, 0], [0.4 + k * 0.02, 1], [0.65, 1], [0.8, 1.6]] as [number, number][] };
        }),
      ],
      progress: tx,
      visible: () => clock.near("thanh-xuong-giang"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 92,
      groups: [{ path: [[gx + 4, gz], XUONG_GIANG], count: 50, spread: [60, 50], color: INK, mortal: true }],
      progress: () => 1,
      fall: () => smoothstep(0.62, 0.85, tx()),
      visible: () => clock.near("thanh-xuong-giang"),
    }),
  );
  world.add(
    createFires({
      sites: [0, 1, 2, 3, 4, 5].map((i) => {
        const [x, z] = ring(XUONG_GIANG, 34, i * 1.05);
        return { x, y: ground(x, z) + 1, z, order: i / 6, size: 2 };
      }),
      lit: () => clock.near("thanh-xuong-giang") * smoothstep(0.6, 0.9, tx()),
      size: 5,
      glow: () => 0.8,
    }),
  );

  // 2. "vien-binh": đạo quân Liễu Thăng (mực) đổ vào từ phía bắc theo đường cái, chủ tướng (ngà) đi đầu; toán quân giữ ải (son) lui dần
  //    phía trước. Ở mép tây bắc, đạo quân Mộc Thạnh (mực) tiến vào (diễn hoạ).
  const VB = 24;
  const vb = run("vien-binh", VB);
  const north = roadBetween(440, 230);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 93,
      groups: [
        { path: north, count: 120, spread: [30, 200], color: INK, timing: [[0.03, 0], [0.9, 1]] },
        { path: north, count: 1, color: IVORY, size: 1.4, timing: [[0.03, 0.02], [0.9, 1.02]] },
        { path: [[-430, 380], [-380, 320], LE_HOA], count: 80, spread: [40, 120], color: INK, timing: [[0.1, 0], [0.95, 1]] },
      ],
      progress: vb,
      visible: () => clock.near("vien-binh"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 94,
      groups: [{ path: roadBetween(400, 200), count: 16, spread: [14, 20], color: SON, timing: [[0, 0], [0.92, 1]] }],
      progress: vb,
      visible: () => clock.near("vien-binh"),
    }),
  );

  // 3. "chi-lang": quân Minh đuổi theo toán quân nhử (son) vào sâu trong thung lũng, tới chân núi Mã Yên; phục binh (son) nằm trên hai sườn núi.
  //    Người xem kéo thanh: phục binh lao xuống, quân Minh ngã dần; chủ tướng (ngà) ngã trước, ở chân núi Mã Yên (diễn hoạ).
  const CL = 14;
  const cl = run("chi-lang", CL);
  const strike = (ctx: FrameCtx) => clamp((ctx.inputs["phuc-kich"] ?? 0) / 0.85);
  const valley = roadBetween(330, 150);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 95,
      groups: [
        { path: valley, count: 110, spread: [24, 170], color: INK, mortal: true, timing: [[0, 0], [1, 1]] },
        { path: [...valley.slice(0, -1), [MA_YEN[0] - 12, MA_YEN[1] + 10]], count: 1, color: IVORY, size: 1.4, mortal: true, timing: [[0, 0.03], [1, 1]] },
        { path: roadBetween(250, 60), count: 14, spread: [12, 16], color: SON, timing: [[0, 0.3], [1, 1]] },
      ],
      progress: cl,
      fall: (ctx) => 0.85 * smoothstep(0.1, 1, strike(ctx)),
      visible: () => clock.near("chi-lang"),
    }),
  );
  const slopes: [Pt, Pt][] = [
    [[-70, 260], [10, 250]],
    [[-60, 180], [8, 190]],
    [[90, 270], [34, 260]],
    [[110, 200], [44, 210]],
  ];
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 96,
      groups: slopes.map(([from, to]) => ({ path: [from, to] as Pt[], count: 22, spread: [50, 12] as [number, number], color: SON })),
      progress: (ctx) => strike(ctx),
      visible: () => clock.near("chi-lang"),
    }),
  );

  // 4. "can-tram": số quân Minh còn lại (mực) theo đường xuống phía nam; ở Cần Trạm rồi ở Phố Cát, nghĩa quân (son) từ hai bên đánh ra,
  //    quân Minh ngã thêm mỗi lần (diễn hoạ).
  const CT = 26;
  const ct = run("can-tram", CT);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 97,
      groups: [{ path: roadBetween(110, -200), count: 90, spread: [26, 120], color: INK, mortal: true, timing: [[0.02, 0], [0.95, 1]] }],
      progress: ct,
      fall: () => 0.25 * smoothstep(0.3, 0.45, ct()) + 0.25 * smoothstep(0.7, 0.85, ct()),
      visible: () => clock.near("can-tram"),
    }),
  );
  const sides = (c: Pt, t0: number): { path: Pt[]; count: number; spread: [number, number]; color: string; timing: [number, number][] }[] => [
    { path: [[c[0] - 110, c[1] + 10], [c[0] - 22, c[1]]], count: 22, spread: [40, 12], color: SON, timing: [[t0, 0], [t0 + 0.12, 1]] },
    { path: [[c[0] + 110, c[1] - 10], [c[0] + 22, c[1]]], count: 22, spread: [40, 12], color: SON, timing: [[t0, 0], [t0 + 0.12, 1]] },
  ];
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 98,
      groups: [...sides(CAN_TRAM, 0.26), ...sides(PHO_CAT, 0.66)],
      progress: ct,
      visible: () => clock.near("can-tram"),
    }),
  );

  // 5. "xuong-giang": quân Minh đóng trại giữa cánh đồng (khối chấm mực); nghĩa quân khép vòng bốn phía, rồi đánh vào; quân Minh ngã gần hết,
  //    hai tướng (ngà) bị dẫn đi (diễn hoạ).
  const XG = 30;
  const xg = run("xuong-giang", XG);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 99,
      groups: [{ path: [[CAMP[0] + 4, CAMP[1]], CAMP], count: 110, spread: [80, 70], color: INK, mortal: true }],
      progress: () => 1,
      fall: () => 0.9 * smoothstep(0.55, 0.8, xg()),
      visible: () => clock.near("xuong-giang"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 100,
      groups: [
        ...Array.from({ length: 10 }, (_, k) => {
          const a = (k / 10) * Math.PI * 2;
          return { path: [ring(CAMP, 250, a), ring(CAMP, 80, a), ring(CAMP, 34, a)] as Pt[], count: 16, spread: [44, 14] as [number, number], color: SON, timing: [[0.02 + k * 0.02, 0], [0.45, 0.7], [0.55, 0.7], [0.75, 1]] as [number, number][] };
        }),
        { path: [CAMP, [CAMP[0] + 60, CAMP[1] - 20], [CAMP[0] + 260, CAMP[1] - 10]], count: 2, spread: [6, 4], color: IVORY, size: 1.3, timing: [[0.82, 0], [1, 0.8]], show: [0.8, 2] },
      ],
      progress: xg,
      visible: () => clock.near("xuong-giang"),
    }),
  );

  // 6. "moc-thanh": đạo quân Mộc Thạnh (mực) quay đầu rút về mép tây bắc; nghĩa quân (son) đuổi theo, quân Minh ngã dọc đường (diễn hoạ).
  const MT = 22;
  const mt = run("moc-thanh", MT);
  const retreat: Pt[] = [LE_HOA, [-380, 320], [-440, 400]];
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 101,
      groups: [{ path: retreat, count: 80, spread: [40, 120], color: INK, mortal: true, timing: [[0.03, 0], [0.9, 1]] }],
      progress: mt,
      fall: () => 0.6 * smoothstep(0.25, 0.8, mt()),
      visible: () => clock.near("moc-thanh"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 102,
      groups: [{ path: [[LE_HOA[0] + 160, LE_HOA[1] - 120], [LE_HOA[0] + 40, LE_HOA[1] - 20], LE_HOA, [-400, 350]], count: 60, spread: [40, 90], color: SON, timing: [[0.08, 0], [0.95, 0.85]] }],
      progress: mt,
      visible: () => clock.near("moc-thanh"),
    }),
  );
};

export default setup;
