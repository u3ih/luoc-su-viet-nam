import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires, type FireSite } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { createGrass } from "@/core/world/grass";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { fbm2 } from "@/core/world/terrain";
import config from "./scene.config";
import { FURNACE, KILN, MAN_BAC, MOUND, WORKSHOP } from "./places";
import { BOUNDS, MAIN, NORTH, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Văn hoá Phùng Nguyên — cảnh CÁCH ĐIỆU. Mọi hình người, lửa, vòng đá chỉ là chấm sáng minh hoạ cho điều lời kể nói; không vẽ
// nhà ở, trang phục, đồ gốm, hoa văn hay hố nung (chưa có hiện vật/tư liệu hình ảnh để dựa vào).

const INK = "#2b2118";
const GLOW = "#ffd27a";

const at = (c: Pt, dx: number, dz: number): Pt => [c[0] + dx, c[1] + dz];
const shift = (pts: Pt[], dx: number, dz: number): Pt[] => pts.map(([x, z]) => [x + dx, z + dz]);
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const len = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const circle = (c: Pt, r: number, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r]);

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const clock = createBeatClock(world, ["phat-hien", "thoi-gian", "ven-song", "gom", "da-ngoc", "dong", "mo-tang", "noi-tiep"]);

  // ---- phong cảnh chung (đất, sông, cây, cỏ, chim, sương, núi xa) ----
  const { nearCam } = await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - MOUND[0], z - MOUND[1]) > 48 && Math.hypot(x - MAN_BAC[0], z - MAN_BAC[1]) > 72,
    dust: { center: { x: -60, y: 0, z: 0 }, extent: { x: 300, y: 40, z: 300 } },
    birds: { center: { x: -60, y: 0, z: 40 }, radius: 170 },
    mist: { center: { x: -60, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 540, height: 1 },
  });

  // ---- tương tác: kéo cho lửa nung bén (phân cảnh "gom") ----
  const BEAT_NUNG = world.beat("gom");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT_NUNG));
    target.nung += ((ctx.inputs.nung ?? 0) - target.nung) * w;
  });
  const sinceNung = (ctx: FrameCtx) => (ctx.completedAt.nung ? (ctx.now - ctx.completedAt.nung) / 1000 : -1);

  const y = (dy: number) => (x: number, z: number) => height(x, z) + dy;

  // 1. "phat-hien": một đốm sáng bừng lên ở doi đất, rồi các đốm nhỏ lần lượt hiện thành dãy ô vuông — như những hố khai quật
  //    (diễn hoạ; số ô và vị trí không phản ánh thực tế).
  const dig = at(MOUND, -8, -12);
  const trench: Pt[] = [dig, at(dig, 16, 0), at(dig, 16, 5), at(dig, 0, 5), at(dig, 0, 10), at(dig, 16, 10), at(dig, 16, 15), at(dig, 0, 15)];
  world.add(
    createCrowd({
      glow: true,
      size: 6,
      height: y(7),
      seed: 3,
      groups: [
        { path: [MOUND, at(MOUND, 0.2, 0)], count: 1, color: GLOW, size: 1.7, show: [0.04, 1.2] },
        { path: trench, count: 16, color: "#ffcf8a", drop: true, size: 0.8, timing: [[0.15, 0], [0.95, 1]] },
      ],
      progress: () => clamp(clock.elapsed("phat-hien") / 10),
      visible: () => clock.near("phat-hien"),
    }),
  );

  // 2. "thoi-gian": làng dần có thêm bếp lửa, khói; ba lớp người nối nhau đi từ bờ sông lên doi đất — nhiều thế hệ (diễn hoạ).
  const hearths: FireSite[] = (
    [[-6, 10], [10, 18], [-18, 6], [4, -8], [18, 0], [-4, 24]] as Pt[]
  ).map(([dx, dz], i) => ({ x: MOUND[0] + dx, y: height(MOUND[0] + dx, MOUND[1] + dz) + 0.3, z: MOUND[1] + dz, order: 0.08 + i * 0.16, size: 0.8 }));
  const village = (ctx: FrameCtx) =>
    Math.max(clock.near("thoi-gian") * clamp(clock.elapsed("thoi-gian") / 18), 0.45 * smoothstep(1.5, 2.2, ctx.t) * (1 - smoothstep(8.2, 8.9, ctx.t)));
  world.add(createFires({ sites: hearths, perSite: 7, size: 5.5, lit: village, glow: (ctx) => 0.25 + 0.75 * smoothstep(1.6, 2.7, ctx.params.mood) }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 22, height: 18, wind: [0.8, 0.5] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = village(ctx) > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });
  const toMound: Pt[] = [[-104, 22], [-110, 48], [-118, 72]];
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 5,
      groups: [0, 1, 2].map((k) => ({
        path: toMound,
        count: 5,
        spread: [12, 10],
        color: ["#4a3a2a", "#3a2c20", INK][k],
        timing: [[0.25 * k, 0], [0.25 * k + 0.5, 1]] as [number, number][],
        show: [0.25 * k, 0.25 * k + 0.56] as [number, number],
      })),
      progress: () => clamp(clock.elapsed("thoi-gian") / 30),
      visible: () => clock.near("thoi-gian"),
    }),
  );

  // 3. "ven-song": đốm sáng — mỗi đốm là một địa điểm có dấu vết — lần lượt hiện dọc các dòng sông, từ doi đất lan ra hai phía
  //    (diễn hoạ phạm vi phân bố; số lượng và vị trí đốm không phản ánh số liệu thật).
  const trails: Pt[][] = [
    shift(rev(MAIN.pts.slice(0, 5)), 0, 48),
    shift(rev(MAIN.pts.slice(0, 5)), 0, -48),
    shift(MAIN.pts.slice(4), 0, 48),
    shift(MAIN.pts.slice(4), 0, -48),
    shift(rev(NORTH.pts), 46, 0),
    shift(rev(NORTH.pts), -46, 0),
  ];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: y(5),
      seed: 9,
      groups: trails.map((pts) => ({ path: pts, count: Math.max(6, Math.round(len(pts) / 46)), spread: [22, 16], color: GLOW, drop: true, size: 1.2 })),
      progress: () => clamp(clock.elapsed("ven-song") / 16),
      visible: () => clock.near("ven-song"),
    }),
  );

  // 4. "gom": thợ gốm đứng quanh hố nung; kéo thì lửa bén dần ở ba chỗ, các đốm sáng "đồ gốm" nóng lên rồi đỏ rực; kéo xong thì
  //    mọi người mang gốm về làng (diễn hoạ; không vẽ hình dáng gốm hay hố nung).
  const kilns: FireSite[] = [
    { x: KILN[0], y: height(KILN[0], KILN[1]) + 0.2, z: KILN[1], order: 0.1, size: 1.9 },
    { x: KILN[0] + 5, y: height(KILN[0] + 5, KILN[1] + 3) + 0.2, z: KILN[1] + 3, order: 0.45, size: 1.5 },
    { x: KILN[0] - 5, y: height(KILN[0] - 5, KILN[1] + 4) + 0.2, z: KILN[1] + 4, order: 0.8, size: 1.5 },
  ];
  const nung = (ctx: FrameCtx) => ctx.params.nung * clock.near("gom");
  world.add(createFires({ sites: kilns, perSite: 8, size: 5, lit: nung, glow: (ctx) => 0.35 + 0.65 * smoothstep(0.6, 1.8, ctx.params.mood) }));
  const kilnSmoke = createSmoke({ sources: kilns.map((k) => ({ x: k.x, y: k.y, z: k.z })), perSource: 24, height: 16, wind: [0.7, 0.4] });
  world.add({
    object: kilnSmoke.object,
    update(ctx) {
      const on = nung(ctx) > 0.15;
      kilnSmoke.object!.visible = on;
      if (on) kilnSmoke.update?.(ctx);
    },
  });
  const pots = 10;
  world.add(
    createGlows({
      count: pots,
      color: (i) => (i % 3 === 0 ? "#f0a06a" : "#e79a55"),
      size: 1.1,
      minPx: 14,
      visible: () => clock.near("gom"),
      place: (i, ctx, out) => {
        const a = Math.PI * (0.15 + 0.7 * (i / (pots - 1)));
        out.set(KILN[0] + Math.cos(a) * 10, height(KILN[0] + Math.cos(a) * 10, KILN[1] + Math.sin(a) * 10) + 0.7, KILN[1] + Math.sin(a) * 10);
        // gốm mộc: sáng mờ; lửa càng bén càng đỏ rực, từng chiếc nóng lên lần lượt
        return 0.2 + 0.8 * clamp(ctx.params.nung * 1.5 - (i / pots) * 0.5);
      },
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 11,
      groups: [{ path: [at(KILN, -22, 14), at(KILN, -12, 8), at(KILN, -9, 6)], count: 4, spread: [8, 6], color: INK }],
      progress: () => clamp(clock.elapsed("gom") / 8),
      visible: () => clock.near("gom"),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 12,
      groups: [{ path: [at(KILN, -4, 4), at(KILN, -12, 14), at(MOUND, 6, -6)], count: 4, spread: [6, 8], color: "#3a2b20" }],
      progress: (ctx) => clamp(sinceNung(ctx) / 14),
      visible: (ctx) => (sinceNung(ctx) >= 0 ? clock.near("gom") * clamp(sinceNung(ctx) / 1) : 0),
    }),
  );

  // 5. "da-ngoc": mấy người ngồi quanh chỗ mài đá, người khác từ bờ sông mang đá về; các vòng sáng — gợi vòng đá — hiện dần,
  //    vòng nhỏ nằm lọt trong vòng lớn như lõi đá lấy ra khi khoan (diễn hoạ; không vẽ hình dáng vòng, hạt chuỗi thật).
  const rings: [number, number][] = [[9, 18], [5.5, 12], [2.5, 7]];
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: y(1.2),
      seed: 15,
      groups: rings.map(([r, n], k) => ({
        path: circle(at(WORKSHOP, 0, 0), r, n),
        count: n,
        color: ["#d8d0a8", "#9fd0a6", "#bfe3c6"][k],
        drop: true,
        size: 0.55,
        timing: [[0.15 * k, 0], [0.15 * k + 0.55, 1]] as [number, number][],
      })),
      progress: () => clamp(clock.elapsed("da-ngoc") / 14),
      visible: () => clock.near("da-ngoc"),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 17,
      groups: [
        { path: [at(WORKSHOP, 14, -16), at(WORKSHOP, 9, -9), at(WORKSHOP, 7, -6)], count: 4, spread: [8, 6], color: INK },
        { path: [[-120, 26], [-136, 60], at(WORKSHOP, 2, -10)], count: 4, spread: [8, 8], color: "#3a2b20", timing: [[0, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("da-ngoc") / 12),
      visible: () => clock.near("da-ngoc"),
    }),
  );

  // 6. "dong": lò luyện đồng nhỏ bừng lửa, một đốm màu đồng nóng chảy lung linh; ruộng lúa xanh ngoài đầu làng (diễn hoạ: lúa là
  //    gợi ý theo lời kể "biết trồng lúa nước", không tái hiện giống lúa hay ruộng cụ thể).
  const furnace: FireSite[] = [{ x: FURNACE[0], y: height(FURNACE[0], FURNACE[1]) + 0.3, z: FURNACE[1], order: 0.1, size: 1.2 }];
  const burn = () => clock.near("dong") * clamp(clock.elapsed("dong") / 6);
  world.add(createFires({ sites: furnace, perSite: 8, size: 5, lit: burn, glow: (ctx) => 0.35 + 0.65 * smoothstep(1.4, 2.5, ctx.params.mood) }));
  world.add(
    createGlows({
      count: 1,
      color: "#ffb04a",
      size: 1.6,
      minPx: 20,
      visible: () => clock.near("dong"),
      place: (_, ctx, out) => {
        out.set(FURNACE[0], height(FURNACE[0], FURNACE[1]) + 1.1, FURNACE[1]);
        return clamp(clock.elapsed("dong") / 5) * (0.8 + 0.2 * Math.sin(ctx.time * 3.1));
      },
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 19,
      groups: [{ path: [at(FURNACE, -24, 18), at(FURNACE, -10, 6), at(FURNACE, -7, 4)], count: 4, spread: [8, 6], color: INK }],
      progress: () => clamp(clock.elapsed("dong") / 8),
      visible: () => clock.near("dong"),
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1200 * q.density),
      area: { x0: -210, x1: -80, z0: 26, z1: 52 },
      accept: (x, z) => {
        const h = height(x, z);
        return h > 1 && h < 4.5 && Math.hypot(x - FURNACE[0], z - FURNACE[1]) > 18 && !nearCam(x, z, 10) && fbm2(x * 0.05, z * 0.05, 2) > 0.3 ? h - 0.05 : null;
      },
      height: [0.5, 0.85],
      blades: 7,
      base: "#6f9a35",
      tip: "#c9d66a",
      sway: 0.25,
      seed: 91,
      maxDistance: 260,
    }),
  );

  // 7. "mo-tang": chiều xuống, một đoàn người mang lửa đi chậm từ bờ sông vào doi đất có đồi bao quanh; ở đó có một đống lửa
  //    nhỏ (diễn hoạ; lời kể chỉ nói tới việc chôn cất ở Mán Bạc, không tả nghi lễ).
  const wake: FireSite[] = [{ x: MAN_BAC[0], y: height(MAN_BAC[0], MAN_BAC[1]) + 0.3, z: MAN_BAC[1], order: 0.2, size: 1.6 }];
  const watch = () => clock.near("mo-tang") * clamp(clock.elapsed("mo-tang") / 10);
  world.add(createFires({ sites: wake, perSite: 7, size: 5, lit: watch, glow: () => 1 }));
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: y(2),
      seed: 23,
      groups: [{ path: [[-196, -6], [-198, -60], [-200, -110], at(MAN_BAC, 4, 10)], count: 7, spread: [8, 14], color: "#ffd9a0", arrive: "#b88a58", size: 0.7 }],
      progress: () => clamp(clock.elapsed("mo-tang") / 20),
      visible: () => clock.near("mo-tang"),
    }),
  );

  // 8. "noi-tiep": một dòng đốm sáng — ấm như hổ phách rồi ngả màu đồng — chảy dọc sông về phía đông, nối các văn hoá về sau
  //    (diễn hoạ ý "chuỗi văn hoá liên tục"; không phải một cuộc di cư).
  const stream = shift(MAIN.pts.slice(3), 0, 30);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: y(4),
      seed: 29,
      groups: [
        { path: stream, count: 22, spread: [14, 10], color: "#ffd27a", arrive: "#c98a4a", drop: true, size: 0.8, timing: [[0, 0], [1, 1]] },
        { path: shift(MAIN.pts.slice(3), 0, -30), count: 14, color: "#ffd27a", arrive: "#c98a4a", drop: true, size: 0.7, timing: [[0.1, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("noi-tiep") / 16),
      visible: () => clock.near("noi-tiep"),
    }),
  );

};

export default setup;
