import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng Mê Linh (cách điệu): sông Hồng chảy tây → đông ở phía nam, núi Ba Vì ba đỉnh ở phía tây,
// đồi thấp trung du phía bắc. Gốc toạ độ ≈ đất Mê Linh.

export const BOUNDS: HeightBounds = { minX: -380, minZ: -360, sizeX: 760, sizeZ: 720, minH: -8, maxH: 170 };
export const WATER = 0;
/** Đất Mê Linh — nơi đốm lửa đầu tiên bùng lên. */
export const ME_LINH = { x: 0, z: 20 };

export function riverZ(x: number) {
  return -130 + 26 * Math.sin(x * 0.007 + 0.5) + 9 * Math.sin(x * 0.023 + 1.7);
}
const riverHalf = (x: number) => 26 + 8 * Math.sin(x * 0.011);

// Ba Vì: ba đỉnh liền nhau (đỉnh Vua, Tản Viên, Ngọc Hoa), cách điệu
const PEAKS: [number, number, number, number][] = [
  [-300, 72, 70, 30],
  [-266, 96, 62, 26],
  [-332, 106, 56, 28],
];

export function height(x: number, z: number) {
  let h = 2.4 + (fbm2(x * 0.014 + 5, z * 0.014 - 3, 4) - 0.5) * 3;
  // đồi trung du phía bắc
  h += smoothstep(120, 300, z) * Math.pow(fbm2(x * 0.016 - 2, z * 0.016 + 6, 5), 1.6) * 60;
  // khối núi Ba Vì
  for (const [px, pz, ph, pr] of PEAKS) h += ph * Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (pr * pr));
  // thân núi rộng, sườn nhiều khe rãnh (nhiễu "gợn" cho sống núi sắc)
  const mass = Math.exp(-((x + 295) ** 2 + (z - 88) ** 2) / (120 * 120));
  const ridge = 1 - Math.abs(2 * fbm2(x * 0.022 + 1, z * 0.022 + 4, 5) - 1);
  h += mass * (26 + Math.pow(ridge, 1.6) * 40);
  // sông Hồng
  const d = Math.abs(z - riverZ(x));
  const half = riverHalf(x);
  h = lerp(-4 + (noise2(x * 0.06, z * 0.06) - 0.5), h, smoothstep(half - 4, half + 14, d));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5e4429"),
  sand: new THREE.Color("#b29464"),
  paddy: new THREE.Color("#7f9a44"),
  paddyWet: new THREE.Color("#6a8a52"),
  grass: new THREE.Color("#5f8a3a"),
  forest: new THREE.Color("#2c4e26"),
  dirt: new THREE.Color("#7f6243"),
  rock: new THREE.Color("#7a7062"),
  mist: new THREE.Color("#a9ab9c"),
};
const tmp = new THREE.Color();

export function paddyCell(x: number, z: number) {
  return noise2(Math.floor(x / 10) * 1.7, Math.floor(z / 8) * 2.3);
}

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.4) c.copy(C.mud).lerp(C.sand, smoothstep(-3, 0.4, h));
  else if (h < 2) c.copy(C.sand).lerp(C.grass, smoothstep(0.4, 2, h));
  else c.copy(C.grass).lerp(C.forest, smoothstep(8, 30, h));
  const field = smoothstep(1.6, 2.3, h) * (1 - smoothstep(5, 6.5, h)) * smoothstep(12, 26, Math.abs(z - riverZ(x)) - riverHalf(x));
  if (field > 0.01) {
    const cell = paddyCell(x, z);
    tmp.copy(cell < 0.4 ? C.paddyWet : C.paddy).multiplyScalar(0.86 + cell * 0.3);
    c.lerp(tmp, field * 0.85);
    const fx = Math.abs((x / 10) % 1);
    const fz = Math.abs((z / 8) % 1);
    if (fx < 0.07 || fz < 0.09) c.lerp(C.sand, field * 0.3);
  }
  c.lerp(C.dirt, smoothstep(0.22, 0.4, slope) * 0.5);
  c.lerp(C.rock, smoothstep(0.45, 0.7, slope) * 0.7);
  c.lerp(C.mist, smoothstep(70, 115, h) * 0.5);
}
