import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đồng bằng ven biển Thanh Hoá (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông; vùng đất thấp nhiều chỗ ngập quanh ba làng ở phía bắc; một con sông nhỏ chảy từ
// phía tây ra biển; về phía tây là đồi núi — Đồng Biên và Mã Cao; phía nam xa là thành phố Thanh Hoá. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều,
// hình dáng sông, đất không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 80 };
export const WATER = 0.3;

/** Sông nhỏ chảy từ phía tây ra biển (diễn hoạ). */
export const SONG: [number, number][] = [[-430, 120], [-300, 60], [-190, 170], [-100, 120], [-30, 150], [120, 190], [250, 160], [340, 190]];
const RIVERS: River[] = [{ pts: SONG, half: 12 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Trung tâm căn cứ Ba Đình và ba làng quanh đó. */
export const BA_DINH: [number, number] = [0, 40];
export const LANG_BA: [number, number][] = [[-48, 60], [48, 60], [0, -4]];
/** Vòng luỹ quanh ba làng (diễn hoạ). */
export const LUY: [number, number][] = [[-95, 85], [0, 118], [95, 85], [105, 20], [60, -45], [-60, -45], [-105, 20], [-95, 85]];
/** Đồng Biên: nơi các thủ lĩnh họp, phía tây. */
export const DONG_BIEN: [number, number] = [-270, 150];
/** Mã Cao: căn cứ nghĩa quân rút về, phía tây nam. */
export const MA_CAO: [number, number] = [-300, -140];
/** Thanh Hoá (toà sứ): phía nam xa. */
export const THANH_HOA: [number, number] = [90, -300];
/** Đường quân Pháp từ Thanh Hoá lên Ba Đình. */
export const DUONG_PHAP: [number, number][] = [THANH_HOA, [70, -190], [40, -100], [20, -50]];
/** Đường nghĩa quân phá vây về Mã Cao. */
export const DUONG_RUT: [number, number][] = [[-60, 20], [-130, -10], [-210, -80], MA_CAO];

const sea = (x: number, z: number) => smoothstep(-35, 30, x - 310 - (noise2(z * 0.01 + 4, 5) - 0.5) * 80);

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 1.2 + (fbm2(x * 0.018 + 3, z * 0.018 - 1, 3) - 0.5) * 1.8;
  // đồi núi phía tây
  land += smoothstep(-170, -340, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 55;
  // bãi trũng ngập quanh ba làng
  land -= smoothstep(150, 70, Math.hypot(x - BA_DINH[0], (z - BA_DINH[1]) * 1.2)) * smoothstep(40, 100, Math.hypot(x - BA_DINH[0], (z - BA_DINH[1]) * 1.2)) * 0.9;
  if (land < 0.55) land = 0.55 - (0.55 - land) * 3.5;
  for (const [c, r] of [[BA_DINH, 60], ...LANG_BA.map((l) => [l, 26] as [[number, number], number]), [DONG_BIEN, 50], [MA_CAO, 50], [THANH_HOA, 55]] as [[number, number], number][])
    land = lerp(land, 3.4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-2.8, land, smoothstep(-3, 8, dd));
  h = lerp(h, -5, sea(x, z));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  sand: new THREE.Color("#c2b184"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  dry: new THREE.Color("#9a9b52"),
  forest: new THREE.Color("#2d4d29"),
  rock: new THREE.Color("#8d8574"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(8, 0.5, h) * 0.8);
  if (h > 10) c.lerp(C.forest, smoothstep(10, 40, h) * 0.7);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
