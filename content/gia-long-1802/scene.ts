import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CUA_DAM, DAM, NORTH, PHU_XUAN, QUY_NHON, ROUTE, THANG_LONG, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Gia Long lên ngôi — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng, thuyền = đốm sáng nổi trên nước; không vẽ thuyền chiến,
// thành, trang phục, cờ, vũ khí. Vị trí Quy Nhơn, Phú Xuân, Thăng Long và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không
// tương ứng số quân hay số thuyền.
// Son = quân Nguyễn Ánh; xanh thép = quân Tây Sơn; ngà = Nguyễn Ánh / Gia Long; vàng = ánh sáng tượng trưng; trắng xám = sứ nhà Thanh.

const SON = "#a83a24";
const SON_GLOW = "#ff8a5a";
const STEEL = "#3a5370";
const STEEL_GLOW = "#8fb4d8";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";
const ENVOY = "#d6dce6";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const onWater = () => WATER + 1.4;
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["thi-nai", "len-ngoi", "ra-bac", "thang-long", "quoc-hieu"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[PHU_XUAN, 60], [THANG_LONG, 60], [QUY_NHON, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2a4a52", shallow: "#82a08c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 50, z: 320 } },
    counts: { trees: 600, bushes: 600, grass: 3200, reeds: 900 },
    forestAt: 0.52,
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 240 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1802,
  });

  // 1. "thi-nai": một đội thuyền (chấm sáng son) từ ngoài khơi tiến qua cửa đầm vào giữa đầm; đội thuyền đậu sẵn (chấm sáng xanh thép) ở giữa đầm;
  //    lửa bừng lên giữa đội đậu sẵn và lan ra, các chấm xanh thép mờ dần (diễn hoạ — không vẽ thuyền, không vẽ trận cụ thể).
  const TN = 28;
  const tn = run("thi-nai", TN);
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: onWater,
      seed: 201,
      groups: [
        { path: [[CUA_DAM[0] + 90, CUA_DAM[1] + 40], CUA_DAM, [DAM[0] + 70, DAM[1] + 6], [DAM[0] + 25, DAM[1] - 6]], count: 22, spread: [46, 70], color: SON_GLOW, timing: [[0.03, 0], [0.5, 1]] },
        { path: [ring(DAM, 26, 2.2), ring(DAM, 28, 2.25)], count: 24, spread: [56, 40], color: STEEL_GLOW, show: [0, 0.6] },
      ],
      progress: tn,
      visible: () => clock.near("thi-nai"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 9 }, (_, i) => {
        const [x, z] = ring(DAM, 8 + (i % 3) * 14, (i / 9) * Math.PI * 2 + 0.3);
        return { x: x - 20, y: WATER + 1.2, z, order: i / 9, size: 1.6 };
      }),
      lit: () => clock.near("thi-nai") * smoothstep(0.45, 0.85, tn()),
      size: 4,
      glow: () => 0.9,
    }),
  );

  // 2. "len-ngoi": người (son) từ phía nam tụ về Phú Xuân; một nhóm (xanh thép) rời Phú Xuân đi lên phía bắc; một quầng ngà rồi quầng vàng nổi lên giữa
  //    thành, lửa quanh thành sáng dần (diễn hoạ — không vẽ lễ nghi, cờ, ngai).
  const LN = 28;
  const ln = run("len-ngoi", LN);
  const [px, pz] = PHU_XUAN;
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 202,
      groups: [
        { path: [[px - 60, pz - 230], [px - 30, pz - 120], [px - 8, pz - 30]], count: 60, spread: [26, 70], color: SON, timing: [[0.03, 0], [0.5, 1]] },
        { path: [[px + 120, pz - 60], [px + 60, pz - 20], [px + 14, pz - 4]], count: 26, spread: [24, 40], color: SON, timing: [[0.08, 0], [0.5, 1]] },
        { path: [[px + 6, pz + 12], [px - 10, pz + 90], [px - 24, pz + 200]], count: 30, spread: [24, 50], color: STEEL, timing: [[0.02, 0], [0.45, 1]], show: [0, 0.5] },
      ],
      progress: ln,
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: (i) => (i === 0 ? IVORY : GOLD),
      size: 18,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(px, ground(px, pz) + 8, pz);
        return smoothstep(0.5, 0.7, ln()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(PHU_XUAN, 32 + (i % 2) * 14, (i / 8) * Math.PI * 2 + 0.25);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.5 };
      }),
      lit: () => clock.near("len-ngoi") * smoothstep(0.55, 0.95, ln()),
      size: 3.8,
      glow: () => 0.85,
    }),
  );

  // 3. "ra-bac": người xem kéo thanh — đoàn người (son) đi theo đường từ Phú Xuân ra Thăng Long; Nguyễn Ánh (ngà) đi đầu; nhóm (xanh thép) đứng quanh
  //    Thăng Long mờ dần khi đoàn tới gần (diễn hoạ — không vẽ trận đánh cụ thể).
  const march = (ctx: FrameCtx) => clamp((ctx.inputs["ra-bac"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 203,
      groups: [
        { path: ROUTE, count: 130, spread: [24, 110], color: SON },
        { path: ROUTE, count: 1, color: IVORY, size: 1.5, timing: [[0, -0.03], [1, 0.97]] },
        { path: [ring(THANG_LONG, 38, 0.6), ring(THANG_LONG, 40, 0.65)], count: 40, spread: [44, 44], color: STEEL, show: [0, 0.75] },
      ],
      progress: (ctx) => 0.03 + 0.97 * march(ctx),
      visible: () => clock.near("ra-bac"),
    }),
  );

  // 4. "thang-long": đoàn người (son) vào Thăng Long từ phía nam; nhóm (xanh thép) rời thành đi về phía bắc rồi tản ra mép bản đồ; ánh sáng trong thành
  //    sáng dần (diễn hoạ).
  const TL = 28;
  const tl = run("thang-long", TL);
  const [tx, tz] = THANG_LONG;
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 204,
      groups: [
        { path: [[tx + 20, tz - 220], [tx + 10, tz - 120], [tx - 4, tz - 30], [tx, tz]], count: 90, spread: [30, 80], color: SON, timing: [[0.03, 0], [0.6, 1]] },
        { path: [ring(THANG_LONG, 20, 0.5), [tx + 40, tz + 70], [tx + 90, tz + 100]], count: 40, spread: [36, 44], color: STEEL, timing: [[0.1, 0], [0.7, 1]] },
      ],
      progress: tl,
      visible: () => clock.near("thang-long"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 9 }, (_, i) => {
        const [x, z] = ring(THANG_LONG, 28 + (i % 3) * 14, (i / 9) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 9, size: 1.5 };
      }),
      lit: () => clock.near("thang-long") * smoothstep(0.5, 0.95, tl()),
      size: 3.8,
      glow: () => 0.85,
    }),
  );

  // 5. "quoc-hieu": một đốm trắng xám (sứ) từ phía bắc xa đi vào Thăng Long; sau đó một đốm vàng (tên quốc hiệu) từ Thăng Long đi dọc đường về Phú Xuân
  //    (diễn hoạ — không vẽ lễ tuyên phong, trang phục, cờ).
  const QH = 28;
  const qh = run("quoc-hieu", QH);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [
        { path: [NORTH, [tx - 20, tz + 130], [tx + 4, tz + 24]], count: 6, spread: [14, 28], color: ENVOY, size: 1.1, timing: [[0.03, 0], [0.45, 1]] },
        { path: [[tx + 4, tz + 8], ...[...ROUTE].reverse().slice(0, 5).map(([x, z]): Pt => [x, z]), PHU_XUAN], count: 1, color: GOLD, size: 1.5, timing: [[0.55, 0], [1, 1]], show: [0.52, 2] },
      ],
      progress: qh,
      visible: () => clock.near("quoc-hieu"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(tx, ground(tx, tz) + 8, tz);
        return smoothstep(0.42, 0.58, qh()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("quoc-hieu"),
    }),
  );
};

export default setup;
