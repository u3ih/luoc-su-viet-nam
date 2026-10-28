import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BEN, BOUNDS, CAU_TAU, DUONG_BO, DUONG_TAU, SAI_GON, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Bến Nhà Rồng 1911 — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng, tàu = đốm sáng nổi trên sông; không vẽ tàu, toà nhà, trang phục, cờ. Vị trí bến, thành phố, sông và hướng ra biển là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người ở cảng; xanh nhạt = tàu; ngà = Nguyễn Tất Thành; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const SHIP = "#a8c8f0";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const onWater = () => WATER + 1.6;
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ben-cang", "len-tau", "nho-neo", "ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BEN, 50], [SAI_GON, 70]];

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
    counts: { trees: 340, bushes: 600, grass: 3000, reeds: 1200 },
    forestAt: 0.62,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1911,
  });

  // 1. "ben-cang": người (son) từ thành phố đi bộ ra bến, tụ lại thành từng nhóm; vài đốm xanh nhạt (tàu) đậu ở cầu tàu; ánh đèn trong thành phố sáng dần (diễn hoạ).
  const BC = 26;
  const bc = run("ben-cang", BC);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1301,
      groups: [
        { path: DUONG_BO, count: 36, spread: [26, 70], color: SON, timing: [[0.03, 0], [0.7, 1]] },
        { path: [[-120, 30], [-40, 50], [30, 60], ring(BEN, 14, 2.6)], count: 22, spread: [26, 60], color: SON, timing: [[0.08, 0], [0.8, 1]] },
      ],
      progress: bc,
      visible: () => clock.near("ben-cang"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 1302,
      groups: [{ path: [[CAU_TAU[0] + 4, CAU_TAU[1] + 14], CAU_TAU], count: 3, spread: [14, 30], color: SHIP }],
      progress: bc,
      visible: () => clock.near("ben-cang"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 7 }, (_, i) => {
        const [x, z] = ring(SAI_GON, 30 + (i % 3) * 14, (i / 7) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.2 };
      }),
      lit: () => clock.near("ben-cang") * smoothstep(0.4, 0.95, bc()),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 2. "len-tau": một đốm ngà (Nguyễn Tất Thành) đi từ thành phố theo đường ra bến rồi lên đốm xanh nhạt (tàu) ở cầu tàu; vài người (son) đứng ở bến; ánh đèn ở bến sáng (diễn hoạ — không vẽ chi tiết lên tàu).
  const LT = 26;
  const lt = run("len-tau", LT);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => (ground(x, z) <= WATER + 0.25 ? WATER + 3 : ground(x, z) + 5),
      groups: [
        { path: [...DUONG_BO, [CAU_TAU[0] + 14, CAU_TAU[1] + 2], CAU_TAU], count: 1, color: IVORY, size: 1.5, timing: [[0.05, 0], [0.85, 1]] },
        { path: [[CAU_TAU[0] + 3, CAU_TAU[1] + 14], CAU_TAU], count: 1, color: SHIP, size: 1.6 },
      ],
      progress: lt,
      visible: () => clock.near("len-tau"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1303,
      groups: [{ path: [ring(BEN, 12, 2.4), ring(BEN, 15, 2.5)], count: 16, spread: [34, 30], color: SON }],
      progress: lt,
      visible: () => clock.near("len-tau"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 4 }, (_, i) => {
        const [x, z] = ring(BEN, 24, (i / 4) * Math.PI * 2 + 0.6);
        return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.1 };
      }),
      lit: () => clock.near("len-tau") * smoothstep(0.2, 0.7, lt()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 3. "nho-neo": người xem kéo thanh — đốm xanh nhạt (tàu) cùng đốm ngà xuôi sông theo đường ra biển; vài người (son) ở lại bến (diễn hoạ).
  const sail = (ctx: FrameCtx) => clamp((ctx.inputs["ra-khoi"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 1304,
      groups: [
        { path: DUONG_TAU, count: 1, color: SHIP, size: 1.7 },
        { path: DUONG_TAU, count: 1, color: IVORY, size: 1.2, timing: [[0, -0.01], [1, 0.99]] },
      ],
      progress: (ctx) => 0.01 + 0.99 * sail(ctx),
      visible: () => clock.near("nho-neo"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1305,
      groups: [{ path: [ring(BEN, 12, 2.4), ring(BEN, 15, 2.5)], count: 16, spread: [34, 30], color: SON }],
      progress: () => 1,
      visible: () => clock.near("nho-neo"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 4 }, (_, i) => {
        const [x, z] = ring(BEN, 24, (i / 4) * Math.PI * 2 + 0.6);
        return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.1 };
      }),
      lit: (ctx) => clock.near("nho-neo") * (1 - 0.5 * smoothstep(0.3, 0.95, sail(ctx))),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 4. "ngay-nay": một quầng vàng dịu sáng ở bến; từng nhóm người (son) từ thành phố đi ra bến và đứng lặng quanh; ánh đèn quanh bến sáng (diễn hoạ).
  const NN = 28;
  const nn = run("ngay-nay", NN);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1306,
      groups: [
        { path: DUONG_BO, count: 24, spread: [26, 70], color: SON, timing: [[0.03, 0], [0.8, 0.95]] },
        { path: [[-110, 160], [-30, 120], [30, 70], ring(BEN, 20, 3.4)], count: 18, spread: [26, 60], color: SON, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: nn,
      visible: () => clock.near("ngay-nay"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(BEN[0], ground(BEN[0], BEN[1]) + 8, BEN[1]);
        return 0.7 * smoothstep(0.2, 0.7, nn()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("ngay-nay"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(BEN, 28, (i / 8) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 };
      }),
      lit: () => clock.near("ngay-nay") * smoothstep(0.3, 0.9, nn()),
      size: 3,
      glow: () => 0.8,
    }),
  );
};

export default setup;
