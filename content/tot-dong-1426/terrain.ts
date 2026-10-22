import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Phía tây nam Đông Quan (CÁCH ĐIỆU, khoảng cách thu ngắn rất nhiều, không phải bản đồ có tư liệu): sông Hồng chảy chéo ở phía đông bắc,
// Đông Quan bên bờ tây, dinh Bồ Đề bên bờ đông; phía tây nam là vùng đồng trũng nhiều ao đầm, bùn lầy (Tốt Động, Chúc Động), xa hơn là
// Cao Bộ dưới chân đồi thấp. Không dựng thành Đông Quan vì chưa rõ hình dạng. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 70 };
export const WATER = 0.3;

/** Sông Hồng (diễn hoạ). */
export const HONG: [number, number][] = [[80, 430], [200, 320], [235, 200], [255, 60], [320, -100], [430, -240]];
const RIVERS: River[] = [{ pts: HONG, half: 30 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

export const DONG_QUAN: [number, number] = [140, 230];
export const BO_DE: [number, number] = [310, 220];
export const CAO_BO: [number, number] = [-250, -210];
export const TOT_DONG: [number, number] = [-110, -60];
export const CHUC_DONG: [number, number] = [-30, -170];

/** Vùng đồng trũng: 0 = đất thường, 1 = giữa đồng lầy. */
export function marsh(x: number, z: number) {
  const d = Math.min(Math.hypot(x - TOT_DONG[0], z - TOT_DONG[1]), Math.hypot(x - CHUC_DONG[0], z - CHUC_DONG[1]), Math.hypot(x - (TOT_DONG[0] + CHUC_DONG[0]) / 2, z - (TOT_DONG[1] + CHUC_DONG[1]) / 2));
  return 1 - smoothstep(70, 150, d);
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.2 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  // đồi thấp phía tây nam, sau Cao Bộ
  land += smoothstep(-200, -380, x + z * 0.3) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.5) * 60;
  // đồng trũng: ao đầm lấm tấm, mặt bùn sát mực nước
  const m = marsh(x, z);
  const ponds = smoothstep(0.5, 0.62, fbm2(x * 0.03 + 11, z * 0.03 - 4, 3));
  land = lerp(land, lerp(WATER + 0.35 + noise2(x * 0.1, z * 0.1) * 0.3, -0.6, ponds), m);
  const h = lerp(-3, land, smoothstep(-4, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#55432d"),
  bog: new THREE.Color("#6b6a3e"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  forest: new THREE.Color("#33552b"),
  rock: new THREE.Color("#a49b88"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.paddy, smoothstep(-1.2, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  c.lerp(C.bog, marsh(x, z) * 0.7);
  if (h > 8) c.lerp(C.forest, smoothstep(8, 26, h) * 0.55);
  c.lerp(C.rock, smoothstep(0.3, 0.52, slope) * 0.7);
}
