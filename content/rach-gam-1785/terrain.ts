import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng sông Cửu Long (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đất thấp, phẳng, rộng; một con sông lớn chảy từ tây sang đông
// (gợi ý sông Tiền) với một cù lao giữa dòng; thị trấn Mỹ Tho ở bờ nam; phía tây nam là hướng Hà Tiên. Khúc sông giữa hai điểm RACH_GAM (tây)
// và XOAI_MUT (đông) là nơi diễn hoạt cảnh. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách, hình dáng sông, cù lao bị thu ngắn và
// cách điệu. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 40 };
export const WATER = 0.3;

/** Đường tim sông (diễn hoạ). */
export const SONG: [number, number][] = [[-430, 60], [-260, 40], [-120, 5], [40, -20], [200, -40], [330, -75], [430, -115]];
const RIVERS: River[] = [{ pts: SONG, half: 52 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 8);

/** Hai đầu khúc sông diễn ra trận đánh (diễn hoạ). */
export const RACH_GAM: [number, number] = [-150, 0];
export const XOAI_MUT: [number, number] = [170, -34];
/** Cù lao giữa dòng. */
export const CU_LAO: [number, number] = [10, -14];
/** Thị trấn Mỹ Tho ở bờ nam (diễn hoạ). */
export const MY_THO: [number, number] = [90, -140];
/** Hướng Hà Tiên (tây nam) — bờ nam phía thượng nguồn (diễn hoạ). */
export const HA_TIEN: [number, number] = [-300, -80];

/** Độ cao dòng chảy: đường tim sông theo x. */
export function riverZ(x: number) {
  for (let i = 0; i < SONG.length - 1; i++) {
    const [ax, az] = SONG[i];
    const [bx, bz] = SONG[i + 1];
    if (x >= ax && x <= bx) return lerp(az, bz, (x - ax) / (bx - ax));
  }
  return x < SONG[0][0] ? SONG[0][1] : SONG[SONG.length - 1][1];
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  const land = 2.1 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9 + smoothstep(0, 12, dd) * 0.5;
  let h = lerp(-2.6, land, smoothstep(-2, 9, dd));
  // cù lao giữa dòng
  const di = Math.hypot((x - CU_LAO[0]) * 0.8, z - CU_LAO[1]);
  h = lerp(h, 2.3, 1 - smoothstep(22, 40, di));
  // bãi bằng ở Mỹ Tho
  h = lerp(h, 2.4, 1 - smoothstep(30, 80, Math.hypot(x - MY_THO[0], z - MY_THO[1])));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#6a5a3c"),
  silt: new THREE.Color("#8d7a52"),
  paddy: new THREE.Color("#7f9c45"),
  grass: new THREE.Color("#5f8a38"),
  dry: new THREE.Color("#9a9b52"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, _slope = 0) {
  if (h < 1) c.copy(C.mud).lerp(C.silt, smoothstep(-2, 1, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3))).lerp(C.dry, smoothstep(0.62, 0.78, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
}
