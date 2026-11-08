import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Tràng An: rừng núi đá vôi dạng tháp, sông suối, đầm nước len giữa núi; cố đô Hoa Lư (HOA_LU) ở rìa phía bắc; nhóm hang Bói (HANG_BOI) ở trung tâm khối đá vôi (CÁCH ĐIỆU, không phải bản đồ có tư liệu)
// Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 170 };
export const WATER = 0.3;

export const SONG: [number, number][] = [[-400, -50], [-200, -20], [-60, -80], [60, -20], [200, -60], [400, -30]];
export const SONG1: [number, number][] = [[-60, -80], [-40, 100], [0, 240]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 18 }, { pts: SONG1, half: 14 }] as River[], 10);

export const HOA_LU: [number, number] = [0, 300];
export const HANG_BOI: [number, number] = [-40, 60];

const sea = (_x: number, _z: number) => 0;
/** Núi: [x, z, bán kính, cao]. */
const NUI: [number, number, number, number][] = [[-368, 317, 38, 96], [375, 368, 37, 72], [-96, -301, 34, 91], [131, 240, 37, 85], [-229, 91, 39, 68], [-229, 303, 27, 72], [-215, 375, 39, 70], [-87, -329, 34, 90], [-24, -332, 26, 81], [341, 222, 34, 103], [-47, -183, 27, 79], [-295, 228, 28, 107], [168, -265, 40, 93], [45, -117, 39, 104], [-270, 362, 41, 65], [237, 25, 26, 103], [-369, 179, 38, 87], [-58, 123, 25, 81], [313, -81, 26, 103], [144, -234, 28, 84], [348, 37, 36, 105], [195, 365, 40, 89], [117, 328, 41, 97], [327, 230, 31, 90], [-281, -87, 32, 68], [70, -142, 25, 89], [-90, 334, 26, 63], [328, 338, 32, 103], [-56, 137, 29, 61], [-349, -86, 26, 89]];
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
  for (const [c, r] of [[HOA_LU, 60]] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.3), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
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
