import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng rộng với hai dòng sông chảy gần như bắc–nam (CÁCH ĐIỆU, không phải bản đồ có tư liệu): giữa bản đồ là nơi đặt điện Diên Hồng ở
// kinh đô (HALL), hai bên là làng mạc ruộng đồng, rìa phía bắc có dải đồi (hướng quân Nguyên kéo xuống). +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 70 };
export const WATER = 0.2;
/** Chỗ đặt điện Diên Hồng (tượng trưng) ở kinh đô. */
export const HALL: [number, number] = [0, 0];

const RIVERS: River[] = [
  { pts: [[140, -430], [170, -250], [190, -60], [165, 140], [205, 300], [190, 430]], half: 28 },
  { pts: [[-210, -430], [-170, -240], [-195, -40], [-160, 170], [-205, 330], [-190, 430]], half: 14 },
];
export const { riverDist, bankDist } = createRivers(RIVERS, 11);

/** Tám nơi các bô lão từ các lộ về Thăng Long (diễn hoạ): trên đồng bằng, cách đều quanh kinh đô. */
export const PLACES: [number, number][] = [
  [-300, 240], [-110, 330], [110, 340], [310, 220], [330, -110], [160, -310], [-120, -300], [-310, -90],
];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.5 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  // dải đồi ở rìa bắc
  land += smoothstep(280, 400, z) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.3) * 60;
  // đồi thấp rải rác ở rìa nam
  land += smoothstep(300, 420, -z) * Math.pow(fbm2(x * 0.013 - 3, z * 0.013 + 6, 4), 1.5) * 30;
  const h = lerp(-3, land, smoothstep(-3, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#85a14b"),
  grass: new THREE.Color("#648a3a"),
  earth: new THREE.Color("#8a7a54"),
  forest: new THREE.Color("#33552b"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.paddy, smoothstep(-1.2, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  // nền đất nện quanh kinh đô
  c.lerp(C.earth, Math.exp(-((x - HALL[0]) ** 2 + (z - HALL[1]) ** 2) / (55 * 55)) * 0.7);
  if (h > 8) c.lerp(C.forest, smoothstep(8, 40, h) * 0.55);
  c.lerp(C.earth, smoothstep(0.3, 0.5, slope) * 0.5);
}
