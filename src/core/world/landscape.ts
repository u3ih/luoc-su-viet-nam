import * as THREE from "three";
import { smoothstep } from "../engine/math";
import type { FrameCtx, World } from "../engine/world";
import type { Keyframe } from "../types";
import { createMist, createRanges } from "./atmosphere";
import { createBirds } from "./birds";
import { cameraClearance, type Clearance } from "./clearance";
import { createDust } from "./dust";
import { createFoliage } from "./foliage";
import { createGrass } from "./grass";
import { createHeightTexture, createTerrain, fbm2, type HeightBounds } from "./terrain";
import { createWater } from "./water";

// Phong cảnh sông–đồi dùng chung: đất, nước, bụi, cây rừng, bụi cây, cỏ, lau sậy, chim, sương, dãy núi xa.
// Mỗi chương tự viết `terrain.ts` (hàm độ cao + màu đất) rồi gọi `addLandscape` thay vì chép lại cả đống đạo cụ;
// mật độ, tầm vẽ, bản lite… đều do bậc chất lượng (`world.quality`) quyết định ở một chỗ này.
// Thứ chỉ riêng chương có (nhân vật, lửa, đạo cụ diễn hoạ) vẫn nằm trong `scene.ts` của chương.

type Area = { x0: number; x1: number; z0: number; z1: number };

export type LandscapeOptions = {
  bounds: HeightBounds;
  height: (x: number, z: number) => number;
  colorize: (h: number, x: number, z: number, out: THREE.Color, slope: number) => void;
  /** Mực nước theo frame. */
  level: (ctx: FrameCtx) => number;
  /** Khoảng cách có dấu tới mép bờ (âm = trong lòng sông) — để cây không mọc xuống nước, lau sậy mọc ven bờ. */
  bankDist: (x: number, z: number) => number;
  /** Keyframe của chương — để không rải cây sát máy quay, không để ngọn cây chắn tia nhìn. */
  keyframes: Record<string, Keyframe>;
  /** Chỗ được rải cây, cỏ (false quanh khu cư trú, hiện trường cần nhìn rõ). Mặc định: cả bản đồ. */
  open?: (x: number, z: number) => boolean;
  /** Vùng rải. Mặc định gần kín `bounds`. */
  area?: Area;
  water?: { deep?: string; shallow?: string };
  /** Bụi lơ lửng. */
  dust?: { center: THREE.Vector3Like; extent: THREE.Vector3Like };
  /** Số lượng cơ sở (nhân với `quality.density`). 0 = không rải. */
  counts?: { trees?: number; bushes?: number; grass?: number; reeds?: number };
  colors?: { treeDark?: string; treeLight?: string; bushDark?: string; bushLight?: string; grassBase?: string; grassTip?: string };
  /** Cây rừng mọc ở chỗ nhiễu lớn hơn ngưỡng này (hoặc trên đồi cao hơn `hillAt` với ngưỡng thấp hơn). Mặc định 0.54. */
  forestAt?: number;
  /** Độ cao từ đó cây mọc dễ hơn (đồi). Mặc định 16. */
  hillAt?: number;
  /** Đàn chim. false = không. */
  birds?: { center: THREE.Vector3Like; radius: number } | false;
  /** Sương là là mặt nước (tắt ở bậc rẻ). */
  mist?: { center: THREE.Vector3Like; size: [number, number]; density: (ctx: FrameCtx) => number };
  /** Dãy núi xa: bán kính, hệ số cao. */
  ranges?: { radius: number; height: number };
  seed?: number;
};

