import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng hạ lưu sông Đáy (CÁCH ĐIỆU, không phải bản đồ có tư liệu): sông lớn chảy từ bắc xuống nam, ra biển ở góc đông nam; phía tây nam
// là vùng núi đá vôi (gợi ý Mô Độ, Yên Mô); bến Bô Cô ở bờ tây sông. Phía bắc bản đồ là hướng Đông Quan (Hà Nội), phía nam là hướng
// Nghệ An, Thuận Hoá. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 100 };
export const WATER = 0.2;

/** Sông Đáy (diễn hoạ) từ bắc xuống nam rồi ra biển. */
export const DAY: [number, number][] = [[40, 430], [60, 280], [30, 140], [55, 20], [90, -110], [140, -230], [220, -330], [300, -430]];
const RIVERS: River[] = [{ pts: DAY, half: 26 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 12);

/** Mô Độ: thung lũng giữa núi đá vôi phía tây nam. */
export const MO_DO: [number, number] = [-230, -200];
/** Bến Bô Cô: bờ tây sông Đáy. */
export const BO_CO: [number, number] = [20, 30];
/** Hướng Đông Quan (bắc) và hướng Nghệ An, Thuận Hoá (nam) — điểm ở mép bản đồ. */
export const NORTH: [number, number] = [-40, 430];
export const SOUTH: [number, number] = [-160, -430];

/** Đường tim sông (x) tại z — nội suy theo DAY (để đặt quân trên mặt sông). */
export function riverX(z: number) {
  for (let i = 0; i < DAY.length - 1; i++) {
    const [ax, az] = DAY[i];
    const [bx, bz] = DAY[i + 1];
    if (z <= az && z >= bz) return lerp(ax, bx, (az - z) / (az - bz));
  }
  return z > DAY[0][1] ? DAY[0][0] : DAY[DAY.length - 1][0];
}

function karst(x: number, z: number) {
  const d = Math.hypot(x - MO_DO[0], z - MO_DO[1]);
  const ring = smoothstep(40, 70, d) * (1 - smoothstep(150, 200, d));
  const tower = smoothstep(0.55, 0.68, fbm2(x * 0.03 + 7, z * 0.03 - 3, 3));
  return ring * tower;
}

/** Biển ở góc đông nam: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => smoothstep(-40, 20, x - z * 0.9 - 560 + (noise2(x * 0.01, z * 0.01) - 0.5) * 60);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.4 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  land += karst(x, z) * (42 + noise2(x * 0.05, z * 0.05) * 24);
  // đồi thấp xa phía tây bắc
  land += smoothstep(-120, -320, x) * smoothstep(0, 240, z) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.6) * 50;
  let h = lerp(-3.5, land, smoothstep(-4, 9, dd));
  h = lerp(h, -4, sea(x, z));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  sand: new THREE.Color("#a99a72"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  rock: new THREE.Color("#a49b88"),
  forest: new THREE.Color("#33552b"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.sand, smoothstep(-1.5, 0.8, h) * sea(x, z + 40));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  if (h > 8) c.lerp(C.forest, smoothstep(8, 28, h) * 0.55);
  c.lerp(C.rock, smoothstep(0.28, 0.5, slope) * 0.8);
}
