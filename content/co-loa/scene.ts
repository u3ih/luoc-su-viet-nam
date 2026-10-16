import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createDust } from "@/core/world/dust";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter } from "@/core/world/props";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
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
  world.add(
    createWalls({
      walls: WALLS,
      height,
      quality: q,
      // k = 0 ngoài, 1 giữa, 2 trong → vòng trong lên trước
      built: (k, ctx) => smoothstep((2 - k) * 0.28, (2 - k) * 0.28 + 0.44, ctx.params.built),
    }),
  );

  // ---- vườn, tre làng trong và quanh thành (không dựng nhà: chưa đủ tư liệu hình dáng nhà thời Âu Lạc) ----
  const clearOfWalls = (x: number, z: number) => WALLS.every((w, k) => Math.abs(wallDistance(k, x, z)) > w.base * 0.5 + 12);
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 1.2 && clearOfWalls(x, z) && clearOfCam(x, z, h) ? h : null;
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
