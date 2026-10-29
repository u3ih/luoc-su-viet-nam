import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, HA_NOI, HUNG_HOA, KIEN_AN, LAM_THAO, PHA_LAI, SON_TAY, VINH_BAO, WATER, YEN_BAI, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Yên Bái 1930 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các nơi, các phía = đốm sáng; không vẽ trại lính, vũ khí, cờ hiệu, trang phục; không có cảnh bạo lực. Vị trí các nơi là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người khởi sự; xanh nhạt = phía chính quyền thuộc địa; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const PHAP = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const MUC_TIEU: Pt[] = [YEN_BAI, SON_TAY, [190, -40], HA_NOI];
const TRUNG_DU: Pt[] = [HUNG_HOA, LAM_THAO, SON_TAY];
const MIEN_XUOI: Pt[] = [PHA_LAI, VINH_BAO, KIEN_AN, [265, -60]];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh", "dem-yen-bai", "nhieu-noi", "phien-toa"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[YEN_BAI, 55], [HA_NOI, 70], [SON_TAY, 40]];

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
    counts: { trees: 380, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1930,
  });

  // 1. "boi-canh": bốn đốm vàng (các mục tiêu) sáng dần; các nhóm người (son) từ nhiều hướng tụ về một điểm ở trung du (hội nghị) (diễn hoạ).
  const BC = 28;
  const bc = run("boi-canh", BC);
  const HOI: Pt = [-70, 120];
  world.add(
    createGlows({
      count: MUC_TIEU.length,
      color: GOLD,
      size: 14,
      minPx: 16,
      place: (i, ctx, out) => {
        const [x, z] = MUC_TIEU[i];
        out.set(x, ground(x, z) + 7, z);
        return 0.8 * smoothstep(0.3 + i * 0.12, 0.45 + i * 0.12, bc()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("boi-canh"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1931,
      groups: [
        { path: [[-230, 220], [-150, 170], ring(HOI, 14, 3.0)], count: 10, spread: [24, 30], color: SON, timing: [[0.03, 0], [0.7, 1]] },
        { path: [[40, 20], [-10, 60], ring(HOI, 14, 5.4)], count: 10, spread: [24, 30], color: SON, timing: [[0.08, 0], [0.75, 1]] },
        { path: [[220, -40], [100, 40], ring(HOI, 14, 0.3)], count: 10, spread: [24, 30], color: SON, timing: [[0.12, 0], [0.8, 1]] },
      ],
      progress: bc,
      visible: () => clock.near("boi-canh"),
    }),
  );

  // 2. "dem-yen-bai": người xem kéo thanh — các nhóm (son) từ quanh tụ về Yên Bái; một đoàn xanh nhạt (phía chính quyền) từ phía ngoài tiến lại sau cùng; ánh lửa bật dần rồi tắt về sáng (diễn hoạ).
  const tc = (ctx: FrameCtx) => clamp((ctx.inputs["tien-cong"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1932,
      groups: [
        { path: [ring(YEN_BAI, 90, 0.5), ring(YEN_BAI, 28, 0.5)], count: 14, spread: [24, 30], color: SON, timing: [[0, 0], [0.45, 1]] },
        { path: [ring(YEN_BAI, 90, 2.6), ring(YEN_BAI, 28, 2.6)], count: 14, spread: [24, 30], color: SON, timing: [[0, 0], [0.45, 1]] },
        { path: [ring(YEN_BAI, 90, 4.4), ring(YEN_BAI, 28, 4.4)], count: 12, spread: [24, 30], color: SON, timing: [[0, 0], [0.45, 1]] },
      ],
      progress: (ctx) => 0.02 + 0.98 * tc(ctx),
      visible: () => clock.near("dem-yen-bai"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1933,
      groups: [{ path: [[YEN_BAI[0] + 170, YEN_BAI[1] - 90], [YEN_BAI[0] + 90, YEN_BAI[1] - 40], ring(YEN_BAI, 22, 5.6)], count: 18, spread: [26, 40], color: PHAP, size: 1.1, timing: [[0.45, 0], [1, 1]] }],
      progress: (ctx) => 0.02 + 0.98 * tc(ctx),
      visible: () => clock.near("dem-yen-bai"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(YEN_BAI, 34, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.2 };
      }),
      lit: (ctx) => clock.near("dem-yen-bai") * smoothstep(0.1, 0.5, tc(ctx)) * (1 - 0.6 * smoothstep(0.7, 1, tc(ctx))),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 3. "nhieu-noi": ba đốm vàng ở trung du sáng rồi mờ; bốn đốm ở miền xuôi sáng rồi mờ muộn hơn; một đốm nhỏ nhấp nháy ở Hà Nội (diễn hoạ).
  const NN = 30;
  const nn = run("nhieu-noi", NN);
  const sites = [...TRUNG_DU, ...MIEN_XUOI, HA_NOI];
  world.add(
    createGlows({
      count: sites.length,
      color: GOLD,
      size: 12,
      minPx: 14,
      place: (i, ctx, out) => {
        const [x, z] = sites[i];
        out.set(x, ground(x, z) + 6, z);
        const a = i < 3 ? 0.04 : i < 7 ? 0.35 : 0.55;
        const on = smoothstep(a, a + 0.08, nn()) * (1 - 0.8 * smoothstep(a + 0.18, a + 0.3, nn()));
        const flick = i === 7 ? 0.6 + 0.4 * Math.sin(ctx.time * 7) : 1;
        return 0.85 * on * flick;
      },
      visible: () => clock.near("nhieu-noi"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1934,
      groups: [
        { path: [[-200, 190], HUNG_HOA, LAM_THAO], count: 14, spread: [24, 40], color: SON, timing: [[0.02, 0], [0.4, 1]] },
        { path: [[160, 20], [230, 40], PHA_LAI], count: 10, spread: [24, 30], color: SON, timing: [[0.3, 0], [0.7, 1]] },
      ],
      progress: nn,
      visible: () => clock.near("nhieu-noi"),
    }),
  );

  // 4. "phien-toa": Yên Bái lặng dần — một quầng vàng dịu và vài ánh lửa; vài nhóm người (son) tụ lại đứng lặng; không mô tả cảnh xử án (diễn hoạ).
  const PT = 28;
  const pt = run("phien-toa", PT);
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(YEN_BAI[0], ground(YEN_BAI[0], YEN_BAI[1]) + 9, YEN_BAI[1]);
        return 0.7 * smoothstep(0.05, 0.4, pt()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.3));
      },
      visible: () => clock.near("phien-toa"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1935,
      groups: [
        { path: [ring(YEN_BAI, 100, 5.0), ring(YEN_BAI, 36, 5.0)], count: 14, spread: [26, 40], color: SON, timing: [[0.05, 0], [0.8, 1]] },
        { path: [ring(YEN_BAI, 100, 1.8), ring(YEN_BAI, 36, 1.8)], count: 12, spread: [26, 40], color: SON, timing: [[0.1, 0], [0.85, 1]] },
      ],
      progress: pt,
      visible: () => clock.near("phien-toa"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(YEN_BAI, 46, (i / 5) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.0 };
      }),
      lit: () => clock.near("phien-toa") * smoothstep(0.2, 0.8, pt()),
      size: 2.8,
      glow: () => 0.8,
    }),
  );
};

export default setup;
