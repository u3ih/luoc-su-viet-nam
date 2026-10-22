import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createStakeField, type StakeLine } from "@/core/world/stakes";
import config from "./scene.config";
import { BOUNDS, STAKE_TOP, STAKE_X, TIDE_HIGH, TIDE_LOW, TL, bankDist, colorize, height, riverZ } from "./terrain";

type Pt = [number, number];

// Bạch Đằng 1288 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; "thuyền" = chấm đi trên mặt sông; không vẽ thuyền, cờ, trang phục, vũ khí (chưa có hiện vật/hình ảnh
// đủ chắc). Vị trí bãi cọc, đường sông, đường quân đi là diễn hoạ. Son = quân Trần, mực = quân Nguyên, vàng = ánh sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const GOLD = "#ffd27a";

const level = (ctx: FrameCtx) => lerp(TIDE_HIGH, TIDE_LOW, ctx.params.tide);
const onWater = (x: number, z: number) => Math.max(height(x, z), (TIDE_HIGH + TIDE_LOW) / 2);
const mid = (x: number, dz = 0): Pt => [x, riverZ(x) + dz];
const lane = (xs: number[], dz = 0): Pt[] => xs.map((x) => mid(x, dz));
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["quan-nguyen", "van-don", "nguyen-rut", "coc-ngam", "con-nuoc", "ket-qua", "dau-tich"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - TL[0], z - TL[1]) > 70,
    water: { deep: "#2b4640", shallow: "#7b9680" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 480, bushes: 650, grass: 4500, reeds: 1800 },
    birds: { center: { x: 60, y: 0, z: 0 }, radius: 200 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 51,
  });

  // ---- tương tác: kéo cho nước triều rút (phân cảnh "con-nuoc") ----
  const BEAT_CN = world.beat("con-nuoc");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT_CN));
    target.tide += ((ctx.inputs["trieu-rut"] ?? 0) - target.tide) * w;
  });
  const drain = (ctx: FrameCtx) => clamp((ctx.inputs["trieu-rut"] ?? 0) / 0.85);

  // ---- bãi cọc: trồi dần trong phân cảnh "coc-ngam", sau đó giữ nguyên (ngọn chìm hay lộ theo mực triều) ----
  const BEAT_CO = world.beat("coc-ngam");
  const zs = riverZ(STAKE_X);
  const lines: StakeLine[] = [-12, 0, 12].map((dx) => ({ from: [STAKE_X + dx, zs + 52], to: [STAKE_X + dx, zs - 52] }));
  world.add(
    await createStakeField({
      lines,
      rows: 4,
      height,
      top: STAKE_TOP,
      toward: [-1, 0],
      seed: 1288,
      built: (ctx) => Math.max(smoothstep(0.5, 11, clock.elapsed("coc-ngam")), smoothstep(BEAT_CO + 0.3, BEAT_CO + 0.6, ctx.t)),
    }),
  );

  // 1. "quan-nguyen": khối quân Nguyên (chấm mực) từ phương bắc kéo xuống đóng ở Thăng Long; quân Trần (chấm son) rút khỏi kinh thành sang phía nam, qua sông (diễn hoạ).
  const QN = 28;
  const qn = run("quan-nguyen", QN);
  world.add(
    createCrowd({
      size: 10,
      height: onWater,
      seed: 81,
      groups: [
        { path: [[-120, 420], [-190, 330], [TL[0] + 6, TL[1] + 8]], count: 200, spread: [70, 50], color: INK, timing: [[0.04, 0], [0.9, 1]] },
        { path: [[TL[0] - 6, TL[1] - 10], [-230, 80], [-220, -40], [-190, -190]], count: 100, spread: [30, 30], color: SON, timing: [[0.08, 0], [0.9, 1]] },
        { path: [[TL[0] - 6, TL[1] - 4], [-236, 90], [-224, -30], [-196, -200]], count: 1, color: GOLD, size: 1.4, timing: [[0.08, 0], [0.9, 1]], show: [0, 0.95] },
      ],
      progress: qn,
      visible: () => clock.near("quan-nguyen"),
    }),
  );

  // 2. "van-don": đoàn "thuyền lương" của quân Nguyên (chấm mực trên mặt nước) từ biển vào cửa sông; hai toán quân Trần từ hai lạch đánh úp, đoàn lương ngã dần (diễn hoạ).
  const VD = 24;
  const vd = run("van-don", VD);
  world.add(
    createCrowd({
      size: 8,
      height: onWater,
      seed: 82,
      groups: [
        { path: lane([430, 380, 330, 300]), count: 90, spread: [30, 40], color: INK, mortal: true, timing: [[0.04, 0], [0.5, 0.7], [0.58, 0.7], [0.9, 0.85]] },
        { path: [[225, -200], [236, -90], [262, -44]], count: 40, spread: [14, 16], color: SON, timing: [[0.4, 0], [0.7, 1]], show: [0.38, 2] },
        { path: [[170, 200], [190, 90], [240, 8]], count: 40, spread: [14, 16], color: SON, timing: [[0.42, 0], [0.72, 1]], show: [0.4, 2] },
      ],
      progress: vd,
      fall: () => 0.9 * smoothstep(0.55, 0.9, vd()),
      visible: () => clock.near("van-don"),
    }),
  );

  // 3. "nguyen-rut": quân Nguyên rời Thăng Long theo hai đường — bộ binh lên phía bắc (đường bộ), thủy quân xuôi sông ra biển (diễn hoạ).
  const NR = 34;
  const nr = run("nguyen-rut", NR);
  world.add(
    createCrowd({
      size: 10,
      height: onWater,
      seed: 83,
      groups: [
        { path: [[TL[0] + 6, TL[1] + 8], [-190, 300], [-130, 410]], count: 110, spread: [50, 36], color: INK, timing: [[0.1, 0], [0.9, 1]] },
        { path: [[-250, 66], ...lane([-160, -20, 70]), [150, -34]], count: 120, spread: [26, 36], color: INK, timing: [[0.12, 0], [0.95, 1]] },
      ],
      progress: nr,
      visible: () => clock.near("nguyen-rut"),
    }),
  );

  // 4. "coc-ngam": bãi cọc trồi lên (xem createStakeField ở trên), trong lúc quân Trần (chấm son) đi lại hai bờ gần bãi cọc, rồi nấp vào hai lạch phía bắc và nam (diễn hoạ).
  const CO = 30;
  const co = run("coc-ngam", CO);
  const bankN: Pt[] = [[STAKE_X - 50, zs + 76], [STAKE_X, zs + 70], [STAKE_X + 50, zs + 78]];
  const bankS: Pt[] = [[STAKE_X - 50, zs - 76], [STAKE_X, zs - 70], [STAKE_X + 50, zs - 78]];
  world.add(
    createCrowd({
      size: 5,
      height: onWater,
      seed: 84,
      groups: [
        { path: [...bankN, ...rev(bankN).slice(1)], count: 16, spread: [10, 8], color: SON, timing: [[0.05, 0], [0.6, 1]] },
        { path: [...bankS, ...rev(bankS).slice(1)], count: 16, spread: [10, 8], color: SON, timing: [[0.05, 0], [0.6, 1]] },
        { path: [[STAKE_X + 40, zs + 74], [175, 150], [145, 230]], count: 40, spread: [18, 14], color: SON, timing: [[0.55, 0], [0.97, 1]], show: [0.5, 2] },
        { path: [[STAKE_X + 40, zs - 74], [200, -120], [220, -190]], count: 40, spread: [18, 14], color: SON, timing: [[0.55, 0], [0.97, 1]], show: [0.5, 2] },
      ],
      progress: co,
      visible: () => clock.near("coc-ngam"),
    }),
  );

  // 5. "con-nuoc": đoàn thuyền Nguyên (chấm mực trên mặt nước) xuôi sông; mấy chấm son nhử đi trước rồi vượt qua bãi cọc; người xem kéo thanh thì nước rút, thuyền Nguyên mắc kẹt,
  //    quân Trần từ hai lạch đánh ập ra và thuyền Nguyên ngã dần (diễn hoạ).
  const CN = 20;
  const cn = run("con-nuoc", CN);
  world.add(
    createCrowd({
      size: 8,
      height: onWater,
      seed: 85,
      groups: [
        { path: lane([-170, -60, 40, 100]), count: 150, spread: [34, 70], color: INK, mortal: true },
        { path: lane([-80, 20, 100, 170, 260], 8), count: 10, spread: [4, 8], color: SON, timing: [[0.02, 0], [0.7, 1]], show: [0, 0.75] },
      ],
      progress: cn,
      fall: (ctx) => 0.95 * smoothstep(0.12, 0.9, drain(ctx)),
      visible: () => clock.near("con-nuoc"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: onWater,
      seed: 86,
      groups: [
        { path: [[STAKE_X + 90, zs + 70], [STAKE_X + 20, zs + 50], [STAKE_X - 40, zs + 20]], count: 50, spread: [26, 12], color: SON },
        { path: [[STAKE_X + 90, zs - 70], [STAKE_X + 20, zs - 50], [STAKE_X - 40, zs - 20]], count: 50, spread: [26, 12], color: SON },
      ],
      progress: (ctx) => drain(ctx),
      visible: (ctx) => clock.near("con-nuoc") * smoothstep(0.04, 0.1, drain(ctx)),
    }),
  );

  // 6. "ket-qua": thuyền Nguyên còn lại bị dồn giữa sông, quân Trần (chấm son) khép lại; ở phía tây đạo quân đường bộ (chấm mực) bị chặn đánh dọc đường rút, ngã dần (diễn hoạ).
  const KQ = 30;
  const kq = run("ket-qua", KQ);
  world.add(
    createCrowd({
      size: 9,
      height: onWater,
      seed: 87,
      groups: [
        { path: [[STAKE_X - 20, zs], [STAKE_X - 20.2, zs]], count: 90, spread: [60, 80], color: INK, mortal: true },
        { path: [[STAKE_X + 90, zs + 60], [STAKE_X + 10, zs + 30]], count: 50, spread: [30, 20], color: SON, timing: [[0.05, 0], [0.5, 1]] },
        { path: [[STAKE_X + 90, zs - 60], [STAKE_X + 10, zs - 30]], count: 50, spread: [30, 20], color: SON, timing: [[0.05, 0], [0.5, 1]] },
        { path: [[-190, 250], [-140, 330], [-110, 420]], count: 120, spread: [50, 40], color: INK, mortal: true, timing: [[0.1, 0], [0.95, 1]] },
        { path: [[-60, 330], [-80, 330.2]], count: 40, spread: [20, 30], color: SON, timing: [[0, 0], [1, 1]], show: [0.3, 2] },
      ],
      progress: kq,
      fall: () => 0.95 * smoothstep(0.2, 0.8, kq()),
      visible: () => clock.near("ket-qua"),
    }),
  );

  // 7. "dau-tich": những đốm sáng nhỏ lần lượt hiện dọc các nhánh sông, như các điểm đã tìm thấy bãi cọc (diễn hoạ: số lượng, vị trí không phản ánh số liệu thật).
  const sites: Pt[] = [[112, zs + 30], [118, zs - 30], [150, 150], [138, 220], [215, -110], [225, -190], [60, zs + 10], [-30, zs - 6]];
  world.add(
    createGlows({
      count: sites.length,
      color: GOLD,
      size: 18,
      minPx: 22,
      place: (i, ctx, out) => {
        out.set(sites[i][0], height(sites[i][0], sites[i][1]) + 6, sites[i][1]);
        return smoothstep(i * 1.2, i * 1.2 + 1.5, clock.elapsed("dau-tich")) * (0.8 + 0.1 * Math.sin(ctx.time * 1.6 + i));
      },
      visible: () => clock.near("dau-tich"),
    }),
  );
};

export default setup;
