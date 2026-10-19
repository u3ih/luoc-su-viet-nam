import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGlows } from "@/core/world/glows";
import { createGrass } from "@/core/world/grass";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createMidden, MOUND_HEIGHT, THICK } from "./actors/midden";
import { createMotes } from "./actors/motes";
import { MOUND, MOUND_Y } from "./places";
import config from "./scene.config";
import { BOUNDS, SEA, SEA_DROP, SITES, colorize, height, riverZ, slopeAt } from "./terrain";

type Pt = [number, number];

// Văn hoá Quỳnh Văn — cảnh CÁCH ĐIỆU. Mỗi phân cảnh một hoạt cảnh riêng, chạy theo đồng hồ phân cảnh (createBeatClock) trong lúc người
// xem dừng đọc. Nguyên tắc: chỉ minh hoạ phần lời kể có nguồn; người vẽ bằng chấm dáng đứng (không trang phục, công cụ, nhà ở, thuyền),
// công cụ đá, xương, gốm KHÔNG được vẽ (chỉ đốm sáng đánh dấu); di cốt không được vẽ — chỉ gợi bằng ánh sáng.
// Mọi vị trí, số lượng, thời lượng trong hoạt cảnh là minh hoạ, được ghi chú trong TODO của story.md.

const SURVEY = "#d6e4ec";
const WALKER = "#f0e0bc";
const GLOW = "#ffd9a0";
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...[...pts].reverse().slice(1)];

/** Độ cao đáy cồn và đỉnh cồn (xem actors/midden.ts). */
const GROUND = MOUND_Y - 0.15;
const TOP_Y = GROUND + MOUND_HEIGHT - 0.0;

