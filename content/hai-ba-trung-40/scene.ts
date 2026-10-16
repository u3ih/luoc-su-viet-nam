import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter } from "@/core/world/props";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import config from "./scene.config";
import { BOUNDS, colorize, height, ME_LINH, paddyCell, riverZ, WATER } from "./terrain";

/** Số đốm lửa = số thành theo Hậu Hán thư. */
const CITIES = 65;

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(40);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);

  // ---- đất & sông ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  // sông Hồng: nước đỏ phù sa
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#5a3a26", shallow: "#9a7650" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 0 }, { x: 260, y: 40, z: 260 }));

  // ---- lửa khởi nghĩa: bùng ở Mê Linh rồi lan ra theo khoảng cách ----
  const BEAT = world.beat("huong-ung");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    target.lit += (Math.max(0.06, ctx.inputs.rise ?? 0) - target.lit) * w;
  });
  const sites: FireSite[] = [{ x: ME_LINH.x, y: height(ME_LINH.x, ME_LINH.z) + 0.3, z: ME_LINH.z, order: 0, size: 1.6 }];
  for (let i = 0; sites.length < CITIES && i < 6000; i++) {
    const a = rand() * Math.PI * 2;
    const r = 40 + Math.pow(rand(), 0.7) * 300;
    const x = ME_LINH.x + Math.cos(a) * r;
    const z = ME_LINH.z + Math.sin(a) * r;
    const h = height(x, z);
    if (h < 1.5 || h > 60 || nearCam(x, z, 20) || sites.some((s) => (s.x - x) ** 2 + (s.z - z) ** 2 < 30 * 30)) continue;
    sites.push({ x, y: h + 0.3, z, order: (r / 340) * 0.9 + rand() * 0.08, size: 1.4 + r / 200 });
  }
  world.add(
    createFires({
      sites,
      lit: (ctx) => ctx.params.lit,
      size: 1.8,
      // quầng sáng rõ về đêm, nhạt đi khi trời sáng
      glow: (ctx) => 0.35 + smoothstep(1.5, 3, ctx.params.mood) * 0.65,
    }),
  );
  // khói từ những đám lửa lớn gần Mê Linh
  const smoke = createSmoke({ sources: sites.slice(0, 8).map((s) => ({ x: s.x, y: s.y + 2, z: s.z })), height: 26, wind: [1, 0.4], color: "#b8aca0" });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.lit > 0.25;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  // ---- làng: tre, cau, chuối (không dựng nhà) ----
  const fromRiver = (x: number, z: number) => Math.abs(z - riverZ(x));
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 1.8 && h < 10 && clearOfCam(x, z, h) && fromRiver(x, z) > 45 ? h : null;
  };
  const hamlets = scatter(16, rand, { x0: -220, x1: 330, z0: -80, z1: 260 }, dry, 45);
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
  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...around(5, 14, 5), ...scatter(Math.round(80 * q.density), rand, { x0: -350, x1: 350, z0: -100, z1: 340 }, dry, 8)], {
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

  await world.yield();
  // ---- rừng núi Ba Vì, đồi, lúa, lau sậy ----
  const wide = { x0: -370, x1: 370, z0: -350, z1: 350 };
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(1200 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 2 || h > 100 || !clearOfCam(x, z, h) || slopeAt(x, z) > 1.2 || fromRiver(x, z) < 40) return null;
        return h > 9 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.55 ? h - 0.3 : null;
      },
      scale: [1.0, 2.0],
      dark: "#16301a",
      light: "#56843a",
      seed: 91,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(1000 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1.2 || h > 40 || !clearOfCam(x, z, h)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.48 ? h - 0.2 : null;
      },
      scale: [0.5, 1.2],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 92,
    }),
  );
  await world.yield();
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.7 || h > 5.5 || nearCam(x, z, 16) || fromRiver(x, z) < 50) return null;
    const c = paddyCell(x, z);
    if (c < 0.4 || (ripe ? c < 0.72 : c >= 0.72)) return null;
    const fx = Math.abs((x / 10) % 1);
    const fz = Math.abs((z / 8) % 1);
    return fx < 0.08 || fz < 0.1 ? null : h - 0.02;
  };
  const fields = { x0: -240, x1: 340, z0: -110, z1: 260 };
  world.add(createGrass({ quality: q, count: Math.round(8000 * q.density), area: fields, accept: paddy(false), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 93 }));
  world.add(createGrass({ quality: q, count: Math.round(3000 * q.density), area: fields, accept: paddy(true), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 94 }));
  world.add(
    createGrass({
      quality: q,
      count: Math.round(3000 * q.density),
      area: { x0: -370, x1: 370, z0: -230, z1: -40 },
      accept: (x, z) => {
        const h = height(x, z);
        return h > -0.8 && h < 1.6 && !nearCam(x, z, 14) ? h - 0.1 : null;
      },
      height: [1.3, 2.4],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 95,
    }),
  );
  world.add(
    createRocks({
      quality: q,
      count: Math.round(300 * q.density),
      area: wide,
      accept: (x, z) => (slopeAt(x, z) > 0.55 && height(x, z) > 10 && !nearCam(x, z) ? height(x, z) : null),
      scale: [0.5, 2.6],
      seed: 96,
    }),
  );
  world.add(createBirds({ flocks: 3, perFlock: 7, center: { x: -60, y: 0, z: 40 }, radius: 140, altitude: [45, 80], seed: 17 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 0 },
        size: [600, 600],
        density: (ctx) => 1 - smoothstep(0.3, 2.0, ctx.params.mood) * 0.7,
        base: () => WATER,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 0 },
      radius: 500,
      spacing: 150,
      layers: 3,
      mood: world.mood,
      // trung du, núi phía bắc và tây; đồng bằng mở về phía đông nam
      profile: (a, l) => smoothstep(-0.3, 0.4, Math.sin(a) - Math.cos(a) * 0.4) * Math.pow(fbm2(a * 5 + l * 7.7, l * 3.1, 4), 1.6) * (90 + l * 70),
    }),
  );
};

export default setup;
