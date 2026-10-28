import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, HUONG_KHE, KHAM_SU, KINH_THANH, LUA, MANG_CA, ROI_KINH, TAN_SO, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Kinh thành Huế và Cần Vương 1885 — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng; không vẽ thành, đồn, pháo, tàu, trang phục, cờ, vũ khí. Vị trí kinh thành,
// Toà Khâm sứ, đồn Mang Cá, Tân Sở, Hương Khê và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số quân.
// Son = quân triều đình và những người hưởng ứng; xanh navy = quân Pháp; ngà = vua Hàm Nghi; vàng / cam = ánh sáng tượng trưng.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh", "dem-hue", "roi-kinh", "chieu-can-vuong", "nguyen-hau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH_THANH, 75], [MANG_CA, 35], [KHAM_SU, 45], [TAN_SO, 50]];

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
    counts: { trees: 650, bushes: 600, grass: 3200, reeds: 900 },
    forestAt: 0.52,
    birds: { center: { x: 0, y: 0, z: 80 }, radius: 230 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1885,
  });

  // 1. "boi-canh": hai nhóm người (son) tụ về kinh thành, một nhóm chia hai phía; một nhóm (navy) từ phía biển đi vào bờ nam sông, tụ lại gần Toà Khâm sứ (diễn hoạ).
  const BC = 28;
  const bc = run("boi-canh", BC);
  const [kx, kz] = KINH_THANH;
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 501,
      groups: [
        { path: [[kx - 180, kz + 70], [kx - 90, kz + 30], [kx - 20, kz + 6]], count: 34, spread: [26, 50], color: SON, timing: [[0.03, 0], [0.5, 1]] },
        { path: [[kx + 30, kz + 180], [kx + 12, kz + 100], [kx + 2, kz + 24]], count: 30, spread: [26, 50], color: SON, timing: [[0.06, 0], [0.55, 1]] },
        { path: [[KHAM_SU[0] + 240, KHAM_SU[1] + 40], [KHAM_SU[0] + 120, KHAM_SU[1] + 10], [KHAM_SU[0] + 20, KHAM_SU[1] + 4]], count: 40, spread: [30, 50], color: NAVY, timing: [[0.2, 0], [0.8, 1]] },
      ],
      progress: bc,
      visible: () => clock.near("boi-canh"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(KINH_THANH, 30 + (i % 2) * 12, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("boi-canh") * smoothstep(0.4, 0.9, bc()),
      size: 3.4,
      glow: () => 0.8,
    }),
  );

  // 2. "dem-hue": ban đêm, nhóm người (navy) đứng quanh lửa ở bờ nam và ở Mang Cá; hai cánh (son) từ kinh thành tiến ra — một cánh qua sông tới bờ nam, một cánh tới Mang Cá;
  //    sau đó lửa sáng ở hai nơi và nhóm navy tiến vào trong kinh thành (diễn hoạ — không vẽ trận đánh cụ thể, không vẽ thương vong).
  const DH = 30;
  const dh = run("dem-hue", DH);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 502,
      groups: [
        { path: [ring(KHAM_SU, 14, 0.4), ring(KHAM_SU, 16, 0.45)], count: 30, spread: [34, 34], color: NAVY },
        { path: [ring(MANG_CA, 10, 0.2), ring(MANG_CA, 12, 0.25)], count: 24, spread: [28, 28], color: NAVY },
        { path: [[kx, kz - 20], [kx - 4, kz - 90], [KHAM_SU[0] + 4, KHAM_SU[1] + 22]], count: 50, spread: [30, 40], color: SON, timing: [[0.1, 0], [0.55, 1]] },
        { path: [[kx + 10, kz + 30], [(kx + MANG_CA[0]) / 2, (kz + MANG_CA[1]) / 2], [MANG_CA[0] - 6, MANG_CA[1] - 8]], count: 40, spread: [24, 30], color: SON, timing: [[0.1, 0], [0.5, 1]] },
        { path: [ring(MANG_CA, 10, 0.2), [kx + 20, kz + 20], [kx, kz]], count: 18, spread: [30, 34], color: NAVY, timing: [[0.7, 0], [1, 1]], show: [0.66, 2] },
      ],
      progress: dh,
      visible: () => clock.near("dem-hue"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(KHAM_SU, 24, (i / 4) * Math.PI * 2 + 0.4);
          return { x, y: height(x, z) + 1, z, order: 0, size: 1.4 };
        }),
        ...Array.from({ length: 3 }, (_, i) => {
          const [x, z] = ring(MANG_CA, 20, (i / 3) * Math.PI * 2 + 0.2);
          return { x, y: height(x, z) + 1, z, order: 0.4 + i * 0.1, size: 1.4 };
        }),
      ],
      lit: () => clock.near("dem-hue") * smoothstep(0.2, 0.6, dh()),
      size: 3.6,
      glow: () => 0.95,
    }),
  );

  // 3. "roi-kinh": một đốm ngà (vua Hàm Nghi) cùng một đoàn người (son) rời kinh thành đi lên núi phía tây bắc, tới Tân Sở; ánh lửa ở kinh thành tắt dần, lửa trại sáng lên ở Tân Sở;
  //    một nhóm nhỏ (son) ở lại (diễn hoạ).
  const RK = 30;
  const rk = run("roi-kinh", RK);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 503,
      groups: [
        { path: ROI_KINH, count: 80, spread: [24, 90], color: SON, timing: [[0.03, 0], [0.9, 1]] },
        { path: ROI_KINH, count: 1, color: IVORY, size: 1.5, timing: [[0.03, -0.03], [0.9, 0.97]] },
        { path: [ring(KINH_THANH, 14, 0.2), ring(KINH_THANH, 16, 0.25)], count: 14, spread: [30, 30], color: SON },
      ],
      progress: rk,
      visible: () => clock.near("roi-kinh"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 5 }, (_, i) => {
          const [x, z] = ring(KINH_THANH, 32, (i / 5) * Math.PI * 2 + 0.2);
          return { x, y: height(x, z) + 1, z, order: 0, size: 1.5 };
        }),
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(TAN_SO, 22, (i / 4) * Math.PI * 2 + 0.5);
          return { x, y: height(x, z) + 1, z, order: 0.8 + i * 0.04, size: 1.4 };
        }),
      ],
      lit: () => clock.near("roi-kinh") * (0.25 + 0.75 * smoothstep(0.65, 0.95, rk())),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 4. "chieu-can-vuong": người xem kéo thanh — một quầng vàng sáng lên ở Tân Sở rồi ánh lửa lan từng điểm ra khắp bản đồ (các nơi quanh vùng núi, đồng bằng); nhiều nhóm người nhỏ
  //    (son) xuất hiện quanh mỗi điểm lửa (diễn hoạ — không vẽ từng cuộc khởi nghĩa).
  const spread = (ctx: FrameCtx) => clamp((ctx.inputs["lan-toa"] ?? 0) / 0.9);
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(TAN_SO, 22, (i / 4) * Math.PI * 2 + 0.5);
          return { x, y: height(x, z) + 1, z, order: 0, size: 1.5 };
        }),
        ...LUA.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: 0.08 + (i / LUA.length) * 0.86, size: 1.6 })),
      ],
      lit: (ctx) => clock.near("chieu-can-vuong") * smoothstep(0, 0.95, spread(ctx)),
      size: 4,
      glow: () => 0.9,
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 504,
      groups: LUA.map((l, i) => ({ path: [ring(l, 34, i), ring(l, 10, i + 1)] as Pt[], count: 8, spread: [26, 26] as [number, number], color: SON, show: [0.08 + (i / LUA.length) * 0.8, 2] as [number, number] })),
      progress: spread,
      visible: () => clock.near("chieu-can-vuong"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 22,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(TAN_SO[0], ground(TAN_SO[0], TAN_SO[1]) + 9, TAN_SO[1]);
        return smoothstep(0, 0.2, clock.elapsed("chieu-can-vuong") / 6) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("chieu-can-vuong"),
    }),
  );

  // 5. "nguyen-hau": những điểm lửa nhỏ ở vùng núi phía bắc và tây sáng rồi tắt dần theo thời gian; một đốm ngà ở rìa vùng núi mờ đi; ở kinh thành một đốm son khác sáng lên (diễn hoạ —
  //    không vẽ từng sự kiện, không vẽ cảnh bắt giữ).
  const NH = 32;
  const nh = run("nguyen-hau", NH);
  world.add(
    createFires({
      sites: [...LUA, TAN_SO, HUONG_KHE].map(([x, z], i, a) => ({ x, y: height(x, z) + 1, z, order: i / a.length, size: 1.5 })),
      lit: () => clock.near("nguyen-hau") * (1 - 0.8 * smoothstep(0.2, 0.95, nh())),
      size: 3.6,
      glow: () => 0.85,
    }),
  );
  world.add(
    createGlows({
      count: 2,
      color: (i) => (i === 0 ? IVORY : GOLD),
      size: (i) => (i === 0 ? 15 : 18),
      minPx: 18,
      place: (i, ctx, out) => {
        const pulse = 0.85 + 0.15 * Math.sin(ctx.time * 1.8 + i);
        if (i === 0) {
          out.set(TAN_SO[0], ground(TAN_SO[0], TAN_SO[1]) + 7, TAN_SO[1]);
          return (1 - smoothstep(0.3, 0.7, nh())) * pulse;
        }
        out.set(KINH_THANH[0], ground(KINH_THANH[0], KINH_THANH[1]) + 8, KINH_THANH[1]);
        return smoothstep(0.55, 0.85, nh()) * pulse;
      },
      visible: () => clock.near("nguyen-hau"),
    }),
  );
};

export default setup;
