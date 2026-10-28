import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Cảng và sông Sài Gòn (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đất thấp; một con sông lớn uốn lượn từ phía bắc xuống biển ở phía đông nam; thành phố ở bờ tây phía bắc; bến ở một khúc sông gần thành phố;
// biển ở góc đông nam. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng sông, bờ không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 30 };
export const WATER = 0.3;

/** Sông Sài Gòn (diễn hoạ) — từ bắc xuống đông nam ra biển. */
export const SONG: [number, number][] = [[60, 430], [40, 300], [-10, 170], [30, 40], [100, -60], [190, -170], [300, -290], [390, -380]];
const RACH: [number, number][] = [[-300, 20], [-200, 60], [-100, 30], [5, 85]];
const RIVERS: River[] = [{ pts: SONG, half: 18 }, { pts: RACH, half: 6 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Bến Nhà Rồng: bờ sông ở khúc sông gần thành phố. */
export const BEN: [number, number] = [66, 40];
/** Cầu tàu trong lòng sông, nơi tàu đậu. */
export const CAU_TAU: [number, number] = [40, 42];
/** Trung tâm thành phố Sài Gòn: phía tây bắc bến. */
export const SAI_GON: [number, number] = [-70, 120];
/** Đường tàu xuôi sông ra biển. */
export const DUONG_TAU: [number, number][] = [CAU_TAU, [70, -20], [120, -90], [195, -170], [300, -285], [385, -385]];
/** Đường đi bộ từ thành phố ra bến. */
export const DUONG_BO: [number, number][] = [SAI_GON, [-30, 100], [20, 78], [54, 52], BEN];

const sea = (x: number, z: number) => Math.max(smoothstep(-35, 30, x - 345 - (noise2(z * 0.01 + 7, 5) - 0.5) * 80), smoothstep(-35, 30, -z - 350 - (noise2(x * 0.01 + 2, 9) - 0.5) * 60));

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.2 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  land += Math.pow(fbm2(x * 0.013 - 4, z * 0.013 + 6, 3), 2) * 3;
  for (const [c, r] of [[BEN, 55], [SAI_GON, 85]] as [[number, number], number][]) land = lerp(land, 3.4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-3, land, smoothstep(-3, 8, dd));
  h = lerp(h, -5, sea(x, z));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  sand: new THREE.Color("#a99a72"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  dry: new THREE.Color("#9a9b52"),
  forest: new THREE.Color("#33552b"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, _slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  if (h > 4.5) c.lerp(C.forest, smoothstep(4.5, 7, h) * 0.5);
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 12, z + 12) - 0.04) * smoothstep(6, 0.5, h) * 0.8);
}
