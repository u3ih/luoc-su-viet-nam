import { lerp, smoothstep, clamp } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires, type FireSite } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, DAI_LA, HL, ROUTE, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Chiếu dời đô — cảnh CÁCH ĐIỆU. Người = chấm dáng người; "thuyền" = chấm đi trên mặt sông; rồng vàng và ánh chiếu = đốm sáng. Không vẽ thuyền,
// cung điện, thành luỹ, trang phục hay rồng (chưa có hiện vật/tư liệu hình ảnh đủ chắc). Vị trí, đường sông là diễn hoạ.

const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const onWater = (x: number, z: number) => Math.max(height(x, z), WATER);

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["len-ngoi", "hoa-lu-chat", "chieu", "xuoi-song", "thang-long"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - HL[0], z - HL[1]) > 60 && Math.hypot(x - DAI_LA[0], z - DAI_LA[1]) > 75,
    water: { deep: "#2d4a45", shallow: "#7d9478" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 520, bushes: 700, grass: 5000, reeds: 1800 },
    birds: { center: { x: 20, y: 0, z: 0 }, radius: 200 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1 },
    seed: 11,
  });

  // 1. "len-ngoi": người từ ba phía tụ về thung lũng Hoa Lư; khi đông đủ, quầng sáng vàng hiện lên chỗ Lý Công Uẩn đứng — tượng trưng việc lên ngôi.
  const LN = 16;
  const ln = run("len-ngoi", LN);
  const [hx, hz] = HL;
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 51,
      groups: [
        { path: [[hx, hz], [hx + 0.2, hz]], count: 1, color: IVORY, size: 1.4 },
        { path: [[hx + 110, hz + 70], [hx + 34, hz + 24], [hx + 12, hz + 8]], count: 30, spread: [16, 16], color: SON, timing: [[0.03, 0], [0.62, 1]] },
        { path: [[hx - 100, hz + 120], [hx - 30, hz + 40], [hx - 10, hz + 12]], count: 30, spread: [16, 16], color: SON, timing: [[0.07, 0], [0.66, 1]] },
        { path: [[hx + 20, hz - 70], [hx + 8, hz - 30], [hx + 3, hz - 10]], count: 24, spread: [14, 12], color: SON, timing: [[0.1, 0], [0.7, 1]] },
      ],
      progress: ln,
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 8,
      groups: [{ path: [[hx, hz], [hx + 0.2, hz]], count: 1, color: GOLD, show: [0.72, 2] }],
      progress: ln,
      visible: () => clock.near("len-ngoi"),
    }),
  );

  // 2. "hoa-lu-chat": đám đông đi lại quanh quẩn trong thung lũng hẹp; một vệt đốm sáng lần lượt hiện dọc đường sông ra phía đồng bằng phía bắc —
  //    "ánh nhìn" của nhà vua hướng ra nơi rộng hơn (diễn hoạ).
  const HC = 22;
  const hc = run("hoa-lu-chat", HC);
  const loop = (c: Pt, r: number): Pt[] => Array.from({ length: 17 }, (_, i) => [c[0] + Math.cos((i / 16) * Math.PI * 2) * r, c[1] + Math.sin((i / 16) * Math.PI * 2) * r]);
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 52,
      groups: [
        { path: loop([hx + 10, hz + 6], 26), count: 36, spread: [6, 12], color: SON, timing: [[0, 0], [1, 2]] },
        { path: loop([hx + 10, hz + 6], 14), count: 18, spread: [4, 8], color: "#6a4a30", timing: [[0, 0], [1, -1]] },
      ],
      progress: hc,
      visible: () => clock.near("hoa-lu-chat"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 4,
      groups: [{ path: [[hx + 40, hz + 20], ...ROUTE], count: 16, color: GOLD, drop: true, size: 0.7, timing: [[0.15, 0], [0.95, 1]] }],
      progress: hc,
      visible: () => clock.near("hoa-lu-chat"),
    }),
  );

  // 3. "chieu": một ánh sáng (lời chiếu) bay từ Hoa Lư theo đường sông tới Đại La rồi toả sáng; sau đó người từ các hướng kéo về đông dần trên đồng bằng
  //    rộng — ý "đất rộng, dân cư đông" (diễn hoạ).
  const CH = 24;
  const ch = run("chieu", CH);
  const flight: Pt[] = [[hx, hz], ...ROUTE, [DAI_LA[0] + 40, DAI_LA[1]], DAI_LA];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => height(x, z) + 24,
      groups: [
        { path: flight, count: 1, color: GOLD, size: 1.4, timing: [[0.03, 0], [0.5, 1]], show: [0, 1.2] },
        { path: [DAI_LA, [DAI_LA[0] + 0.2, DAI_LA[1]]], count: 1, color: GOLD, size: 1.8, show: [0.5, 2] },
      ],
      progress: ch,
      visible: () => clock.near("chieu"),
    }),
  );
  const [dx, dz] = DAI_LA;
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 53,
      groups: [
        { path: [[dx - 180, dz - 60], [dx - 80, dz - 10], [dx - 20, dz + 4]], count: 40, spread: [30, 40], color: SON, timing: [[0.45, 0], [0.9, 1]], show: [0.45, 2] },
        { path: [[dx - 120, dz + 120], [dx - 60, dz + 50], [dx - 10, dz + 12]], count: 40, spread: [30, 40], color: SON, timing: [[0.5, 0], [0.92, 1]], show: [0.5, 2] },
        { path: [[dx - 100, dz - 160], [dx - 50, dz - 60], [dx, dz - 10]], count: 40, spread: [30, 40], color: SON, timing: [[0.55, 0], [0.95, 1]], show: [0.55, 2] },
      ],
      progress: ch,
      visible: () => clock.near("chieu"),
    }),
  );

  // 4. "xuoi-song": tương tác — kéo thanh thì đoàn người (chấm "thuyền") đi từ Hoa Lư theo đường sông tới Đại La; chấm ngà dẫn đầu.
  const progressed = (ctx: { inputs: Record<string, number> }) => clamp((ctx.inputs["di-chuyen"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 10,
      height: onWater,
      seed: 54,
      groups: [
        { path: [[hx + 40, hz + 20], ...ROUTE], count: 40, spread: [4, 22], color: SON },
        { path: [[hx + 40, hz + 20], ...ROUTE], count: 1, color: IVORY, size: 1.5 },
      ],
      progress: progressed,
      visible: () => clock.near("xuoi-song"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 6,
      groups: [
        { path: [[hx, hz], [hx + 0.2, hz]], count: 1, color: GOLD, size: 1.2, show: [0, 0.03] },
        { path: [DAI_LA, [DAI_LA[0] + 0.2, DAI_LA[1]]], count: 1, color: GOLD, size: 1.4, show: [0.88, 2] },
      ],
      progress: progressed,
      visible: () => clock.near("xuoi-song"),
    }),
  );

  // 5. "thang-long": chuỗi đốm sáng (rồng vàng — chỉ là ánh sáng, không vẽ hình rồng) xoắn lên từ mặt sông ở Đại La rồi bay vút lên; sau đó
  //    lửa của thành mới lần lượt bừng lên trên đồng bằng và người đông dần (diễn hoạ).
  const TL = 30;
  const tl = run("thang-long", TL);
  const RIVER_AT: Pt = [106, 238];
  const spiral: Pt[] = Array.from({ length: 41 }, (_, i) => {
    const k = i / 40;
    const a = 0.4 + k * Math.PI * 3;
    const r = lerp(40, 4, Math.min(1, k * 1.4)) + k * 30;
    return [RIVER_AT[0] + Math.cos(a) * r, RIVER_AT[1] + Math.sin(a) * r];
  });
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      // càng về cuối càng cao: bay vút lên
      height: (x, z) => onWater(x, z) + 6 + Math.hypot(x - RIVER_AT[0], z - RIVER_AT[1]) * 0.9,
      seed: 55,
      groups: [
        { path: spiral, count: 1, color: GOLD, size: 1.6, timing: [[0.03, 0], [0.38, 1]], show: [0, 0.4] },
        { path: spiral, count: 12, spread: [1.5, 40], color: "#ffe6a8", size: 0.7, timing: [[0.03, 0], [0.38, 1]], show: [0, 0.4] },
      ],
      progress: tl,
      visible: () => clock.near("thang-long"),
    }),
  );
  const sites: FireSite[] = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const r = 26 + (i % 3) * 18;
    const x = dx + Math.cos(a) * r;
    const z = dz + Math.sin(a) * r * 0.8;
    return { x, y: height(x, z) + 0.25, z, order: i / 14, size: 1.1 };
  });
  world.add(createFires({ sites, size: 2, lit: () => clock.near("thang-long") * smoothstep(8, 24, clock.elapsed("thang-long")), glow: (ctx) => 0.3 + smoothstep(1.5, 3, ctx.params.mood) * 0.7 }));
  world.add(
    createCrowd({
      size: 5,
      height,
      seed: 56,
      groups: [
        { path: [[dx - 150, dz - 60], [dx - 50, dz - 10], [dx - 8, dz + 4]], count: 40, spread: [30, 40], color: SON, timing: [[0.4, 0], [0.95, 1]], show: [0.4, 2] },
        { path: [[dx - 90, dz + 120], [dx - 40, dz + 50], [dx - 6, dz + 12]], count: 40, spread: [30, 40], color: SON, timing: [[0.45, 0], [0.95, 1]], show: [0.45, 2] },
      ],
      progress: tl,
      visible: () => clock.near("thang-long"),
    }),
  );
};

export default setup;
