import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Cửa sông lớn nhiều đồi (CÁCH ĐIỆU, không phải bản đồ có tư liệu): một con sông rộng chảy từ tây sang đông ra biển ở mép phải bản đồ;
// hai bờ là đồi thấp; phía tây bắc có một thung lũng hẹp len giữa đồi, nơi đường bộ đi xuống. Chỉ gợi ý "sông rộng chảy ra biển,
// đồi hai bên, một lối núi" mà các nguồn nêu; vị trí thật các trận không được khẳng định. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 80 };
export const WATER = 0;

const MAIN: River = { pts: [[-430, 70], [-290, 50], [-150, 0], [-20, -34], [120, -26], [260, 6], [430, 46]], half: 42 };
export const { riverDist, bankDist } = createRivers([MAIN], 12);
/** Đường bộ đi xuống qua thung lũng phía tây bắc, tới bờ bắc sông. */
export const PASS: [number, number][] = [[-240, 410], [-250, 280], [-205, 160], [-150, 60], [-110, 10]];
const pass = createRivers([{ pts: PASS, half: 0 }], 14);

/** Đường tim sông (z) tại x — để đặt bãi cọc, tuyến thuyền (nội suy theo MAIN.pts). */
export function riverZ(x: number) {
  const p = MAIN.pts;
  for (let i = 0; i < p.length - 1; i++) {
    if (x <= p[i + 1][0]) return lerp(p[i][1], p[i + 1][1], clamp((x - p[i][0]) / (p[i + 1][0] - p[i][0])));
  }
  return p[p.length - 1][1];
}

/** Đồi nơi vua họp triều, thu quân (phía tây nam), và trại quân Việt ở bờ nam. */
export const COURT: [number, number] = [-290, -190];
export const LE_CAMP: [number, number] = [-40, -140];
/** Khu cọc ngầm: x của các đường cọc. */
export const STAKE_X = -40;

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  const dp = pass.bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  const hills = smoothstep(40, 170, dd) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.5) * 90;
  land += hills * smoothstep(22, 70, dp);
  // đồi họp triều: bãi bằng quanh COURT để thấy rõ người tụ họp
  land = lerp(land, 6, 1 - smoothstep(28, 75, Math.hypot(x - COURT[0], z - COURT[1])));
  const h = lerp(-4.5, land, smoothstep(-5, 9, dd));
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
