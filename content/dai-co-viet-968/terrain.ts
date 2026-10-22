import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng Hoa Lư và đồng bằng phía đông bắc (CÁCH ĐIỆU, không phải bản đồ có tư liệu): quanh Hoa Lư là những dãy núi đá vôi
// dựng đứng bao một thung lũng bằng phẳng; xa hơn về phía đông bắc là đồng bằng thấp có hai dòng sông. Chỉ gợi ý ý "kinh đô
// núi đá hiểm trở, đồng bằng rộng" mà nguồn nêu; vị trí, hình dạng núi và sông không khẳng định. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 110 };
export const WATER = 0.2;
/** Hoa Lư: thung lũng giữa núi đá vôi, chỗ dựng cung điện. */
export const HL: [number, number] = [-220, -160];

/** Mười hai cứ điểm (diễn hoạ; số lượng theo cách gọi của sử cũ, vị trí là gợi ý). */
export const BASES: [number, number][] = [
  [-90, -40], [-20, 60], [50, -70], [-150, 90], [30, 170], [-70, 240],
  [110, 110], [250, 40], [290, -130], [260, 230], [120, 300], [-190, 250],
];

const RIVERS: River[] = [
  // sông nhỏ chảy qua chân núi Hoa Lư
  { pts: [[-400, -330], [-330, -240], [-260, -215], [-170, -170], [-90, -150], [20, -110], [110, -40], [190, -10]], half: 11 },
  // sông lớn phía đông
  { pts: [[180, -400], [168, -250], [186, -100], [172, 20], [150, 150], [165, 300], [190, 400]], half: 24 },
];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

/** Núi đá vôi dựng đứng quanh Hoa Lư (0..1). */
function karst(x: number, z: number) {
  const d = Math.hypot(x - HL[0], z - HL[1]);
  const ring = smoothstep(46, 72, d) * (1 - smoothstep(120, 175, d));
  const tower = smoothstep(0.56, 0.68, fbm2(x * 0.028 + 7, z * 0.028 - 3, 3));
  return ring * tower;
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  land += karst(x, z) * (46 + noise2(x * 0.05, z * 0.05) * 26);
  let h = lerp(-3, land, smoothstep(-3, 10, dd));
  // bờ bãi thấp
  h = Math.min(h, 3.2 + smoothstep(16, 40, dd) * 80);
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  rock: new THREE.Color("#a49b88"),
  forest: new THREE.Color("#33552b"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.7) c.copy(C.mud).lerp(C.paddy, smoothstep(-1.2, 0.7, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  if (h > 8) c.lerp(C.forest, smoothstep(8, 28, h) * 0.55);
  c.lerp(C.rock, smoothstep(0.28, 0.5, slope) * 0.8);
}
