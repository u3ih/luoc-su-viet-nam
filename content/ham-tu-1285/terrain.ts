import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng sông Hồng (CÁCH ĐIỆU, không phải bản đồ có tư liệu): một con sông lớn chảy từ tây bắc xuống đông nam; Thăng Long (THANG_LONG) bên bờ tây; Chương Dương (CHUONG_DUONG) trên sông phía nam Thăng Long;
// Hàm Tử (HAM_TU) và Tây Kết (TAY_KET) xa hơn về phía đông nam; bờ bắc sông (GIA_LAM); hướng quân Nguyên rút lên (VINH_BINH) ở tây bắc. Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 130 };
export const WATER = 0.3;

export const SONG: [number, number][] = [[-300,430], [-200,280], [-90,150], [10,60], [110,-20], [150,-150], [200,-430]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 24 }] as River[], 10);

export const THANG_LONG: [number, number] = [-40, 120];
export const CHUONG_DUONG: [number, number] = [60, -20];
export const HAM_TU: [number, number] = [170, -110];
export const TAY_KET: [number, number] = [230, -250];
export const GIA_LAM: [number, number] = [90, 150];
export const VINH_BINH: [number, number] = [-170, 330];

const sea = (_x: number, _z: number) => 0;

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.5 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  land += smoothstep(120, 330, z - x * 0.6) * (10 + Math.pow(fbm2(x * 0.012 + 1, z * 0.012 + 5, 4), 1.4) * 70);
  land += smoothstep(200, 420, Math.hypot(x, z)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 24;
  for (const [c, r] of [[THANG_LONG, 70], [CHUONG_DUONG, 70], [HAM_TU, 70], [TAY_KET, 70], [GIA_LAM, 70], [VINH_BINH, 70]] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.3), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-3, land, smoothstep(-3, 8, dd));
  h = lerp(h, -6, sea(x, z));
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
