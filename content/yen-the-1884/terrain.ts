import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Vùng đồi trung du Yên Thế (CÁCH ĐIỆU, không phải bản đồ có tư liệu): một thung lũng nhỏ nằm giữa vòng đồi thấp, rừng thưa; một con sông chảy ở phía đông; phía nam
// xa là đồng bằng và hướng Hà Nội; quanh vùng là vài đồn của quân Pháp. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng đồi,
// sông không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 90 };
export const WATER = 0.3;

/** Sông ở phía đông (diễn hoạ). */
export const SONG: [number, number][] = [[340, 430], [300, 250], [335, 50], [300, -150], [360, -430]];
const RIVERS: River[] = [{ pts: SONG, half: 18 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

/** Thung lũng Yên Thế — nơi dân tụ về. */
export const YEN_THE: [number, number] = [-20, 20];
/** Căn cứ Phồn Xương. */
export const PHON_XUONG: [number, number] = [-70, 120];
/** Hà Nội: phía nam xa. */
export const HA_NOI: [number, number] = [-250, -340];
/** Các làng nông dân tụ về (diễn hoạ). */
export const LANG: [number, number][] = [[-210, 50], [-100, -130], [150, 110], [60, -190]];
/** Các đồn của quân Pháp quanh vùng (diễn hoạ). */
export const DON: [number, number][] = [[190, -50], [130, 250], [-220, 230], [-170, -120]];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  const d = Math.hypot(x - YEN_THE[0], (z - YEN_THE[1]) * 0.85);
  let land = 2.8 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // vòng đồi quanh thung lũng
  land += smoothstep(70, 200, d) * (0.3 + Math.pow(fbm2(x * 0.012 + 5, z * 0.012 - 2, 4), 1.2) * 1.2) * 40;
  for (const [c, r] of [[YEN_THE, 80], [PHON_XUONG, 50], ...DON.map((t) => [t, 30] as [[number, number], number]), ...LANG.map((l) => [l, 32] as [[number, number], number])] as [[number, number], number][])
    land = lerp(land, 4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  const h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#b3a26e"),
  grass: new THREE.Color("#6e8f3c"),
  dry: new THREE.Color("#9a9650"),
  forest: new THREE.Color("#2d4d29"),
  rock: new THREE.Color("#8d8574"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 1) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 1, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.5);
  if (h > 10) c.lerp(C.forest, smoothstep(10, 36, h) * 0.75);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
