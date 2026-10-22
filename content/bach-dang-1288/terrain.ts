import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Cửa sông lớn nhiều đồi (CÁCH ĐIỆU, không phải bản đồ có tư liệu): một con sông rộng chảy từ tây sang đông ra biển ở mép phải bản đồ; hai bờ là đồi thấp
// và bãi bồi; phía tây là chỗ đặt kinh thành bỏ trống. Chỉ gợi ý "sông rộng chịu ảnh hưởng triều, đồi hai bên, nhiều lạch nhỏ" mà các nguồn nêu; vị trí thật
// bãi cọc không được khẳng định. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 90 };
/** Mực nước khi triều lên cao nhất / rút thấp nhất (người xem kéo ở phân cảnh "con-nuoc"). */
export const TIDE_HIGH = 2.0;
export const TIDE_LOW = -1.8;
/** Ngọn cọc (đóng sao cho mực triều cao nhấn chìm, triều thấp làm lộ). */
export const STAKE_TOP = 0.9;

const MAIN: River = { pts: [[-430, 100], [-300, 70], [-160, 30], [-20, -10], [110, -30], [250, -40], [430, -70]], half: 50 };
const BRANCH: River = { pts: [[120, 400], [150, 220], [140, 90], [112, -10]], half: 12 };
const BRANCH_S: River = { pts: [[230, -400], [215, -250], [225, -120], [215, -50]], half: 12 };
export const { riverDist, bankDist } = createRivers([MAIN, BRANCH, BRANCH_S], 12);

/** Đường tim sông chính (z) tại x. */
export function riverZ(x: number) {
  const p = MAIN.pts;
  for (let i = 0; i < p.length - 1; i++) if (x <= p[i + 1][0]) return lerp(p[i][1], p[i + 1][1], clamp((x - p[i][0]) / (p[i + 1][0] - p[i][0])));
  return p[p.length - 1][1];
}

/** Thăng Long (bờ bắc phía tây), nơi đại quân Nguyên đóng; khu cọc trên sông ở x ≈ 110. */
export const TL: [number, number] = [-250, 165];
export const STAKE_X = 112;

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  land += smoothstep(40, 190, dd) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.5) * 80;
  const h = lerp(-4.6, land, smoothstep(-5, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#a79a72"),
  grass: new THREE.Color("#69883c"),
  dry: new THREE.Color("#8b8f4c"),
  forest: new THREE.Color("#2f4f2a"),
  stone: new THREE.Color("#8a8272"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.6) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 0.5, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.6);
  if (h > 14) c.lerp(C.forest, smoothstep(14, 44, h) * 0.7);
  c.lerp(C.stone, smoothstep(0.32, 0.55, slope) * 0.6);
}
