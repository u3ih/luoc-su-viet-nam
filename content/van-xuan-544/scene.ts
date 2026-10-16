import * as THREE from "three";
import { clamp, easeInOut, lerp, mulberry32, smoothstep } from "@/core/engine/math";
import { MOOD } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter } from "@/core/world/props";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createCanoes } from "./actors/canoes";
import config from "./scene.config";
import { BOUNDS, CAMP, colorize, height, ISLAND, WATER } from "./terrain";

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(544);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);

  // ---- đầm ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  // nước đầm: sẫm, phẳng lặng, ánh xanh rêu
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#1d3326", shallow: "#4e6440", foam: "#cfc6a0" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 0 }, { x: 260, y: 20, z: 260 }));

  // ---- đêm xuống (người xem kéo), rồi thuyền độc mộc đánh úp trại giặc ----
  const BEAT = world.beat("da-trach");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    const night = ctx.inputs.dem ?? 0;
    target.mood = lerp(target.mood, lerp(MOOD.overcast, MOOD.night, night), w);
    target.camp = Math.max(target.camp, lerp(0.5, 0.8, night) * w);
    const done = ctx.completedAt.dem;
    if (done) {
      const since = ctx.now - done;
      const after = smoothstep(BEAT - 0.6, BEAT - 0.1, ctx.t);
      target.raid = Math.max(target.raid, easeInOut(clamp((since - 800) / 12000)) * after);
      target.camp = Math.max(target.camp, (0.8 + smoothstep(4000, 7000, since) * 0.2) * after);
    }
  });
  const from = new THREE.Vector3(ISLAND.x, 0, ISLAND.z);
  const to = new THREE.Vector3(CAMP.x - 30, 0, CAMP.z);
  world.add(createCanoes({ count: q.lite ? 6 : 10, from, to, raid: (ctx) => ctx.params.raid }));

  // trại quân Lương: lửa trại, khói (không dựng lều trại: chưa có tư liệu hình dáng đủ chắc)
  const sites: FireSite[] = [];
  for (let i = 0; sites.length < 16 && i < 400; i++) {
    const x = CAMP.x - 10 + (rand() - 0.5) * 70;
    const z = CAMP.z + (rand() - 0.5) * 90;
    const h = height(x, z);
    if (h < 1.6 || sites.some((s) => (s.x - x) ** 2 + (s.z - z) ** 2 < 100)) continue;
    sites.push({ x, y: h + 0.2, z, order: rand(), size: 1 + rand() * 0.8 });
  }
  world.add(createFires({ sites, lit: (ctx) => ctx.params.camp, size: 1.6, glow: (ctx) => 0.3 + smoothstep(1.5, 3, ctx.params.mood) * 0.7 }));
  const smoke = createSmoke({ sources: sites.slice(0, 6).map((s) => ({ x: s.x, y: s.y + 2, z: s.z })), height: 22, wind: [-0.8, 0.3], color: "#a8a094" });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.camp > 0.4;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  // ---- lau sậy: thứ che chở nghĩa quân ----
  await world.yield();
  const marsh = { x0: -330, x1: 330, z0: -330, z1: 330 };
  const reedAt = (minH: number, maxH: number) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < minH || h > maxH || nearCam(x, z, 12)) return null;
    // chừa lạch nước cho thuyền
    if (Math.abs(z - ISLAND.z) < 14 && x > ISLAND.x + 40 && x < CAMP.x - 40) return null;
    return h - 0.1;
  };
  world.add(createGrass({ quality: q, count: Math.round(14000 * q.density), area: marsh, accept: reedAt(-0.9, 1.2), height: [1.8, 3.2], blades: 9, base: "#6e7440", tip: "#e2d39a", sway: 0.06, seed: 101 }));
  world.add(createGrass({ quality: q, count: Math.round(5000 * q.density), area: marsh, accept: reedAt(-1.4, 0.2), height: [1.4, 2.2], blades: 7, base: "#4f6a34", tip: "#a9bb6a", sway: 0.08, seed: 102 }));

  // bãi giữa đầm: tre, chuối, cây; bờ đất: cây rừng
  const isle = (x: number, z: number) => {
    const h = height(x, z);
    return h > 1.4 && (x - ISLAND.x) ** 2 + (z - ISLAND.z) ** 2 < ISLAND.r ** 2 && clearOfCam(x, z, h) ? h - 0.2 : null;
  };
  const shore = (x: number, z: number) => {
    const h = height(x, z);
    return h > 2 && clearOfCam(x, z, h) && (x - CAMP.x) ** 2 + (z - CAMP.z) ** 2 > 60 * 60 ? h - 0.2 : null;
  };
  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...scatter(Math.round(30 * q.density) + 8, rand, { x0: -70, x1: 30, z0: -40, z1: 60 }, isle, 6), ...scatter(Math.round(70 * q.density), rand, marsh, shore, 10)], {
      quality: q,
      recenter: true,
      shadow: q.shadows,
      sway: 0.0035,
      tint: 0.25,
      maxDistance: 340,
    }),
    createProps("bui_chuoi", scatter(10, rand, { x0: -70, x1: 30, z0: -40, z1: 60 }, isle, 5), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
  ]);
  for (const a of actors) world.add(a);
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(700 * q.density),
      area: marsh,
      accept: (x, z) => {
        const y = shore(x, z) ?? isle(x, z);
        return y !== null && fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.45 ? y - 0.1 : null;
      },
      scale: [1.0, 1.8],
      dark: "#18301a",
      light: "#58833a",
      seed: 103,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "palm",
      count: Math.round(50 * q.density),
      area: marsh,
      accept: (x, z) => {
        const h = height(x, z);
        return h > 0.3 && h < 1.5 && !nearCam(x, z) ? h - 0.1 : null;
      },
      scale: [0.7, 1.1],
      dark: "#3d5a24",
      light: "#a4b85a",
      seed: 104,
    }),
  );
  // cò trắng bay trên đầm
  world.add(createBirds({ flocks: 3, perFlock: 6, center: { x: 0, y: 0, z: 0 }, radius: 120, altitude: [20, 45], color: "#e8e2d0", seed: 21 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 0 },
        size: [620, 620],
        // đầm lầy: sương dày cả lúc chiều, đêm
        density: (ctx) => 1 - smoothstep(0.4, 1.6, ctx.params.mood) * 0.45,
        base: () => WATER,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 0 },
      radius: 500,
      spacing: 150,
      layers: 2,
      mood: world.mood,
      // đồng bằng: chỉ vài dải đồi thấp mờ xa
      profile: (a, l) => Math.pow(fbm2(a * 4 + l * 9.1, l * 2.3, 4), 2) * (30 + l * 40),
    }),
  );
};

export default setup;
