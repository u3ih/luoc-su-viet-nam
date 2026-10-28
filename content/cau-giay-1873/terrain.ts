import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng sông Hồng quanh Hà Nội (CÁCH ĐIỆU, không phải bản đồ có tư liệu): trục bắc–nam; sông lớn chảy ở phía đông; Hà Nội bên bờ tây sông; Cầu Giấy ở phía tây
// thành, có con rạch nhỏ; xa hơn về phía tây là vùng đồi Sơn Tây; xung quanh Hà Nội là vài điểm gợi ý các tỉnh đồng bằng. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu;
// khoảng cách bị thu ngắn rất nhiều, hình dáng sông, đồi không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 90 };
export const WATER = 0.3;

/** Sông Hồng (diễn hoạ) — chảy từ bắc xuống nam, ở phía đông. */
export const SONG: [number, number][] = [[330, 430], [260, 300], [190, 200], [175, 60], [215, -90], [290, -240], [330, -430]];
/** Rạch nhỏ ở phía tây thành, gần Cầu Giấy (diễn hoạ). */
const RACH: [number, number][] = [[-250, 130], [-150, 80], [-90, 40], [-40, 20], [40, -20], [120, -110]];
const RIVERS: River[] = [{ pts: SONG, half: 26 }, { pts: RACH, half: 6 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

export const HA_NOI: [number, number] = [100, 40];
/** Bến sông gần thành, nơi tàu Pháp cập. */
export const BEN: [number, number] = [158, 70];
/** Khu Cầu Giấy: phía tây thành, bên rạch. */
export const CAU_GIAY: [number, number] = [-70, 60];
/** Sơn Tây: phía tây xa. */
export const SON_TAY: [number, number] = [-330, 180];
/** Nơi quân Cờ Đen tụ lại trước khi tiến (giữa đường Sơn Tây – Cầu Giấy). */
export const TIEN_DON: [number, number] = [-200, 125];
/** Các tỉnh quanh Hà Nội (diễn hoạ). */
export const TINH: [number, number][] = [[110, -250], [-100, -210], [130, 310], [-120, -50]];
/** Đường tàu đi từ phía nam lên bến Hà Nội, men theo sông. */
export const DUONG_SONG: [number, number][] = [[290, -240], [215, -90], [188, 20], [BEN[0] + 12, BEN[1] - 4]];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  // đồi phía tây (Sơn Tây)
  land += smoothstep(-210, -360, x) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.4) * 60;
  for (const [c, r] of [[HA_NOI, 90], [CAU_GIAY, 60], [SON_TAY, 55], [TIEN_DON, 45], ...TINH.map((t) => [t, 40] as [[number, number], number])] as [[number, number], number][])
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
  rock: new THREE.Color("#a49b88"),
  forest: new THREE.Color("#33552b"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  if (h > 9) c.lerp(C.forest, smoothstep(9, 30, h) * 0.6);
  c.lerp(C.rock, smoothstep(0.28, 0.5, slope) * 0.8);
}
