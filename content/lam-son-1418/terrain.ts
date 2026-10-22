import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Miền núi tây Thanh Hoá (CÁCH ĐIỆU, không phải bản đồ có tư liệu): sông Chu chảy từ tây sang đông giữa thung lũng; Lam Sơn ở bờ bắc;
// núi Chí Linh cao nhất ở phía tây (thượng nguồn); Lũng Nhai là một khoảng trống giữa rừng đồi phía tây bắc; phía đông thung lũng mở ra
// đồng bằng (hướng Tây Đô); một lối đi qua đồi xuống phía nam (hướng Nghệ An). Vị trí thật của Lũng Nhai, Chí Linh còn được bàn luận —
// đây chỉ là gợi ý "vùng núi rừng hiểm trở bên sông". +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 200 };
export const WATER = 0.4;

/** Sông Chu (diễn hoạ). */
export const CHU: [number, number][] = [[-430, 60], [-300, 40], [-160, -10], [-20, -20], [120, 10], [260, -10], [430, 20]];
const RIVERS: River[] = [{ pts: CHU, half: 16 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

export const LAM_SON: [number, number] = [-40, 50];
export const CHI_LINH: [number, number] = [-260, 200];
export const LUNG_NHAI: [number, number] = [-150, 290];
/** Lối xuống phía nam (hướng Nghệ An). */
export const PASS_S: [number, number][] = [[-40, 40], [-10, -40], [40, -150], [20, -270], [60, -430]];
const pass = createRivers([{ pts: PASS_S, half: 0 }], 12);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  const dp = pass.bankDist(x, z);
  let land = 2.8 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.2;
  // đồi núi hai bên thung lũng, thấp dần về phía đông
  const hills = smoothstep(30, 150, dd) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 110 * (1 - smoothstep(80, 380, x) * 0.7);
  land += hills * smoothstep(18, 60, dp);
  // núi Chí Linh
  land += 80 * Math.exp(-((x - CHI_LINH[0]) ** 2 + (z - CHI_LINH[1]) ** 2) / (70 * 70));
  // bãi bằng ở Lam Sơn và Lũng Nhai để thấy rõ người tụ họp
  land = lerp(land, 5, 1 - smoothstep(30, 70, Math.hypot(x - LAM_SON[0], z - LAM_SON[1])));
  land = lerp(land, 22, 1 - smoothstep(18, 40, Math.hypot(x - LUNG_NHAI[0], z - LUNG_NHAI[1])));
  const h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#a79a72"),
  grass: new THREE.Color("#628a3a"),
  dry: new THREE.Color("#8b8f4c"),
  forest: new THREE.Color("#2c4c28"),
  stone: new THREE.Color("#8a8272"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 1) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 1, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.5);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 40, h) * 0.75);
  c.lerp(C.stone, smoothstep(0.34, 0.58, slope) * 0.6);
}
