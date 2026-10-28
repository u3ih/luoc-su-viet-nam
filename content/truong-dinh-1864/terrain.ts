import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng sông nước miền Đông Nam Bộ (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đất thấp, phẳng; một con sông chảy từ Sài Gòn (phía bắc) xuống biển ở
// phía đông nam; về phía nam, gần biển, là vùng sông rạch chằng chịt, dừa nước um tùm — nơi Gò Công và "Đám lá tối trời"; ba điểm ở phía bắc, tây và đông
// gợi ý ba tỉnh Gia Định, Định Tường, Biên Hoà. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng sông, rạch không
// theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 30 };
export const WATER = 0.3;

/** Sông từ Sài Gòn xuống biển (diễn hoạ). */
export const SONG: [number, number][] = [[70, 430], [75, 320], [50, 200], [20, 60], [30, -60], [60, -170], [140, -290], [260, -360]];
const RACH: [number, number][][] = [
  [[-200, -120], [-120, -190], [-60, -250], [40, -270], [130, -260]],
  [[-150, -300], [-80, -250], [-20, -180], [30, -200]],
  [[-250, -250], [-170, -230], [-80, -250]],
  [[-300, 40], [-200, 20], [-90, -20], [20, 60]],
];
const RIVERS: River[] = [{ pts: SONG, half: 18 }, ...RACH.map((pts) => ({ pts, half: 5 }))];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

/** Sài Gòn: bờ tây sông, phía bắc. */
export const SAI_GON: [number, number] = [118, 340];
/** Chỗ tàu đậu giữa sông ở Sài Gòn. */
export const BEN_SONG: [number, number] = [74, 330];
/** Gò Công: bản doanh của Trương Định. */
export const GO_CONG: [number, number] = [-20, -185];
/** "Đám lá tối trời": vùng rạch dừa nước, phía tây nam Gò Công. */
export const DAM_LA: [number, number] = [-110, -245];
/** Ba điểm gợi ý ba tỉnh nhượng cho Pháp. */
export const BA_TINH: [number, number][] = [[250, 250], [90, 130], [-230, 110]];
/** Phía bắc xa: hướng Huế, nơi lệnh bãi binh đi tới. */
export const NORTH: [number, number] = [-370, 425];
/** Các làng nghĩa quân tụ về (diễn hoạ). */
export const LANG: [number, number][] = [[-220, -60], [-150, 60], [100, -90], [-290, -200], [160, -200]];

const sea = (x: number, z: number) => Math.max(smoothstep(-35, 30, x - 325 - (noise2(z * 0.01 + 7, 5) - 0.5) * 80), smoothstep(-35, 30, -z - 350 - (noise2(x * 0.01 + 2, 9) - 0.5) * 60));

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 1.9 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  land += Math.pow(fbm2(x * 0.013 - 4, z * 0.013 + 6, 3), 2) * 4;
  for (const [c, r] of [[SAI_GON, 70], [GO_CONG, 60], [DAM_LA, 45], ...BA_TINH.map((b) => [b, 40] as [[number, number], number]), ...LANG.map((l) => [l, 35] as [[number, number], number])] as [[number, number], number][])
    land = lerp(land, 3.2, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
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
  // dải cát ven biển
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 12, z + 12) - 0.04) * smoothstep(6, 0.5, h) * 0.8);
}
