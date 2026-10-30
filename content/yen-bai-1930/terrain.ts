import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Miền Bắc (CÁCH ĐIỆU, không phải bản đồ có tư liệu): vùng núi ở tây bắc (Yên Bái, YEN_BAI), trung du ở giữa, đồng bằng ở đông nam; một con sông lớn chảy từ tây bắc xuống đông nam;
// Hà Nội (HA_NOI) bên bờ sông, các nơi khác rải trên đồng bằng ở phía đông. Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 130 };
export const WATER = 0.25;

export const SONG: [number, number][] = [[-300, 430], [-200, 260], [-90, 120], [10, 20], [80, -30], [150, -150], [200, -430]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 22 }] as River[], 12);

export const YEN_BAI: [number, number] = [-250, 230];
export const HUNG_HOA: [number, number] = [-170, 140];
export const LAM_THAO: [number, number] = [-130, 85];
export const SON_TAY: [number, number] = [-60, 20];
export const HA_NOI: [number, number] = [50, 0];
export const PHA_LAI: [number, number] = [250, 70];
export const VINH_BAO: [number, number] = [290, -120];
export const KIEN_AN: [number, number] = [320, -30];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.4 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 0.9;
  // núi ở tây bắc, thấp dần về phía đồng bằng
  land += smoothstep(120, 330, z - x * 0.6) * (10 + Math.pow(fbm2(x * 0.012 + 1, z * 0.012 + 5, 4), 1.4) * 70);
  land += smoothstep(200, 400, Math.hypot(x - 60, z + 40)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 20;
  for (const [c, r] of [[YEN_BAI, 60], [HA_NOI, 80], [SON_TAY, 45], [PHA_LAI, 45], [KIEN_AN, 45], [VINH_BAO, 45]] as [[number, number], number][]) land = lerp(land, Math.max(3.2, land * 0.25), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  const h = lerp(-3, land, smoothstep(-3, 8, dd));
  return clamp(h + (noise2(x * 0.3, z * 0.3) - 0.5) * 0.04, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  dry: new THREE.Color("#a09a5c"),
  forest: new THREE.Color("#33552b"),
  rock: new THREE.Color("#8d8a78"),
  sand: new THREE.Color("#a99a72"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.sand, smoothstep(-1.5, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  if (h > 10) c.lerp(C.forest, smoothstep(10, 28, h) * 0.7);
  c.lerp(C.rock, smoothstep(0.35, 0.8, slope) * 0.6);
}
