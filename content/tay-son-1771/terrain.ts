import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Miền trung du, đồng bằng ven biển Quy Nhơn (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông; núi cao dần về phía tây;
// một con sông chảy từ núi ra biển (gợi ý sông Côn); ấp Tây Sơn ở chân đồi phía tây, thành Quy Nhơn ở sát biển. Phía bắc bản đồ là
// hướng Phú Xuân, Quảng Nam. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 120 };
export const WATER = 0.3;

/** Sông (diễn hoạ) — chảy từ núi phía tây ra biển. */
export const SONG: [number, number][] = [[-430, 90], [-300, 60], [-170, 20], [-40, -10], [90, -25], [210, -35], [340, -30]];
const RIVERS: River[] = [{ pts: SONG, half: 14 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Ấp Tây Sơn: chân đồi phía tây, bờ bắc sông. */
export const TAY_SON: [number, number] = [-150, 70];
/** Thành Quy Nhơn: sát biển, bờ bắc sông. */
export const QUY_NHON: [number, number] = [200, 0];
/** Nơi quan lại thu thuế (diễn hoạ): giữa đồng bằng. */
export const TRAM: [number, number] = [60, 110];
/** Hướng phía bắc (Phú Xuân, Quảng Nam) — điểm ở mép bản đồ. */
export const NORTH: [number, number] = [130, 420];

/** Biển ở phía đông: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => smoothstep(-35, 30, x - 270 - (noise2(x * 0.01 + 4, z * 0.012) - 0.5) * 70);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.8 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // núi và cao nguyên phía tây (cao dần về tây)
  land += smoothstep(-90, -330, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.3) * 90;
  // đồi thấp rải rác ở đồng bằng phía bắc
  land += smoothstep(60, 260, z) * smoothstep(120, -40, x) * Math.pow(fbm2(x * 0.016 + 1, z * 0.016 - 5, 3), 1.6) * 26;
  // bãi bằng ở Tây Sơn, Quy Nhơn, trạm thu thuế để thấy rõ người
  land = lerp(land, 5.5, 1 - smoothstep(35, 85, Math.hypot(x - TAY_SON[0], z - TAY_SON[1])));
  land = lerp(land, 3.5, 1 - smoothstep(30, 80, Math.hypot(x - QUY_NHON[0], z - QUY_NHON[1])));
  land = lerp(land, 4, 1 - smoothstep(30, 75, Math.hypot(x - TRAM[0], z - TRAM[1])));
  let h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  h = lerp(h, -5, sea(x, z));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#c2b184"),
  grass: new THREE.Color("#6a8d3e"),
  dry: new THREE.Color("#93944f"),
  forest: new THREE.Color("#2d4d29"),
  rock: new THREE.Color("#8d8574"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 1) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 1, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.55);
  // dải cát ven biển
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(12, 0.5, h) * 0.8);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
