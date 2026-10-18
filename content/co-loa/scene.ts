import * as THREE from "three";
import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter } from "@/core/world/props";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createBolt } from "./actors/bolt";
import { createWalls } from "./actors/walls";
import config from "./scene.config";
import { BOUNDS, colorize, height, outsideCity, paddyCell, riverCenter, wallDistance, WALLS, WATER } from "./terrain";

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(257);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);

  // ---- đất, hào, sông ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#244638", shallow: "#6a8458" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 0 }, { x: 260, y: 30, z: 260 }));

  // ---- đắp thành: người xem kéo; ba vòng lên lần lượt từ trong ra ngoài ----
  const BEAT = world.beat("dap-thanh");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    target.built += ((ctx.inputs.dap ?? 0) - target.built) * w;
  });

  // ---- hoạt cảnh: mỗi phân cảnh có đồng hồ riêng, diễn trong lúc người xem dừng đọc ----
  const clock = createBeatClock(world, ["au-lac", "dap-thanh", "ba-vong-thanh", "no-than", "my-chau", "mat-nuoc", "bac-thuoc"]);
  /** Giây kể từ khi người xem kéo xong thanh đắp thành (Kim Quy hiện lên). */
  const sinceBuilt = (ctx: FrameCtx) => (ctx.completedAt.dap ? (ctx.now - ctx.completedAt.dap) / 1000 : -1);
  const KQ_TRIP = 6;

  // Ba vòng thành: vệt sáng vàng lần lượt chạy hết vòng ngoài → giữa → trong (độ dài tương ứng ~8 / 6,5 / 1,6 km);
  // khi Kim Quy tới nơi, cả ba vòng loé sáng một lúc.
  const TRACE = [
    [0.4, 3.0],
    [3.6, 2.6],
    [6.4, 1.6],
  ];
  const TRACE_LOOP = 11;
  const kqFlash = (ctx: FrameCtx) => {
    const s = sinceBuilt(ctx) - KQ_TRIP;
    return s < 0 ? 0 : smoothstep(0, 0.4, s) * (1 - smoothstep(1.2, 2.6, s)) * Math.max(clock.near("dap-thanh"), clock.near("ba-vong-thanh"));
  };
  world.add(
    createWalls({
      walls: WALLS,
      height,
      quality: q,
      // k = 0 ngoài, 1 giữa, 2 trong → vòng trong lên trước
      built: (k, ctx) => smoothstep((2 - k) * 0.28, (2 - k) * 0.28 + 0.44, ctx.params.built),
      traceHead: (k, ctx) => {
        if (kqFlash(ctx) > 0) return 1;
        const tau = clock.elapsed("ba-vong-thanh") % TRACE_LOOP;
        return clamp((tau - TRACE[k][0]) / TRACE[k][1]);
      },
      traceOn: (k, ctx) => {
        const tau = clock.elapsed("ba-vong-thanh") % TRACE_LOOP;
        const loop = tau > TRACE[k][0] ? 1 - smoothstep(9.4, 10.8, tau) : 0;
        return Math.max(kqFlash(ctx), loop * clock.near("ba-vong-thanh"));
      },
      wear: (ctx) => ctx.params.wear,
    }),
  );

  // Rùa Vàng (Kim Quy) giúp đắp thành: một đốm sáng vàng từ sông phía đông lướt vào giữa thành rồi tan.
  world.add(
    createCrowd({
      glow: true,
      size: 16,
      height: (x, z) => Math.max(height(x, z), WATER) + 10,
      groups: [{ path: [[322, -20], [250, -12], [130, 12], [14, 34]], count: 1, color: "#ffcf6a" }],
      progress: (ctx) => clamp(sinceBuilt(ctx) / KQ_TRIP),
      visible: (ctx) => {
        const s = sinceBuilt(ctx);
        return s < 0 ? 0 : smoothstep(0, 0.5, s) * (1 - smoothstep(KQ_TRIP, KQ_TRIP + 1.2, s)) * Math.max(clock.near("dap-thanh"), clock.near("ba-vong-thanh"));
      },
    }),
  );

  // Từ Văn Lang đến Âu Lạc: người Âu Việt từ miền núi phía bắc, người Lạc Việt từ đồng bằng phía nam
  // cùng đổ về Phong Khê, tới nơi thì hoà làm một màu.
  const AU_LAC = 11;
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 21,
      groups: [
        { path: [[-300, 300], [-180, 170], [-60, 60], [0, 18]], count: 70, spread: [26, 34], color: "#a8552c", arrive: "#7a4a22" },
        { path: [[90, -340], [60, -220], [26, -90], [4, 14]], count: 70, spread: [26, 34], color: "#2c4a6a", arrive: "#7a4a22", timing: [[0.05, 0], [1, 1]] },
      ],
      progress: () => clamp(clock.elapsed("au-lac") / AU_LAC),
      visible: () => clock.near("au-lac"),
    }),
  );

  // Nỏ thần: quân Triệu Đà từ phía bắc kéo xuống dọc sông, tới bãi ngoài thành, một phát nỏ từ mặt thành hạ cả đám giữa đội hình,
  // số còn lại rút lui — lặp lại từng đợt ("nhiều lần đem quân sang đánh nhưng không thắng").
  const WAVE = 10;
  const wave = (ctx: FrameCtx) => clock.elapsed("no-than") % WAVE;
  world.add(
    createCrowd({
      size: 3,
      height,
      seed: 31,
      groups: [{ path: [[276, 330], [272, 260], [266, 186]], count: 150, spread: [40, 30], color: "#2a2320", mortal: true }],
      progress: (ctx) => {
        const tau = wave(ctx);
        return smoothstep(0.3, 4.0, tau) * (1 - smoothstep(5.8, 9.4, tau));
      },
      fall: (ctx) => 0.5 * smoothstep(4.5, 5.3, wave(ctx)),
      visible: (ctx) => {
        const tau = wave(ctx);
        return clock.near("no-than") * clamp(tau / 0.6) * clamp((WAVE - tau) / 0.6);
      },
    }),
  );
  world.add(
    createBolt({
      from: new THREE.Vector3(200, height(200, 131) + WALLS[0].height + 1.5, 131),
      to: new THREE.Vector3(268, height(268, 202) + 1, 202),
      arc: 12,
      phase: (ctx) => (clock.near("no-than") > 0.5 ? (wave(ctx) - 3.6) / 0.9 : -1),
    }),
  );

  // Mỵ Châu – Trọng Thủy: đoàn người phương bắc vào thành tới chỗ Mỵ Châu, ở lại một thời gian, rồi theo
  // Trọng Thủy về bắc — mang theo một đốm sáng vàng (lẫy nỏ đã bị đánh tráo). Mỵ Châu (chấm son) ở lại.
  const MY_CHAU = 17;
  const north: [number, number][] = [[40, 340], [34, 250], [22, 130], [14, 46], [12, 36]];
  const roundTrip: [number, number][] = [...north, ...north.slice(0, -1).reverse()];
  const stay: [number, number][] = [[0, 0], [0.34, 0.5], [0.6, 0.5], [0.94, 1]];
  world.add(
    createCrowd({
      size: 11,
      height,
      seed: 41,
      groups: [
        { path: [[8, 33], [8.2, 33]], count: 1, color: "#b8322a", size: 1.3 },
        { path: roundTrip, count: 1, color: "#e8e2d4", size: 1.3, timing: stay, show: [0, 0.97] },
        { path: roundTrip, count: 7, spread: [14, 24], color: "#c9c2b2", timing: stay, show: [0, 0.97] },
      ],
      progress: () => clamp(clock.elapsed("my-chau") / MY_CHAU),
      visible: () => clock.near("my-chau"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => height(x, z) + 9,
      groups: [{ path: [...north].reverse(), count: 1, color: "#ffd27a", timing: [[0.6, 0], [0.94, 1]], show: [0.6, 0.97] }],
      progress: () => clamp(clock.elapsed("my-chau") / MY_CHAU),
      visible: () => clock.near("my-chau"),
    }),
  );

  // Mất nước: quân Triệu tràn vào thành, phát nỏ mất linh rơi giữa đường; vua cùng Mỵ Châu chạy về nam,
  // lông ngỗng rắc dọc đường, quân đuổi lần theo; cuối đường, ánh vàng của Rùa Vàng hiện lên.
  const MAT_NUOC = 18;
  const flee: [number, number][] = [[14, 30], [4, -40], [-18, -150], [-34, -230], [-44, -290]];
  const fleeTiming: [number, number][] = [[0.3, 0], [0.82, 1]];
  const lost = (ctx: FrameCtx) => clamp(clock.elapsed("mat-nuoc") / MAT_NUOC);
  world.add(
    createCrowd({
      size: 2.6,
      height,
      seed: 51,
      groups: [
        { path: [[-70, 345], [-40, 250], [0, 130], [10, 62]], count: 170, spread: [50, 44], color: "#2a2320", timing: [[0, 0], [0.45, 1]] },
        { path: [[90, 345], [60, 250], [28, 130], [18, 64]], count: 120, spread: [40, 36], color: "#2a2320", timing: [[0.05, 0], [0.5, 1]] },
        { path: flee, count: 26, spread: [10, 16], color: "#2a2320", timing: [[0.46, 0], [0.98, 0.86]], show: [0.46, 1.1] },
      ],
      progress: lost,
      visible: () => clock.near("mat-nuoc"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 0.6,
      height: (x, z) => height(x, z) + 1.6,
      seed: 52,
      groups: [
        { path: flee, count: 2, spread: [3, 2], color: "#ffd27a", timing: fleeTiming },
        { path: flee, count: 46, color: "#f4efe4", drop: true, size: 0.45, timing: fleeTiming },
        { path: [[-44, -296], [-44, -295]], count: 1, color: "#ffcf6a", size: 22, show: [0.84, 1.1] },
      ],
      progress: lost,
      visible: () => clock.near("mat-nuoc"),
    }),
  );
  world.add(
    createBolt({
      from: new THREE.Vector3(14, height(14, 74) + WALLS[2].height + 1.5, 74),
      to: new THREE.Vector3(-14, height(-14, 210) + 1, 210),
      arc: 14,
      fizzle: true,
      phase: (ctx) => (clock.near("mat-nuoc") > 0.5 ? (clock.elapsed("mat-nuoc") - 3.2) / 1.3 : -1),
    }),
  );

  // Hơn một nghìn năm: về đêm, đuốc của quân cai trị thắp dần trên khắp ba vòng thành, từ trong ra ngoài.
  const garrison: FireSite[] = WALLS.flatMap((w, k) => {
    const count = [18, 14, 9][k];
    return Array.from({ length: count }, (_, i) => {
      const [x, z] = w.at((i / count) * Math.PI * 2 + k);
      return { x, y: height(x, z) + w.height + 0.4, z, order: (2 - k) * 0.3 + (i / count) * 0.28, size: 0.8 };
    });
  });
  world.add(
    createFires({
      sites: garrison,
      perSite: 5,
      size: 1.2,
      lit: (ctx) => clock.near("bac-thuoc") * clamp(clock.elapsed("bac-thuoc") / 7),
    }),
  );

  // ---- vườn, tre làng trong và quanh thành (không dựng nhà: chưa đủ tư liệu hình dáng nhà thời Âu Lạc) ----
  const clearOfWalls = (x: number, z: number) => WALLS.every((w, k) => Math.abs(wallDistance(k, x, z)) > w.base * 0.5 + 12);
  // bãi ven sông ngoài thành, nơi quân giặc kéo tới trong phân cảnh "Nỏ thần": để trống cho thấy rõ đội quân
  const battlefield = (x: number, z: number) => x > 215 && x < 305 && z > 150 && z < 345;
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 1.2 && clearOfWalls(x, z) && clearOfCam(x, z, h) && !battlefield(x, z) ? h : null;
  };
  const hamlets = scatter(14, rand, { x0: -230, x1: 250, z0: -230, z1: 240 }, (x, z) => {
    const y = dry(x, z);
    return y !== null && Math.abs(x - riverCenter(z)) > 40 ? y : null;
  }, 45);
  const around = (r0: number, r1: number, n: number) =>
    hamlets.flatMap((v) =>
      Array.from({ length: n }, () => {
        const a = rand() * Math.PI * 2;
        const r = r0 + rand() * (r1 - r0);
        const x = v.x + Math.cos(a) * r;
        const z = v.z + Math.sin(a) * r;
        return { x, y: height(x, z) - 0.15, z, rotY: rand() * 6.28, scale: 0.85 + rand() * 0.3 };
      }),
    ).filter((p) => clearOfWalls(p.x, p.z));
  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...around(5, 14, 5), ...scatter(Math.round(90 * q.density), rand, { x0: -340, x1: 340, z0: -340, z1: 340 }, dry, 8)], {
      quality: q,
      recenter: true,
      shadow: q.shadows,
      sway: 0.0035,
      tint: 0.25,
      maxDistance: 340,
    }),
    createProps("cay_cau", around(6, 12, 3), { quality: q, recenter: true, shadow: q.shadows, sway: 0.003, tint: 0.2 }),
    createProps("bui_chuoi", around(4, 10, 2), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
  ]);
  for (const a of actors) world.add(a);
  const smoke = createSmoke({ sources: hamlets.map((v) => ({ x: v.x + 2, y: v.y + 3, z: v.z })), height: 16, wind: [0.9, 0.3] });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.village > 0.3;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  await world.yield();
  // ---- cây, lúa, cỏ, chim ----
  const wide = { x0: -350, x1: 350, z0: -350, z1: 350 };
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(700 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null) return null;
        // cây mọc thành lùm, rừng trên đồi phía bắc
        return y > 8 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.56 ? y - 0.3 : null;
      },
      scale: [1.0, 1.8],
      dark: "#18301a",
      light: "#58833a",
      seed: 81,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 280,
      count: Math.round(900 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        return y !== null && fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 82,
    }),
  );
  await world.yield();
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.2 || h > 4.5 || !outsideCity(x, z) || nearCam(x, z, 16) || Math.abs(x - riverCenter(z)) < 40) return null;
    const c = paddyCell(x, z);
    if (c < 0.4 || (ripe ? c < 0.72 : c >= 0.72)) return null;
    const fx = Math.abs((x / 11) % 1);
    const fz = Math.abs((z / 9) % 1);
    return fx < 0.08 || fz < 0.1 ? null : h - 0.02;
  };
  world.add(createGrass({ quality: q, count: Math.round(8000 * q.density), area: wide, accept: paddy(false), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 83 }));
  world.add(createGrass({ quality: q, count: Math.round(3000 * q.density), area: wide, accept: paddy(true), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 84 }));
  // cỏ trên mặt thành & ven hào
  world.add(
    createGrass({
      quality: q,
      count: Math.round(5000 * q.density),
      area: { x0: -280, x1: 280, z0: -280, z1: 280 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 0.4 || h > 6 || nearCam(x, z, 12) || outsideCity(x, z)) return null;
        return fbm2(x * 0.07, z * 0.07, 3) > 0.45 ? h - 0.05 : null;
      },
      height: [0.5, 1.0],
      base: "#5a8436",
      tip: "#b4c46a",
      seed: 85,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(2500 * q.density),
      area: { x0: -300, x1: 350, z0: -300, z1: 300 },
      accept: (x, z) => {
        const h = height(x, z);
        // lau sậy mép hào, mép sông
        return h > -0.6 && h < 0.9 && !nearCam(x, z, 14) ? h - 0.1 : null;
      },
      height: [1.2, 2.2],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 86,
    }),
  );
  world.add(createBirds({ flocks: 2, perFlock: 7, center: { x: 0, y: 0, z: 0 }, radius: 140, altitude: [50, 80], seed: 13 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 0 },
        size: [560, 560],
        density: (ctx) => 1 - smoothstep(0.2, 2.0, ctx.params.mood) * 0.75,
        base: () => WATER,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 0 },
      radius: 480,
      spacing: 150,
      layers: 3,
      mood: world.mood,
      // đồng bằng mở về phía nam; phía bắc, tây bắc có núi (Tam Đảo, Ba Vì) mờ xa
      profile: (a, l) => smoothstep(-0.1, 0.5, Math.sin(a)) * Math.pow(fbm2(a * 5 + l * 11.3, l * 2.9, 4), 1.6) * (80 + l * 70),
    }),
  );
};

export default setup;
