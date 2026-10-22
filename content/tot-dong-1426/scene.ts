import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, BO_DE, CAO_BO, CHUC_DONG, DONG_QUAN, TOT_DONG, WATER, bankDist, colorize, height, marsh } from "./terrain";

type Pt = [number, number];

// Tốt Động – Chúc Động — cảnh CÁCH ĐIỆU. Người = chấm dáng người, chủ tướng = đốm sáng; không vẽ thành Đông Quan (chưa rõ hình dạng),
// trang phục, cờ, vũ khí. Vị trí các nơi và đường đi của ba cánh quân là diễn hoạ, khoảng cách thu ngắn rất nhiều.
// Son = quân Lam Sơn, mực = quân Minh, ngà = Vương Thông / sứ giả, vàng = quầng sáng tượng trưng (Lê Lợi ở Bồ Đề).

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.15);
const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const [qx, qz] = DONG_QUAN;
const MID: Pt = [(TOT_DONG[0] + CHUC_DONG[0]) / 2, (TOT_DONG[1] + CHUC_DONG[1]) / 2];

/** Ba cánh quân Minh: từ Đông Quan tới mép đồng lầy (`edge`), rồi vào giữa đồng (`in`) (diễn hoạ). */
const WINGS: { road: Pt[]; inside: Pt[] }[] = [
  { road: [[qx - 20, qz - 10], [-20, 150], [-90, 40]], inside: [[-90, 40], TOT_DONG] },
  { road: [[qx - 10, qz - 20], [40, 80], [-20, -20]], inside: [[-20, -20], MID] },
  { road: [[qx, qz - 24], [110, 40], [40, -100]], inside: [[40, -100], CHUC_DONG] },
];
/** Phục binh quanh đồng lầy: nơi nấp → nơi đánh vào. */
const AMBUSH: [Pt, Pt][] = [
  [[-220, -10], [TOT_DONG[0] - 20, TOT_DONG[1]]],
  [[-150, 70], [TOT_DONG[0] + 4, TOT_DONG[1] + 18]],
  [[-170, -190], [MID[0] - 16, MID[1] - 10]],
  [[-60, -260], [CHUC_DONG[0], CHUC_DONG[1] - 18]],
  [[60, -230], [CHUC_DONG[0] + 20, CHUC_DONG[1]]],
  [[40, -10], [MID[0] + 20, MID[1] + 16]],
];
/** Các thành, đồn quân Minh khác — ra hàng trong phân cảnh cuối (diễn hoạ). */
const FORTS: Pt[] = [
  [-260, 260],
  [-300, -40],
  [60, -330],
  [330, -200],
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vuong-thong", "ba-canh", "mai-phuc", "tot-dong", "ket-qua", "vay-thanh"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => marsh(x, z) < 0.5 && Math.hypot(x - qx, z - qz) > 70 && Math.hypot(x - BO_DE[0], z - BO_DE[1]) > 40,
    water: { deep: "#2f4a40", shallow: "#7a8f70" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 4200, reeds: 2600 },
    birds: { center: { x: MID[0], y: 0, z: MID[1] }, radius: 180 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.9 },
    seed: 1426,
  });

  // quân Minh giữ Đông Quan: một khối chấm mực đứng yên, hiện ở mọi phân cảnh (trừ lúc đã kéo hết ra đồng)
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 71,
      groups: [{ path: [[qx, qz - 4], [qx, qz]], count: 70, spread: [90, 70], color: INK }],
      progress: () => 1,
      visible: () => Math.max(clock.near("vuong-thong"), clock.near("ket-qua"), clock.near("vay-thanh")),
    }),
  );

  // 1. "vuong-thong": viện binh (mực) theo đường lớn từ phía bắc đổ vào Đông Quan; ngoài đồng, các toán nghĩa quân (son) đứng chờ (diễn hoạ).
  const VT = 22;
  const vt = run("vuong-thong", VT);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 72,
      groups: [
        { path: [[-60, 430], [20, 340], [qx - 30, qz + 30]], count: 110, spread: [30, 160], color: INK, timing: [[0.03, 0], [0.85, 1]] },
        { path: [[qx - 40, qz + 40], [qx - 30, qz + 30]], count: 1, color: IVORY, size: 1.4, timing: [[0, 0], [0.85, 1]], show: [0.6, 2] },
        { path: [[-200, 120], [-190, 110]], count: 20, spread: [30, 20], color: SON },
        { path: [[-120, -60], [-110, -70]], count: 20, spread: [30, 20], color: SON },
        { path: [[60, -200], [70, -210]], count: 20, spread: [30, 20], color: SON },
      ],
      progress: vt,
      visible: () => clock.near("vuong-thong"),
    }),
  );

  // 2. "ba-canh": ba cánh quân Minh (mực) rời Đông Quan, theo ba ngả gần song song tiến về phía tây nam; chủ tướng (ngà) đi ở cánh giữa.
  const BC = 24;
  const bc = run("ba-canh", BC);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 73,
      groups: [
        ...WINGS.map((w, k) => ({ path: w.road, count: 60, spread: [24, 120] as [number, number], color: INK, timing: [[0.03 + k * 0.04, 0], [0.9 + k * 0.03, 1]] as [number, number][] })),
        { path: WINGS[1].road, count: 1, color: IVORY, size: 1.4, timing: [[0.07, -0.05], [0.93, 0.92]] },
      ],
      progress: bc,
      visible: () => clock.near("ba-canh"),
    }),
  );

  // 3. "mai-phuc": phục binh (son) nằm im quanh đồng lầy (chấm nhỏ, thấp); quân Minh từ ba ngả chậm chạp lội vào giữa đồng.
  const MP = 30;
  const mp = run("mai-phuc", MP);
  const hidden = (vis: (ctx: FrameCtx) => number, seed: number) =>
    createCrowd({
      size: 3.2,
      height: ground,
      seed,
      groups: AMBUSH.map(([from]) => ({ path: [[from[0] + 4, from[1]], from] as Pt[], count: 16, spread: [40, 14] as [number, number], color: SON })),
      progress: () => 1,
      visible: vis,
    });
  world.add(hidden(() => clock.near("mai-phuc"), 74));
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 75,
      groups: WINGS.map((w, k) => ({ path: w.inside, count: 60, spread: [40, 70] as [number, number], color: INK, timing: [[0.02 + k * 0.04, 0], [0.95, 0.8]] as [number, number][] })),
      progress: mp,
      visible: () => clock.near("mai-phuc"),
    }),
  );

  // 4. "tot-dong": người xem kéo thanh — phục binh từ sáu phía đánh vào giữa đồng; quân Minh mắc trong bùn, ngã dần. Kéo xong thì số còn lại
  //    cùng chủ tướng (ngà) chạy về hướng Đông Quan (diễn hoạ).
  const strike = (ctx: FrameCtx) => clamp((ctx.inputs["phuc-kich"] ?? 0) / 0.85);
  const sinceWin = (ctx: FrameCtx) => (ctx.completedAt["phuc-kich"] ? (ctx.now - ctx.completedAt["phuc-kich"]) / 1000 : 0);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 76,
      groups: WINGS.map((w) => ({ path: [w.inside[0], w.inside[1]] as Pt[], count: 60, spread: [40, 70] as [number, number], color: INK, mortal: true, timing: [[0, 0.8], [1, 0.8]] as [number, number][] })),
      progress: () => 1,
      fall: (ctx) => 0.8 * smoothstep(0.15, 1, strike(ctx)),
      visible: () => clock.near("tot-dong"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 77,
      groups: AMBUSH.map(([from, to]) => ({ path: [from, to] as Pt[], count: 16, spread: [40, 14] as [number, number], color: SON })),
      progress: (ctx) => strike(ctx),
      visible: () => clock.near("tot-dong"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 78,
      groups: [
        { path: [MID, [10, 60], [qx - 30, qz - 20]], count: 30, spread: [30, 60], color: INK },
        { path: [MID, [10, 60], [qx - 30, qz - 20]], count: 1, color: IVORY, size: 1.4, timing: [[0, 0.04], [1, 1.04]] },
      ],
      progress: (ctx) => clamp(sinceWin(ctx) / 14),
      visible: (ctx) => clock.near("tot-dong") * smoothstep(0, 0.6, sinceWin(ctx)),
    }),
  );

  // 5. "ket-qua": nghĩa quân (son) tụ lại giữa đồng; quân Minh co về trong thành (khối chấm mực ở Đông Quan) (diễn hoạ).
  const KQ = 20;
  const kq = run("ket-qua", KQ);
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 79,
      groups: AMBUSH.map(([, to], k) => ({ path: [to, [MID[0] + 30, MID[1] + 60]] as Pt[], count: 14, spread: [30, 30] as [number, number], color: SON, timing: [[0.05 + k * 0.03, 0], [0.7, 1]] as [number, number][] })),
      progress: kq,
      visible: () => clock.near("ket-qua"),
    }),
  );
  world.add(
    createFires({
      sites: [0, 1, 2, 3].map((i) => {
        const [x, z] = ring([MID[0] + 30, MID[1] + 60], 40, i * 1.6);
        return { x, y: ground(x, z) + 1, z, order: i / 4, size: 1.6 };
      }),
      lit: () => clock.near("ket-qua") * smoothstep(0.5, 0.9, kq()),
      size: 4,
      glow: () => 0.8,
    }),
  );

  // 6. "vay-thanh": nghĩa quân (son) khép vòng quanh Đông Quan; ở Bồ Đề bên kia sông, quầng sáng — Lê Lợi — hiện lên giữa đại doanh.
  //    Sứ giả (ngà) mang thư tới các thành khác; quân giữ thành (mực) đổi dần sang màu son — ra hàng (diễn hoạ).
  const VTH = 30;
  const vth = run("vay-thanh", VTH);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 80,
      groups: [
        ...Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return { path: [ring(DONG_QUAN, 220, a), ring(DONG_QUAN, 85, a)] as Pt[], count: 18, spread: [56, 14] as [number, number], color: SON, timing: [[0.02 + k * 0.02, 0], [0.45 + k * 0.02, 1]] as [number, number][] };
        }),
        { path: [[BO_DE[0] + 40, BO_DE[1] - 60], BO_DE], count: 50, spread: [50, 50], color: SON, timing: [[0, 0], [0.3, 1]] },
        ...FORTS.map((f, k) => ({ path: [[BO_DE[0] - 10, BO_DE[1]], [(BO_DE[0] + f[0]) / 2, (BO_DE[1] + f[1]) / 2 - 20], f] as Pt[], count: 2, spread: [4, 4] as [number, number], color: IVORY, timing: [[0.3 + k * 0.04, 0], [0.62 + k * 0.04, 1]] as [number, number][] })),
      ],
      progress: vth,
      visible: () => clock.near("vay-thanh"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 81,
      // quân giữ thành: chỉ "đi" vài mét tại chỗ — dùng `arrive` để đổi màu khi ra hàng
      groups: FORTS.map((f, k) => ({ path: [[f[0] + 3, f[1]], [f[0] + 8, f[1] + 3]] as Pt[], count: 20, spread: [30, 24] as [number, number], color: INK, arrive: SON, timing: [[0.66 + k * 0.05, 0], [0.8 + k * 0.05, 1]] as [number, number][] })),
      progress: vth,
      visible: () => clock.near("vay-thanh"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 24,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(BO_DE[0], ground(BO_DE[0], BO_DE[1]) + 8, BO_DE[1]);
        return smoothstep(0.15, 0.3, vth()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.5));
      },
      visible: () => clock.near("vay-thanh"),
    }),
  );
  // Cao Bộ: nơi nghĩa quân đóng (một nhóm nhỏ đứng yên) — chỉ để người xem thấy đích của ba cánh quân Minh
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 82,
      groups: [{ path: [[CAO_BO[0] + 4, CAO_BO[1]], CAO_BO], count: 24, spread: [30, 26], color: SON }],
      progress: () => 1,
      visible: () => Math.max(clock.near("ba-canh"), clock.near("mai-phuc")),
    }),
  );
};

export default setup;
