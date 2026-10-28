import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Hai bờ và biển ở giữa (CÁCH ĐIỆU, không phải bản đồ có tư liệu): đất liền Việt Nam ở phía tây (Quảng Nam ở ven biển, núi phía sau), đất Nhật Bản ở phía đông (một bến lớn ven biển,
// núi phía sau), biển ở giữa. Không theo tỉ lệ hay hình dáng thật; chỉ gợi ý hành trình vượt biển. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 90 };
export const WATER = 0.3;

/** Con sông nhỏ ở bờ Việt Nam (diễn hoạ). */
export const SONG: [number, number][] = [[-430, 120], [-350, 40], [-290, -10], [-215, 20]];
const RIVERS: River[] = [{ pts: SONG, half: 10 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 8);

/** Quảng Nam: bờ phía tây, nơi lập Duy Tân hội. */
export const QUANG_NAM: [number, number] = [-290, -40];
/** Bến ở Nhật Bản: bờ phía đông, nơi thanh niên tới học. */
export const NHAT_BAN: [number, number] = [300, 40];
/** Giữa biển, nơi hai bên gặp nhau trong cảnh cuối. */
export const GIUA_BIEN: [number, number] = [0, 5];
/** Đường vượt biển từ Quảng Nam sang Nhật Bản. */
export const DUONG_BIEN: [number, number][] = [[-205, -10], [-100, -25], [0, 0], [110, 40], [205, 40]];
export const HAI_BO_VIET: [number, number] = [-210, -15];
export const HAI_BO_NHAT: [number, number] = [215, 38];

/** Biển ở giữa: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => {
  const wobble = (noise2(z * 0.012 + 3, 5) - 0.5) * 70;
  const west = smoothstep(30, -30, x + 215 + wobble);
  const east = smoothstep(-30, 30, x - 215 - wobble * 0.8);
  return 1 - Math.max(west, east);
};

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.8 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // núi phía sau hai bờ
  land += smoothstep(-300, -400, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 70;
  land += smoothstep(330, 400, x) * Math.pow(fbm2(x * 0.011 - 4, z * 0.011 + 6, 4), 1.4) * 80;
  for (const [c, r] of [[QUANG_NAM, 65], [NHAT_BAN, 75]] as [[number, number], number][]) land = lerp(land, 4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  h = lerp(h, -5, sea(x, z));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#c2b184"),
  grass: new THREE.Color("#6a8d3e"),
  dry: new THREE.Color("#92934e"),
  forest: new THREE.Color("#2d4d29"),
  rock: new THREE.Color("#8d8574"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 1) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 1, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.5);
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x > 0 ? x - 12 : x + 12, z) - 0.04) * smoothstep(10, 0.5, h) * 0.8);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
