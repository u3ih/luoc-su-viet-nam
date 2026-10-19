import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createMist, createRanges } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createCave, type Mouth } from "./actors/cave";
import { createMotes } from "./actors/motes";
import { createStrata, LAYERS } from "./actors/strata";
import { COLUMN } from "./places";
import config from "./scene.config";
import { BOUNDS, colorize, faceZ, height, LEDGE, PATH_FOOT, slopeAt, streamCenter, WATER } from "./terrain";

// Hang Con Moong. Mỗi phân cảnh một hoạt cảnh riêng, chạy theo đồng hồ phân cảnh (createBeatClock) trong lúc người
// xem dừng đọc. Nguyên tắc: chỉ minh hoạ phần lời kể có nguồn; người vẽ bằng chấm dáng đứng (không trang phục, công
// cụ, nhà ở); di cốt không được vẽ — chỉ gợi bằng ánh sáng.

const BEATS = ["hang-dong", "dia-tang", "lop-sau", "nhuyen-the", "mo-tang", "khi-hau", "lop-tren", "di-san"];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const { clearOfCam } = cameraClearance(config.keyframes);
  const clock = createBeatClock(world, BEATS);

  // ---- đất, suối ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#2c4a44", shallow: "#6f8c66" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 10, z: 0 }, { x: 280, y: 60, z: 280 }));

  // ---- cửa hang: hai cửa thông nhau (cửa phụ nhỏ hơn, cao hơn một chút). Hình dáng, vị trí chỉ là gợi ý. ----
  const mouth = (x: number, y: number, width: number, height: number, fromZ: number): Mouth => {
    // áp vào vách đá: chân cửa ở chỗ vách chạm độ cao y, đỉnh cửa nghiêng theo độ ngả của vách
    const zb = faceZ(x, y + 0.2, fromZ);
    const zt = faceZ(x, y + height, fromZ);
    return { x, y, z: zb - 0.3, width, height, lean: Math.atan2(zt - zb, height) };
  };
  const main = mouth(LEDGE.x, LEDGE.y, 14, 11, LEDGE.z);
  const side0 = mouth(-19, LEDGE.y + 14, 8, 6, 8);
  const side = { ...side0, z: side0.z - 0.6 };
  const mainZ = main.z;
  /** Mức rọi sáng ấm từ trong hang theo từng phân cảnh (người ở thì sáng, bỏ đi thì tắt). */
  const occupied = () => {
    const away = 1 - smoothstep(5, 14, clock.elapsed("lop-tren"));
    return clamp(
      clock.near("hang-dong") * 0.22 +
        clock.near("lop-sau") * 0.1 +
        clock.near("nhuyen-the") * 0.75 +
        clock.near("mo-tang") * 0.4 +
        clock.near("khi-hau") * 0.45 +
        clock.near("lop-tren") * 0.7 * away +
        clock.near("di-san") * 0.18,
    );
  };
  world.add(
    createCave({
      mouths: [main, side],
      glow: occupied,
    }),
  );

  // ---- cột lớp đất minh hoạ (xem actors/strata.ts) ----
  const COL_BEAT = world.beat("dia-tang");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - COL_BEAT));
    target.layers += ((ctx.inputs.layers ?? 0) - target.layers) * w;
  });
  const colGround = height(COLUMN.x, COLUMN.z);
  const strata = createStrata({
    x: COLUMN.x,
    z: COLUMN.z,
    groundY: colGround,
    progress: (ctx) => ctx.params.layers,
    highlight: (ctx) => {
      // lớp 1 = trên cùng, lớp 10 = dưới cùng (0 = đáy cột, 1 = đỉnh). Theo mô tả báo chí về đợt khai quật:
      // các lớp 7–10 không thấy xương thú nhưng có nhiều công cụ đá thạch anh; các lớp 1–6 có công cụ, xương thú, vỏ nhuyễn thể.
      const swept = ctx.completedAt.layers ? clamp((ctx.now - ctx.completedAt.layers) / 1000 / 9) : 0;
      const s = clock.near("dia-tang") * (swept > 0 && swept < 1 ? 1 : 0);
      if (s > 0.01) return { center: swept * 1.1 - 0.05, width: 0.2 * s };
      const deep = clock.near("lop-sau");
      if (deep > 0.01) {
        // từ lớp sâu nhất, nhấn dần lên cao khi kể sang Sơn Vi → Hoà Bình
        const up = smoothstep(7, 18, clock.elapsed("lop-sau"));
        return { center: 0.18 + up * 0.22, width: 0.32 * deep };
      }
      const shell = clock.near("nhuyen-the");
      if (shell > 0.01) return { center: 0.7, width: 0.36 * shell };
      const top = clock.near("lop-tren");
      if (top > 0.01) return { center: 0.96, width: 0.16 * top };
      return { center: 0, width: 0 };
    },
  });
  world.add(strata);
  const colFront = COLUMN.z - 3.4;

  // ---- hoạt cảnh 1 · hang-dong: đoàn khảo sát (chấm xanh nhạt) đi từ thung lũng lên thềm đá trước cửa hang ----
  const SURVEY = 17;
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 74,
      groups: [{ path: [[26, -96], [14, -70], [4, PATH_FOOT], [1, -6], [0, LEDGE.z - 2]], count: 7, spread: [3, 7], color: "#d6e4ec" }],
      progress: () => clamp(clock.elapsed("hang-dong") / SURVEY),
      visible: () => clock.near("hang-dong"),
    }),
  );

  // ---- hoạt cảnh 3 · lop-sau: đốm sáng đánh dấu chỗ tìm thấy công cụ đá ở các lớp sâu (trắng lạnh), rồi các lớp
  // Hoà Bình ở trên (ánh ấm) hiện sau đó. Vị trí rải trên mặt trước cột, chỉ là minh hoạ. ----
  const slabY = (i: number) => colGround - 0.6 + (i + 0.5) * 1.9;
  const lowSites = [0, 1, 2, 3].flatMap((i) => [-4.5, 0.5, 4.2].map((dx, j) => ({ x: COLUMN.x + dx, y: slabY(i), z: colFront, delay: (i * 3 + j) * 0.7 })));
  world.add(createMotes({ sites: lowSites, perSite: 3, rise: 2.4, size: 1.8, spread: 0.2, color: "#d8ecff", seed: 11, visible: () => clock.near("lop-sau"), elapsed: () => clock.elapsed("lop-sau") }));
  const midSites = [4, 5, 6].flatMap((i) => [-3.2, 2.8].map((dx, j) => ({ x: COLUMN.x + dx, y: slabY(i), z: colFront, delay: 8 + (i - 4) * 2.2 + j * 0.8 })));
  world.add(createMotes({ sites: midSites, perSite: 3, rise: 2.4, size: 1.8, spread: 0.2, color: "#ffc477", seed: 12, visible: () => clock.near("lop-sau"), elapsed: () => clock.elapsed("lop-sau") }));

  // ---- hoạt cảnh 4 · nhuyen-the: người đi từ suối lên hang rồi lại xuống, vỏ ốc, trai (chấm sáng nhỏ) rơi vãi dọc lối mòn ----
  const WALK = 22;
  const walkPath: [number, number][] = [[18, -100], [8, -72], [3, PATH_FOOT], [1, -8], [0, LEDGE.z - 2]];
  const walkP = (ctx: FrameCtx) => (clock.elapsed("nhuyen-the") % WALK) / WALK;
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 81,
      groups: [
        { path: walkPath, count: 6, spread: [3, 10], color: "#f0e0bc", timing: [[0, 0], [0.8, 1]] },
        { path: [[-26, -104], [-10, -70], [0, PATH_FOOT], [0.6, -6], [0, LEDGE.z - 2]], count: 4, spread: [2, 8], color: "#f0e0bc", timing: [[0.12, 0], [0.9, 1]], show: [0.1, 1] },
      ],
      progress: walkP,
      visible: () => clock.near("nhuyen-the"),
    }),
  );
  world.add(
    createCrowd({
      size: 1.1,
      height,
      seed: 82,
      groups: [{ path: [[0.4, -30], [0.6, -8], [0, LEDGE.z - 3]], count: 34, spread: [6, 0], color: "#efe6d2", drop: true, timing: [[0.1, 0], [0.8, 1]], show: [0.08, 1] }],
      progress: walkP,
      visible: () => clock.near("nhuyen-the"),
    }),
  );

  // ---- hoạt cảnh 5 · mo-tang: ánh sáng dịu bốc lên từ vài chỗ trên thềm trước cửa hang (không vẽ di cốt; số mộ, vị trí chỉ là minh hoạ) ----
  const graveSites = [-3.2, -1.1, 1.0, 3.1].map((dx, i) => ({ x: dx, y: LEDGE.y + 0.3, z: mainZ - 1.6 + (i % 2) * 0.8, delay: 1.2 + i * 2.4 }));
  world.add(createMotes({ sites: graveSites, perSite: 8, rise: 9, size: 2, spread: 0.6, color: "#fff1cf", seed: 21, visible: () => clock.near("mo-tang"), elapsed: () => clock.elapsed("mo-tang") }));

  // ---- hoạt cảnh 6 · khi-hau: sương lạnh dày lúc đầu tan dần, chim về khi trời ấm; trời ngả từ u ám sang bình minh ----
  world.add(
    createMist({
      center: { x: 0, y: 0, z: 0 },
      size: [700, 700],
      layers: 3,
      density: () => {
        const cold = clock.near("khi-hau") * (1 - smoothstep(2, 16, clock.elapsed("khi-hau")));
        const stay = Math.max(clock.near("lop-sau") * 0.5, clock.near("nhuyen-the") * 0.45, clock.near("mo-tang") * 0.4);
        return q.cheapShaders ? 0 : Math.max(cold * 1.1, stay);
      },
      base: () => 2,
      mood: world.mood,
    }),
  );
  const birds = createBirds({ flocks: 2, perFlock: 6, center: { x: 30, y: 0, z: 10 }, radius: 110, altitude: [55, 85], seed: 17 });
  world.add({
    object: birds.object,
    update(ctx) {
      const on = clock.near("khi-hau") * smoothstep(7, 9, clock.elapsed("khi-hau")) + clock.near("lop-tren") + clock.near("di-san");
      birds.object!.visible = on > 0.15;
      if (birds.object!.visible) birds.update?.(ctx);
    },
  });

  // ---- hoạt cảnh 7 · lop-tren: người rời hang, đi xuống thung lũng rồi xa dần về phía đồng bằng (nam); ánh trong hang tắt dần ----
  const LEAVE = 24;
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 91,
      groups: [
        { path: [[0, LEDGE.z - 2], [0.6, -8], [3, PATH_FOOT], [20, -100], [60, -200], [90, -330]], count: 9, spread: [3, 12], color: "#f0e0bc", timing: [[0.1, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("lop-tren") / LEAVE),
      visible: () => clock.near("lop-tren") * (1 - smoothstep(0.82, 0.98, clock.elapsed("lop-tren") / LEAVE)),
    }),
  );

  // ---- hoạt cảnh 8 · di-san: bảy điểm sáng — hang Con Moong và sáu di tích phụ cận (hang Lai, Lý Chùn, Mang Chiêng,
  // Diêm, Bố Giáo, quần thể Đầu Voi). VỊ TRÍ CHỈ MINH HOẠ, không phải toạ độ thật. ----
  const heritage: [number, number][] = [[0, 30], [-125, 120], [150, 70], [-55, 215], [95, 205], [-250, 25], [240, 5]];
  const heritageSites = heritage.map(([x, z], i) => ({ x, y: Math.max(height(x, z), LEDGE.y * (i === 0 ? 1 : 0)) + 1.5, z, delay: i * 1.8 }));
  world.add(createMotes({ sites: heritageSites, perSite: 14, rise: 48, size: 13, spread: 1.6, color: "#ffd9a0", seed: 31, visible: () => clock.near("di-san"), elapsed: () => clock.elapsed("di-san") }));

  // ---- cây, cỏ, đá ----
  await world.yield();
  const wide = { x0: -400, x1: 400, z0: -320, z1: 440 };
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 0.9 && clearOfCam(x, z, h, 8) ? h : null;
  };
  // rừng phủ chân núi và đỉnh núi đá vôi; sườn dốc thì để trơ đá
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(900 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null || slopeAt(x, z) > 0.55) return null;
        if (Math.abs(x - LEDGE.x) < 11 && z > PATH_FOOT - 10 && z < LEDGE.z + 14) return null;
        return y > 6 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.5 ? y - 0.3 : null;
      },
      scale: [1.0, 1.9],
      dark: "#17301a",
      light: "#5a8a3a",
      seed: 71,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 240,
      count: Math.round(900 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null || slopeAt(x, z) > 0.7) return null;
        if (Math.abs(x - LEDGE.x) < 6 && z > PATH_FOOT - 10 && z < LEDGE.z + 14) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#22391c",
      light: "#6f9244",
      seed: 72,
    }),
  );
  await world.yield();
  world.add(
    createRocks({
      quality: q,
      count: Math.round(260 * q.density),
      area: { x0: -300, x1: 300, z0: -200, z1: 320 },
      accept: (x, z) => {
        const h = height(x, z);
        const s = slopeAt(x, z);
        if (h < 0.6 || s < 0.25 || s > 1.4 || !clearOfCam(x, z, h, 4)) return null;
        if (Math.abs(x - LEDGE.x) < 12 && z > PATH_FOOT - 10 && z < LEDGE.z + 16) return null;
        return h;
      },
      scale: [0.8, 3.2],
      stone: "#a79f8d",
      moss: "#667c3e",
      seed: 73,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(7000 * q.density),
      area: { x0: -300, x1: 300, z0: -250, z1: 120 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 0.7 || h > 8 || slopeAt(x, z) > 0.3 || Math.abs(x - LEDGE.x) < 5 && z < LEDGE.z + 8 && z > PATH_FOOT - 6) return null;
        return fbm2(x * 0.05 + 11, z * 0.05, 3) > 0.42 ? h - 0.05 : null;
      },
      height: [0.45, 0.9],
      base: "#4e7a2a",
      tip: "#b2c860",
      seed: 74,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1800 * q.density),
      area: { x0: -300, x1: 300, z0: -190, z1: -50 },
      accept: (x, z) => {
        // lau sậy mép suối
        const h = height(x, z);
        return h > -0.6 && h < 0.8 && Math.abs(z - streamCenter(x)) < 20 ? h - 0.1 : null;
      },
      height: [1.1, 2.0],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 75,
    }),
  );

  await world.yield();
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 60 },
      radius: 520,
      spacing: 140,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => Math.pow(fbm2(a * 6 + l * 9.7, l * 3.1, 4), 1.5) * (110 + l * 60),
    }),
  );
};

export default setup;
