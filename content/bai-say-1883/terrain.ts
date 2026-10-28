import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng thấp nhiều đầm lau sậy ở Hưng Yên (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đất rất phẳng và thấp, nhiều chỗ trũng ngập nước xen bãi cao; sông lớn chảy ở phía tây;
// Hà Nội ở tây bắc; Hải Dương ở đông bắc; căn cứ Bãi Sậy ở giữa và Trại Sơn ở phía nam. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng sông, đầm
// không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 30 };
export const WATER = 0.3;

/** Sông Hồng (diễn hoạ) — chảy từ bắc xuống nam, ở phía tây. */
export const SONG: [number, number][] = [[-300, 430], [-250, 300], [-290, 150], [-260, -20], [-300, -190], [-260, -330], [-290, -430]];
const RIVERS: River[] = [{ pts: SONG, half: 24 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

export const BAI_SAY: [number, number] = [0, 0];
export const HA_NOI: [number, number] = [-190, 300];
export const HAI_DUONG: [number, number] = [250, 170];
/** Trại Sơn, đại bản doanh đội quân Hai Sông: phía nam. */
export const TRAI_SON: [number, number] = [40, -190];
export const CAU_DUONG: [number, number] = [-110, 250];
export const KE_SAT: [number, number] = [150, 85];
/** Các huyện nghĩa quân lan tới (diễn hoạ). */
export const HUYEN: [number, number][] = [[-130, -90], [120, -80], [-90, 120], [190, 20]];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  // đất thấp, nhiều chỗ trũng ngập nước (bãi lau sậy)
  let land = 0.85 + (fbm2(x * 0.016 + 3, z * 0.016 - 1, 3) - 0.5) * 2.2;
  // chỗ trũng sâu hẳn xuống để thành mặt nước rõ, không để những mảng nước nông trắng bọt
  if (land < 0.55) land = 0.55 - (0.55 - land) * 3.5;
  for (const [c, r] of [[BAI_SAY, 70], [HA_NOI, 70], [HAI_DUONG, 60], [TRAI_SON, 55], [CAU_DUONG, 35], [KE_SAT, 35], ...HUYEN.map((h) => [h, 35] as [[number, number], number])] as [[number, number], number][])
    land = lerp(land, 3.2, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  const h = lerp(-2.8, land, smoothstep(-3, 8, dd));
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
}
