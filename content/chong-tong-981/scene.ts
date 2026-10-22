import { clamp, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createStakeField } from "@/core/world/stakes";
import config from "./scene.config";
import { BOUNDS, COURT, LE_CAMP, PASS, STAKE_X, WATER, bankDist, colorize, height, riverZ } from "./terrain";

type Pt = [number, number];

// Lê Hoàn đánh quân Tống — cảnh CÁCH ĐIỆU. Người và "thuyền" đều là chấm dáng người (thuyền = chấm đi trên mặt nước); không vẽ thuyền,
// cờ, trang phục, vũ khí vì chưa có hiện vật/hình ảnh đủ chắc. Vị trí bãi cọc, hướng quân đi là diễn hoạ. Son = quân Đại Cồ Việt,
// mực = quân Tống, ngà = sứ giả / người đứng đầu, vàng = quầng sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
/** Điểm giữa lòng sông tại x (m). */
const mid = (x: number, dz = 0): Pt => [x, riverZ(x) + dz];
const onWater = (x: number, z: number) => Math.max(height(x, z), WATER);
/** Đường thuyền đi dọc sông, nối các x. */
const lane = (xs: number[], dz = 0): Pt[] => xs.map((x) => mid(x, dz));

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nhiep-chinh", "dong-song", "coc-ngam", "bach-dang", "gia-hang", "ket-qua"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - COURT[0], z - COURT[1]) > 40 && Math.hypot(x - LE_CAMP[0], z - LE_CAMP[1]) > 40,
    water: { deep: "#2b4640", shallow: "#7b9680" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 520, bushes: 700, grass: 5000, reeds: 1800 },
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 190 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 21,
  });

  // ---- bãi cọc ngầm: trồi dần trong phân cảnh "coc-ngam", sau đó giữ nguyên ----
  const BEAT_COC = world.beat("coc-ngam");
  const z0 = riverZ(STAKE_X);
  world.add(
    await createStakeField({
      lines: [
        { from: [STAKE_X, z0 + 40], to: [STAKE_X, z0 - 40] },
        { from: [STAKE_X - 14, z0 + 40], to: [STAKE_X - 14, z0 - 40] },
      ],
      rows: 4,
      height,
      top: WATER + 0.7,
      toward: [1, 0],
      seed: 981,
      built: (ctx) => Math.max(smoothstep(0.5, 11, clock.elapsed("coc-ngam")), smoothstep(BEAT_COC + 0.3, BEAT_COC + 0.6, ctx.t)),
    }),
  );

  // 1. "nhiep-chinh": người từ ba hướng tụ về đồi họp triều; khi đã đông đủ, một quầng sáng vàng hiện lên trên chỗ Lê Hoàn đứng —
  //    tượng trưng việc lên ngôi, không phải vật thể (diễn hoạ).
  const NC = 16;
  const nc = run("nhiep-chinh", NC);
  const [cx, cz] = COURT;
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 31,
      groups: [
        { path: [[cx, cz], [cx + 0.2, cz]], count: 1, color: IVORY, size: 1.4 },
        { path: [[cx + 120, cz + 90], [cx + 40, cz + 30], [cx + 10, cz + 8]], count: 30, spread: [16, 16], color: SON, timing: [[0.03, 0], [0.62, 1]] },
        { path: [[cx - 100, cz + 140], [cx - 34, cz + 50], [cx - 8, cz + 12]], count: 30, spread: [16, 16], color: SON, timing: [[0.07, 0], [0.66, 1]] },
        { path: [[cx + 30, cz - 130], [cx + 14, cz - 50], [cx + 4, cz - 14]], count: 30, spread: [16, 16], color: SON, timing: [[0.1, 0], [0.7, 1]] },
      ],
      progress: nc,
      visible: () => clock.near("nhiep-chinh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 8,
      groups: [{ path: [[cx, cz], [cx + 0.2, cz]], count: 1, color: GOLD, show: [0.7, 2] }],
      progress: nc,
      visible: () => clock.near("nhiep-chinh"),
    }),
  );

  // 2. "dong-song": hai đạo quân Tống tiến xuống — thủy quân (chấm trên mặt sông) từ phía biển vào cửa sông, bộ binh từ thung lũng
  //    phía tây bắc xuống bờ sông; quân Việt từ đồi họp triều đi ra trại ở bờ nam (diễn hoạ; số lượng, hướng đi không phải tư liệu).
  const DS = 28;
  const ds = run("dong-song", DS);
  world.add(
    createCrowd({
      size: 10,
      height: onWater,
      seed: 32,
      groups: [{ path: lane([430, 330, 220, 130]), count: 90, spread: [34, 40], color: INK, timing: [[0.04, 0], [0.9, 1]] }],
      progress: ds,
      visible: () => clock.near("dong-song"),
    }),
  );
  world.add(
    createCrowd({
      size: 10,
      height,
      seed: 33,
      groups: [
        { path: PASS, count: 100, spread: [24, 36], color: INK, timing: [[0.05, 0], [0.92, 1]] },
        { path: [[cx + 8, cz + 8], [-170, -150], LE_CAMP], count: 70, spread: [26, 28], color: SON, timing: [[0.1, 0], [0.9, 1]] },
        { path: [[cx + 8, cz + 8], [-170, -150], LE_CAMP], count: 1, color: IVORY, size: 1.5, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: ds,
      visible: () => clock.near("dong-song"),
    }),
  );

  // 3. "coc-ngam": bãi cọc trồi lên (xem createStakeField ở trên); trong lúc đó một toán quân Việt (chấm) đi lại trên hai bờ gần bãi cọc, như đang làm việc.
  const CN = 26;
  const cn = run("coc-ngam", CN);
  const bankN: Pt[] = [[STAKE_X - 30, z0 + 56], [STAKE_X, z0 + 50], [STAKE_X + 30, z0 + 56]];
  const bankS: Pt[] = [[STAKE_X - 30, z0 - 56], [STAKE_X, z0 - 50], [STAKE_X + 30, z0 - 56]];
  const both = [...bankN, ...rev(bankN).slice(1)];
  const bothS = [...bankS, ...rev(bankS).slice(1)];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 34,
      groups: [
        { path: both, count: 14, spread: [8, 8], color: SON, timing: [[0.05, 0], [0.97, 1]] },
        { path: bothS, count: 14, spread: [8, 8], color: SON, timing: [[0.05, 0], [0.97, 1]] },
      ],
      progress: cn,
      visible: () => clock.near("coc-ngam"),
    }),
  );

  // 4. "bach-dang": thủy quân Tống (chấm trên mặt sông) tiến sâu vào cửa sông, đẩy lùi một toán quân Việt ở bờ nam (một số ngã xuống),
  //    chạy tới sát bãi cọc rồi đứng lại.
  const BD = 24;
  const bd = run("bach-dang", BD);
  const bank: Pt[] = [[STAKE_X - 10, z0 - 56], [STAKE_X - 70, z0 - 66], [STAKE_X - 150, z0 - 80]];
  world.add(
    createCrowd({
      size: 6,
      height: onWater,
      seed: 35,
      groups: [{ path: lane([430, 300, 160, 40, 10]), count: 100, spread: [34, 40], color: INK, timing: [[0.03, 0], [0.9, 1]] }],
      progress: bd,
      visible: () => clock.near("bach-dang"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 36,
      groups: [{ path: bank, count: 40, spread: [20, 18], color: SON, mortal: true, timing: [[0.35, 0], [0.95, 1]] }],
      progress: bd,
      fall: () => 0.3 * smoothstep(0.4, 0.8, bd()),
      visible: () => clock.near("bach-dang"),
    }),
  );

  // 5. "gia-hang": thuyền giặc đứng dưới bãi cọc, một toán nhỏ quân Việt tiến ra "xin hàng" (chấm son) rồi dừng; người xem kéo thanh thì quân Việt
  //    từ hai bờ xuất kích, thuyền giặc rối loạn và ngã dần (diễn hoạ; không vẽ nhân vật Hầu Nhân Bảo).
  const GH = 14;
  const gh = run("gia-hang", GH);
  const ambush = (ctx: { inputs: Record<string, number> }) => clamp((ctx.inputs["phuc-kich"] ?? 0) / 0.85);
  world.add(
    createCrowd({
      size: 6,
      height: onWater,
      seed: 37,
      groups: [
        { path: lane([48, 8, -4]), count: 80, spread: [26, 36], color: INK, mortal: true },
        { path: [mid(STAKE_X - 20), mid(STAKE_X + 36)], count: 6, spread: [4, 6], color: IVORY, timing: [[0.05, 0], [0.6, 1]], show: [0, 1.2] },
      ],
      progress: gh,
      fall: (ctx) => 0.95 * smoothstep(0.1, 1, ambush(ctx)),
      visible: () => clock.near("gia-hang"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 38,
      groups: [
        { path: [[STAKE_X - 90, z0 + 70], [STAKE_X - 50, z0 + 56], [STAKE_X - 5, z0 + 40]], count: 40, spread: [20, 14], color: SON },
        { path: [[STAKE_X - 90, z0 - 70], [STAKE_X - 50, z0 - 56], [STAKE_X - 5, z0 - 40]], count: 40, spread: [20, 14], color: SON },
      ],
      progress: (ctx) => ambush(ctx),
      visible: (ctx) => clock.near("gia-hang") * smoothstep(0.01, 0.05, ambush(ctx)),
    }),
  );

  // 6. "ket-qua": thủy quân và bộ binh Tống rút theo đường cũ (ra biển, lên thung lũng phía tây bắc); về cuối một sứ đoàn nhỏ (chấm ngà) đi
  //    theo thung lũng lên phía bắc — gợi quan hệ hòa hiếu năm 986 (diễn hoạ).
  const KQ = 26;
  const kq = run("ket-qua", KQ);
  world.add(
    createCrowd({
      size: 9,
      height: onWater,
      seed: 39,
      groups: [{ path: lane([20, 120, 240, 430]), count: 50, spread: [30, 34], color: INK, timing: [[0.04, 0], [0.8, 1]] }],
      progress: kq,
      visible: () => clock.near("ket-qua"),
    }),
  );
  world.add(
    createCrowd({
      size: 9,
      height,
      seed: 40,
      groups: [
        { path: rev(PASS), count: 60, spread: [20, 30], color: INK, timing: [[0.05, 0], [0.85, 1]] },
        { path: rev(PASS), count: 6, spread: [4, 8], color: IVORY, size: 1.2, timing: [[0.55, 0], [1, 1]], show: [0.55, 2] },
        { path: [LE_CAMP, [LE_CAMP[0] + 30, LE_CAMP[1] + 40]], count: 40, spread: [24, 18], color: SON },
      ],
      progress: kq,
      visible: () => clock.near("ket-qua"),
    }),
  );
};

export default setup;
