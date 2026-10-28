import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng Huế và núi phía tây (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông; một con sông chảy từ núi phía tây qua kinh thành ra biển
// (gợi ý sông Hương), bờ bắc là kinh thành, bờ nam là Toà Khâm sứ; góc đông bắc kinh thành là đồn Mang Cá; núi rừng phía tây bắc là Tân Sở; xa hơn về phía bắc là vùng núi
// Hương Khê. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng sông, núi không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 120 };
export const WATER = 0.3;

/** Sông Hương (diễn hoạ) — chảy từ núi phía tây qua kinh thành ra biển ở phía đông. */
export const SONG: [number, number][] = [[-430, -110], [-300, -60], [-180, -70], [-80, -30], [0, -20], [90, -40], [200, -20], [340, 10]];
const RIVERS: River[] = [{ pts: SONG, half: 18 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Kinh thành: bờ bắc sông. */
export const KINH_THANH: [number, number] = [20, 60];
/** Đồn Mang Cá: góc đông bắc kinh thành. */
export const MANG_CA: [number, number] = [75, 105];
/** Toà Khâm sứ: bờ nam sông, đối diện kinh thành. */
export const KHAM_SU: [number, number] = [10, -95];
/** Tân Sở: núi rừng phía tây bắc. */
export const TAN_SO: [number, number] = [-250, 220];
/** Vùng núi phía bắc xa (hướng Hương Khê). */
export const HUONG_KHE: [number, number] = [-300, 380];
/** Các nơi khởi nghĩa phía bắc và nam, ánh lửa lan tới (diễn hoạ). */
export const LUA: [number, number][] = [[-330, 320], [-170, 340], [-60, 380], [80, 330], [-200, 120], [-330, 40], [-120, -200], [60, -300]];
/** Đường đưa vua từ kinh thành ra Tân Sở (diễn hoạ). */
export const ROI_KINH: [number, number][] = [[KINH_THANH[0] - 20, KINH_THANH[1] + 20], [-60, 110], [-130, 150], [-200, 190], TAN_SO];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.7 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // núi phía tây và phía bắc (cao dần về tây bắc)
  const rise = smoothstep(-80, -330, x) * 0.8 + smoothstep(150, 390, z) * 0.45;
  land += Math.min(1, rise) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 85;
  // bãi bằng ở các điểm diễn hoạt cảnh
  for (const [c, r] of [[KINH_THANH, 100], [MANG_CA, 40], [KHAM_SU, 55], [TAN_SO, 70]] as [[number, number], number][])
    land = lerp(land, 4.2, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  // biển ở phía đông
  const sea = smoothstep(-35, 30, x - 300 - (noise2(z * 0.01 + 4, 5) - 0.5) * 80);
  h = lerp(h, -5, sea);
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#c2b184"),
  grass: new THREE.Color("#6a8d3e"),
  dry: new THREE.Color("#92934e"),
  forest: new THREE.Color("#2d4d29"),
  rock: new THREE.Color("#8d8574"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 1) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 1, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.5);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
