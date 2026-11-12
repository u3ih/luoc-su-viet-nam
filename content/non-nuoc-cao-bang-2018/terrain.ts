import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng núi đá vôi dạng tháp; trung tâm (TRUNG_TAM) giữa thung lũng; thác Bản Giốc (BAN_GIOC) đông bắc, hồ Thang Hen (THANG_HEN) tây bắc, Phia Oắc (PHIA_OAC) tây nam (CÁCH ĐIỆU, không phải bản đồ có tư liệu)
// Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 160 };
export const WATER = 0.3;

export const SONG: [number, number][] = [[-400, -40], [-150, -10], [0, 10], [200, 120], [400, 160]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 14 }] as River[], 10);

export const TRUNG_TAM: [number, number] = [0, 20];
export const BAN_GIOC: [number, number] = [200, 140];
export const THANG_HEN: [number, number] = [-160, 120];
export const PHIA_OAC: [number, number] = [-200, -150];

const sea = (_x: number, _z: number) => 0;
/** Núi: [x, z, bán kính, cao]. */
const NUI: [number, number, number, number][] = [[-378, -44, 39, 83], [-293, 281, 41, 107], [250, -226, 40, 61], [303, 208, 40, 106], [182, 302, 33, 104], [-369, -300, 35, 97], [128, -50, 40, 65], [19, 223, 30, 66], [223, -341, 39, 96], [387, -381, 38, 78], [220, -219, 35, 58], [294, 241, 25, 101], [-328, -313, 35, 100], [-272, -325, 25, 65], [310, -336, 37, 66], [28, 380, 24, 68], [-294, -63, 37, 103], [317, -282, 35, 59], [-118, 223, 40, 61], [74, 285, 28, 86], [15, 338, 41, 53], [-273, 6, 41, 64], [-168, -232, 35, 57], [-349, -356, 28, 75], [138, -281, 25, 98], [349, 276, 31, 107], [-18, 173, 41, 72], [265, -378, 29, 108], [-148, 305, 27, 108], [227, 251, 31, 79], [-132, -304, 28, 102], [160, -211, 32, 86], [-277, -47, 35, 60], [-186, 60, 36, 86]];
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
  for (const [c, r] of [[TRUNG_TAM, 60], [BAN_GIOC, 30], [THANG_HEN, 30], [PHIA_OAC, 30]] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.3), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
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
