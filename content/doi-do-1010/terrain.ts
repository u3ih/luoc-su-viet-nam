import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Hai vùng đất nối nhau bằng sông (CÁCH ĐIỆU, không phải bản đồ có tư liệu): phía nam là thung lũng Hoa Lư bao quanh núi đá vôi, phía bắc là
// đồng bằng rộng bên một con sông lớn (Đại La). Một sông nhỏ chảy từ chân núi Hoa Lư ra gặp sông lớn. +z hướng bắc. Chỉ gợi ý
// ý "núi chật hẹp → đồng bằng rộng bên sông" mà lời chiếu nêu; vị trí và hình dạng sông không khẳng định. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 110 };
export const WATER = 0.2;
/** Hoa Lư: thung lũng giữa núi đá vôi (phía nam). */
export const HL: [number, number] = [-190, -270];
/** Đại La: đất bằng bên bờ tây sông lớn (phía bắc). */
export const DAI_LA: [number, number] = [20, 255];

/** Đường thuỷ từ chân núi Hoa Lư tới Đại La (diễn hoạ): sông nhỏ rồi sông lớn. */
export const SMALL: [number, number][] = [[-175, -262], [-120, -290], [-30, -262], [60, -210], [140, -150]];
export const BIG: [number, number][] = [[150, -400], [145, -150], [140, 0], [112, 120], [100, 200], [112, 270], [140, 330], [150, 400]];
export const ROUTE: [number, number][] = [...SMALL, [146, -110], [140, 0], [112, 120], [100, 200], [104, 250]];

const RIVERS: River[] = [
  { pts: SMALL, half: 9 },
  { pts: BIG, half: 22 },
];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

function karst(x: number, z: number) {
  const d = Math.hypot(x - HL[0], z - HL[1]);
  const ring = smoothstep(44, 70, d) * (1 - smoothstep(110, 165, d));
  const tower = smoothstep(0.56, 0.68, fbm2(x * 0.028 + 7, z * 0.028 - 3, 3));
  return ring * tower;
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  land += karst(x, z) * (46 + noise2(x * 0.05, z * 0.05) * 26);
  // vài đồi thấp ở xa
  land += smoothstep(150, 330, Math.hypot(x - 20, z - 40)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 38;
  const h = lerp(-3, land, smoothstep(-3, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  rock: new THREE.Color("#a49b88"),
  forest: new THREE.Color("#33552b"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.paddy, smoothstep(-1.2, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  if (h > 8) c.lerp(C.forest, smoothstep(8, 28, h) * 0.55);
  c.lerp(C.rock, smoothstep(0.28, 0.5, slope) * 0.8);
}
