import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vịnh và bờ biển Đà Nẵng (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía bắc và phía đông; ở đông bắc, bán đảo Sơn Trà là một ngọn đồi cao ăn
// ra biển che cho vịnh; một con sông chảy từ núi phía tây ra vịnh (gợi ý sông Hàn); đất liền phía nam, phía tây là đồi núi. Các đồn ở chân bán
// đảo và bên cửa sông; phòng tuyến Liêu Trì lùi về phía tây nam. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều,
// hình dáng vịnh, đồi, sông không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 110 };
export const WATER = 0.3;

/** Sông ở phía tây vịnh (diễn hoạ) — chảy từ núi ra vịnh. */
export const SONG: [number, number][] = [[-430, -90], [-300, -20], [-170, 20], [-80, 90], [-30, 160], [-10, 240], [0, 300]];
const RIVERS: River[] = [{ pts: SONG, half: 14 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Đỉnh bán đảo Sơn Trà, đông bắc. */
export const SON_TRA: [number, number] = [210, 190];
/** Chỗ tàu liên quân đậu ngoài vịnh. */
export const VINH: [number, number] = [20, 265];
/** Đồn ở chân bán đảo (đông) và đồn bên cửa sông (tây) — diễn hoạ. */
export const DON_DONG: [number, number] = [140, 160];
export const DON_TAY: [number, number] = [-5, 150];
/** Nơi liên quân đóng sau khi đổ bộ, ven biển phía nam bán đảo. */
export const BO_BIEN: [number, number] = [90, 120];
/** Phòng tuyến Liêu Trì, lùi về phía tây nam. */
export const LIEU_TRI: [number, number] = [-130, -30];
/** Phía nam xa: hướng Gia Định — đường biển đi về phía nam ở mép phía đông bản đồ. */
export const NAM: [number, number] = [385, -140];
/** Luỹ đất vòng quanh nơi liên quân đóng (diễn hoạ). */
export const LUY: [number, number][] = [[-70, 200], [-95, 105], [-60, 25], [30, -5], [130, -12], [215, 40], [240, 120]];
/** Hướng tiếp viện từ phía nam (về Liêu Trì). */
export const TIEP_VIEN: [number, number][] = [[-120, -300], [-130, -190], [-135, -90], LIEU_TRI];
/** Đường từ vịnh vào bờ khi liên quân đổ bộ. */
export const DO_BO: [number, number][] = [[30, 255], [70, 205], [95, 160], BO_BIEN];
/** Đường tàu đi từ vịnh ra biển rồi về phía nam, men theo phía đông. */
export const RA_BIEN: [number, number][] = [VINH, [210, 280], [330, 200], [372, 60], NAM];

/** Biển ở phía bắc và phía đông: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => {
  const north = smoothstep(-30, 30, z - 205 - (noise2(x * 0.011 + 4, 3) - 0.5) * 70);
  const east = smoothstep(-35, 30, x - 300 - (noise2(z * 0.01 + 7, 5) - 0.5) * 80);
  return Math.max(north, east);
};

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.7 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // đồi núi phía tây, cao dần về tây và lên phía bắc (gợi ý dải núi phía bắc vịnh)
  land += smoothstep(-130, -340, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 70;
  // bãi bằng ở các điểm diễn hoạt cảnh
  for (const [c, r] of [[BO_BIEN, 100], [LIEU_TRI, 70], [DON_DONG, 50], [DON_TAY, 50]] as [[number, number], number][])
    land = lerp(land, 4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  // bán đảo Sơn Trà: ngọn đồi cao ăn ra biển
  const pen = Math.exp(-((((x - SON_TRA[0]) / 85) ** 2) + (((z - SON_TRA[1]) / 120) ** 2)));
  h = lerp(h, -5, sea(x, z) * (1 - smoothstep(0.1, 0.35, pen)));
  h += pen * (62 + noise2(x * 0.04, z * 0.04) * 22) * (0.4 + 0.6 * smoothstep(0.1, 0.5, pen));
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
  // dải cát ven biển
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 10, z - 10) - 0.04) * smoothstep(12, 0.5, h) * 0.8);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
