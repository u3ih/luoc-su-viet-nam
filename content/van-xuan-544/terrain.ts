import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đầm Dạ Trạch (cách điệu): mặt nước nông lấm tấm doi đất mọc lau sậy, giữa đầm có bãi đất cao;
// bờ đông là đất liền nơi quân Lương đóng trại. Mực nước ở y = 0.

export const BOUNDS: HeightBounds = { minX: -360, minZ: -360, sizeX: 720, sizeZ: 720, minH: -4, maxH: 40 };
export const WATER = 0;
/** Bãi đất cao giữa đầm — chỗ nghĩa quân đóng. */
export const ISLAND = { x: -20, z: 10, r: 42 };
/** Trại quân Lương trên bờ đông. */
export const CAMP = { x: 262, z: 20 };

export function height(x: number, z: number) {
  // đáy đầm nông, gợn bùn
  // (đủ sâu để shader nước không vẽ bọt bờ khắp mặt đầm)
  let h = -2.2 + (fbm2(x * 0.02 + 3, z * 0.02 - 5, 4) - 0.5) * 1.4;
  // doi đất thấp — chỗ lau sậy mọc dày
  const islets = smoothstep(0.52, 0.66, fbm2(x * 0.035 - 8, z * 0.035 + 2, 4));
  h = lerp(h, 0.3 + noise2(x * 0.2, z * 0.2) * 0.3, islets);
  // bãi giữa đầm
  h += 3.4 * Math.exp(-((x - ISLAND.x) ** 2 + (z - ISLAND.z) ** 2) / (ISLAND.r * ISLAND.r));
  // bờ đất xung quanh, rộng nhất phía đông (trại giặc)
  const rim = Math.max(smoothstep(300, 345, Math.hypot(x, z)), smoothstep(215, 245, x + (noise2(z * 0.02, 1.1) - 0.5) * 30));
  h = lerp(h, 2.6 + fbm2(x * 0.03, z * 0.03, 3) * 4, rim);
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#4e3c26"),
  reedBed: new THREE.Color("#6f7a3e"),
  grass: new THREE.Color("#5c8638"),
  earth: new THREE.Color("#8a6c46"),
  forest: new THREE.Color("#2e5228"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < -0.6) c.copy(C.mud).multiplyScalar(0.7);
  else if (h < -0.1) c.copy(C.mud);
  else if (h < 1) c.copy(C.mud).lerp(C.reedBed, smoothstep(-0.1, 0.6, h));
  else c.copy(C.reedBed).lerp(C.grass, smoothstep(1, 2.4, h));
  // đất nện quanh trại
  const camp = Math.exp(-((x - CAMP.x) ** 2 + (z - CAMP.z) ** 2) / (40 * 40));
  c.lerp(C.earth, camp * 0.7);
  if (h > 4) c.lerp(C.forest, smoothstep(0.5, 0.7, fbm2(x * 0.04, z * 0.04, 3)) * 0.6);
  c.lerp(C.earth, smoothstep(0.25, 0.45, slope) * 0.5);
}
