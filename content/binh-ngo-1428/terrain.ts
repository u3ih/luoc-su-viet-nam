import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đông Quan / Đông Kinh bên sông Hồng (CÁCH ĐIỆU, không phải bản đồ có tư liệu): sông Hồng chảy từ bắc xuống nam ở phía đông; kinh thành
// là một vùng đất bằng bên bờ tây (không dựng tường thành, cung điện); trong kinh thành có một hồ nhỏ (gợi ý hồ Tả Vọng – Hoàn Kiếm); phía
// nam thành là bãi đất trống nơi hội thề; đồng ruộng, làng mạc trải ra bốn phía. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 60 };
export const WATER = 0.3;

/** Sông Hồng (diễn hoạ). */
export const HONG: [number, number][] = [[150, 430], [190, 300], [215, 150], [210, 0], [235, -150], [290, -300], [330, -430]];
const RIVERS: River[] = [{ pts: HONG, half: 34 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Trung tâm kinh thành, hồ trong thành, bãi hội thề phía nam thành. */
export const CITY: [number, number] = [0, 90];
export const LAKE = { x: 80, z: 30, rx: 26, rz: 42 };
export const OATH: [number, number] = [10, -90];

/** Đường tim sông (x) tại z — nội suy theo HONG. */
export function riverX(z: number) {
  for (let i = 0; i < HONG.length - 1; i++) {
    const [ax, az] = HONG[i];
    const [bx, bz] = HONG[i + 1];
    if (z <= az && z >= bz) return lerp(ax, bx, (az - z) / (az - bz));
  }
  return z > HONG[0][1] ? HONG[0][0] : HONG[HONG.length - 1][0];
}

export function lakeDist(x: number, z: number) {
  return Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz);
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  // đồi thấp ở xa, quanh mép bản đồ
  land += smoothstep(280, 420, Math.hypot(x - CITY[0], z - CITY[1])) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.6) * 40;
  // kinh thành: nền bằng
  land = lerp(land, 3, 1 - smoothstep(110, 170, Math.hypot(x - CITY[0], z - CITY[1])));
  // hồ trong thành
  const l = lakeDist(x, z) + (noise2(x * 0.06, z * 0.06) - 0.5) * 0.15;
  land = lerp(land, -1.8, 1 - smoothstep(0.85, 1.05, l));
  const h = lerp(-3.5, land, smoothstep(-4, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#829c48"),
  grass: new THREE.Color("#658a3a"),
  yard: new THREE.Color("#9a8a62"),
  forest: new THREE.Color("#33552b"),
  rock: new THREE.Color("#a49b88"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.paddy, smoothstep(-1.2, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  c.lerp(C.yard, (1 - smoothstep(90, 140, Math.hypot(x - CITY[0], z - CITY[1]))) * 0.4 * smoothstep(1.1, 1.4, lakeDist(x, z)));
  if (h > 8) c.lerp(C.forest, smoothstep(8, 26, h) * 0.55);
  c.lerp(C.rock, smoothstep(0.3, 0.52, slope) * 0.7);
}
