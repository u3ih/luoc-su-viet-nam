import * as THREE from "three";
import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createDust } from "@/core/world/dust";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter, type Placement } from "@/core/world/props";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createChildren } from "./actors/children";
import config from "./scene.config";
import { BOUNDS, colorize, height, HILL, KNOLL, mountainness, paddyCell, riverCenter } from "./terrain";

// Đảo đá vôi ngoài khơi: x, z, cao, bán kính
const KARST: [number, number, number, number][] = [
  [-140, -150, 34, 10], [-110, -210, 46, 13], [70, -265, 30, 9], [40, -190, 40, 12], [96, -230, 36, 11],
  [-170, -175, 30, 9], [150, -180, 28, 8], [-70, -275, 42, 12], [20, -290, 34, 10],
];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(2879);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);
  // gò bọc trăm trứng để trống: không cây, không bụi che quầng sáng
  const offKnoll = (x: number, z: number) => (x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 > 30 ** 2;

  // ---- đất & nước ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => 0, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => 0, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#123b44", shallow: "#5f8c74" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 20 }, { x: 200, y: 40, z: 220 }));

  // ---- bọc trăm trứng: người xem kéo để chia con ----
  const BEAT = world.beat("chia-con");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    target.spread += ((ctx.inputs.chia ?? 0) - target.spread) * w;
  });
  const knollY = height(KNOLL.x, KNOLL.z);
  const mountain: THREE.Vector3[] = [];
  const sea: THREE.Vector3[] = [];
  for (let i = 0; mountain.length < 50 && i < 4000; i++) {
    const x = -220 + rand() * 440;
    const z = 140 + rand() * 130;
    const h = height(x, z);
    if (h > 28) mountain.push(new THREE.Vector3(x, h + 3 + rand() * 4, z));
  }
  for (let i = 0; sea.length < 50 && i < 4000; i++) {
    const x = -200 + rand() * 400;
    const z = -95 - rand() * 90;
    if (height(x, z) < -3) sea.push(new THREE.Vector3(x, 2 + rand() * 4, z));
  }
  world.add(
    createChildren({
      center: new THREE.Vector3(KNOLL.x, knollY + 6.5, KNOLL.z),
      mountain,
      sea,
      orb: (ctx) => ctx.params.orb,
      spread: (ctx) => ctx.params.spread,
      glow: (ctx) => ctx.params.glow,
    }),
  );

  // ---- đạo cụ ----
  const plain = (minH: number, maxH: number) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < minH || h > maxH || !clearOfCam(x, z, h)) return null;
    if ((x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 < 22 ** 2) return null;
    return h - 0.2;
  };
  // làng thời Văn Lang: chỉ gợi bằng khói bếp và vườn cau, tre — không dựng nhà (chưa có tư liệu hình dáng nhà
  // đủ chắc để vẽ lại; nhà sàn trên trống đồng chỉ là hình khắc cách điệu)
  const hamlets: Placement[] = scatter(9, rand, { x0: -150, x1: 150, z0: -10, z1: 120 }, (x, z) => {
    const h = height(x, z);
    if (h < 2.2 || h > 7 || mountainness(x, z) > 0.2 || Math.abs(x - riverCenter(z)) < 26) return null;
    return clearOfCam(x, z, h) && (x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 > 40 ** 2 ? h : null;
  }, 40);
  const around = (r0: number, r1: number, n: number) =>
    hamlets.flatMap((v) =>
      Array.from({ length: n }, () => {
        const a = rand() * Math.PI * 2;
        const r = r0 + rand() * (r1 - r0);
        const x = v.x + Math.cos(a) * r;
        const z = v.z + Math.sin(a) * r;
        return { x, y: height(x, z) - 0.15, z, rotY: rand() * 6.28, scale: 0.85 + rand() * 0.3 };
      }),
    );
  const karst: Placement[][] = [[], [], []];
  KARST.forEach(([x, z, h, r], i) => karst[i % 3].push({ x, y: -9, z, rotY: rand() * 6.28, scale: [r * 2.4, h + 9, r * 2.4] }));

  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...around(4, 12, 4), ...scatter(Math.round(110 * q.density), rand, { x0: -200, x1: 200, z0: -40, z1: 140 }, plain(2, 9), 6)], {
      quality: q,
      recenter: true,
      shadow: q.shadows,
      sway: 0.0035,
      tint: 0.25,
      maxDistance: 320,
    }),
    createProps("cay_cau", around(5, 11, 3), { quality: q, recenter: true, shadow: q.shadows, sway: 0.003, tint: 0.2 }),
    createProps("bui_chuoi", around(4, 9, 2), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
    ...karst.map((list, i) => createProps("nui_da_voi", list, { quality: q, filter: (n) => n === `da_voi_${i}` || n === `da_voi_${i}_cay`, filterId: `da_voi_${i}`, recenter: true, tint: 0.2 })),
  ]);
  for (const a of actors) world.add(a);

  // khói bếp các làng: hiện khi kể tới nước Văn Lang
  const smoke = createSmoke({ sources: hamlets.map((v) => ({ x: v.x + 2, y: v.y + 3, z: v.z })), height: 16, wind: [0.8, 0.4] });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.village > 0.3;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  await world.yield();
  // ---- rừng núi, cỏ, lúa, đá ----
  const wide = { x0: -310, x1: 310, z0: -80, z1: 300 };
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(1500 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 6 || h > 80 || !offKnoll(x, z) || !clearOfCam(x, z, h) || slopeAt(x, z) > 1.1) return null;
        const hill = (x - HILL.x) ** 2 + (z - HILL.z) ** 2 < (HILL.r * 1.2) ** 2;
        return hill || mountainness(x, z) > 0.25 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.5 ? h - 0.3 : null;
      },
      scale: [1.0, 2.0],
      dark: "#16301a",
      light: "#56843a",
      seed: 61,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(1200 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1.2 || h > 40 || !offKnoll(x, z) || !clearOfCam(x, z, h)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.47 ? h - 0.2 : null;
      },
      scale: [0.5, 1.2],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 62,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "palm",
      count: Math.round(60 * q.density),
      area: { x0: -260, x1: 260, z0: -90, z1: -30 },
      accept: (x, z) => {
        const h = height(x, z);
        return h > 0.6 && h < 3 && !nearCam(x, z) ? h - 0.2 : null;
      },
      scale: [0.8, 1.2],
      dark: "#3d5a24",
      light: "#a4b85a",
      shadow: q.shadows,
      seed: 63,
    }),
  );
  await world.yield();
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.6 || h > 5.4 || nearCam(x, z, 16) || mountainness(x, z) > 0.1 || Math.abs(x - riverCenter(z)) < 24) return null;
    if ((x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 < 18 ** 2) return null;
    const c = paddyCell(x, z);
    if (c < 0.4 || (ripe ? c < 0.72 : c >= 0.72)) return null;
    const fx = Math.abs((x / 10) % 1);
    const fz = Math.abs((z / 8) % 1);
    return fx < 0.08 || fz < 0.1 ? null : h - 0.02;
  };
  const fields = { x0: -240, x1: 240, z0: -30, z1: 160 };
  world.add(createGrass({ quality: q, count: Math.round(7000 * q.density), area: fields, accept: paddy(false), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 71 }));
  world.add(createGrass({ quality: q, count: Math.round(2500 * q.density), area: fields, accept: paddy(true), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 72 }));
  world.add(
    createGrass({
      quality: q,
      count: Math.round(6000 * q.density),
      area: { x0: -200, x1: 200, z0: -70, z1: 160 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1 || h > 12 || nearCam(x, z, 14)) return null;
        // trên gò chỉ cỏ thấp lưa thưa
        return fbm2(x * 0.06, z * 0.06, 3) > (offKnoll(x, z) ? 0.42 : 0.6) ? h - 0.05 : null;
      },
      height: [0.5, 1.0],
      base: "#5a8436",
      tip: "#b4c46a",
      seed: 73,
    }),
  );
  world.add(
    createRocks({
      quality: q,
      count: Math.round(420 * q.density),
      area: { x0: -300, x1: 300, z0: -110, z1: 300 },
      accept: (x, z) => {
        const h = height(x, z);
        if (nearCam(x, z)) return null;
        return (h > -1.5 && h < 1.2 && z < -30) || (slopeAt(x, z) > 0.55 && h > 8) ? h : null;
      },
      scale: [0.4, 2.6],
      seed: 74,
    }),
  );
  world.add(createBirds({ flocks: 3, perFlock: 7, center: { x: -20, y: 0, z: 150 }, radius: 110, altitude: [70, 100], seed: 9 }));

  await world.yield();
  // ---- sương, núi xa ----
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 60 },
        size: [520, 560],
        density: (ctx) => 1 - smoothstep(0.3, 2.0, ctx.params.mood) * 0.7,
        base: () => 0.5,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 40 },
      radius: 460,
      spacing: 140,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => {
        // phía bắc (z dương) núi trùng điệp; phía nam để trống thành chân trời biển
        const land = smoothstep(-0.25, 0.25, Math.sin(a));
        return land * Math.pow(fbm2(a * 6 + l * 13.1, l * 3.7, 4), 1.5) * (110 + l * 60);
      },
    }),
  );
};

export default setup;
