import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng sông nước phía nam Sài Gòn (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đất thấp, phẳng; một con sông lớn chảy từ tây bắc xuống đông nam
// (gợi ý nơi có vàm Nhật Tảo, ở phía tây); một con sông khác chảy từ Sài Gòn (phía bắc) xuống rồi nhập vào sông lớn (gợi ý nơi có Cần Giuộc, ở phía đông);
// vài con kênh nhỏ chằng chịt giữa ruộng. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng sông, kênh không theo
// bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 30 };
export const WATER = 0.3;

/** Sông lớn chảy từ tây bắc xuống đông nam (diễn hoạ). */
export const SONG_LON: [number, number][] = [[-430, 70], [-300, 10], [-190, -40], [-120, -62], [-40, -100], [40, -150], [150, -250], [250, -340], [330, -430]];
/** Sông từ Sài Gòn xuống rồi nhập vào sông lớn (diễn hoạ). */
export const SONG_SG: [number, number][] = [[170, 430], [150, 320], [130, 200], [118, 110], [96, 30], [60, -60], [20, -120], [40, -150]];
const KENH: [number, number][][] = [
  [[-300, 260], [-180, 200], [-60, 150], [40, 100], [118, 110]],
  [[330, 300], [250, 230], [180, 180], [130, 200]],
];
const RIVERS: River[] = [{ pts: SONG_LON, half: 22 }, { pts: SONG_SG, half: 16 }, ...KENH.map((pts) => ({ pts, half: 6 }))];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

/** Chỗ tàu đậu ở vàm sông (phía tây): một điểm giữa lòng sông lớn. */
export const NHAT_TAO: [number, number] = [-120, -62];
/** Xóm bên bờ vàm, nơi nghĩa quân tụ lại. */
export const XOM_NHAT_TAO: [number, number] = [-108, -26];
/** Đồn ở Cần Giuộc, bên bờ đông sông Sài Gòn–Cần Giuộc. */
export const CAN_GIUOC: [number, number] = [130, 64];
/** Sài Gòn: phía bắc. */
export const SAI_GON: [number, number] = [190, 335];
/** Các làng nghĩa binh tụ về (diễn hoạ). */
export const LANG: [number, number][] = [[-40, 70], [30, 175], [215, 45], [-150, 25], [150, -45]];
/** Bãi đất làm lễ tế (diễn hoạ) và nơi ở của người viết bài văn tế (diễn hoạ). */
export const TE_DAN: [number, number] = [-30, 5];
export const NHA_CHIEU: [number, number] = [-170, 150];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 1.9 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  // bờ lõm xuống thành ruộng, gò cao hơn chút ở quanh làng
  land += Math.pow(fbm2(x * 0.013 - 4, z * 0.013 + 6, 3), 2) * 4;
  // bãi bằng ở các điểm diễn hoạt cảnh
  for (const [c, r] of [[XOM_NHAT_TAO, 55], [CAN_GIUOC, 55], [SAI_GON, 70], [TE_DAN, 60], [NHA_CHIEU, 40], ...LANG.map((l) => [l, 40] as [[number, number], number])] as [[number, number], number][])
    land = lerp(land, 3.2, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  const h = lerp(-3, land, smoothstep(-3, 8, dd));
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
  c.lerp(C.mud, smoothstep(0.5, 0.2, noise2(x * 0.05, z * 0.05)) * 0.1);
}
