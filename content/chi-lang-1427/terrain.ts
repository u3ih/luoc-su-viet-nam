import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đường từ Lạng Sơn xuống Xương Giang (CÁCH ĐIỆU, khoảng cách thu ngắn rất nhiều, không phải bản đồ có tư liệu): phía bắc là thung lũng hẹp
// Chi Lăng kẹp giữa hai dãy núi đá, có núi Mã Yên nhô lên giữa lòng thung; thung lũng mở ra phía nam thành vùng đồi thấp (Cần Trạm,
// Phố Cát) rồi cánh đồng Xương Giang bên sông Thương. Mép tây bắc bản đồ là hướng đạo quân Mộc Thạnh (Lê Hoa). +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 120 };
export const WATER = 0.3;

/** Đường cái qua thung lũng Chi Lăng xuống Xương Giang (diễn hoạ). */
export const ROAD: [number, number][] = [[70, 430], [50, 320], [20, 210], [10, 110], [-10, 20], [-40, -80], [-60, -170], [-50, -250]];
const road = createRivers([{ pts: ROAD, half: 0 }], 10);
/** Sông Thương (diễn hoạ). */
export const THUONG: [number, number][] = [[-430, -300], [-250, -330], [-80, -320], [100, -350], [260, -330], [430, -360]];
const RIVERS: River[] = [{ pts: THUONG, half: 20 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

export const MA_YEN: [number, number] = [36, 170];
export const CAN_TRAM: [number, number] = [-40, -80];
export const PHO_CAT: [number, number] = [-60, -170];
export const XUONG_GIANG: [number, number] = [-40, -255];
/** Hướng Lê Hoa (tây bắc) — nơi đạo quân Mộc Thạnh tới rồi rút (diễn hoạ). */
export const LE_HOA: [number, number] = [-330, 260];

/** Độ "hẹp" của thung lũng: 1 trong đoạn ải phía bắc, 0 ở vùng đồng bằng phía nam. */
const gorge = (z: number) => smoothstep(-20, 120, z);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  const dr = road.bankDist(x, z);
  let land = 3 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.2;
  // hai dãy núi đá kẹp thung lũng ở phía bắc; xuống phía nam chỉ còn đồi thấp
  const wallH = lerp(26, 110, gorge(z)) * (0.6 + 0.6 * fbm2(x * 0.02 + 5, z * 0.02 + 9, 4));
  const width = lerp(130, 34, gorge(z));
  land += smoothstep(width * 0.5, width * 1.6, dr) * wallH;
  // núi Mã Yên giữa lòng thung
  land += 46 * Math.exp(-((x - MA_YEN[0]) ** 2 + (z - MA_YEN[1]) ** 2) / (22 * 22)) * (0.85 + 0.3 * noise2(x * 0.1, z * 0.1));
  // cánh đồng Xương Giang: phẳng
  land = lerp(land, 3, 1 - smoothstep(70, 140, Math.hypot(x - XUONG_GIANG[0], z - XUONG_GIANG[1])));
  const h = lerp(-3, land, smoothstep(-4, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#a79a72"),
  grass: new THREE.Color("#678a3c"),
  paddy: new THREE.Color("#829c48"),
  forest: new THREE.Color("#2c4c28"),
  stone: new THREE.Color("#948c7a"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 0.8, h));
  else c.copy(C.grass).lerp(C.paddy, (1 - smoothstep(4, 9, h)) * smoothstep(-60, -200, z));
  if (h > 12) c.lerp(C.forest, smoothstep(12, 40, h) * 0.7);
  c.lerp(C.stone, smoothstep(0.3, 0.55, slope) * 0.75);
}
