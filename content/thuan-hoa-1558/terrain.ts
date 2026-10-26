import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Dải đất ven biển miền Trung (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông; dải núi Hoành Sơn chạy từ tây ra sát biển ở
// phía bắc, có một chỗ trũng làm đèo; phía nam đèo là đồng bằng nhỏ với một con sông chảy từ núi phía tây ra biển (gợi ý sông Thạch Hãn);
// dinh Ái Tử ở bờ bắc sông. Phía bắc bản đồ là hướng Thanh Hoá. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn
// rất nhiều, hình dáng đèo, sông, bờ biển không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 120 };
export const WATER = 0.3;

/** Sông ở phía nam đèo (diễn hoạ) — chảy từ núi phía tây ra biển. */
export const SONG: [number, number][] = [[-430, -60], [-300, -100], [-160, -120], [-30, -150], [100, -140], [230, -125], [340, -120]];
const RIVERS: River[] = [{ pts: SONG, half: 15 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Dinh Ái Tử: bờ bắc sông. */
export const AI_TU: [number, number] = [-60, -92];
/** Nơi xuất phát phía bắc (hướng Thanh Hoá). */
export const NORTH: [number, number] = [-20, 345];
/** Chỗ trũng của dải Hoành Sơn (đèo). */
export const PASS: [number, number] = [30, 250];
/** Đường đi gợi ý từ phía bắc, qua đèo, tới Ái Tử. */
export const ROUTE: [number, number][] = [NORTH, [5, 295], PASS, [24, 200], [0, 120], [-32, 25], [-55, -55], AI_TU];
/** Đường đi tiếp xuống phía nam (hướng Quảng Nam), ra mép bản đồ. */
export const SOUTH_ROUTE: [number, number][] = [AI_TU, [-70, -170], [-45, -260], [-95, -340], [-60, -430]];
const south = createRivers([{ pts: SOUTH_ROUTE, half: 0 }], 12);

/** Biển ở phía đông: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => smoothstep(-35, 30, x - 285 - (noise2(x * 0.01 + 4, z * 0.012) - 0.5) * 80);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.7 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // núi Trường Sơn phía tây (cao dần về tây)
  land += smoothstep(-130, -340, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 75;
  // dải Hoành Sơn: chạy ngang, ra sát biển, trũng xuống ở chỗ đèo
  const w = 30 + noise2(x * 0.02, 2) * 12;
  const ridge = Math.exp(-(((z - 250 + (noise2(x * 0.015, 7) - 0.5) * 40) / w) ** 2)) * (1 - smoothstep(190, 290, x));
  const notch = 1 - 0.72 * Math.exp(-(((x - PASS[0]) / 46) ** 2));
  land += ridge * notch * (56 + noise2(x * 0.03 + 1, z * 0.03) * 26);
  // bãi bằng ở Ái Tử và nơi xuất phát để thấy rõ đoàn người
  land = lerp(land, 4, 1 - smoothstep(35, 85, Math.hypot(x - AI_TU[0], z - AI_TU[1])));
  land = lerp(land, 4.5, 1 - smoothstep(35, 85, Math.hypot(x - NORTH[0], z - NORTH[1])));
  // lối đi xuống phía nam thoải hơn
  land = lerp(land, Math.min(land, 6), 1 - smoothstep(10, 40, south.bankDist(x, z)));
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
  // dải cát ven biển
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(12, 0.5, h) * 0.8);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