const BEATS = ["vinh-xua", "phat-hien", "con-so", "nhuyen-the", "do-dung", "mo-tang", "nien-dai", "hom-nay"];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const { clearOfCam } = cameraClearance(config.keyframes);
  const clock = createBeatClock(world, BEATS);
  /** Mực biển: hạ dần ở phân cảnh cuối (tham số `sea` do đồng hồ phân cảnh điều khiển bên dưới). */
  const level = (ctx: FrameCtx) => SEA - SEA_DROP * ctx.params.sea;

  // ---- đất, biển ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: level, cheap: q.cheapShaders }));
  world.add(
    createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#2a5350", shallow: "#8c9b76" } }),
  );
  await world.yield();
  world.add(createDust(q.dust, { x: -40, y: 0, z: 0 }, { x: 300, y: 40, z: 300 }));

  // ---- tương tác: kéo cho lớp vỏ chồng dần lên (phân cảnh "con-so") ----
  const BEAT_SHELL = world.beat("con-so");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT_SHELL));
    target.shell += ((ctx.inputs.shell ?? 0) - target.shell) * w;
    // phân cảnh cuối: nước biển hạ dần theo thời gian đứng đọc, về 0 khi rời đi
    target.sea = smoothstep(2, 28, clock.elapsed("hom-nay"));
  });

  // ---- cồn vỏ sò minh hoạ (xem actors/midden.ts) ----
  const midden = createMidden({
    x: MOUND[0],
    z: MOUND[1],
    groundY: GROUND,
    radius: [44, 38],
    progress: (ctx) => ctx.params.shell,
    highlight: (ctx) => {
      const swept = ctx.completedAt.shell ? clamp((ctx.now - ctx.completedAt.shell) / 1000 / 9) : 0;
      const s = clock.near("con-so") * (swept > 0 && swept < 1 ? 1 : 0);
      if (s > 0.01) return { center: swept * 1.1 - 0.05, width: 0.2 * s };
      const grave = clock.near("mo-tang");
      if (grave > 0.01) return { center: 0.5, width: 0.36 * grave };
      return { center: 0, width: 0 };
    },
  });
  world.add(midden);
  /** Điểm trên sườn cồn: lớp l (0 = đáy), góc a (rad) — để đặt đốm sáng. */
  const slope = (l: number, a: number): [number, number, number] => {
    const [ax, az] = midden.radiusAt(l + 0.5); // bán kính giữa tấm l
    return [MOUND[0] + Math.cos(a) * ax, GROUND + l * THICK + THICK * 0.6, MOUND[1] + Math.sin(a) * az];
  };

  // ---- hoạt cảnh 1 · vinh-xua: các địa điểm quanh vịnh lần lượt sáng lên — mỗi đốm là một địa điểm văn hoá Quỳnh Văn
  //      (diễn hoạ; số lượng và vị trí đốm không phản ánh số liệu thật). Cồn Quỳnh Văn sáng đầu tiên, lớn hơn. ----
  const siteY = SITES.map(([x, z], i) => (i === 0 ? TOP_Y + 3 : height(x, z) + 3));
  world.add(
    createGlows({
      count: SITES.length,
      color: GLOW,
      size: (i) => (i === 0 ? 11 : 7),
      minPx: 20,
      place: (i, ctx, out) => {
        out.set(SITES[i][0], siteY[i], SITES[i][1]);
        const on = smoothstep(0.4 + i * 0.5, 1.6 + i * 0.5, clock.elapsed("vinh-xua"));
        return on * (i === 0 ? 1 : 0.75);
      },
      visible: () => clock.near("vinh-xua"),
    }),
  );

  // ---- hoạt cảnh 2 · phat-hien: đoàn khảo sát (chấm xanh nhạt) từ đất liền tới cồn; đến nơi thì dấu mốc sáng bừng trên đỉnh cồn ----
  world.add(
    createCrowd({
      size: 4.4,
      height,
      seed: 41,
      groups: [{ path: [[-4, 118], [-30, 98], [-52, 74], [-68, 52]], count: 6, spread: [4, 8], color: SURVEY }],
      progress: () => clamp(clock.elapsed("phat-hien") / 16),
      visible: () => clock.near("phat-hien"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: "#ffd27a",
      size: 9,
      minPx: 26,
      place: (_i, ctx, out) => {
        out.set(MOUND[0], TOP_Y + 4, MOUND[1]);
        return smoothstep(12, 15, clock.elapsed("phat-hien"));
      },
      visible: () => clock.near("phat-hien"),
    }),
  );

  // ---- hoạt cảnh 3 · con-so: cồn lớn dần theo thanh kéo; kéo xong thì ánh sáng quét từ đáy lên đỉnh (xem highlight ở trên).
  //      Trong lúc chờ kéo: vài hạt sáng nhẹ ở chân cồn như vỏ mới bỏ lại (minh hoạ) ----
  const baseSites = [0.2, 1.6, 3.0, 4.4].map((a, i) => {
    const [x, , z] = slope(0, a);
    return { x: x + Math.cos(a) * 3, y: GROUND + 0.4, z: z + Math.sin(a) * 3, delay: 0.5 + i * 1.3 };
  });
  world.add(
    createMotes({
      sites: baseSites,
      perSite: 5,
      rise: 3,
      size: 1.1,
      spread: 1.4,
      color: "#efe6d2",
      seed: 51,
      visible: (ctx) => clock.near("con-so") * (1 - clamp(ctx.params.shell * 1.2)),
      elapsed: () => clock.elapsed("con-so"),
    }),
  );

  // ---- hoạt cảnh 4 · nhuyen-the: người ra bãi ven biển nhặt nhuyễn thể (đứng lại ở mép nước) rồi mang về; chấm sáng nhỏ (vỏ) rơi dọc
  //      đường về chân cồn ----
  const WALK = 26;
  const stay: [number, number][] = [[0, 0], [0.4, 0.5], [0.62, 0.5], [0.98, 1]];
  const walkP = () => (clock.elapsed("nhuyen-the") % WALK) / WALK;
  world.add(
    createCrowd({
      size: 4.2,
      height,
      seed: 61,
      groups: [
        { path: roundTrip([[-62, 36], [-42, 40], [-24, 43], [-12, 45]]), count: 7, spread: [10, 12], color: WALKER, timing: stay },
        { path: roundTrip([[-62, 16], [-42, 19], [-24, 22], [-12, 24]]), count: 5, spread: [8, 10], color: WALKER, timing: stay, show: [0.02, 1] },
      ],
      progress: walkP,
      visible: () => clock.near("nhuyen-the"),
    }),
  );
  world.add(
    createCrowd({
      size: 1.1,
      height,
      seed: 62,
      groups: [{ path: [[-12, 36], [-34, 34], [-56, 30]], count: 34, spread: [14, 0], color: "#efe6d2", drop: true, timing: [[0.52, 0], [0.97, 1]], show: [0.5, 1] }],
      progress: walkP,
      visible: () => clock.near("nhuyen-the"),
    }),
  );

  // ---- hoạt cảnh 5 · do-dung: bếp lửa bùng lên trên đỉnh cồn (gợi vết tích bếp trong lớp vỏ), khói bay; đốm sáng nơi tìm thấy đồ đá, xương,
  //      gốm trên sườn cồn lần lượt hiện (không vẽ hiện vật) ----
  const hearths: FireSite[] = [
    { x: MOUND[0] - 3, y: TOP_Y + 0.3, z: MOUND[1] + 2, order: 0.05, size: 1.5 },
    { x: MOUND[0] + 6, y: TOP_Y + 0.3, z: MOUND[1] - 3, order: 0.45, size: 1 },
    { x: MOUND[0] + 1, y: TOP_Y + 0.3, z: MOUND[1] + 7, order: 0.75, size: 1 },
  ];
  const lit = () => clock.near("do-dung") * smoothstep(0.5, 8, clock.elapsed("do-dung"));
  world.add(createFires({ sites: hearths, perSite: 9, size: 7, lit, glow: (ctx) => 0.35 + 0.65 * smoothstep(0.8, 1.9, ctx.params.mood) }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 24, height: 16, wind: [0.6, 0.4] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = lit() > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });
  const finds = [
    [2, 2.7], [3, 0.4], [3, 3.9], [4, 1.6], [4, 5.2], [5, 3.0],
  ].map(([l, a], i) => {
    const [x, y, z] = slope(l, a);
    return { x, y, z, delay: 2 + i * 1.6 };
  });
  world.add(createMotes({ sites: finds, perSite: 6, rise: 4, size: 2.3, spread: 0.9, color: GLOW, seed: 52, visible: () => clock.near("do-dung"), elapsed: () => clock.elapsed("do-dung") }));

  // ---- hoạt cảnh 6 · mo-tang: ánh sáng dịu bốc lên từ chín chỗ trên mặt cồn (không vẽ di cốt; số điểm gợi đợt khai quật 2025, vị trí là
  //      minh hoạ); các tấm giữa cồn được nhấn nhẹ (xem highlight) ----
  const graves = Array.from({ length: 9 }, (_, i) => {
    const gx = (i % 3) - 1;
    const gz = Math.floor(i / 3) - 1;
    return { x: MOUND[0] + gx * 4.6 + ((i * 7) % 3 - 1) * 0.6 - 2, y: TOP_Y + 0.2, z: MOUND[1] + gz * 4.2 + ((i * 5) % 3 - 1) * 0.5, delay: 1.2 + i * 1.6 };
  });
  world.add(createMotes({ sites: graves, perSite: 9, rise: 10, size: 2.8, spread: 0.6, color: "#fff1cf", seed: 53, visible: () => clock.near("mo-tang"), elapsed: () => clock.elapsed("mo-tang") }));

  // ---- hoạt cảnh 7 · nien-dai: ba giai đoạn (sớm, giữa, muộn) — ba cụm sáng lần lượt bừng lên ở ba địa điểm (vị trí là gợi ý) ----
  const stageSites = [
    { x: MOUND[0], y: TOP_Y + 1, z: MOUND[1], delay: 0.5 },
    { x: SITES[1][0], y: height(SITES[1][0], SITES[1][1]) + 2, z: SITES[1][1], delay: 8 },
    { x: SITES[2][0], y: height(SITES[2][0], SITES[2][1]) + 2, z: SITES[2][1], delay: 15.5 },
  ];
  world.add(createMotes({ sites: stageSites, perSite: 20, rise: 44, size: 20, spread: 3.5, color: GLOW, seed: 54, visible: () => clock.near("nien-dai"), elapsed: () => clock.elapsed("nien-dai") }));

  // ---- hoạt cảnh 8 · hom-nay: nước biển hạ dần, bãi lộ rộng ra, bờ lùi xa cồn (tham số `sea`); đoàn khảo sát đến cồn và hai điểm sáng
  //      đánh dấu hố khai quật (vị trí minh hoạ) ----
  world.add(
    createCrowd({
      size: 4.4,
      height,
      seed: 71,
      groups: [{ path: [[-6, 110], [-28, 96], [-48, 74], [-62, 54]], count: 5, spread: [4, 7], color: SURVEY }],
      progress: () => clamp(clock.elapsed("hom-nay") / 15),
      visible: () => clock.near("hom-nay"),
    }),
  );
  world.add(
    createMotes({
      sites: [
        { x: MOUND[0] + 7, y: TOP_Y + 0.2, z: MOUND[1] + 3, delay: 9 },
        { x: MOUND[0] + 11, y: TOP_Y - 0.4, z: MOUND[1] - 3, delay: 12 },
      ],
      perSite: 8,
      rise: 5,
      size: 1.4,
      spread: 1,
      color: "#fff1cf",
      seed: 55,
      visible: () => clock.near("hom-nay"),
      elapsed: () => clock.elapsed("hom-nay"),
    }),
  );

  // ---- sương mỏng trên vịnh lúc bình minh, chim biển ----
  world.add(
    createMist({
      center: { x: 150, y: 0, z: 0 },
      size: [700, 700],
      layers: 3,
      density: (ctx) => (q.cheapShaders ? 0 : Math.max(0.9 * (1 - smoothstep(0.4, 1.4, ctx.t)), clock.near("vinh-xua") * 0.5, clock.near("nien-dai") * 0.4)),
      base: (ctx) => level(ctx) + 1,
      mood: world.mood,
    }),
  );
  const birds = createBirds({ flocks: 2, perFlock: 6, center: { x: 150, y: 0, z: 0 }, radius: 150, altitude: [26, 52], seed: 17 });
  world.add({
    object: birds.object,
    update(ctx) {
      const on = Math.max(1 - smoothstep(0.5, 1.5, ctx.t), clock.near("vinh-xua"), clock.near("nien-dai"), clock.near("hom-nay"));
      birds.object!.visible = on > 0.15;
      if (birds.object!.visible) birds.update?.(ctx);
    },
  });

  // ---- cây, cỏ, lau sậy ----
  await world.yield();
  const farFromMound = (x: number, z: number, r: number) => Math.hypot((x - MOUND[0]) / 1.1, z - MOUND[1]) > r;
  const dry = (x: number, z: number, min = 2) => {
    const h = height(x, z);
    return h > min && farFromMound(x, z, 70) && Math.abs(z - riverZ(x)) > 24 && clearOfCam(x, z, h, 8) ? h : null;
  };
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(520 * q.density),
      area: { x0: -415, x1: -60, z0: -395, z1: 395 },
      accept: (x, z) => {
        const y = dry(x, z, 2.2);
        if (y === null || slopeAt(x, z) > 0.5) return null;
        return y > 7 || fbm2(x * 0.02 + 4, z * 0.02 - 2, 3) > 0.5 ? y - 0.3 : null;
      },
      scale: [1.0, 1.8],
      dark: "#1e3a20",
      light: "#5f8b3c",
      seed: 81,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 230,
      count: Math.round(700 * q.density),
      area: { x0: -400, x1: 120, z0: -395, z1: 395 },
      accept: (x, z) => {
        const y = dry(x, z, 1.8);
        if (y === null || slopeAt(x, z) > 0.6) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#2a4120",
      light: "#7a9a48",
      seed: 82,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(6500 * q.density),
      area: { x0: -400, x1: 60, z0: -300, z1: 300 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1.6 || h > 9 || slopeAt(x, z) > 0.3 || !farFromMound(x, z, 62)) return null;
        return fbm2(x * 0.05 + 11, z * 0.05, 3) > 0.42 ? h - 0.05 : null;
      },
      height: [0.4, 0.8],
      base: "#5a7f2c",
      tip: "#bccb6c",
      seed: 83,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1700 * q.density),
      area: { x0: -380, x1: 20, z0: -200, z1: -40 },
      accept: (x, z) => {
        // lau sậy hai bên cửa sông
        const h = height(x, z);
        return h > -0.4 && h < 1.3 && Math.abs(z - riverZ(x)) < 26 ? h - 0.1 : null;
      },
      height: [1.0, 1.9],
      blades: 9,
      base: "#7d7d46",
      tip: "#ecdca4",
      sway: 0.05,
      seed: 84,
    }),
  );

  await world.yield();
  world.add(
    createRanges({
      center: { x: -80, y: 0, z: 0 },
      radius: 520,
      spacing: 130,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => {
        // chỉ phía đất liền (tây); hướng biển (đông) để trống
        const w = smoothstep(0.15, -0.55, Math.cos(a));
        return w * Math.pow(fbm2(a * 6 + l * 9.7, l * 3.1, 4), 1.5) * (90 + l * 55);
      },
    }),
  );
};

export default setup;
