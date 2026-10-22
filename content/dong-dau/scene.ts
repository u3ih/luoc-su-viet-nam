import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createFires, type FireSite } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { createGrass } from "@/core/world/grass";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { fbm2 } from "@/core/world/terrain";
import config from "./scene.config";
import { FURNACE, GRAVES, HOUSES, JADE, LAKE, LAKE_R, MOLDS, POTTERY, SITE } from "./places";
import { BOUNDS, MAIN, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Văn hoá Đồng Đậu — cảnh CÁCH ĐIỆU. Mọi hình người, gia súc, lửa, đồ đồng chỉ là chấm sáng minh hoạ cho điều lời kể nói; không
// vẽ nhà ở, trang phục, lò, khuôn, đồ gốm hay hoa văn (chưa có hiện vật/tư liệu hình ảnh để dựa vào).

const INK = "#2b2118";
const GLOW = "#ffd27a";

const at = (c: Pt, dx: number, dz: number): Pt => [c[0] + dx, c[1] + dz];
const shift = (pts: Pt[], dx: number, dz: number): Pt[] => pts.map(([x, z]) => [x + dx, z + dz]);
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
const circle = (c: Pt, r: number, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r]);
/** Hình vuông cạnh `s` quanh tâm `c` (đường khép kín). */
const square = (c: Pt, s: number): Pt[] => [at(c, -s / 2, -s / 2), at(c, s / 2, -s / 2), at(c, s / 2, s / 2), at(c, -s / 2, s / 2), at(c, -s / 2, -s / 2)];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const clock = createBeatClock(world, ["phat-hien", "dia-ban", "nen-nha", "duc-dong", "gom-da", "kinh-te", "tuc-le", "noi-tiep"]);

  // ---- phong cảnh chung ----
  const { nearCam } = await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - SITE[0], z - SITE[1]) > 80 && Math.hypot(x - GRAVES[0], z - GRAVES[1]) > 32,
    water: { deep: "#2f4b44", shallow: "#80957a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    birds: { center: { x: 20, y: 0, z: 20 }, radius: 170 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 540, height: 1 },
    seed: 3,
  });

  // ---- tương tác: kéo để rót đồng vào khuôn (phân cảnh "duc-dong") ----
  const BEAT_DUC = world.beat("duc-dong");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT_DUC));
    target.duc += ((ctx.inputs.duc ?? 0) - target.duc) * w;
  });
  const sinceDuc = (ctx: FrameCtx) => (ctx.completedAt.duc ? (ctx.now - ctx.completedAt.duc) / 1000 : -1);
  const y = (dy: number) => (x: number, z: number) => height(x, z) + dy;
  const site = (c: Pt, order: number, size: number, dy = 0.25): FireSite => ({ x: c[0], y: height(c[0], c[1]) + dy, z: c[1], order, size });

  // 1. "phat-hien": một đốm sáng bừng lên trên gò, rồi sáu hố khai quật hiện lần lượt — mỗi hố một lần khai quật (diễn hoạ; vị
  //    trí các hố không phải vị trí thật).
  const digs: Pt[] = [[-30, -22], [24, -26], [30, 14], [-8, 26], [-36, 8], [4, -4]];
  const dugGroups: CrowdGroup[] = digs.map(([dx, dz], k) => ({
    path: square(at(SITE, dx, dz), 9),
    count: 8,
    color: "#ffcf8a",
    drop: true,
    size: 0.7,
    timing: [[0.1 + 0.13 * k, 0], [0.1 + 0.13 * k + 0.13, 1]] as [number, number][],
  }));
  world.add(
    createCrowd({
      glow: true,
      size: 6,
      height: y(7),
      seed: 3,
      groups: [{ path: [SITE, at(SITE, 0.2, 0)], count: 1, color: GLOW, size: 1.7, show: [0.04, 1.2] }, ...dugGroups],
      progress: () => clamp(clock.elapsed("phat-hien") / 14),
      visible: () => clock.near("phat-hien"),
    }),
  );

  // 2. "dia-ban": 42 đốm sáng — số di tích đã biết — hiện dọc sông, quanh đầm và vào phía đồi; ba màu theo loại di tích: 28 cư trú,
  //    6 cư trú kèm mộ táng, 6 cư trú kèm xưởng đá, 2 loại khác (số lượng đúng nguồn; vị trí chỉ là minh hoạ).
  const bank = shift(MAIN.pts.slice(1, 7), 0, 62);
  const around = circle(LAKE, LAKE_R + 22, 22);
  const hills: Pt[] = [[-200, 70], [-160, 130], [-100, 190], [-30, 200], [50, 170]];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: y(5),
      seed: 9,
      groups: [
        { path: bank, count: 14, spread: [26, 14], color: GLOW, drop: true, size: 1.3 },
        { path: around, count: 14, spread: [18, 12], color: GLOW, drop: true, size: 1.3, timing: [[0.1, 0], [1, 1]] },
        { path: hills, count: 6, spread: [16, 14], color: "#f2a3a3", drop: true, size: 1.4, timing: [[0.2, 0], [1, 1]] },
        { path: shift(bank, 0, 26), count: 6, spread: [14, 10], color: "#9fd3ea", drop: true, size: 1.4, timing: [[0.3, 0], [1, 1]] },
        { path: [[-120, -20], [-60, -40], [10, -30]], count: 2, spread: [10, 10], color: "#e8e4d4", drop: true, size: 1.4, timing: [[0.4, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("dia-ban") / 18),
      visible: () => clock.near("dia-ban"),
    }),
  );

  // 3. "nen-nha": bảy nền nhà hiện lên như hình vuông cạnh ~3,8 m (12 đến 15 mét vuông, đúng nguồn), trong vài nền có bếp lửa hố nông
  //    bốc khói; người đi lại giữa các nền (diễn hoạ; không vẽ nhà).
  const hearths: FireSite[] = HOUSES.slice(0, 5).map((h, i) => site(at(h, 0.6, 0.4), 0.1 + i * 0.18, 1.1));
  const village = (ctx: FrameCtx) =>
    Math.max(clock.near("nen-nha") * clamp(clock.elapsed("nen-nha") / 16), 0.4 * smoothstep(2.5, 3.2, ctx.t) * (1 - smoothstep(8.2, 8.9, ctx.t)));
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: y(0.6),
      seed: 13,
      groups: HOUSES.map((h, k) => ({
        path: square(h, 3.8),
        count: 8,
        color: "#ffe3b0",
        drop: true,
        size: 0.7,
        timing: [[0.08 * k, 0], [0.08 * k + 0.4, 1]] as [number, number][],
      })),
      progress: () => clamp(clock.elapsed("nen-nha") / 12),
      visible: () => clock.near("nen-nha"),
    }),
  );
  world.add(createFires({ sites: hearths, perSite: 6, size: 5, lit: village, glow: (ctx) => 0.25 + 0.75 * smoothstep(1.6, 2.7, ctx.params.mood) }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 20, height: 18, wind: [0.8, 0.5] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = village(ctx) > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 14,
      groups: [
        { path: roundTrip([at(HOUSES[1], 6, -4), at(HOUSES[3], 0, 6), at(HOUSES[2], -6, 2)]), count: 4, spread: [8, 8], color: INK, timing: [[0, 0], [0.5, 0.5], [1, 1]] },
        { path: roundTrip([at(HOUSES[5], 0, -6), at(HOUSES[6], -4, 6), at(HOUSES[4], -6, -2)]), count: 4, spread: [8, 8], color: "#3a2b20" },
      ],
      progress: () => clamp(clock.elapsed("nen-nha") / 26),
      visible: () => clock.near("nen-nha"),
    }),
  );

  // 4. "duc-dong": lò bừng lửa khi kéo; ba đốm đồng nóng chảy chạy từ lò sang ba khuôn rồi các khuôn nóng đỏ; kéo xong thì hai mươi
  //    đốm — hai mươi loại hình đồ đồng — hiện thành lưới (diễn hoạ; không vẽ lò, khuôn hay hình đồ đồng).
  const duc = (ctx: FrameCtx) => ctx.params.duc * clock.near("duc-dong");
  world.add(createFires({ sites: [site(FURNACE, 0.05, 1.5, 0.3)], perSite: 9, size: 5, lit: (ctx) => Math.max(duc(ctx), clock.near("duc-dong") * clamp(clock.elapsed("duc-dong") / 5) * 0.55), glow: (ctx) => 0.35 + 0.65 * smoothstep(1.4, 2.7, ctx.params.mood) }));
  world.add(
    createGlows({
      count: MOLDS.length * 2,
      color: (i) => (i < MOLDS.length ? "#ffae4a" : "#b9622d"),
      size: (i) => (i < MOLDS.length ? 0.9 : 1.2),
      minPx: 12,
      visible: () => clock.near("duc-dong"),
      place: (i, ctx, out) => {
        const k = i % MOLDS.length;
        const m = MOLDS[k];
        if (i < MOLDS.length) {
          // đồng nóng chảy: đi từ lò sang khuôn k theo mức rót
          const f = smoothstep(0.1 + k * 0.22, 0.4 + k * 0.22, ctx.params.duc);
          const px = lerp(FURNACE[0], m[0], f);
          const pz = lerp(FURNACE[1], m[1], f);
          out.set(px, height(px, pz) + 1.1 + Math.sin(f * Math.PI) * 0.8, pz);
          return ctx.params.duc > 0.03 ? 0.95 * (1 - smoothstep(0.55 + k * 0.1, 0.8 + k * 0.1, ctx.params.duc)) : 0;
        }
        // khuôn: nóng dần khi đồng đã vào
        out.set(m[0], height(m[0], m[1]) + 0.5, m[1]);
        return 0.25 + 0.7 * smoothstep(0.35 + k * 0.22, 0.7 + k * 0.22, ctx.params.duc);
      },
    }),
  );
  const toolsAt = at(FURNACE, 14, 4);
  world.add(
    createGlows({
      count: 20,
      color: (i) => (i % 2 ? "#e0a060" : "#f0b977"),
      size: 0.55,
      minPx: 10,
      visible: () => clock.near("duc-dong"),
      place: (i, ctx, out) => {
        const gx = toolsAt[0] + (i % 5) * 2.2;
        const gz = toolsAt[1] + Math.floor(i / 5) * 2.2;
        out.set(gx, height(gx, gz) + 0.5, gz);
        const s = sinceDuc(ctx);
        return s < 0 ? 0 : smoothstep(0, 0.7, s - i * 0.18);
      },
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 17,
      groups: [{ path: [at(FURNACE, -24, 10), at(FURNACE, -12, 4), at(FURNACE, -8, 2)], count: 4, spread: [8, 6], color: INK }],
      progress: () => clamp(clock.elapsed("duc-dong") / 8),
      visible: () => clock.near("duc-dong"),
    }),
  );

  // 5. "gom-da": lò gốm nhỏ có lửa và khói; vài người làm gốm; ở chỗ chế tác đá ngọc, các đốm xanh nhạt — trang sức — hiện dần
  //    (diễn hoạ; không vẽ hình dáng khuyên tai, vòng hay hoa văn gốm).
  const kilns: FireSite[] = [site(POTTERY, 0.1, 1.2), site(at(POTTERY, 6, 3), 0.5, 0.9)];
  const kiln = () => clock.near("gom-da") * clamp(clock.elapsed("gom-da") / 8);
  world.add(createFires({ sites: kilns, perSite: 8, size: 5, lit: kiln, glow: (ctx) => 0.35 + 0.65 * smoothstep(0.6, 1.8, ctx.params.mood) }));
  const kilnSmoke = createSmoke({ sources: kilns.map((k) => ({ x: k.x, y: k.y, z: k.z })), perSource: 22, height: 16, wind: [0.7, 0.4] });
  world.add({
    object: kilnSmoke.object,
    update(ctx) {
      const on = kiln() > 0.15;
      kilnSmoke.object!.visible = on;
      if (on) kilnSmoke.update?.(ctx);
    },
  });
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: y(1),
      seed: 19,
      groups: [{ path: circle(JADE, 7, 12), count: 12, color: "#a9dcb4", drop: true, size: 0.55 }],
      progress: () => clamp(clock.elapsed("gom-da") / 12),
      visible: () => clock.near("gom-da"),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 21,
      groups: [
        { path: [at(POTTERY, -22, 16), at(POTTERY, -10, 8), at(POTTERY, -6, 4)], count: 4, spread: [8, 6], color: INK },
        { path: [at(JADE, 14, 14), at(JADE, 8, 8), at(JADE, 5, 5)], count: 3, spread: [6, 6], color: "#3a2b20" },
      ],
      progress: () => clamp(clock.elapsed("gom-da") / 8),
      visible: () => clock.near("gom-da"),
    }),
  );

  // 6. "kinh-te": ruộng lúa xanh ven đầm, người ra đồng, gia súc — đàn nhỏ chậm rãi đi lại gần làng; vài người đứng ven đầm đánh cá
  //    (diễn hoạ; không tả giống lúa hay loài vật cụ thể).
  const fieldA = { x0: 14, x1: LAKE[0] - LAKE_R * 1.15 - 2, z0: 0, z1: 108 };
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1400 * q.density),
      area: fieldA,
      accept: (x, z) => {
        const h = height(x, z);
        return h > 1 && h < 9 && Math.hypot(x - SITE[0], z - SITE[1]) > 78 && !nearCam(x, z, 10) && fbm2(x * 0.04, z * 0.04, 2) > 0.22 ? h - 0.05 : null;
      },
      height: [0.55, 0.9],
      blades: 7,
      base: "#6f9a35",
      tip: "#cbd86c",
      sway: 0.25,
      seed: 93,
      maxDistance: 280,
    }),
  );
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 23,
      groups: [
        { path: roundTrip([[-6, 62], [18, 62], [38, 66]]), count: 6, spread: [10, 10], color: INK, timing: [[0, 0], [0.5, 0.5], [1, 1]] },
        { path: roundTrip([[-24, 76], [-4, 88], [14, 92]]), count: 8, spread: [14, 8], color: "#6a4a30", size: 0.6 },
        { path: roundTrip([[-30, 20], [-14, 14], [4, 10]]), count: 4, spread: [8, 6], color: "#8a7a64", size: 0.45 },
        { path: [[LAKE[0] - 78, LAKE[1] - 30], [LAKE[0] - 76, LAKE[1] - 24]], count: 3, spread: [10, 3], color: INK },
      ],
      progress: () => clamp(clock.elapsed("kinh-te") / 28),
      visible: () => clock.near("kinh-te"),
    }),
  );

  // 7. "tuc-le": chiều xuống, đoàn người mang lửa đi chậm tới khu mộ trên gò nhỏ; ở đó một đống lửa le lói
  //    (diễn hoạ; lời kể chỉ nói tới tập quán mai táng, không tả nghi lễ).
  const wake = () => clock.near("tuc-le") * clamp(clock.elapsed("tuc-le") / 10);
  world.add(createFires({ sites: [site(GRAVES, 0.2, 0.9, 0.3)], perSite: 7, size: 5, lit: wake, glow: () => 1 }));
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: y(2),
      seed: 27,
      groups: [{ path: [[-60, 70], [-92, 92], [-112, 104], at(GRAVES, 6, -6)], count: 7, spread: [8, 12], color: "#ffd9a0", arrive: "#b88a58", size: 0.7 }],
      progress: () => clamp(clock.elapsed("tuc-le") / 20),
      visible: () => clock.near("tuc-le"),
    }),
  );

  // 8. "noi-tiep": một dòng đốm sáng — ấm như hổ phách rồi ngả màu đồng — chảy dọc sông về hai phía, nối các văn hoá về sau
  //    (diễn hoạ ý "chuỗi văn hoá liên tục"; không phải một cuộc di cư).
  const east = shift(MAIN.pts.slice(2), 0, 70);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: y(4),
      seed: 29,
      groups: [
        { path: east, count: 20, spread: [14, 10], color: GLOW, arrive: "#c98a4a", drop: true, size: 0.8 },
        { path: rev(shift(MAIN.pts.slice(0, 3), 0, 70)), count: 12, spread: [14, 10], color: GLOW, arrive: "#c98a4a", drop: true, size: 0.7, timing: [[0.1, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("noi-tiep") / 16),
      visible: () => clock.near("noi-tiep"),
    }),
  );
};

export default setup;
