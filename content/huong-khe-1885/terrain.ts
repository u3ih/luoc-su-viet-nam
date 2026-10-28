import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Dải đất hẹp từ núi ra biển ở Hà Tĩnh (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông; núi rừng cao dần về phía tây (gợi ý dãy Trường Sơn); căn cứ Vụ Quang trong
// thung lũng ở chân núi bên một con sông chảy ra biển; tỉnh lỵ Hà Tĩnh gần cửa sông; về phía bắc là Nghệ An, về phía nam là hướng Quảng Bình; Tân Sở ở phía nam xa. Chỉ gợi ý
// quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều, hình dáng sông, núi không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 120 };
export const WATER = 0.3;

/** Sông chảy từ núi ra biển (diễn hoạ). */
export const SONG: [number, number][] = [[-430, -100], [-300, -60], [-200, -30], [-80, 30], [40, 90], [160, 130], [330, 160]];
const RIVERS: River[] = [{ pts: SONG, half: 14 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Căn cứ Vụ Quang: thung lũng ở chân núi, bên sông. */
export const VU_QUANG: [number, number] = [-215, -5];
/** Tỉnh lỵ Hà Tĩnh: gần cửa sông. */
export const HA_TINH: [number, number] = [150, 100];
/** Nghệ An: phía bắc. */
export const NGHE_AN: [number, number] = [60, 330];
/** Đồn Nu, Thanh Chương: phía tây bắc. */
export const DON_NU: [number, number] = [-110, 270];
/** Tân Sở: phía nam xa (nơi lệnh từ triều đình ra). */
export const TAN_SO: [number, number] = [-300, -375];
/** Hướng Quảng Bình ở phía nam, hướng Thanh Hoá ở phía bắc xa. */
export const QUANG_BINH: [number, number] = [-20, -230];
export const THANH_HOA: [number, number] = [30, 410];
/** Các điểm ánh lửa lan tới (diễn hoạ): tỉnh lỵ, Nghệ An, Quảng Bình, Thanh Hoá, đồn Nu. */
export const LUA: [number, number][] = [HA_TINH, NGHE_AN, QUANG_BINH, THANH_HOA, DON_NU];

/** Biển ở phía đông: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => smoothstep(-35, 30, x - 300 - (noise2(z * 0.01 + 4, 5) - 0.5) * 80);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.8 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // núi rừng cao dần về phía tây
  land += smoothstep(-110, -330, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 95;
  for (const [c, r] of [[VU_QUANG, 75], [HA_TINH, 55], [NGHE_AN, 50], [DON_NU, 40], [TAN_SO, 60], [QUANG_BINH, 45], [THANH_HOA, 45]] as [[number, number], number][])
    land = lerp(land, 4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  h = lerp(h, -5, sea(x, z));
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
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(12, 0.5, h) * 0.8);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
