import { clamp, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, HALL, PLACES, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Hội nghị Diên Hồng — cảnh CÁCH ĐIỆU. Người = chấm dáng người; ánh sáng = đốm sáng. Không vẽ điện Diên Hồng, trang phục, cờ, vũ khí (chưa có hiện vật/tư liệu
// hình ảnh đủ chắc). Vị trí kinh đô, các lộ, hướng quân Nguyên đi là diễn hoạ. Son = quân/dân nhà Trần, mực = quân Nguyên, ngà = các bô lão, vàng = ánh sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const ELDER = "#d8cdb0";
const GOLD = "#ffd27a";

const onWater = (x: number, z: number) => Math.max(height(x, z), WATER);
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const circle = (c: Pt, r: number, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r]);
/** Đường đi từ nơi `p` tới điện, hơi cong (điểm giữa lệch) để không thẳng tuột. */
const toHall = (p: Pt, k: number): Pt[] => [p, [p[0] * 0.5 + (k % 2 ? 22 : -22), p[1] * 0.5 + (k % 3 ? -18 : 18)], [HALL[0] + p[0] * 0.07, HALL[1] + p[1] * 0.07]];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["moi-be", "ap-sat", "trieu-tap", "dien-hong", "ve-lang", "mo-man"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - HALL[0], z - HALL[1]) > 70,
    water: { deep: "#2d4a45", shallow: "#7d9478" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 460, bushes: 620, grass: 4500, reeds: 1800 },
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 200 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 41,
  });

  // 1. "moi-be": sứ nhà Nguyên (chấm mực) từ phương bắc tới kinh đô, đứng lại một lúc rồi quay về phía bắc (lời đòi bị từ chối); ở xa phía bắc một khối quân tập hợp dần (diễn hoạ).
  const MB = 28;
  const mb = run("moi-be", MB);
  world.add(
    createCrowd({
      size: 9,
      height,
      seed: 71,
      groups: [
        { path: [[40, 380], [24, 220], [8, 70], [HALL[0] + 6, HALL[1] + 18]], count: 10, spread: [8, 10], color: INK, timing: [[0.03, 0], [0.4, 1], [0.55, 1], [0.92, 0]] },
        { path: [[HALL[0], HALL[1] + 6], [HALL[0] + 0.2, HALL[1] + 6]], count: 24, spread: [24, 14], color: SON },
        { path: [[60, 400], [60, 330]], count: 120, spread: [120, 40], color: INK, timing: [[0.3, 0], [0.95, 1]], show: [0.28, 2] },
      ],
      progress: mb,
      visible: () => clock.near("moi-be"),
    }),
  );

  // 2. "ap-sat": hai khối quân Nguyên (chấm mực) tiến sát từ hai phía — bắc và đông nam — rồi dừng ở biên; quân Trần (chấm son) giữ các điểm gần kinh đô (diễn hoạ).
  const AS = 30;
  const as_ = run("ap-sat", AS);
  world.add(
    createCrowd({
      size: 11,
      height: onWater,
      seed: 72,
      groups: [
        { path: [[40, 410], [60, 330], [70, 250]], count: 200, spread: [150, 50], color: INK, timing: [[0.04, 0], [0.9, 1]] },
        { path: [[330, -400], [290, -300], [250, -190]], count: 110, spread: [70, 40], color: INK, timing: [[0.1, 0], [0.92, 1]] },
        { path: [[-50, 150], [-48, 150.2]], count: 60, spread: [90, 20], color: SON },
        { path: [[60, -120], [62, -120.2]], count: 50, spread: [70, 20], color: SON },
      ],
      progress: as_,
      visible: () => clock.near("ap-sat"),
    }),
  );

  // 3. "trieu-tap": tám vệt sáng (sứ giả) từ kinh đô toả ra tám nơi; rồi các bô lão (chấm ngà) từ tám nơi ấy kéo về điện (diễn hoạ).
  const TT = 40;
  const tt = run("trieu-tap", TT);
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 5,
      seed: 73,
      groups: PLACES.map((p): CrowdGroup => ({ path: [[HALL[0], HALL[1]], ...toHall(p, 3).slice(1, 2), p], count: 1, color: GOLD, size: 1.2, timing: [[0.03, 0], [0.35, 1]], show: [0, 0.4] })),
      progress: tt,
      visible: () => clock.near("trieu-tap"),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height: onWater,
      seed: 74,
      groups: PLACES.map((p, k): CrowdGroup => ({ path: toHall(p, k), count: 8, spread: [10, 12], color: ELDER, timing: [[0.3 + (k % 4) * 0.03, 0], [0.97, 1]], show: [0.3, 2] })),
      progress: tt,
      visible: () => clock.near("trieu-tap"),
    }),
  );

  // 4. "dien-hong": các bô lão đứng thành vòng quanh điện (chấm ngà lần lượt hiện), một đốm sáng ở giữa; người xem kéo thanh thì từng đốm sáng quanh vòng bừng lên và bay cao dần —
  //    tượng trưng tiếng đáp "đánh" vang lên từ muôn người (diễn hoạ, không vẽ chữ hay lời).
  const DH = 20;
  const dh = run("dien-hong", DH);
  const N_VOICE = 36;
  const ring = circle(HALL, 30, N_VOICE);
  const spoken = (ctx: { inputs: Record<string, number> }) => clamp((ctx.inputs.danh ?? 0) / 0.85);
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 75,
      groups: [{ path: ring, count: 90, color: ELDER, drop: true, timing: [[0.03, 0], [0.55, 1]] }],
      progress: dh,
      visible: () => clock.near("dien-hong"),
    }),
  );
  world.add(
    createGlows({
      count: N_VOICE + 1,
      color: (i) => (i === N_VOICE ? GOLD : "#ffe2a0"),
      size: (i) => (i === N_VOICE ? 12 : 7),
      minPx: 20,
      place: (i, ctx, out) => {
        const s = spoken(ctx);
        if (i === N_VOICE) {
          out.set(HALL[0], height(HALL[0], HALL[1]) + 7, HALL[1]);
          return 0.6 + 0.1 * Math.sin(ctx.time * 1.5) + 0.25 * smoothstep(0, 1, s);
        }
        const [x, z] = ring[i];
        out.set(x, height(x, z) + 4 + s * (10 + (i % 5) * 5), z);
        return smoothstep(0.02 + (i / N_VOICE) * 0.4, 0.15 + (i / N_VOICE) * 0.4, s) * (0.8 + 0.1 * Math.sin(ctx.time * 2 + i));
      },
      visible: () => clock.near("dien-hong"),
    }),
  );

  // 5. "ve-lang": các bô lão đi từ điện về tám nơi; theo sau, vệt sáng "tin lan" tỏa ra khắp các làng và từng nhóm dân binh (chấm son) hiện dần ở mỗi nơi (diễn hoạ).
  const VL = 36;
  const vl = run("ve-lang", VL);
  world.add(
    createCrowd({
      size: 4,
      height: onWater,
      seed: 76,
      groups: [
        ...PLACES.map((p, k): CrowdGroup => ({ path: rev(toHall(p, k)), count: 8, spread: [10, 12], color: ELDER, timing: [[0.02, 0], [0.7, 1]] })),
        ...PLACES.map((p, k): CrowdGroup => ({ path: [p, [p[0] + 0.2, p[1]]], count: 14, spread: [26, 22], color: SON, show: [0.5 + (k % 4) * 0.08, 2] })),
      ],
      progress: vl,
      visible: () => clock.near("ve-lang"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 4,
      seed: 77,
      groups: PLACES.map((p, k): CrowdGroup => ({ path: [[HALL[0], HALL[1]], ...toHall(p, k).slice(1, 2).reverse(), p], count: 6, color: GOLD, drop: true, size: 0.7, timing: [[0.15, 0], [0.9, 1]] })),
      progress: vl,
      visible: () => clock.near("ve-lang"),
    }),
  );

  // 6. "mo-man": khối quân Nguyên (chấm mực) từ phương bắc tiến xuống vùng kinh đô; quân Trần (chấm son) và người dân rời kinh đô theo hướng đông nam,
  //    rút ra khỏi khung hình (diễn hoạ; hướng rút không phải tư liệu).
  const MM = 34;
  const mm = run("mo-man", MM);
  world.add(
    createCrowd({
      size: 10,
      height: onWater,
      seed: 78,
      groups: [
        { path: [[40, 400], [30, 300], [14, 160], [HALL[0] + 4, HALL[1] + 14]], count: 220, spread: [120, 60], color: INK, timing: [[0.05, 0], [0.97, 1]] },
        { path: [[HALL[0] - 4, HALL[1]], [90, -120], [200, -260], [300, -420]], count: 140, spread: [40, 40], color: SON, timing: [[0.1, 0], [0.9, 1]] },
        { path: [[HALL[0] - 4, HALL[1] + 8], [60, -140], [150, -280], [250, -430]], count: 1, color: GOLD, size: 1.4, timing: [[0.1, 0], [0.9, 1]], show: [0, 0.95] },
      ],
      progress: mm,
      visible: () => clock.near("mo-man"),
    }),
  );
};

export default setup;
