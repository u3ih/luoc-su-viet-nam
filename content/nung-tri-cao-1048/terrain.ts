import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng núi đá biên giới thu nhỏ: châu Quảng Nguyên (QUANG_NGUYEN) phía tây nam; Ung Châu (UNG_CHAU) phía bắc; Quảng Châu (QUANG_CHAU_N) bên biển phía đông; Thăng Long (THANG_LONG_N) góc nam — khoảng cách thu ngắn rất nhiều (CÁCH ĐIỆU, không phải bản đồ có tư liệu)
// Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 120 };
export const WATER = 0.3;

export const SONG: [number, number][] = [[-400, 160], [-80, 120], [80, 80], [180, 40]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 16 }] as River[], 10);

export const QUANG_NGUYEN: [number, number] = [-120, -60];
export const UNG_CHAU: [number, number] = [-20, 120];
export const QUANG_CHAU_N: [number, number] = [150, 50];
export const THANG_LONG_N: [number, number] = [-60, -170];

const sea = (x: number, z: number) => smoothstep(-30, 30, x - 190 - (noise2(z * 0.01 + 7, 5) - 0.5) * 50);
/** Núi: [x, z, bán kính, cao]. */
const NUI: [number, number, number, number][] = [[-374, 267, 45, 83], [306, 44, 46, 67], [267, -204, 29, 56], [-103, -329, 44, 53], [-192, -306, 44, 61], [355, 264, 28, 89], [-341, 185, 36, 99], [-376, 166, 40, 94], [302, 162, 35, 76], [222, -247, 47, 59], [228, -107, 34, 83], [-237, -302, 38, 75], [281, 185, 45, 74], [-322, 182, 29, 67]];
/** Đảo: [x, z, bán kính, cao]. */
const DAO: [number, number, number, number][] = [];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.5 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  land += smoothstep(200, 420, Math.hypot(x, z)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 24;
  for (const [mx, mz, r, mh] of NUI) {
    const d = Math.hypot(x - mx, z - mz) / r;
    land += mh * Math.exp(-d * d * 2.2) * (0.75 + 0.5 * fbm2(x * 0.03 + mx, z * 0.03 + mz, 4));
  }
  for (const [c, r] of [[QUANG_NGUYEN, 30], [UNG_CHAU, 30], [QUANG_CHAU_N, 30], [THANG_LONG_N, 30]] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.3), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-3, land, smoothstep(-3, 8, dd));
  h = lerp(h, -6, sea(x, z));
  for (const [ix, iz, r, ih] of DAO) {
    const d = Math.hypot(x - ix, z - iz);
    const k = smoothstep(r, r * 0.35, d + (fbm2(x * 0.04 + ix, z * 0.04, 3) - 0.5) * r * 0.5);
    h = Math.max(h, lerp(-6, ih * (0.7 + 0.5 * fbm2(x * 0.05, z * 0.05 + iz, 3)), k));
  }
  return clamp(h + (noise2(x * 0.3, z * 0.3) - 0.5) * 0.04, BOUNDS.minH, BOUNDS.maxH);
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
