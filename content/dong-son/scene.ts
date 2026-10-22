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
import { CENTER, CENTERS, FESTIVAL, FIELDS, FIELD_Y, FIND, FOUNDRY } from "./places";
import { BOUNDS, MAIN, NORTH, SOUTH, WATER_HIGH, WATER_LOW, bankDist, colorize, fieldMask, height } from "./terrain";

type Pt = [number, number];

// Văn hoá Đông Sơn — cảnh CÁCH ĐIỆU. Mọi hình người, trâu bò, lửa, đồ đồng chỉ là chấm sáng minh hoạ cho điều lời kể nói; không vẽ
// nhà ở, thuyền, trang phục, trống đồng hay hoa văn (có tư liệu hiện vật riêng, không tự cách điệu trong cảnh này).

const INK = "#2b2118";
const GLOW = "#ffd27a";
const BRONZE = "#d99a52";

const at = (c: Pt, dx: number, dz: number): Pt => [c[0] + dx, c[1] + dz];
const shift = (pts: Pt[], dx: number, dz: number): Pt[] => pts.map(([x, z]) => [x + dx, z + dz]);
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const len = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
const circle = (c: Pt, r: number, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => [c[0] + Math.cos((i / n) * Math.PI * 2) * r, c[1] + Math.sin((i / n) * Math.PI * 2) * r]);
const square = (c: Pt, s: number): Pt[] => [at(c, -s / 2, -s / 2), at(c, s / 2, -s / 2), at(c, s / 2, s / 2), at(c, -s / 2, s / 2), at(c, -s / 2, -s / 2)];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const clock = createBeatClock(world, ["phat-hien", "thoi-gian", "phan-bo", "ruong-nuoc", "dong", "le-hoi", "trung-tam", "giao-luu"]);
  const level = (ctx: FrameCtx) => lerp(WATER_LOW, WATER_HIGH, ctx.params.trieu);

  // ---- phong cảnh chung ----
  const { nearCam } = await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) =>
      Math.hypot(x - CENTER[0], z - CENTER[1]) > 62 &&
      Math.hypot(x - FOUNDRY[0], z - FOUNDRY[1]) > 36 &&
      Math.hypot(x - FESTIVAL[0], z - FESTIVAL[1]) > 38 &&
      Math.hypot(x - FIND[0], z - FIND[1]) > 24 &&
      fieldMask(x, z) < 0.05,
    water: { deep: "#2f4b44", shallow: "#80957a" },
    dust: { center: { x: -20, y: 0, z: 20 }, extent: { x: 340, y: 40, z: 340 } },
    birds: { center: { x: -20, y: 0, z: 30 }, radius: 180 },
    mist: { center: { x: -20, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 540, height: 1 },
    seed: 5,
  });

  // ---- tương tác: kéo cho nước triều lên (phân cảnh "ruong-nuoc") ----
  const BEAT_RUONG = world.beat("ruong-nuoc");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT_RUONG));
    target.trieu += ((ctx.inputs.trieu ?? 0) - target.trieu) * w;
  });
  const y = (dy: number) => (x: number, z: number) => height(x, z) + dy;
  const fire = (c: Pt, order: number, size: number, dy = 0.3): FireSite => ({ x: c[0], y: height(c[0], c[1]) + dy, z: c[1], order, size });

  // 1. "phat-hien": một người đi ra bờ sông, rồi đồ đồng lộ ra — các đốm màu đồng hiện dần dọc bờ; sau đó dãy ô khai quật hiện lần
  //    lượt (diễn hoạ; vị trí chỉ là gợi ý, không phải vị trí di tích thật).
  const trench: CrowdGroup[] = [[16, -8], [30, -14], [26, 6]].map(([dx, dz], k) => ({
    path: square(at(FIND, dx, dz), 8),
    count: 8,
    color: "#ffcf8a",
    drop: true,
    size: 0.7,
    timing: [[0.5 + 0.14 * k, 0], [0.5 + 0.14 * k + 0.14, 1]] as [number, number][],
  }));
  world.add(
    createCrowd({
      glow: true,
      size: 6,
      height: y(1.5),
      seed: 3,
      groups: [
        { path: shift([[-6, 8], [4, 2], [10, -2]], FIND[0], FIND[1]), count: 8, color: BRONZE, drop: true, size: 0.75, timing: [[0.18, 0], [0.5, 1]] },
        { path: [FIND, at(FIND, 0.2, 0)], count: 1, color: GLOW, size: 1.6, show: [0.22, 1.2] },
        ...trench,
      ],
      progress: () => clamp(clock.elapsed("phat-hien") / 16),
      visible: () => clock.near("phat-hien"),
    }),
  );
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 4,
      groups: [{ path: [at(FIND, -42, 40), at(FIND, -22, 38), at(FIND, -6, 12), at(FIND, -2, 4)], count: 1, color: INK, show: [0, 0.28] }],
      progress: () => clamp(clock.elapsed("phat-hien") / 16),
      visible: () => clock.near("phat-hien"),
    }),
  );

  // 2. "thoi-gian": làng lớn dần có thêm bếp lửa qua nhiều thế hệ; ba lớp người nối nhau đi từ bờ sông lên thềm (diễn hoạ).
  const hearths: FireSite[] = ([[-8, 6], [10, 14], [-16, -6], [6, -10], [20, 2], [-2, 22], [24, 18], [-22, 12]] as Pt[]).map(([dx, dz], i) =>
    fire(at(CENTER, dx, dz), 0.06 + i * 0.12, 0.8),
  );
  const village = (ctx: FrameCtx) =>
    Math.max(clock.near("thoi-gian") * clamp(clock.elapsed("thoi-gian") / 22), 0.45 * smoothstep(1.5, 2.2, ctx.t) * (1 - smoothstep(8.2, 8.9, ctx.t)));
  world.add(createFires({ sites: hearths, perSite: 7, size: 5.5, lit: village, glow: (ctx) => 0.25 + 0.75 * smoothstep(1.6, 2.7, ctx.params.mood) }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 20, height: 18, wind: [0.8, 0.5] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = village(ctx) > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });
  const upBank: Pt[] = [[-30, 18], [-14, 42], [-4, 62]];
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 5,
      groups: [0, 1, 2].map((k) => ({
        path: upBank,
        count: 6,
        spread: [14, 10],
        color: ["#4a3a2a", "#3a2c20", INK][k],
        timing: [[0.25 * k, 0], [0.25 * k + 0.5, 1]] as [number, number][],
        show: [0.25 * k, 0.25 * k + 0.56] as [number, number],
      })),
      progress: () => clamp(clock.elapsed("thoi-gian") / 32),
      visible: () => clock.near("thoi-gian"),
    }),
  );

  // 3. "phan-bo": đốm sáng — mỗi đốm là một di tích — lần lượt hiện dọc ba dòng sông, lan ra hai phía từ ngã ba (diễn hoạ; số
  //    đốm và vị trí không phản ánh số liệu thật: hơn 400 di tích).
  const trails: [Pt[], number, number][] = [
    [rev(MAIN.pts.slice(0, 5)), 0, 60],
    [rev(MAIN.pts.slice(0, 5)), 0, -60],
    [MAIN.pts.slice(4), 0, 60],
    [MAIN.pts.slice(4), 0, -60],
    [rev(NORTH.pts), 58, 0],
    [rev(NORTH.pts), -58, 0],
    [rev(SOUTH.pts), 58, 0],
    [rev(SOUTH.pts), -58, 0],
  ];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: y(5),
      seed: 9,
      groups: trails.map(([pts, dx, dz]) => ({ path: shift(pts, dx, dz), count: Math.max(8, Math.round(len(pts) / 30)), spread: [28, 22], color: GLOW, drop: true, size: 1.25 })),
      progress: () => clamp(clock.elapsed("phan-bo") / 18),
      visible: () => clock.near("phan-bo"),
    }),
  );

  // 4. "ruong-nuoc": ruộng lúa xanh trên mặt bằng thấp ven sông — kéo thì nước triều lên, ngập dần thửa ruộng; người và trâu bò
  //    cày bừa theo luống khi nước còn cạn (diễn hoạ; không tả giống lúa, ruộng hay nông cụ cụ thể).
  const rows = (k: number): Pt[] => {
    const z = FIELDS.z0 + 10 + k * 11;
    return roundTrip([[FIELDS.x0 + 6, z], [FIELDS.x1 - 6, z]]);
  };
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1500 * q.density),
      area: { x0: FIELDS.x0, x1: FIELDS.x1, z0: FIELDS.z0, z1: FIELDS.z1 },
      accept: (x, z) => (fieldMask(x, z) > 0.7 && !nearCam(x, z, 8) ? FIELD_Y - 0.05 : null),
      height: [0.55, 0.85],
      blades: 7,
      base: "#68963a",
      tip: "#c4d468",
      sway: 0.25,
      seed: 95,
      maxDistance: 260,
    }),
  );
  world.add(
    createCrowd({
      size: 4.5,
      height: y(0),
      seed: 11,
      groups: [0, 1, 2, 3].map((k) => ({
        path: rows(k),
        count: 2,
        spread: [6, 2],
        color: k % 2 ? "#3a2b20" : INK,
        timing: [[0, 0], [0.5, 0.5], [1, 1]] as [number, number][],
        show: [0.02 * k, 1.1] as [number, number],
      })),
      progress: () => (clock.elapsed("ruong-nuoc") / 40) % 1,
      // người rời ruộng khi nước lên cao
      visible: (ctx) => clock.near("ruong-nuoc") * (1 - smoothstep(0.55, 0.9, ctx.params.trieu)),
    }),
  );
  world.add(
    createCrowd({
      size: 4.5,
      height: y(0),
      seed: 12,
      groups: [0, 1].map((k) => ({ path: rows(k + 1).slice(0, 3), count: 2, spread: [5, 2], color: "#6a4a30", size: 0.65, timing: [[0, 0], [0.5, 0.5], [1, 1]] as [number, number][] })),
      progress: () => (clock.elapsed("ruong-nuoc") / 40) % 1,
      visible: (ctx) => clock.near("ruong-nuoc") * (1 - smoothstep(0.55, 0.9, ctx.params.trieu)),
    }),
  );

  // 5. "dong": ba lò đúc bừng lửa, khói bốc; đốm màu đồng đi từ xưởng về phía làng như đồ đồng được mang đi trao đổi (diễn hoạ;
  //    không vẽ lò, khuôn, trống hay hình dáng đồ đồng).
  const furnaces: FireSite[] = [fire(at(FOUNDRY, 0, 0), 0.08, 2), fire(at(FOUNDRY, 8, 4), 0.4, 1.6), fire(at(FOUNDRY, -7, 5), 0.72, 1.6)];
  const burn = () => clock.near("dong") * clamp(clock.elapsed("dong") / 8);
  world.add(createFires({ sites: furnaces, perSite: 9, size: 5, lit: burn, glow: (ctx) => 0.35 + 0.65 * smoothstep(1.4, 2.7, ctx.params.mood) }));
  const smelt = createSmoke({ sources: furnaces.map((f) => ({ x: f.x, y: f.y, z: f.z })), perSource: 24, height: 18, wind: [0.7, 0.4] });
  world.add({
    object: smelt.object,
    update(ctx) {
      const on = burn() > 0.15;
      smelt.object!.visible = on;
      if (on) smelt.update?.(ctx);
    },
  });
  world.add(
    createGlows({
      count: 3,
      color: "#ffae4a",
      size: 1.1,
      minPx: 14,
      visible: () => clock.near("dong"),
      place: (i, ctx, out) => {
        // đồng nóng chảy: nhấp nháy ở miệng từng lò
        const f = furnaces[i];
        out.set(f.x, f.y + 1.0, f.z);
        return clamp(clock.elapsed("dong") / 6 - i * 0.2) * (0.8 + 0.2 * Math.sin(ctx.time * 3 + i * 2));
      },
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: y(1.2),
      seed: 15,
      groups: [{ path: [at(FOUNDRY, 2, -6), at(FOUNDRY, 14, -30), at(CENTER, -6, 12)], count: 10, spread: [6, 18], color: BRONZE, arrive: "#a8743a", size: 0.55, timing: [[0.25, 0], [1, 1]] }],
      progress: () => clamp(clock.elapsed("dong") / 26),
      visible: () => clock.near("dong"),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 16,
      groups: [{ path: [at(FOUNDRY, -26, -14), at(FOUNDRY, -12, -4), at(FOUNDRY, -6, 0)], count: 5, spread: [8, 6], color: INK }],
      progress: () => clamp(clock.elapsed("dong") / 8),
      visible: () => clock.near("dong"),
    }),
  );

  // 6. "le-hoi": ba đống lửa trên bãi hội; người từ ba hướng kéo về, rồi chậm rãi đi vòng quanh một đốm sáng đập nhịp — như tiếng
  //    trống (diễn hoạ nhịp; không vẽ trống, hoa văn hay điệu múa).
  const bonfires: FireSite[] = [fire(at(FESTIVAL, 14, 0), 0.1, 1.8), fire(at(FESTIVAL, -7, 12), 0.45, 1.6), fire(at(FESTIVAL, -7, -12), 0.8, 1.6)];
  const feast = () => clock.near("le-hoi") * clamp(clock.elapsed("le-hoi") / 6);
  world.add(createFires({ sites: bonfires, perSite: 8, size: 5, lit: feast, glow: () => 1 }));
  world.add(
    createGlows({
      count: 1,
      color: "#ffe2a0",
      size: 2.2,
      minPx: 22,
      visible: () => clock.near("le-hoi"),
      place: (_, ctx, out) => {
        out.set(FESTIVAL[0], height(FESTIVAL[0], FESTIVAL[1]) + 1.6, FESTIVAL[1]);
        // nhịp ~ 100 lần mỗi phút
        const beat = Math.pow(0.5 + 0.5 * Math.sin(ctx.time * 6.4), 3);
        return clamp(clock.elapsed("le-hoi") / 5) * (0.35 + 0.65 * beat);
      },
    }),
  );
  const arrive: Pt[][] = [
    [[FESTIVAL[0] + 40, FESTIVAL[1] - 54], [FESTIVAL[0] + 22, FESTIVAL[1] - 20], [FESTIVAL[0] + 10, FESTIVAL[1] - 8]],
    [[FESTIVAL[0] - 56, FESTIVAL[1] + 40], [FESTIVAL[0] - 26, FESTIVAL[1] + 18], [FESTIVAL[0] - 10, FESTIVAL[1] + 8]],
    [[FESTIVAL[0] + 6, FESTIVAL[1] + 58], [FESTIVAL[0] + 4, FESTIVAL[1] + 28], [FESTIVAL[0] + 2, FESTIVAL[1] + 10]],
  ];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 19,
      groups: arrive.map((p) => ({ path: p, count: 6, spread: [10, 12], color: INK, timing: [[0, 0], [0.3, 1]] as [number, number][] })),
      progress: () => clamp(clock.elapsed("le-hoi") / 40),
      visible: () => clock.near("le-hoi") * (1 - smoothstep(0.32, 0.4, clamp(clock.elapsed("le-hoi") / 40))),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 20,
      groups: [{ path: circle(FESTIVAL, 12, 20), count: 14, color: "#3a2b20", timing: [[0, 0], [1, 1]] }],
      progress: () => clamp((clock.elapsed("le-hoi") - 10) / 50),
      visible: () => clock.near("le-hoi") * smoothstep(9, 13, clock.elapsed("le-hoi")),
    }),
  );

  // 7. "trung-tam": mười một đốm sáng — mười một trung tâm — bừng lên lần lượt; giữa các trung tâm kề nhau có những đốm nhỏ chạy
  //    qua lại như trao đổi (diễn hoạ; vị trí chỉ là minh hoạ, số lượng theo nguồn).
  world.add(
    createGlows({
      count: CENTERS.length,
      color: GLOW,
      size: 6,
      minPx: 40,
      visible: () => clock.near("trung-tam"),
      place: (i, ctx, out) => {
        const [cx, cz] = CENTERS[i];
        out.set(cx, height(cx, cz) + 6, cz);
        return smoothstep(0, 0.8, clock.elapsed("trung-tam") - i * 0.9) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i));
      },
    }),
  );
  const links: [number, number][] = [[0, 1], [0, 5], [0, 7], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 1], [0, 9]];
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: y(4),
      seed: 25,
      groups: links.map(([a, b], k) => ({
        path: roundTrip([CENTERS[a], CENTERS[b]]),
        count: 2,
        spread: [0, 14],
        color: BRONZE,
        size: 0.45,
        timing: [[0, 0], [1, 1]] as [number, number][],
        show: [0.1 + k * 0.03, 1.2] as [number, number],
      })),
      progress: () => (clock.elapsed("trung-tam") / 36) % 1,
      visible: () => clock.near("trung-tam") * smoothstep(8, 12, clock.elapsed("trung-tam")),
    }),
  );

  // 8. "giao-luu": từ làng lớn, ba dòng đốm màu đồng đi ra ba hướng — xuôi nam theo miền Trung, lên tây về phía Lào, lên bắc về Vân
  //    Nam — như trống và đồ đồng được trao đổi đi xa (diễn hoạ; không vẽ đường đi, không phải một cuộc di cư).
  const out = (end: Pt, bend: Pt): Pt[] => [CENTER, bend, end];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: y(5),
      seed: 29,
      groups: [
        { path: out([-20, -390], [30, -150]), count: 14, spread: [14, 8], color: GLOW, arrive: BRONZE, drop: true, size: 1.25 },
        { path: out([-390, 230], [-150, 150]), count: 14, spread: [14, 8], color: GLOW, arrive: BRONZE, drop: true, size: 1.25, timing: [[0.1, 0], [1, 1]] },
        { path: out([40, 390], [10, 250]), count: 12, spread: [14, 8], color: GLOW, arrive: BRONZE, drop: true, size: 1.25, timing: [[0.2, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("giao-luu") / 18),
      visible: () => clock.near("giao-luu"),
    }),
  );
};

export default setup;
