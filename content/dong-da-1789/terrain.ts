import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng sông Hồng và con đường từ phía nam lên (CÁCH ĐIỆU, không phải bản đồ có tư liệu): trục bắc–nam; sông lớn chảy phía đông;
// Thăng Long ở phía bắc bản đồ; các đồn Ngọc Hồi, Hà Hồi, Đống Đa (Khương Thượng) nằm dọc con đường phía nam thành; núi đá vôi quanh
// Tam Điệp ở phía nam; phía nam xa là núi Bân (nơi Nguyễn Huệ lên ngôi) và Nghệ An. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách
// bị thu ngắn rất nhiều, hình dáng sông, đồi không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 80 };
export const WATER = 0.3;

/** Sông Hồng (diễn hoạ) — chảy từ bắc xuống nam, ở phía đông. */
export const SONG: [number, number][] = [[330, 430], [260, 300], [190, 200], [175, 60], [215, -90], [290, -240], [330, -430]];
const RIVERS: River[] = [{ pts: SONG, half: 26 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

export const THANG_LONG: [number, number] = [70, 290];
export const NGOC_HOI: [number, number] = [20, 140];
export const HA_HOI: [number, number] = [-5, 10];
/** Đồn Khương Thượng (Đống Đa), phía tây nam thành. */
export const DONG_DA: [number, number] = [-70, 225];
export const TAM_DIEP: [number, number] = [-40, -150];
/** Nghệ An và núi Bân (gần Phú Xuân) — phía nam xa. */
export const NGHE_AN: [number, number] = [-50, -265];
export const BAN_SON: [number, number] = [-70, -350];
/** Đường tiến quân từ Tam Điệp lên phía bắc, qua Hà Hồi đến sát Ngọc Hồi. */
export const ROUTE: [number, number][] = [TAM_DIEP, [-35, -80], [-20, -20], HA_HOI, [8, 70], [NGOC_HOI[0] - 6, NGOC_HOI[1] - 40]];
/** Phía bắc xa: hướng Lạng Sơn, Long Châu — điểm ở mép bản đồ. */
export const NORTH: [number, number] = [150, 430];

function karst(x: number, z: number) {
  const zone = smoothstep(-320, -210, z) * (1 - smoothstep(-110, -20, z));
  const corridor = smoothstep(40, 90, Math.abs(x - TAM_DIEP[0]));
  const tower = smoothstep(0.46, 0.6, fbm2(x * 0.03 + 7, z * 0.03 - 3, 3));
  return zone * corridor * tower * smoothstep(-320, -150, x) * (1 - smoothstep(150, 260, x));
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.2 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  land += karst(x, z) * (46 + noise2(x * 0.05, z * 0.05) * 26);
  // đồi núi thấp xa phía tây
  land += smoothstep(-210, -390, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 55;
  // núi Bân ở phía nam xa
  land += 34 * Math.exp(-(((x - BAN_SON[0]) / 45) ** 2 + ((z - BAN_SON[1]) / 45) ** 2));
  // bãi bằng ở các điểm diễn hoạt cảnh
  for (const [c, r] of [[THANG_LONG, 90], [NGOC_HOI, 60], [HA_HOI, 55], [DONG_DA, 50], [TAM_DIEP, 50], [NGHE_AN, 70]] as [[number, number], number][])
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
