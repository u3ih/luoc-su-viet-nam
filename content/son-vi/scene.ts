import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import config from "./scene.config";
import { BOUNDS, WATER_HIGH, WATER_LOW, MAIN, NORTH, SOUTH, SHELTER, SONVI, barMask, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Văn hoá Sơn Vi — cảnh CÁCH ĐIỆU. Mọi hình người, thú, lửa chỉ là chấm minh hoạ cho điều lời kể nói; không vẽ công cụ đá,
// trang phục hay nhà ở (chưa có hiện vật/tư liệu hình ảnh để dựa vào). Chi tiết diễn hoạ mà nguồn không nói rõ được ghi TODO.

const INK = "#2b2118";
const GLOW = "#ffd27a";

const shift = (pts: Pt[], dx: number, dz: number): Pt[] => pts.map(([x, z]) => [x + dx, z + dz]);
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const len = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
/** Đi tới rồi quay về cùng đường. */
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(20000);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);
  const level = (ctx: FrameCtx) => WATER_HIGH + (WATER_LOW - WATER_HIGH) * ctx.params.water;

  // ---- đất, sông ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: level, cheap: q.cheapShaders }));
  world.add(
    createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#2d4a45", shallow: "#7d9478" } }),
  );
  await world.yield();
  world.add(createDust(q.dust, { x: -60, y: 0, z: 0 }, { x: 300, y: 40, z: 300 }));

  // ---- tương tác: kéo cho nước sông rút (phân cảnh "cuoi-song") ----
  const BEAT_HA = world.beat("cuoi-song");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT_HA));
    target.water += ((ctx.inputs.ha ?? 0) - target.water) * w;
  });

  // ---- hoạt cảnh: mỗi phân cảnh có đồng hồ riêng, diễn trong lúc người xem dừng đọc ----
  const clock = createBeatClock(world, ["phat-hien", "thoi-gian", "them-song", "cuoi-song", "kiem-an", "bep-lua", "tiep-noi"]);

  // 1. "phat-hien": dấu mốc sáng bừng lên ở gò Sơn Vi, rồi một vòng đốm sáng nhỏ lần lượt hiện quanh đó — nơi tìm thấy di tích
  //    đầu tiên (diễn hoạ; vị trí gò trong cảnh là gợi ý, không phải vị trí thật).
  const ring: Pt[] = Array.from({ length: 17 }, (_, i) => [SONVI[0] + Math.cos((i / 16) * Math.PI * 2) * 26, SONVI[1] + Math.sin((i / 16) * Math.PI * 2) * 26]);
  world.add(
    createCrowd({
      glow: true,
      size: 6,
      height: (x, z) => height(x, z) + 8,
      seed: 3,
      groups: [
        { path: [SONVI, [SONVI[0] + 0.2, SONVI[1]]], count: 1, color: GLOW, size: 1.7, show: [0.04, 1.2] },
        { path: ring, count: 14, color: "#ffcf8a", drop: true, size: 0.8, timing: [[0.15, 0], [0.95, 1]] },
      ],
      progress: () => clamp(clock.elapsed("phat-hien") / 10),
      visible: () => clock.near("phat-hien"),
    }),
  );

  // 2. "thoi-gian": ba đợt người nối nhau đi dọc thềm sông — nhiều thế hệ qua hàng chục nghìn năm (diễn hoạ).
  const bank = shift(MAIN.pts.slice(1, 5), 0, 50);
  const waves: CrowdGroup[] = [0, 1, 2].map((k) => ({
    path: bank,
    count: 7,
    spread: [10, 16],
    color: ["#4a3a2a", "#3a2c20", INK][k],
    timing: [[0.25 * k, 0], [0.25 * k + 0.5, 1]],
    show: [0.25 * k, 0.25 * k + 0.56],
  }));
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 5,
      groups: waves,
      progress: () => clamp(clock.elapsed("thoi-gian") / 32),
      visible: () => clock.near("thoi-gian"),
    }),
  );

  // 3. "them-song": các đốm sáng — mỗi đốm là một địa điểm có dấu vết — lần lượt hiện dọc thềm các dòng sông lớn, từ chỗ các
  //    sông gặp nhau lan ra hai phía (diễn hoạ phạm vi phân bố; số lượng và vị trí đốm không phản ánh số liệu thật).
  const confIdx = 5;
  const trails: [Pt[], number, number][] = [
    [rev(MAIN.pts.slice(0, confIdx + 1)), 0, 58],
    [rev(MAIN.pts.slice(0, confIdx + 1)), 0, -58],
    [MAIN.pts.slice(confIdx), 0, 58],
    [MAIN.pts.slice(confIdx), 0, -58],
    [rev(NORTH.pts), 58, 0],
    [rev(NORTH.pts), -58, 0],
    [rev(SOUTH.pts), 58, 0],
    [rev(SOUTH.pts), -58, 0],
  ];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => height(x, z) + 5,
      seed: 9,
      groups: trails.map(([pts, dx, dz]) => ({
        path: shift(pts, dx, dz),
        count: Math.max(6, Math.round(len(pts) / 42)),
        spread: [26, 20],
        color: GLOW,
        drop: true,
        size: 0.8,
      })),
      progress: () => clamp(clock.elapsed("them-song") / 16),
      visible: () => clock.near("them-song"),
    }),
  );

  // 4. "cuoi-song": nước rút, bãi cuội lộ ra (đá nhỏ rải trong lòng sông); kéo xong thì một nhóm người ra bãi (diễn hoạ).
  const sinceHa = (ctx: FrameCtx) => (ctx.completedAt.ha ? (ctx.now - ctx.completedAt.ha) / 1000 : -1);
  world.add(
    createRocks({
      quality: q,
      count: Math.round(420 * q.density),
      area: { x0: -290, x1: -40, z0: 0, z1: 130 },
      accept: (x, z) => (barMask(x, z) > 0.3 ? height(x, z) : null),
      scale: [0.45, 1.3],
      stone: "#9d9684",
      moss: "#9d9684",
      seed: 41,
      maxDistance: 320,
    }),
  );
  const barWalk: Pt[] = [[-175, 8], [-168, 34], [-162, 58]];
  world.add(
    createCrowd({
      size: 3.2,
      height: (x, z) => Math.max(height(x, z), WATER_LOW),
      seed: 13,
      groups: [{ path: barWalk, count: 4, spread: [7, 7], color: INK }],
      progress: (ctx) => clamp(sinceHa(ctx) / 8),
      visible: (ctx) => (sinceHa(ctx) >= 0 ? clock.near("cuoi-song") * clamp(sinceHa(ctx) / 0.8) : 0),
    }),
  );

  // 5. "kiem-an": hái lượm trên thềm, nhặt ốc hến ven sông, một bầy thú xa xa và vài người đi theo — săn bắt (diễn hoạ;
  //    không tả cảnh săn cụ thể vì nguồn không có).
  const KA = 28;
  const stay: [number, number][] = [[0, 0], [0.36, 0.5], [0.62, 0.5], [0.96, 1]];
  const KA_TRIP: Pt[] = [[-205, 38], [-172, 26], [-142, 10], [-122, -10]];
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 17,
      groups: [
        { path: roundTrip(KA_TRIP), count: 7, spread: [14, 16], color: INK, timing: stay, show: [0, 0.98] },
        { path: roundTrip([[-192, 56], [-166, 44], [-140, 38]]), count: 5, spread: [9, 6], color: "#3a2b20", timing: [[0, 0], [0.5, 0.5], [1, 1]] },
        { path: [[-45, -10], [-80, -35], [-120, -55], [-150, -50]], count: 4, spread: [6, 8], color: "#1d1611", timing: [[0, 0], [1, 0.85]], size: 1 },
        { path: [[-90, -95], [-125, -70], [-165, -48], [-205, -35]], count: 9, spread: [28, 14], color: "#6a4a30", timing: [[0, 0], [1, 0.8]], size: 0.55 },
      ],
      progress: () => clamp(clock.elapsed("kiem-an") / KA),
      visible: () => clock.near("kiem-an"),
    }),
  );

  // 6 + 7. "bep-lua" / "tiep-noi": chiều xuống, mọi người từ ba hướng về quanh bếp (một bếp lớn ở giữa), lửa bừng lên; sang
  //    sáng sau lửa tàn dần, từng nhóm lại đi ra các ngả (diễn hoạ; lời kể chỉ nói tới vết tích bếp ở di tích hang động).
  const hearths: FireSite[] = [
    { x: SHELTER[0], y: height(SHELTER[0], SHELTER[1]) + 0.3, z: SHELTER[1], order: 0.05, size: 1.6 },
    { x: SHELTER[0] + 9, y: height(SHELTER[0] + 9, SHELTER[1] + 5) + 0.3, z: SHELTER[1] + 5, order: 0.45, size: 0.9 },
    { x: SHELTER[0] - 8, y: height(SHELTER[0] - 8, SHELTER[1] + 7) + 0.3, z: SHELTER[1] + 7, order: 0.75, size: 0.9 },
  ];
  const lit = (ctx: FrameCtx) =>
    Math.max(
      clock.near("bep-lua") * clamp(clock.elapsed("bep-lua") / 7),
      clock.near("tiep-noi") * (1 - 0.95 * clamp(clock.elapsed("tiep-noi") / 16)),
    );
  world.add(createFires({ sites: hearths, perSite: 9, size: 6.5, lit, glow: (ctx) => 0.3 + 0.7 * smoothstep(1.6, 2.7, ctx.params.mood) }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 28, height: 20, wind: [0.8, 0.5] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = lit(ctx) > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });
  const COME: Pt[][] = [
    [[-60, 4], [-64, -45], [-70, -79]],
    [[-5, -98], [-35, -92], [-65, -89]],
    [[-170, -62], [-130, -78], [-92, -89]],
  ];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 23,
      groups: COME.map((path) => ({ path, count: 5, spread: [12, 10], color: INK })),
      progress: () => clamp(clock.elapsed("bep-lua") / 18),
      visible: () => clock.near("bep-lua"),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 29,
      groups: COME.map((path) => ({ path: rev(path), count: 5, spread: [10, 6], color: INK, timing: [[0.05, 0], [1, 1]], show: [0, 1.1] })),
      progress: () => clamp(clock.elapsed("tiep-noi") / 24),
      visible: () => clock.near("tiep-noi"),
    }),
  );

  // ---- mỏm đá quanh chỗ đặt bếp, cây rừng thưa, bụi, cỏ, lau sậy, chim ----
  const OUTCROP: Pt = [SHELTER[0] - 40, SHELTER[1] - 34];
  world.add(
    createRocks({
      quality: q,
      count: Math.round(70 * q.density),
      area: { x0: OUTCROP[0] - 40, x1: OUTCROP[0] + 40, z0: OUTCROP[1] - 40, z1: OUTCROP[1] + 40 },
      accept: (x, z) => {
        const d = Math.hypot(x - OUTCROP[0], z - OUTCROP[1]);
        return d > 12 && d < 40 && Math.hypot(x - SHELTER[0], z - SHELTER[1]) > 16 ? height(x, z) : null;
      },
      scale: [0.9, 3],
      seed: 43,
      maxDistance: 320,
    }),
  );
  await world.yield();
  const open = (x: number, z: number) =>
    Math.hypot(x - SONVI[0], z - SONVI[1]) > 36 && Math.hypot(x - SHELTER[0], z - SHELTER[1]) > 50 && bankDist(x, z) > 6;
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 2.4 && open(x, z) && clearOfCam(x, z, h) ? h : null;
  };
  const wide = { x0: -395, x1: 395, z0: -395, z1: 395 };
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(640 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null) return null;
        const f = fbm2(x * 0.02 + 4, z * 0.02 - 2, 3);
        return f > 0.54 || (y > 16 && f > 0.4) ? y - 0.3 : null;
      },
      scale: [1.0, 1.9],
      dark: "#1d3a1d",
      light: "#5e8a3c",
      seed: 81,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 260,
      count: Math.round(800 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        return y !== null && fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#27401f",
      light: "#6f9242",
      seed: 82,
    }),
  );
  await world.yield();
  world.add(
    createGrass({
      quality: q,
      count: Math.round(7000 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1.2 || h > 9 || nearCam(x, z, 14) || !open(x, z)) return null;
        return fbm2(x * 0.04 + 1, z * 0.04 - 5, 3) > 0.42 ? h - 0.05 : null;
      },
      height: [0.35, 0.7],
      blades: 6,
      base: "#5a7d32",
      tip: "#b4c26a",
      sway: 0.2,
      seed: 83,
      maxDistance: 300,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(2200 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        // lau sậy mép nước
        return h > -0.4 && h < 1.0 && bankDist(x, z) > -4 && !nearCam(x, z, 14) ? h - 0.1 : null;
      },
      height: [1.1, 2.0],
      blades: 9,
      base: "#76763f",
      tip: "#e6d89c",
      sway: 0.05,
      seed: 86,
      maxDistance: 260,
    }),
  );
  world.add(createBirds({ flocks: 2, perFlock: 7, center: { x: -60, y: 0, z: 40 }, radius: 170, altitude: [55, 90], seed: 15 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: -60, y: 0, z: 0 },
        size: [800, 800],
        density: (ctx) => 0.15 + 0.6 * smoothstep(3.1, 3.7, ctx.params.mood) + 0.35 * (1 - smoothstep(0.8, 1.6, ctx.params.mood)),
        base: (ctx) => level(ctx),
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 0 },
      radius: 540,
      spacing: 160,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => Math.pow(fbm2(a * 5 + l * 11.3, l * 2.9, 4), 1.6) * (110 + l * 80),
    }),
  );
};

export default setup;
