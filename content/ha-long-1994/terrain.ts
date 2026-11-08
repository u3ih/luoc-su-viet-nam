import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vịnh Hạ Long: bờ đất liền ở phía tây bắc (BO), mặt vịnh rộng với nhiều đảo đá vôi dựng đứng; đảo Canh Độc (CANH_DOC) với động Thiên Cung; vùng lõi (VUNG_LOI) giữa vịnh (CÁCH ĐIỆU, không phải bản đồ có tư liệu)
// Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 140 };
export const WATER = 0.3;


export const { riverDist, bankDist } = createRivers([] as River[], 10);

export const BO: [number, number] = [-200, 330];
export const CANH_DOC: [number, number] = [60, -60];
export const VUNG_LOI: [number, number] = [0, -100];

const sea = (x: number, z: number) => smoothstep(-30, 30, -z - 230 - (noise2(x * 0.01 + 7, 5) - 0.5) * 60);
/** Núi: [x, z, bán kính, cao]. */
const NUI: [number, number, number, number][] = [];
/** Đảo: [x, z, bán kính, cao]. */
const DAO: [number, number, number, number][] = [[-368, -225, 28, 50], [-123, -54, 30, 55], [13, 40, 28, 57], [338, 126, 26, 35], [-173, -191, 25, 38], [-25, -151, 22, 38], [-185, -4, 22, 66], [2, -286, 18, 62], [-128, -32, 29, 47], [-14, -227, 17, 47], [73, -269, 34, 34], [-283, 125, 24, 30], [216, -270, 22, 52], [-287, -291, 21, 26], [-292, 120, 33, 59], [287, -370, 24, 32], [-103, 154, 28, 66], [260, -350, 22, 69], [1, -298, 20, 30], [-141, 88, 23, 60], [127, 148, 27, 60], [-164, -213, 15, 46], [318, 59, 34, 61], [323, -127, 28, 65], [144, 145, 14, 38], [-88, -365, 28, 51], [13, 95, 34, 66], [147, 143, 34, 29], [259, -310, 33, 26], [58, -258, 17, 28], [-50, -94, 34, 30], [69, -175, 17, 42], [157, -286, 27, 34], [204, -54, 20, 31]];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.5 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  land += smoothstep(200, 420, Math.hypot(x, z)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 24;
  for (const [mx, mz, r, mh] of NUI) {
    const d = Math.hypot(x - mx, z - mz) / r;
    land += mh * Math.exp(-d * d * 2.2) * (0.75 + 0.5 * fbm2(x * 0.03 + mx, z * 0.03 + mz, 4));
  }
  for (const [c, r] of [] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.3), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
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
