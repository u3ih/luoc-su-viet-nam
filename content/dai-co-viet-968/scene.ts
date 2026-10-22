import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires, type FireSite } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BASES, BOUNDS, HL, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Đại Cồ Việt — cảnh CÁCH ĐIỆU. Người = chấm dáng người, cứ điểm và ánh sáng = đốm sáng; không vẽ trang phục, cờ, vũ khí, cung điện
// hay vạc dầu (chưa có hiện vật/tư liệu hình ảnh đủ chắc). Vị trí các cứ điểm, đường quân đi là diễn hoạ, không phải tư liệu.

const INK = "#2a2320";
const SON = "#a83a24";
const SON_GLOW = "#e0583c";
const GOLD = "#ffd27a";
const IVORY = "#f0e2b8";

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
const circle = (c: Pt, r: number, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r]);

/** Thứ tự đoàn quân đi qua các cứ điểm trong phân cảnh "dep-loan" (diễn hoạ). */
const ROUTE = [0, 2, 6, 1, 3, 11, 5, 4, 9, 10, 7, 8];
const ARMY_PATH: Pt[] = [HL, ...ROUTE.map((i) => BASES[i])];
const legLen = ARMY_PATH.slice(1).map((p, i) => Math.hypot(p[0] - ARMY_PATH[i][0], p[1] - ARMY_PATH[i][1]));
const total = legLen.reduce((a, b) => a + b, 0);
/** Quãng (0..1) trên ARMY_PATH mà đoàn quân tới từng cứ điểm i. */
const reachAt = BASES.map((_, i) => {
  const k = ROUTE.indexOf(i);
  return legLen.slice(0, k + 1).reduce((a, b) => a + b, 0) / total;
});

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["loan", "hoa-lu", "co-lau", "dep-loan", "xung-de", "trieu-dinh", "ket"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - HL[0], z - HL[1]) > 70,
    water: { deep: "#2d4a45", shallow: "#7d9478" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 520, bushes: 700, grass: 5000, reeds: 1800 },
    birds: { center: { x: -60, y: 0, z: 0 }, radius: 190 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 7,
  });

  const gy = (x: number, z: number) => height(x, z) + 0.25;
  const baseY = BASES.map(([x, z]) => height(x, z) + 7);

  // 1. "loan": mười hai cứ điểm lần lượt sáng lên khắp đồng bằng; giữa vài cặp cứ điểm kề nhau, hai toán quân đi lại xô xát (diễn hoạ).
  const LOAN = 24;
  const loan = run("loan", LOAN);
  world.add(
    createGlows({
      count: BASES.length,
      color: GOLD,
      size: 34,
      minPx: 30,
      place: (i, ctx, out) => {
        out.set(BASES[i][0], baseY[i], BASES[i][1]);
        return smoothstep(i * 1.1, i * 1.1 + 1.4, clock.elapsed("loan")) * (0.8 + 0.1 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("loan"),
    }),
  );
  const feud = (a: number, b: number) => roundTrip([BASES[a], BASES[b]]);
  world.add(
    createCrowd({
      size: 10,
      height,
      seed: 11,
      groups: [feud(0, 1), feud(2, 6), feud(3, 5), feud(7, 8)].flatMap((path, k) => [
        { path, count: 12, spread: [10, 8], color: INK, timing: [[0.18 + k * 0.05, 0], [0.97, 1]] as [number, number][] },
        { path: rev(path), count: 12, spread: [10, 8], color: "#6a4a30", timing: [[0.18 + k * 0.05, 0], [0.97, 1]] as [number, number][] },
      ]),
      progress: loan,
      visible: () => clock.near("loan"),
    }),
  );

  // 2. "hoa-lu": người từ ba phía tụ về thung lũng Hoa Lư quanh một đốm sáng — Đinh Bộ Lĩnh, "có thế lớn giữa thời loạn" (diễn hoạ).
  const HLU = 18;
  const hlu = run("hoa-lu", HLU);
  const valley: Pt[][] = [
    [[-60, -60], [-130, -120], [HL[0] + 22, HL[1] + 8]],
    [[-330, 40], [-290, -60], [HL[0] - 18, HL[1] + 10]],
    [[-310, -330], [-260, -250], [HL[0] - 10, HL[1] - 18]],
  ];
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 12,
      groups: valley.map((path, k) => ({ path, count: 24, spread: [14, 18], color: SON, timing: [[0.05 + k * 0.05, 0], [0.8, 1]] as [number, number][] })),
      progress: hlu,
      visible: () => clock.near("hoa-lu"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => height(x, z) + 6,
      groups: [{ path: [HL, [HL[0] + 0.2, HL[1]]], count: 1, color: GOLD, size: 1.5, show: [0.1, 2] }],
      progress: hlu,
      visible: () => clock.near("hoa-lu"),
    }),
  );

  // 3. "co-lau": truyền thuyết — đám trẻ (chấm nhỏ) xếp hàng đi vòng quanh một bãi cỏ "bày trận", rồi tụ lại quanh một đốm sáng
  //    ở giữa: người được tôn làm "trưởng" (diễn hoạ). Không vẽ cờ lau hay vũ khí.
  const F: Pt = [HL[0] + 70, HL[1] + 90];
  const CL = 20;
  const cl = run("co-lau", CL);
  world.add(
    createCrowd({
      size: 3,
      height,
      seed: 13,
      groups: [
        { path: circle(F, 20), count: 20, spread: [3, 14], color: "#4a3a2a", size: 0.8, timing: [[0.04, 0], [0.62, 1]], show: [0, 0.66] },
        { path: [[F[0] + 20, F[1]], [F[0] + 6, F[1] + 4]], count: 20, spread: [8, 6], color: "#4a3a2a", size: 0.8, timing: [[0.6, 0], [0.92, 1]], show: [0.6, 2] },
      ],
      progress: cl,
      visible: () => clock.near("co-lau"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 4,
      groups: [{ path: [F, [F[0] + 0.2, F[1]]], count: 1, color: GOLD, size: 1.2, show: [0.55, 2] }],
      progress: cl,
      visible: () => clock.near("co-lau"),
    }),
  );

  // 4. "dep-loan": tương tác — kéo thanh thì đoàn quân từ Hoa Lư đi lần lượt qua các cứ điểm; cứ điểm đã qua đổi từ vàng sang đỏ son.
  const progressed = (ctx: FrameCtx) => clamp((ctx.inputs["thong-nhat"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 10,
      height,
      seed: 14,
      groups: [
        { path: ARMY_PATH, count: 80, spread: [22, 30], color: SON },
        { path: ARMY_PATH, count: 1, color: IVORY, size: 1.5 },
      ],
      progress: progressed,
      visible: () => clock.near("dep-loan"),
    }),
  );
  const gl = (color: string, on: boolean) =>
    createGlows({
      count: BASES.length,
      color,
      size: 34,
      minPx: 30,
      place: (i, ctx, out) => {
        out.set(BASES[i][0], baseY[i], BASES[i][1]);
        const done = smoothstep(reachAt[i] - 0.02, reachAt[i] + 0.01, progressed(ctx));
        return (on ? done : 1 - done) * (0.8 + 0.1 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("dep-loan"),
    });
  world.add(gl(GOLD, false));
  world.add(gl(SON_GLOW, true));

  // 5. "xung-de": hai khối người từ hai phía vào xếp hàng trước chỗ Đinh Bộ Lĩnh đứng ở Hoa Lư; khi đã đông đủ, một quầng sáng vàng
  //    hiện lên trên chỗ ông đứng — tượng trưng việc lên ngôi, không phải vật thể (diễn hoạ).
  const XD = 16;
  const xd = run("xung-de", XD);
  const THRONE: Pt = [HL[0] + 6, HL[1] - 2];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 15,
      groups: [
        { path: [THRONE, [THRONE[0] + 0.2, THRONE[1]]], count: 1, color: IVORY, size: 1.4 },
        { path: [[HL[0] + 90, HL[1] - 70], [HL[0] + 30, HL[1] - 28], [HL[0] + 22, HL[1] - 14]], count: 36, spread: [18, 16], color: SON, timing: [[0.03, 0], [0.62, 1]] },
        { path: [[HL[0] + 80, HL[1] + 90], [HL[0] + 34, HL[1] + 36], [HL[0] + 22, HL[1] + 16]], count: 36, spread: [18, 16], color: SON, timing: [[0.08, 0], [0.66, 1]] },
      ],
      progress: xd,
      visible: () => clock.near("xung-de"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 8,
      groups: [{ path: [THRONE, [THRONE[0] + 0.2, THRONE[1]]], count: 1, color: GOLD, show: [0.68, 2] }],
      progress: xd,
      visible: () => clock.near("xung-de"),
    }),
  );

  // 6. "trieu-dinh": quân chia thành từng khối đứng thành hàng lần lượt hiện ra; một ngọn lửa lớn trước sân (chỗ "vạc dầu" trong lời kể,
  //    chỉ là ánh lửa) bừng lên; một sứ đoàn nhỏ rời Hoa Lư đi về phía đông bắc, ra khỏi khung hình (hướng đi là diễn hoạ).
  const TD = 26;
  const td = run("trieu-dinh", TD);
  const blocks: Pt[] = [[-30, 34], [-8, 46], [14, 38], [-20, 62]];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 16,
      groups: [
        ...blocks.map(([dx, dz], k) => ({
          path: [[HL[0] + dx, HL[1] + dz], [HL[0] + dx + 0.2, HL[1] + dz]] as Pt[],
          count: 16,
          spread: [14, 10] as Pt,
          color: SON,
          show: [0.06 + k * 0.11, 2] as Pt,
        })),
        { path: [[HL[0] + 36, HL[1] + 10], [-100, -70], [60, 40], [250, 190], [340, 330]], count: 8, spread: [6, 8], color: IVORY, timing: [[0.2, 0], [0.97, 1]] },
      ],
      progress: td,
      visible: () => clock.near("trieu-dinh"),
    }),
  );

  // 7. "ket": ánh sáng và lửa ở Hoa Lư tắt dần; ở xa phía đông bắc, một đoàn người chậm rãi tiến lại từ chân trời — điềm báo chương sau
  //    (nhà Tống nhòm ngó). Chỉ là diễn hoạ gợi ý, không phải đội hình thật.
  const KET = 22;
  const ket = run("ket", KET);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => height(x, z) + 6,
      groups: [{ path: [HL, [HL[0] + 0.2, HL[1]]], count: 1, color: GOLD, size: 1.5, show: [0, 0.3] }],
      progress: ket,
      visible: () => clock.near("ket"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 17,
      groups: [{ path: [[340, 390], [250, 300], [140, 190], [40, 110]], count: 120, spread: [40, 50], color: INK, timing: [[0.4, 0], [1, 1]], show: [0.38, 2] }],
      progress: ket,
      visible: () => clock.near("ket"),
    }),
  );

  // lửa quanh khu cung điện: nhóm lên theo từng phân cảnh, tắt dần khi "ket"
  const sites: FireSite[] = [[-16, -12], [14, -18], [26, 8], [-10, 20], [8, 2]].map(([dx, dz], i) => ({ x: HL[0] + dx, y: gy(HL[0] + dx, HL[1] + dz), z: HL[1] + dz, order: i * 0.18, size: 1.1 }));
  const vac: FireSite = { x: HL[0] + 14, y: gy(HL[0] + 14, HL[1] + 6), z: HL[1] + 6, order: 0.9, size: 1.6 };
  world.add(
    createFires({
      sites: [...sites, vac],
      size: 2,
      lit: () =>
        Math.max(
          clock.near("hoa-lu") * smoothstep(3, 9, clock.elapsed("hoa-lu")) * 0.8,
          clock.near("xung-de") * smoothstep(8, 14, clock.elapsed("xung-de")) * 0.8,
          clock.near("trieu-dinh") * (0.8 + 0.2 * smoothstep(8, 14, clock.elapsed("trieu-dinh"))),
          clock.near("ket") * (1 - smoothstep(2, 12, clock.elapsed("ket"))) * 0.9,
        ),
      glow: (ctx) => 0.3 + smoothstep(1.5, 3, ctx.params.mood) * 0.7,
    }),
  );
};

export default setup;
