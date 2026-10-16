import * as THREE from "three";
import { clamp, easeInOut, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBirds } from "@/core/world/birds";
import { createDust } from "@/core/world/dust";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter, type Placement } from "@/core/world/props";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createFleet, WAKE_SLOTS } from "./actors/fleet";
import { createMoored } from "./actors/moored";
import { createStakes } from "./actors/stakes";
import config, { TIDE_HIGH, TIDE_LOW } from "./scene.config";
import { BOUNDS, colorize, height, paddyCell, riverCenter, riverHalfWidth } from "./terrain";

// Đảo đá vôi ngoài cửa biển: x, z, cao, bán kính
const KARST: [number, number, number, number][] = [
  [64, -128, 30, 9], [92, -160, 42, 12], [128, -118, 26, 8], [70, -205, 36, 11],
  [140, -190, 48, 14], [-98, -150, 34, 10], [-128, -205, 44, 13], [-160, -140, 28, 9],
  [-84, -248, 30, 9], [36, -262, 38, 11], [182, -240, 34, 10], [-200, -230, 40, 12],
];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(938);

  // ---- đất & nước ----
  // bản đồ độ sâu cho shader nước: máy yếu dùng lưới thưa hơn (¼ số lần tính độ cao)
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  const wakes = new Float32Array(Math.min(WAKE_SLOTS, q.wakes) * 4);
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: (ctx) => ctx.params.tide, cheap: q.cheapShaders }));
  world.add(
    createWater({
      heightTex,
      bounds: BOUNDS,
      segments: q.waterSeg,
      level: (ctx) => ctx.params.tide,
      wakes,
      cheap: q.cheapShaders,
      sky: () => world.mood,
    }),
  );
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: -2, z: -24 }, { x: 160, y: 30, z: 180 }));

  // ---- logic tương tác: người xem điều khiển con nước ----
  const BEAT = world.beat("nuoc-rut");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    const userTide = TIDE_HIGH + (TIDE_LOW - TIDE_HIGH) * (ctx.inputs.drain ?? 0);
    target.tide += (userTide - target.tide) * w;
    const done = ctx.completedAt.drain;
    if (done) {
      const since = ctx.now - done;
      const after = smoothstep(BEAT - 0.6, BEAT - 0.1, ctx.t);
      target.attack = Math.max(target.attack, easeInOut(clamp((since - 1200) / 6000)) * after);
      target.sink = Math.max(target.sink, clamp((since - 3500) / 9000) * 0.75 * after);
    }
  });

  // ---- thuyền & cọc (tải song song model Blender) ----
  // không rải cây sát vị trí máy quay để khỏi che khung hình
  const cams = Object.values(config.keyframes).map((k) => k.cam);
  const nearCam = (x: number, z: number, r = 30) => cams.some(([cx, , cz]) => (cx - x) ** 2 + (cz - z) ** 2 < r * r);
  // cây không mọc chắn đường nhìn từ máy quay tới điểm nhìn: bỏ những cây nằm gần đoạn thẳng đó
  // (theo mặt bằng) mà ngọn cây (~10 m) cao hơn tia nhìn tại chỗ ấy
  const looks = Object.values(config.keyframes).map((k) => k.look);
  const blocks = (x: number, z: number, h: number, [ax, ay, az]: number[], [bx, by, bz]: number[]) => {
    const dx = bx - ax;
    const dz = bz - az;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1));
    const d2 = (ax + dx * t - x) ** 2 + (az + dz * t - z) ** 2;
    return d2 < 24 ** 2 && h + 10 > ay + (by - ay) * t;
  };
  const clearOfCam = (x: number, z: number, h: number) => !nearCam(x, z) && cams.every((c, i) => !blocks(x, z, h, c, looks[i]));
  const onBank = (minH: number, maxH: number, maxFromRiver: number) => (x: number, z: number) => {
    const h = height(x, z);
    if (!clearOfCam(x, z, h)) return null;
    const d = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
    return h > minH && h < maxH && d < maxFromRiver ? h - 0.2 : null;
  };
  const area = { x0: -150, x1: 150, z0: -70, z1: 150 };
  const village: Placement[] = [];
  for (let i = 0; i < 7; i++) {
    const z = 36 + i * 8 + (rand() - 0.5) * 4;
    const x = riverCenter(z) + riverHalfWidth(z) + 18 + (i % 2) * 10 + rand() * 4;
    village.push({ x, y: height(x, z) - 0.1, z, rotY: -Math.PI / 2 + (rand() - 0.5) * 0.3, scale: 0.9 + rand() * 0.2 });
  }
  const notInVillage = (fn: (x: number, z: number) => number | null) => (x: number, z: number) =>
    village.some((v) => (v.x - x) ** 2 + (v.z - z) ** 2 < 64) ? null : fn(x, z);

  // quanh mỗi nhà: vài cây cau, bụi chuối, đống rơm, đoạn rào tre
  const around = (r0: number, r1: number, n: number) =>
    village.flatMap((v) =>
      Array.from({ length: n }, () => {
        const a = rand() * Math.PI * 2;
        const r = r0 + rand() * (r1 - r0);
        const x = v.x + Math.cos(a) * r;
        const z = v.z + Math.sin(a) * r;
        return { x, y: height(x, z) - 0.15, z, rotY: rand() * 6.28, scale: 0.85 + rand() * 0.3 };
      }),
    );
  const fences = village.map((v) => {
    const x = v.x - 7;
    return { x, y: height(x, v.z) - 0.1, z: v.z, rotY: Math.PI / 2 + (rand() - 0.5) * 0.2 };
  });

  const karst: Placement[][] = [[], [], []];
  KARST.forEach(([x, z, h, r], i) => karst[i % 3].push({ x, y: -8, z, rotY: rand() * 6.28, scale: [r * 2.4, h + 8, r * 2.4] }));

  await world.yield();
  const actors = await Promise.all([
    createStakes(),
    createFleet(q, world.signal, wakes),
    createMoored(q, [30, 37, 41, 52, 58, 71]),
    createProps("nha_tranh", village, { quality: q, recenter: true, shadow: q.shadows, tint: 0.15 }),
    createProps("cay_cau", around(6, 10, 2), { quality: q, recenter: true, shadow: q.shadows, sway: 0.003, tint: 0.2 }),
    createProps("bui_chuoi", around(5, 9, 1), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
    createProps("dong_rom", around(6, 9, 1).filter((_, i) => i % 2 === 0), { quality: q, recenter: true, shadow: q.shadows, tint: 0.15 }),
    createProps("rao_tre", fences, { quality: q, recenter: true }),
    createProps("bui_tre", scatter(Math.round(140 * q.density), rand, area, notInVillage(onBank(1.5, 12, 45)), 5), { quality: q, recenter: true, shadow: q.shadows, sway: 0.0035, tint: 0.25, maxDistance: 320 }),
    createProps("cay_bang", scatter(Math.round(50 * q.density), rand, area, notInVillage(onBank(3, 16, 80)), 9), { quality: q, recenter: true, smooth: true, shadow: q.shadows, sway: 0.002, tint: 0.25 }),
    ...karst.map((list, i) => createProps("nui_da_voi", list, { quality: q, filter: (n) => n === `da_voi_${i}` || n === `da_voi_${i}_cay`, filterId: `da_voi_${i}`, recenter: true, tint: 0.2 })),
  ]);
  for (const a of actors) world.add(a);

  await world.yield();
  // ---- cỏ ven bờ, lau sậy mép nước, chim trời ----
  const bank = { x0: -160, x1: 160, z0: -90, z1: 160 };
  world.add(
    createGrass({
      quality: q,
      count: Math.round(9000 * q.density),
      area: bank,
      // cỏ thấp nên được mọc gần máy quay hơn cây, chỉ chừa một khoảng nhỏ để lá không phóng to choán khung
      accept: notInVillage((x, z) => {
        if (nearCam(x, z, 14)) return null;
        const h = height(x, z);
        const d = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
        return h > 1.2 && h < 14 && d < 70 ? h - 0.05 : null;
      }),
      height: [0.5, 1.1],
      base: "#5a8436",
      tip: "#adc068",
      seed: 41,
    }),
  );
  await world.yield();
  world.add(
    createGrass({
      quality: q,
      count: Math.round(3500 * q.density),
      area: bank,
      accept: (x, z) => {
        if (nearCam(x, z, 16)) return null;
        const h = height(x, z);
        const d = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
        // dải bùn sát mép nước, ngoài bãi cọc để không che cảnh chính
        return h > -1.2 && h < 1.6 && d > -6 && (z > -2 || z < -50) ? h - 0.1 : null;
      },
      height: [1.4, 2.6],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 42,
    }),
  );
  world.add(createBirds({ flocks: 3, perFlock: 7, center: { x: 0, y: 0, z: -40 }, radius: 90, altitude: [34, 60] }));

  await world.yield();
  // ---- rừng đồi, bụi ven bờ, dừa nước, đá tảng ----
  const fromRiver = (x: number, z: number) => Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;
  const wide = { x0: -310, x1: 310, z0: -100, z1: 215 };
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(1100 * q.density),
      area: wide,
      accept: notInVillage((x, z) => {
        const h = height(x, z);
        if (h < 5 || !clearOfCam(x, z, h) || fromRiver(x, z) < 22 || slopeAt(x, z) > 0.9) return null;
        // rừng mọc thành mảng, không rải đều như rắc tiêu
        return fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.42 ? h - 0.3 : null;
      }),
      scale: [1.0, 1.9],
      dark: "#18301a",
      light: "#58833a",
      seed: 51,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(1600 * q.density),
      area: wide,
      accept: notInVillage((x, z) => {
        const h = height(x, z);
        if (h < 1.4 || h > 26 || !clearOfCam(x, z, h)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.45 || fromRiver(x, z) < 14 ? h - 0.2 : null;
      }),
      scale: [0.5, 1.2],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 52,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "palm",
      count: Math.round(70 * q.density),
      area: bank,
      accept: (x, z) => {
        const h = height(x, z);
        const d = fromRiver(x, z);
        return h > 0.8 && h < 4 && d > 1 && d < 16 && !nearCam(x, z) && (z > 0 || z < -50) ? h - 0.2 : null;
      },
      scale: [0.8, 1.2],
      dark: "#3d5a24",
      light: "#a4b85a",
      shadow: q.shadows,
      seed: 53,
    }),
  );
  await world.yield();
  world.add(
    createRocks({
      quality: q,
      count: Math.round(520 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        const d = fromRiver(x, z);
        if (nearCam(x, z) || (z > -45 && z < -5 && d < 2)) return null;
        // đá ven mép nước + đá lộ trên sườn dốc
        return (h > -2 && h < 1.5 && d > -4 && d < 6) || (slopeAt(x, z) > 0.45 && h > 4) ? h : null;
      },
      scale: [0.3, 2.2],
      seed: 54,
    }),
  );

  await world.yield();
  // ---- ruộng lúa: lúa xanh trên ô cạn, lúa chín vàng ở vài ô ----
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.6 || h > 4.2 || nearCam(x, z) || fromRiver(x, z) < 8) return null;
    const c = paddyCell(x, z);
    if (c < 0.35 || (ripe ? c < 0.7 : c >= 0.7)) return null;
    // chừa bờ ruộng
    const fx = Math.abs((x / 9) % 1);
    const fz = Math.abs((z / 7) % 1);
    return fx < 0.1 || fz < 0.12 ? null : h - 0.02;
  };
  world.add(createGrass({ quality: q, count: Math.round(7000 * q.density), area: wide, accept: notInVillage(paddy(false)), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 61 }));
  world.add(createGrass({ quality: q, count: Math.round(2500 * q.density), area: wide, accept: notInVillage(paddy(true)), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 62 }));

  await world.yield();
  // ---- khói bếp, sương sông, núi xa ----
  world.add(createSmoke({ sources: village.filter((_, i) => i % 2 === 0).map((v) => ({ x: v.x + 1, y: v.y + 4.5, z: v.z })), height: 18, wind: [-1, 0.5] }));
  // sương = 3 lớp trong suốt phủ gần kín màn hình: tốn tỉ lệ điểm ảnh, máy yếu bỏ
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: -20 },
        size: [420, 520],
        // dày lúc bình minh, mỏng khi u ám, gần tan lúc hoàng hôn
        density: (ctx) => 1 - smoothstep(0.2, 2.0, ctx.params.mood) * 0.75,
        base: (ctx) => ctx.params.tide,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: -60 },
      radius: 470,
      spacing: 140,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => {
        // phía biển (z âm) để trống thành chân trời nước; phía đất liền: núi trùng điệp cao dần
        const land = smoothstep(-0.35, 0.15, Math.sin(a));
        return land * Math.pow(fbm2(a * 6 + l * 13.1, l * 3.7, 4), 1.6) * (70 + l * 45);
      },
    }),
  );
};

export default setup;
