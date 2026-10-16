import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đất tổ (cách điệu): biển ở z âm, đồng bằng ở giữa có sông chảy ra biển, núi non trùng điệp ở z dương.
// Một quả đồi riêng giữa trung du (gợi núi Nghĩa Lĩnh) cho phân cảnh Giỗ Tổ.

export const BOUNDS: HeightBounds = { minX: -320, minZ: -330, sizeX: 640, sizeZ: 640, minH: -12, maxH: 110 };
/** Gò giữa đồng bằng — nơi bọc trăm trứng phát sáng. */
export const KNOLL = { x: 6, z: 18 };
/** Đồi riêng ở trung du (gợi núi Nghĩa Lĩnh). */
export const HILL = { x: -64, z: 96, r: 34, h: 38 };

export function riverCenter(z: number) {
  return 34 + 26 * Math.sin(z * 0.011 + 0.6) + 7 * Math.sin(z * 0.037 + 2.1);
}
const riverHalf = (z: number) => 7 + smoothstep(40, -70, z) * 12;

/** 0 = đồng bằng, 1 = núi cao (theo z, mép núi răng cưa). */
export function mountainness(x: number, z: number) {
  return smoothstep(70, 210, z + (noise2(x * 0.012, 4.2) - 0.5) * 70);
}

export function height(x: number, z: number) {
  const m = mountainness(x, z);
  // sống núi: nhiễu "gợn" (1 - |2n - 1|) cho dãy núi có sống sắc
  const ridge = 1 - Math.abs(2 * fbm2(x * 0.011 + 3, z * 0.011 - 7, 5) - 1);
  const peaks = Math.pow(ridge, 1.8) * 95 + fbm2(x * 0.03, z * 0.03, 3) * 10;
  let h = 2.4 + (fbm2(x * 0.02 + 9, z * 0.02 + 1, 4) - 0.45) * 5 + m * peaks;
  // gò bọc trăm trứng + đồi trung du
  h += 4.5 * Math.exp(-((x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2) / 260);
  h += HILL.h * Math.exp(-((x - HILL.x) ** 2 + (z - HILL.z) ** 2) / (HILL.r * HILL.r));
  // sông
  const d = Math.abs(x - riverCenter(z));
  const half = riverHalf(z);
  h = lerp(-3.2 + (noise2(x * 0.1, z * 0.1) - 0.5) * 0.5, h, smoothstep(half - 2, half + 9, d) * (1 - m * 0.2) + m * 0.2);
  // bờ biển răng cưa, thềm cát rồi đáy biển
  const coast = smoothstep(-92, -48, z + (noise2(x * 0.025, 1.3) - 0.5) * 34);
  const seabed = -9 + noise2(x * 0.02, z * 0.02) * 3;
  return clamp(lerp(seabed, h, coast), BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  sand: new THREE.Color("#c2a46e"),
  mud: new THREE.Color("#5a4129"),
  paddy: new THREE.Color("#7f9a44"),
  paddyWet: new THREE.Color("#6a8a52"),
  grass: new THREE.Color("#5c8a38"),
  forest: new THREE.Color("#2c4e26"),
  forestHigh: new THREE.Color("#3a5a3a"),
  dirt: new THREE.Color("#7f6243"),
  rock: new THREE.Color("#7d7264"),
  mist: new THREE.Color("#b9b6a6"),
};
const tmp = new THREE.Color();

export function paddyCell(x: number, z: number) {
  return noise2(Math.floor(x / 10) * 1.7, Math.floor(z / 8) * 2.3);
}

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  const m = mountainness(x, z);
  if (h < 0.3) c.copy(C.mud).lerp(C.sand, smoothstep(-3, 0.3, h));
  else if (h < 2) c.copy(C.sand).lerp(C.grass, smoothstep(0.3, 2, h));
  else c.copy(C.grass).lerp(C.forest, smoothstep(0.2, 0.7, m) * 0.9);
  // ruộng trên đồng bằng thấp, cách sông một quãng
  const fromRiver = Math.abs(x - riverCenter(z)) - riverHalf(z);
  const field = smoothstep(1.4, 2.2, h) * (1 - smoothstep(5.5, 7, h)) * smoothstep(10, 22, fromRiver) * (1 - m) * smoothstep(-40, -10, z);
  if (field > 0.01) {
    const cell = paddyCell(x, z);
    tmp.copy(cell < 0.4 ? C.paddyWet : C.paddy).multiplyScalar(0.86 + cell * 0.3);
    c.lerp(tmp, field * 0.85);
    const fx = Math.abs((x / 10) % 1);
    const fz = Math.abs((z / 8) % 1);
    if (fx < 0.07 || fz < 0.09) c.lerp(C.sand, field * 0.3);
  }
  // núi cao: rừng sẫm loang, đỉnh nhạt dần trong mây
  if (h > 12) c.lerp(C.forestHigh, smoothstep(0.5, 0.75, fbm2(x * 0.03, z * 0.03, 3)) * 0.5);
  c.lerp(C.dirt, smoothstep(0.22, 0.4, slope) * 0.5);
  c.lerp(C.rock, smoothstep(0.42, 0.7, slope) * 0.75);
  c.lerp(C.mist, smoothstep(55, 95, h) * 0.55);
}
