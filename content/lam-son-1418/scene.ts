import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CHI_LINH, LAM_SON, LUNG_NHAI, PASS_S, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Lam Sơn — cảnh CÁCH ĐIỆU. Người = chấm dáng người, chủ tướng / người tìm đến = đốm sáng; không vẽ trang phục, cờ, vũ khí,
// voi ngựa. Vị trí Lũng Nhai, Chí Linh, các thành, hướng quân đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều.
// Son = nghĩa quân Lam Sơn, mực = quân Minh, ngà = Lê Lợi / tướng / người tìm đến, vàng = quầng sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
const shuttle = (pts: Pt[], n: number): Pt[] => Array.from({ length: n }, () => roundTrip(pts).slice(0, -1)).flat().concat([pts[0]]);
const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);

/** Thành Trà Lân và vùng Nghệ An — cuối lối đi xuống phía nam (diễn hoạ). */
const TRA_LAN: Pt = [40, -300];
/** Các nơi nổi lửa năm 1425, từ nam ra bắc (diễn hoạ). */
const FIRE_SITES: Pt[] = [
  [-120, -380],
  [120, -360],
  [10, -310],
  [-200, -240],
  [220, -200],
  [-60, -130],
  [160, -90],
  [300, -40],
  [-250, -60],
  [240, 120],
  [330, 200],
];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["lung-nhai", "dung-co", "chi-linh", "hoa-hoan", "nghe-an", "mo-rong", "ra-bac"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - LAM_SON[0], z - LAM_SON[1]) > 55 && Math.hypot(x - LUNG_NHAI[0], z - LUNG_NHAI[1]) > 36,
    water: { deep: "#2b4640", shallow: "#7b9680" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 50, z: 320 } },
    counts: { trees: 700, bushes: 700, grass: 4000, reeds: 1200 },
    forestAt: 0.5,
    birds: { center: { x: CHI_LINH[0], y: 0, z: CHI_LINH[1] }, radius: 200 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1418,
  });

  // 1. "lung-nhai": trong đêm, mười chín người từ nhiều ngả rừng tìm về khoảng trống Lũng Nhai, đứng thành vòng; một đốm sáng hiện giữa vòng
  //    — lời thề (diễn hoạ; không vẽ lễ vật, đồ thề).
  const LN = 18;
  const ln = run("lung-nhai", LN);
  const [lx, lz] = LUNG_NHAI;
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 61,
      groups: Array.from({ length: 19 }, (_, i) => {
        const a = (i / 19) * Math.PI * 2;
        const far = ring(LUNG_NHAI, 90 + (i % 4) * 20, a + 0.4);
        const near = ring(LUNG_NHAI, 9, a);
        return { path: [far, near] as Pt[], count: 1, color: i === 0 ? IVORY : SON, size: i === 0 ? 1.3 : 1, timing: [[0.02 + (i % 5) * 0.05, 0], [0.55 + (i % 5) * 0.05, 1]] as [number, number][] };
      }),
      progress: ln,
      visible: () => clock.near("lung-nhai"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 14,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(lx, height(lx, lz) + 3, lz);
        return smoothstep(0.75, 0.95, ln()) * (0.8 + 0.2 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("lung-nhai"),
    }),
  );

  // 2. "dung-co": người từ bốn phía kéo về Lam Sơn; lửa trại sáng dần; một quầng sáng — Bình Định Vương — hiện giữa bãi (diễn hoạ).
  const DC = 22;
  const dc = run("dung-co", DC);
  const [sx, sz] = LAM_SON;
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 62,
      groups: [
        { path: [[sx + 220, sz - 40], [sx + 90, sz - 20], [sx + 14, sz]], count: 34, spread: [20, 40], color: SON, timing: [[0.03, 0], [0.6, 1]] },
        { path: [[sx - 140, sz + 140], [sx - 50, sz + 50], [sx - 10, sz + 10]], count: 26, spread: [18, 34], color: SON, timing: [[0.06, 0], [0.62, 1]] },
        { path: [[sx + 30, sz - 200], [sx + 20, sz - 80], [sx + 4, sz - 12]], count: 26, spread: [18, 34], color: SON, timing: [[0.09, 0], [0.66, 1]] },
        { path: [[sx + 100, sz + 180], [sx + 40, sz + 70], [sx + 8, sz + 12]], count: 20, spread: [18, 30], color: SON, timing: [[0.12, 0], [0.68, 1]] },
      ],
      progress: dc,
      visible: () => clock.near("dung-co"),
    }),
  );
  const campFires: Pt[] = Array.from({ length: 7 }, (_, i) => ring(LAM_SON, 34, (i / 7) * Math.PI * 2 + 0.3));
  world.add(
    createFires({
      sites: campFires.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i / campFires.length, size: 1.4 })),
      lit: () => clock.near("dung-co") * smoothstep(0.35, 0.8, dc()),
      size: 3.5,
      glow: () => 0.9,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 22,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(sx, height(sx, sz) + 7, sz);
        return smoothstep(0.62, 0.8, dc()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.5));
      },
      visible: () => clock.near("dung-co"),
    }),
  );

  // 3. "chi-linh": quân Minh (mực) từ nhiều hướng khép vòng vây quanh núi Chí Linh; nghĩa quân (son) lui lên đỉnh, thưa dần. Giữa chừng một người
  //    (ngà) tách ra lao về phía vòng vây rồi ngã — chuyện Lê Lai theo Lam Sơn thực lục (diễn hoạ; các nguồn chép khác nhau).
  const CL = 28;
  const cl = run("chi-linh", CL);
  const [cx, cz] = CHI_LINH;
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 63,
      groups: Array.from({ length: 6 }, (_, k) => {
        const a = (k / 6) * Math.PI * 2 + 0.2;
        return { path: [ring(CHI_LINH, 260, a), ring(CHI_LINH, 115, a)] as Pt[], count: 26, spread: [80, 20], color: INK, timing: [[0.03 + k * 0.03, 0], [0.55 + k * 0.03, 1]] as [number, number][] };
      }),
      progress: cl,
      visible: () => clock.near("chi-linh"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 64,
      groups: [
        { path: [[sx - 40, sz + 10], [cx + 90, cz - 70], [cx + 20, cz - 10], [cx + 4, cz]], count: 40, spread: [14, 40], color: SON, mortal: true, timing: [[0.02, 0], [0.5, 1]] },
        { path: [[cx + 6, cz + 2], [cx + 50, cz - 30], [cx + 105, cz - 60]], count: 1, color: IVORY, size: 1.3, mortal: true, timing: [[0.62, 0], [0.82, 1]], show: [0.6, 2] },
      ],
      progress: cl,
      fall: () => Math.max(0.55 * smoothstep(0.3, 0.7, cl()), smoothstep(0.82, 0.86, cl())),
      visible: () => clock.near("chi-linh"),
    }),
  );

  // 4. "hoa-hoan": thời tạm hoà — nghĩa quân đi lại giữa bãi Lam Sơn và ruộng ven sông (làm ruộng, gây dựng lại); quân Minh đứng xa phía đông.
  //    Một người (đốm sáng ngà) từ phía đông tìm đến Lam Sơn — Nguyễn Trãi (diễn hoạ).
  const HH = 30;
  const hh = run("hoa-hoan", HH);
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 65,
      groups: [
        { path: shuttle([[sx + 10, sz - 10], [sx + 60, sz - 28]], 3), count: 18, spread: [24, 6], color: SON },
        { path: shuttle([[sx + 20, sz + 10], [sx + 90, sz + 6]], 3), count: 18, spread: [20, 6], color: SON, timing: [[0.1, 0], [1, 1]] },
        { path: [[300, 40], [300, 41]], count: 50, spread: [50, 40], color: INK },
      ],
      progress: hh,
      visible: () => clock.near("hoa-hoan"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [[260, -40], [160, 0], [60, 40], [sx + 12, sz + 4]], count: 1, color: IVORY, size: 1.3, timing: [[0.2, 0], [0.75, 1]] }],
      progress: hh,
      visible: () => clock.near("hoa-hoan") * smoothstep(0.15, 0.25, hh()),
    }),
  );

  // 5. "nghe-an": người xem kéo thanh — đoàn nghĩa quân theo lối qua đồi xuống phía nam; kéo xong thì quân Minh ở Trà Lân (mực) ra hàng
  //    (tan đi) và lửa căn cứ mới sáng lên (diễn hoạ).
  const march = (ctx: FrameCtx) => clamp((ctx.inputs["nam-tien"] ?? 0) / 0.9);
  const sinceIn = (ctx: FrameCtx) => (ctx.completedAt["nam-tien"] ? (ctx.now - ctx.completedAt["nam-tien"]) / 1000 : 0);
  const route: Pt[] = [LAM_SON, ...PASS_S.slice(1, -1), TRA_LAN];
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 66,
      groups: [
        { path: route, count: 90, spread: [20, 110], color: SON },
        { path: route, count: 1, color: IVORY, size: 1.4, timing: [[0, -0.03], [1, 0.97]] },
      ],
      progress: (ctx) => 0.04 + 0.96 * march(ctx),
      visible: () => clock.near("nghe-an"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 67,
      groups: [{ path: [[TRA_LAN[0] + 20, TRA_LAN[1] - 50], [TRA_LAN[0] + 10, TRA_LAN[1] - 30]], count: 40, spread: [36, 30], color: INK, mortal: true }],
      progress: () => 1,
      fall: (ctx) => smoothstep(0.5, 4, sinceIn(ctx)),
      visible: () => clock.near("nghe-an"),
    }),
  );
  world.add(
    createFires({
      sites: [0, 1, 2, 3, 4].map((i) => {
        const [x, z] = ring(TRA_LAN, 30, i * 1.25);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.5 };
      }),
      lit: (ctx) => clock.near("nghe-an") * smoothstep(2, 7, sinceIn(ctx)),
      size: 4,
      glow: () => 0.8,
    }),
  );

  // 6. "mo-rong": lửa nghĩa quân lần lượt bùng lên từ phía nam ra phía bắc; các toán quân (son) toả ra các ngả (diễn hoạ).
  const MR = 22;
  const mr = run("mo-rong", MR);
  world.add(
    createFires({
      sites: FIRE_SITES.map(([x, z], i) => ({ x, y: height(x, z) + 1.5, z, order: i / FIRE_SITES.length, size: 2.2 })),
      lit: () => clock.near("mo-rong") * smoothstep(0.05, 0.9, mr()),
      size: 8,
      glow: () => 0.9,
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 68,
      groups: [
        { path: [TRA_LAN, [-60, -200], [-250, -60]], count: 30, spread: [20, 50], color: SON, timing: [[0.2, 0], [0.9, 1]] },
        { path: [TRA_LAN, [160, -200], [300, -40], [330, 200]], count: 30, spread: [20, 50], color: SON, timing: [[0.25, 0], [1, 1]] },
        { path: [[-120, -400], [-120, -380]], count: 20, spread: [30, 20], color: SON },
      ],
      progress: mr,
      visible: () => clock.near("mo-rong"),
    }),
  );

  // 7. "ra-bac": từ thung lũng, ba đạo quân (son) toả về phía tây bắc, phía bắc và phía đông bắc, mỗi đạo có tướng dẫn đầu (ngà) (diễn hoạ).
  const RB = 26;
  const rb = run("ra-bac", RB);
  const starts: Pt = [sx + 20, sz + 10];
  const routes: Pt[][] = [
    [starts, [sx - 60, sz + 150], [-280, 430]],
    [starts, [sx + 30, sz + 160], [20, 430]],
    [starts, [sx + 140, sz + 110], [380, 430]],
  ];
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 69,
      groups: routes.flatMap((path, k) => [
        { path, count: 45, spread: [18, 90], color: SON, timing: [[0.04 + k * 0.05, 0], [0.9, 1]] as [number, number][] },
        { path, count: 1, color: IVORY, size: 1.4, timing: [[0.04 + k * 0.05, 0.02], [0.9, 1.02]] as [number, number][] },
      ]),
      progress: rb,
      visible: () => clock.near("ra-bac"),
    }),
  );
};

export default setup;
