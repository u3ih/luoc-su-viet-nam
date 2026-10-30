import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, HANG_DAO, HA_NOI, TINH, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Đông Kinh Nghĩa Thục 1907 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; trường, các ban, các lớp = đốm sáng; không vẽ nhà, lớp học, sách, cờ hiệu, trang phục. Vị trí Hà Nội, phố Hàng Đào và các tỉnh là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = trường; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hang-dao", "mo-hinh", "day-hoc", "dong-cua", "ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HANG_DAO, 60], [HA_NOI, 60]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 3000, reeds: 1000 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1907,
  });

  const school = (id: string, clockFn: () => number, seed: number, a0: number, a1: number, fade = false) => {
    world.add(
      createGlows({
        count: 1,
        color: IVORY,
        size: 18,
        minPx: 18,
        place: (_, ctx, out) => {
          out.set(HANG_DAO[0], ground(HANG_DAO[0], HANG_DAO[1]) + 8, HANG_DAO[1]);
          const k = clockFn();
          return 0.8 * smoothstep(a0, a1, k) * (fade ? 1 - 0.8 * smoothstep(0.55, 0.95, k) : 1) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + seed));
        },
        visible: () => clock.near(id),
      }),
    );
  };

  // 1. "hang-dao": các nhóm người (son) từ nhiều ngả tụ về phố Hàng Đào; một đốm ngà (trường) sáng dần; đèn quanh phố bật dần (diễn hoạ).
  const HD = 26;
  const hd = run("hang-dao", HD);
  school("hang-dao", hd, 1, 0.3, 0.8);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1971,
      groups: [
        { path: [[-130, 90], [-60, 60], ring(HANG_DAO, 14, 2.9)], count: 20, spread: [26, 56], color: SON, timing: [[0.03, 0], [0.8, 1]] },
        { path: [[-120, -90], [-50, -20], ring(HANG_DAO, 14, 3.9)], count: 16, spread: [26, 50], color: SON, timing: [[0.08, 0], [0.85, 1]] },
        { path: [[70, 200], [40, 110], ring(HANG_DAO, 14, 1.6)], count: 14, spread: [26, 44], color: SON, timing: [[0.12, 0], [0.9, 1]] },
      ],
      progress: hd,
      visible: () => clock.near("hang-dao"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(HANG_DAO, 30 + (i % 2) * 10, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 };
      }),
      lit: () => clock.near("hang-dao") * smoothstep(0.4, 0.95, hd()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 2. "mo-hinh": bốn đốm vàng (bốn ban) sáng lần lượt quanh đốm ngà (trường); vài nhóm người (son) đi lại giữa các ban (diễn hoạ).
  const MH = 28;
  const mh = run("mo-hinh", MH);
  school("mo-hinh", mh, 2, 0, 0.1);
  world.add(
    createGlows({
      count: 4,
      color: GOLD,
      size: 10,
      minPx: 14,
      place: (i, ctx, out) => {
        const [x, z] = ring(HANG_DAO, 34, (i / 4) * Math.PI * 2 + 0.5);
        out.set(x, ground(x, z) + 6, z);
        return 0.8 * smoothstep(0.1 + i * 0.15, 0.22 + i * 0.15, mh()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8 + i));
      },
      visible: () => clock.near("mo-hinh"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1972,
      groups: [
        { path: [ring(HANG_DAO, 70, 0.9), ring(HANG_DAO, 30, 0.9)], count: 10, spread: [24, 30], color: SON, timing: [[0.05, 0], [0.8, 1]] },
        { path: [ring(HANG_DAO, 70, 3.5), ring(HANG_DAO, 30, 3.5)], count: 10, spread: [24, 30], color: SON, timing: [[0.1, 0], [0.85, 1]] },
      ],
      progress: mh,
      visible: () => clock.near("mo-hinh"),
    }),
  );

  // 3. "day-hoc": người xem kéo thanh — năm đốm ngà (các lớp ở tỉnh lân cận) sáng dần, từ Hàng Đào mỗi hướng một nhóm người (son) đi tới (diễn hoạ).
  const lop = (ctx: FrameCtx) => clamp((ctx.inputs["mo-lop"] ?? 0) / 0.9);
  world.add(
    createGlows({
      count: TINH.length + 1,
      color: IVORY,
      size: 14,
      minPx: 16,
      place: (i, ctx, out) => {
        const [x, z] = i === 0 ? HANG_DAO : TINH[i - 1];
        out.set(x, ground(x, z) + 7, z);
        return 0.8 * (i === 0 ? 1 : smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, lop(ctx))) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("day-hoc"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1973,
      groups: TINH.map((p, k) => ({
        path: [ring(HANG_DAO, 14, k), [lerp(HANG_DAO[0], p[0], 0.5), lerp(HANG_DAO[1], p[1], 0.5)] as Pt, ring(p, 12, k)],
        count: 7,
        spread: [14, 20],
        color: SON,
        timing: [[0.03 + k * 0.1, 0], [0.9, 1]] as [number, number][],
      })),
      progress: (ctx) => lop(ctx),
      visible: () => clock.near("day-hoc"),
    }),
  );

  // 4. "dong-cua": đốm ngà mờ dần; các nhóm người (son) tản ra khỏi phố Hàng Đào về nhiều hướng; đèn tắt dần (diễn hoạ).
  const DC = 26;
  const dc = run("dong-cua", DC);
  school("dong-cua", dc, 4, -0.1, 0.05, true);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1974,
      groups: [
        { path: [ring(HANG_DAO, 16, 2.9), [-70, 70], [-140, 110]], count: 16, spread: [22, 40], color: SON, timing: [[0.1, 0], [0.9, 1]] },
        { path: [ring(HANG_DAO, 16, 4.2), [-40, -50], [-110, -100]], count: 14, spread: [22, 40], color: SON, timing: [[0.15, 0], [0.9, 1]] },
        { path: [ring(HANG_DAO, 16, 1.4), [40, 120], [70, 210]], count: 12, spread: [22, 40], color: SON, timing: [[0.2, 0], [0.9, 1]] },
      ],
      progress: dc,
      visible: () => clock.near("dong-cua"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(HANG_DAO, 32, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 };
      }),
      lit: () => clock.near("dong-cua") * (1 - 0.8 * smoothstep(0.3, 0.95, dc())),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 5. "ngay-nay": một quầng vàng dịu ở Hàng Đào; từng nhóm người (son) đi tới và đứng lặng; đèn bật dần (diễn hoạ).
  const NN = 28;
  const nn = run("ngay-nay", NN);
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(HANG_DAO[0], ground(HANG_DAO[0], HANG_DAO[1]) + 8, HANG_DAO[1]);
        return 0.7 * smoothstep(0.1, 0.6, nn()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.5));
      },
      visible: () => clock.near("ngay-nay"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1975,
      groups: [
        { path: [[-120, 70], [-50, 55], ring(HANG_DAO, 22, 3.0)], count: 20, spread: [26, 56], color: SON, timing: [[0.03, 0], [0.8, 0.95]] },
        { path: [[70, 190], [40, 100], ring(HANG_DAO, 22, 1.5)], count: 14, spread: [26, 44], color: SON, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: nn,
      visible: () => clock.near("ngay-nay"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(HANG_DAO, 36, (i / 8) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 };
      }),
      lit: () => clock.near("ngay-nay") * smoothstep(0.3, 0.9, nn()),
      size: 3,
      glow: () => 0.8,
    }),
  );
};

export default setup;