/** Dựng toàn bộ phong cảnh; trả về bộ kiểm tra khoảng cách tới máy quay để chương tự rải thêm đạo cụ riêng. */
export async function addLandscape(world: World, o: LandscapeOptions): Promise<Clearance> {
  const q = world.quality;
  const seed = o.seed ?? 0;
  const clear = cameraClearance(o.keyframes);
  const { nearCam, clearOfCam } = clear;
  const open = o.open ?? (() => true);
  const wide: Area = o.area ?? { x0: o.bounds.minX + 5, x1: o.bounds.minX + o.bounds.sizeX - 5, z0: o.bounds.minZ + 5, z1: o.bounds.minZ + o.bounds.sizeZ - 5 };
  const counts = { trees: 640, bushes: 800, grass: 7000, reeds: 2200, ...o.counts };
  const col = { treeDark: "#1d3a1d", treeLight: "#5e8a3c", bushDark: "#27401f", bushLight: "#6f9242", grassBase: "#5a7d32", grassTip: "#b4c26a", ...o.colors };
  const cx = o.bounds.minX + o.bounds.sizeX / 2;
  const cz = o.bounds.minZ + o.bounds.sizeZ / 2;

  // ---- đất, nước ----
  const heightTex = createHeightTexture(o.height, o.bounds, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: o.bounds, segments: q.terrainSeg, height: o.height, colorize: o.colorize, wetLevel: o.level, cheap: q.cheapShaders }));
  world.add(
    createWater({
      heightTex,
      bounds: o.bounds,
      segments: q.waterSeg,
      level: o.level,
      cheap: q.cheapShaders,
      sky: () => world.mood,
      colors: { deep: o.water?.deep ?? "#2d4a45", shallow: o.water?.shallow ?? "#7d9478" },
    }),
  );
  await world.yield();
  const dust = o.dust ?? { center: { x: cx, y: 0, z: cz }, extent: { x: o.bounds.sizeX * 0.4, y: 40, z: o.bounds.sizeZ * 0.4 } };
  world.add(createDust(q.dust, dust.center, dust.extent));

  // ---- cây rừng, bụi (chỉ trên đất khô, ngoài chỗ cần nhìn rõ, không chắn máy quay) ----
  const awayFromWater = (x: number, z: number) => o.bankDist(x, z) > 6;
  const dry = (x: number, z: number) => {
    const h = o.height(x, z);
    return h > 2.4 && open(x, z) && awayFromWater(x, z) && clearOfCam(x, z, h) ? h : null;
  };
  const forestAt = o.forestAt ?? 0.54;
  const hillAt = o.hillAt ?? 16;
  if (counts.trees > 0)
    world.add(
      createFoliage({
        quality: q,
        kind: "tree",
        count: Math.round(counts.trees * q.density),
        area: wide,
        accept: (x, z) => {
          const y = dry(x, z);
          if (y === null) return null;
          const f = fbm2(x * 0.02 + 4, z * 0.02 - 2, 3);
          return f > forestAt || (y > hillAt && f > forestAt - 0.14) ? y - 0.3 : null;
        },
        scale: [1.0, 1.9],
        dark: col.treeDark,
        light: col.treeLight,
        seed: 81 + seed,
      }),
    );
  if (counts.bushes > 0)
    world.add(
      createFoliage({
        quality: q,
        kind: "bush",
        maxDistance: 260,
        count: Math.round(counts.bushes * q.density),
        area: wide,
        accept: (x, z) => {
          const y = dry(x, z);
          return y !== null && fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
        },
        scale: [0.5, 1.1],
        dark: col.bushDark,
        light: col.bushLight,
        seed: 82 + seed,
      }),
    );
  await world.yield();

  // ---- cỏ, lau sậy ----
  if (counts.grass > 0)
    world.add(
      createGrass({
        quality: q,
        count: Math.round(counts.grass * q.density),
        area: wide,
        accept: (x, z) => {
          const h = o.height(x, z);
          if (h < 1.2 || h > 9 || nearCam(x, z, 14) || !open(x, z) || !awayFromWater(x, z)) return null;
          return fbm2(x * 0.04 + 1, z * 0.04 - 5, 3) > 0.42 ? h - 0.05 : null;
        },
        height: [0.35, 0.7],
        blades: 6,
        base: col.grassBase,
        tip: col.grassTip,
        sway: 0.2,
        seed: 83 + seed,
        maxDistance: 300,
      }),
    );
  if (counts.reeds > 0)
    world.add(
      createGrass({
        quality: q,
        count: Math.round(counts.reeds * q.density),
        area: wide,
        accept: (x, z) => {
          const h = o.height(x, z);
          return h > -0.4 && h < 1.0 && o.bankDist(x, z) > -4 && !nearCam(x, z, 14) ? h - 0.1 : null;
        },
        height: [1.1, 2.0],
        blades: 9,
        base: "#76763f",
        tip: "#e6d89c",
        sway: 0.05,
        seed: 86 + seed,
        maxDistance: 260,
      }),
    );

  // ---- chim, sương, núi xa ----
  if (o.birds !== false) world.add(createBirds({ flocks: 2, perFlock: 7, center: o.birds?.center ?? { x: cx, y: 0, z: cz }, radius: o.birds?.radius ?? 170, altitude: [55, 90], seed: 15 + seed }));
  await world.yield();
  if (!q.cheapShaders && o.mist)
    world.add(createMist({ center: o.mist.center, size: o.mist.size, density: o.mist.density, base: o.level, mood: world.mood }));
  const rg = o.ranges ?? { radius: 540, height: 1 };
  world.add(
    createRanges({
      center: { x: cx, y: 0, z: cz },
      radius: rg.radius,
      spacing: 160,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => Math.pow(fbm2(a * 5 + l * 11.3 + seed, l * 2.9, 4), 1.6) * (110 + l * 80) * rg.height,
    }),
  );
  return clear;
}

/** Sương mặc định: dày lúc rạng đông và lúc đêm. */
export const dawnNightMist = (ctx: FrameCtx) => 0.15 + 0.6 * smoothstep(3.1, 3.7, ctx.params.mood) + 0.35 * (1 - smoothstep(0.8, 1.6, ctx.params.mood));
