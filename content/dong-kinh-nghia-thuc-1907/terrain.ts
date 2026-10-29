import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng đồng bằng quanh Hà Nội (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đồng bằng thấp, một con sông lớn chảy từ bắc xuống nam ở phía đông; Hà Nội (HA_NOI) bên bờ sông;
// phố Hàng Đào (HANG_DAO) trong khu thành thị; các tỉnh lân cận rải xung quanh; đồi thấp ở rìa tây và bắc. Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 60 };
export const WATER = 0.25;

/** Sông lớn (diễn hoạ). */
export const SONG: [number, number][] = [[210, 430], [185, 300], [215, 160], [190, 20], [220, -120], [195, -260], [225, -430]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 26 }] as River[], 12);

/** Hà Nội: đất bằng gần bờ sông. */
export const HA_NOI: [number, number] = [60, 40];
/** Phố Hàng Đào: trong khu thành thị, gần bờ sông. */
export const HANG_DAO: [number, number] = [10, 30];
/** Các tỉnh lân cận (diễn hoạ): Hà Đông, Hoài Đức, Hưng Yên, Hải Dương, Thái Bình. */
export const TINH: [number, number][] = [[-120, -60], [-150, 110], [120, -230], [300, -40], [270, -300]];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.4 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  land += smoothstep(200, 420, Math.hypot(x + 60, z - 30)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 40;
  for (const [c, r] of [[HA_NOI, 85], [HANG_DAO, 70]] as [[number, number], number][]) land = lerp(land, 3.2, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  const h = lerp(-3, land, smoothstep(-3, 8, dd));
  return clamp(h + (noise2(x * 0.3, z * 0.3) - 0.5) * 0.04, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  dry: new THREE.Color("#a09a5c"),
  forest: new THREE.Color("#33552b"),
  court: new THREE.Color("#a99a72"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, _slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.court, smoothstep(-1.5, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  if (h > 8) c.lerp(C.forest, smoothstep(8, 20, h) * 0.6);
  c.lerp(C.court, (1 - smoothstep(18, 60, Math.hypot(x - HANG_DAO[0], z - HANG_DAO[1]))) * smoothstep(0.9, 1.6, h) * 0.5);
}
