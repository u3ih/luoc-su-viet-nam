import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Dải đất hẹp ven biển trải dài bắc – nam (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông, núi ở phía tây; một con sông chảy ngang giữa dải đất qua Huế (HUE) ra biển;
// Hà Nội (HA_NOI) ở đầu phía bắc, Sài Gòn (SAI_GON) ở đầu phía nam. Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 120 };
export const WATER = 0.3;

export const HUONG: [number, number][] = [[-330, 22], [-190, -8], [-40, 14], [90, -4], [200, 6], [300, 0]];
export const { riverDist, bankDist } = createRivers([{ pts: HUONG, half: 14 }] as River[], 10);

export const HA_NOI: [number, number] = [20, 335];
export const SAI_GON: [number, number] = [10, -335];
export const HUE: [number, number] = [50, 10];
/** Hai ranh giới (diễn hoạ) giữa ba vùng: z của đường ngăn Bắc Kỳ – Trung Kỳ và Trung Kỳ – Nam Kỳ. */
export const RANH_BAC = 150;
export const RANH_NAM = -150;

const sea = (x: number, z: number) => smoothstep(-30, 30, x - 280 - (noise2(z * 0.01 + 7, 5) - 0.5) * 70);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  land += smoothstep(-110, -300, x) * (16 + Math.pow(fbm2(x * 0.012 + 1, z * 0.012 + 5, 4), 1.3) * 80);
  land += Math.pow(fbm2(x * 0.013 - 4, z * 0.013 + 6, 3), 2) * 3;
  for (const [c, r] of [[HA_NOI, 75], [SAI_GON, 75], [HUE, 70]] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.4), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-3, land, smoothstep(-3, 8, dd));
  h = lerp(h, -6, sea(x, z));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  sand: new THREE.Color("#b3a479"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  dry: new THREE.Color("#a09a5c"),
  forest: new THREE.Color("#33552b"),
  rock: new THREE.Color("#8d8a78"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  if (h > 8) c.lerp(C.forest, smoothstep(8, 26, h) * 0.7);
  c.lerp(C.rock, smoothstep(0.35, 0.8, slope) * 0.6);
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(6, 0.5, h) * 0.8);
}
