import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CHAU_HOA, DO_BAN, DUONG_BIEN, DUONG_BO, THI_NAI, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Thành Đồ Bàn 1471 — cảnh CÁCH ĐIỆU. Người, quân = chấm dáng người; hai phía = đốm sáng; không vẽ thành, thuyền chiến, cờ hiệu, trang phục. Vị trí Đồ Bàn, các cửa biển, châu Hoá và đường quân là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số quân.
// Xanh nhạt = quân Đại Việt; ngà = phía Chiêm Thành; son = dân; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const DV = "#a8c8f0";
const CHAM = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const onWater = () => WATER + 1.8;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nguyen-nhan", "xuat-quan", "vay-thanh", "hau-qua", "lang-gieng"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[DO_BAN, 70], [CHAU_HOA, 55], [THI_NAI, 45]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2f4a4a", shallow: "#7f9a7c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1471,
  });

  // 1. "nguyen-nhan": hai đốm sáng — ngà (phía Chiêm Thành) ở Đồ Bàn, xanh nhạt (Đại Việt) ở châu Hoá — sáng dần; một đoàn ngà tiến về phía châu Hoá rồi dừng; người (son) đi lại (diễn hoạ).
  const NN = 28;
  const nn = run("nguyen-nhan", NN);
  world.add(
    createGlows({
      count: 2,
      color: (i) => (i === 0 ? CHAM : DV),
      size: 18,
      minPx: 18,
      place: (i, ctx, out) => {
        const p = i === 0 ? DO_BAN : CHAU_HOA;
        out.set(p[0], ground(p[0], p[1]) + 8, p[1]);
        return 0.8 * smoothstep(0.1 * i, 0.4 + 0.1 * i, nn()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("nguyen-nhan"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1471,
      groups: [{ path: [[-10, -40], [5, 70], [10, 160], ring(CHAU_HOA, 46, 4.4)], count: 26, spread: [30, 60], color: CHAM, size: 1.1, timing: [[0.1, 0], [0.8, 1]] }],
      progress: nn,
      visible: () => clock.near("nguyen-nhan"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1472,
      groups: [{ path: [[-60, 250], [-10, 300], ring(CHAU_HOA, 14, 3.4)], count: 16, spread: [26, 44], color: SON, timing: [[0.05, 0], [0.8, 1]] }],
      progress: nn,
      visible: () => clock.near("nguyen-nhan"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(CHAU_HOA, 36, (i / 5) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 };
      }),
      lit: () => clock.near("nguyen-nhan") * smoothstep(0.4, 0.95, nn()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 2. "xuat-quan": hai đoàn xanh nhạt (quân Đại Việt) từ phía bắc xuống phía nam — một đoàn đi trước, một đoàn đi sau; ánh lửa trại dọc đường bật dần (diễn hoạ).
  const XQ = 30;
  const xq = run("xuat-quan", XQ);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1473,
      groups: [
        { path: DUONG_BO, count: 34, spread: [30, 70], color: DV, size: 1.1, timing: [[0.02, 0], [0.9, 0.55]] },
        { path: DUONG_BO, count: 40, spread: [30, 80], color: DV, size: 1.1, timing: [[0.14, 0], [0.95, 0.4]] },
      ],
      progress: xq,
      visible: () => clock.near("xuat-quan"),
    }),
  );
  world.add(
    createFires({
      sites: [[10, 220], [20, 150], [5, 90], [-2, 40]].map(([x, z], i) => ({ x: x + 14, y: height(x + 14, z) + 1, z, order: i / 4, size: 1.2 })),
      lit: () => clock.near("xuat-quan") * smoothstep(0.2, 0.9, xq()),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 3. "vay-thanh": người xem kéo thanh — đoàn xanh nhạt đi đường bộ tới Đồ Bàn, đoàn đốm đi theo đường ven biển vào cửa; các đoàn khép dần thành vòng quanh thành; đốm ngà ở Đồ Bàn (diễn hoạ).
  const tien = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1474,
      groups: [
        { path: [[-5, 40], [-20, -10], ring(DO_BAN, 30, 1.2)], count: 22, spread: [26, 44], color: DV, size: 1.1 },
        { path: [[-70, 20], [-80, -30], ring(DO_BAN, 30, 3.4)], count: 16, spread: [26, 36], color: DV, size: 1.1 },
        { path: [[30, -150], [-10, -130], ring(DO_BAN, 30, 5.0)], count: 16, spread: [26, 36], color: DV, size: 1.1 },
      ],
      progress: (ctx) => 0.03 + 0.97 * tien(ctx),
      visible: () => clock.near("vay-thanh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 1475,
      groups: [{ path: DUONG_BIEN, count: 10, spread: [30, 40], color: DV, size: 1.3 }],
      progress: (ctx) => 0.02 + 0.98 * tien(ctx),
      visible: () => clock.near("vay-thanh"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: CHAM,
      size: 18,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(DO_BAN[0], ground(DO_BAN[0], DO_BAN[1]) + 8, DO_BAN[1]);
        return 0.85 * (1 - 0.5 * smoothstep(0.85, 1, tien(ctx))) * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("vay-thanh"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(DO_BAN, 44, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 };
      }),
      lit: (ctx) => clock.near("vay-thanh") * smoothstep(0.1, 0.9, tien(ctx)),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 4. "hau-qua": ba đốm sáng (ba tiểu quốc) hiện dần ở phía nam; một đốm xanh nhạt sáng ở phần đất phía bắc; đoàn người (son) đi lại (diễn hoạ).
  const HQ = 28;
  const hq = run("hau-qua", HQ);
  const BA: Pt[] = [[-60, -230], [20, -150], [-50, -320]];
  world.add(
    createGlows({
      count: 4,
      color: (i) => (i === 3 ? DV : CHAM),
      size: 16,
      minPx: 16,
      place: (i, ctx, out) => {
        const p = i === 3 ? ([0, 30] as Pt) : BA[i];
        out.set(p[0], ground(p[0], p[1]) + 8, p[1]);
        return 0.75 * smoothstep(0.05 + i * 0.12, 0.25 + i * 0.12, hq()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.6 + i));
      },
      visible: () => clock.near("hau-qua"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1476,
      groups: [
        { path: [[-60, 120], [-30, 60], [-10, 20]], count: 16, spread: [28, 44], color: SON, timing: [[0.1, 0], [0.9, 1]] },
        { path: [[-30, -120], [-45, -190], [-55, -225]], count: 14, spread: [28, 40], color: SON, timing: [[0.15, 0], [0.9, 1]] },
      ],
      progress: hq,
      visible: () => clock.near("hau-qua"),
    }),
  );

  // 5. "lang-gieng": từng nhóm người (son) từ ba hướng đi lại quanh Đồ Bàn; ánh đèn quanh bật dần; quầng ngà dịu ở Đồ Bàn (diễn hoạ).
  const LG = 28;
  const lg = run("lang-gieng", LG);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1477,
      groups: [
        { path: [[-60, 100], [-40, 20], ring(DO_BAN, 24, 1.8)], count: 18, spread: [26, 50], color: SON, timing: [[0.05, 0], [0.85, 1]] },
        { path: [[120, -110], [60, -80], ring(DO_BAN, 24, 5.4)], count: 16, spread: [26, 44], color: SON, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: lg,
      visible: () => clock.near("lang-gieng"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: CHAM,
      size: 18,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(DO_BAN[0], ground(DO_BAN[0], DO_BAN[1]) + 8, DO_BAN[1]);
        return 0.7 * smoothstep(0.1, 0.6, lg()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("lang-gieng"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 7 }, (_, i) => {
        const [x, z] = ring(DO_BAN, 36 + (i % 2) * 10, (i / 7) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.1 };
      }),
      lit: () => clock.near("lang-gieng") * smoothstep(0.3, 0.9, lg()),
      size: 3,
      glow: () => 0.8,
    }),
  );
};

export default setup;
