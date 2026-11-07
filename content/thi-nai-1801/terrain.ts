import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Đầm Thị Nại và cửa biển (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông, đầm rộng (DAM) thông ra biển qua cửa hẹp (CUA); núi nhỏ hai bên cửa có bảo Tam Tòa (TAM_TOA) ở bắc, Nhạn Châu (NHAN_CHAU) ở nam; Hổ Cơ (HO_CO) ở bờ nam đầm; thành Bình Định (THANH_BD) trong đất liền phía tây; một con sông đổ vào đầm; NGOAI là chỗ thủy quân Nguyễn đậu ngoài cửa.
// Chỉ gợi ý quan hệ vị trí; khoảng cách thu ngắn rất nhiều. +z hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 130 };
export const WATER = 0.3;

export const SONG: [number, number][] = [[-140, 40], [0, 25], [100, 15], [180, 5]];
export const SONG1: [number, number][] = [[170, 5], [240, -5], [320, -15]];
export const SONG2: [number, number][] = [[-400, 140], [-260, 90], [-150, 45]];
export const { riverDist, bankDist } = createRivers([{ pts: SONG, half: 66 }, { pts: SONG1, half: 16 }, { pts: SONG2, half: 14 }] as River[], 10);

export const THANH_BD: [number, number] = [-210, -90];
export const DAM: [number, number] = [30, 20];
export const CUA: [number, number] = [255, -8];
export const TAM_TOA: [number, number] = [235, 70];
export const NHAN_CHAU: [number, number] = [215, -75];
export const HO_CO: [number, number] = [70, -60];
export const NGOAI: [number, number] = [350, -20];

const sea = (x: number, z: number) => smoothstep(-30, 30, x - 280 - (noise2(z * 0.01 + 7, 5) - 0.5) * 70);
/** Núi: [x, z, bán kính, cao]. */
const NUI: [number, number, number, number][] = [[235, 75, 48, 46], [215, -80, 44, 34], [-300, -250, 130, 60]];
/** Đảo: [x, z, bán kính, cao]. */
const DAO: [number, number, number, number][] = [];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.5 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  land += smoothstep(200, 420, Math.hypot(x, z)) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.6) * 24;
  for (const [mx, mz, r, mh] of NUI) {
    const d = Math.hypot(x - mx, z - mz) / r;
    land += mh * Math.exp(-d * d * 2.2) * (0.75 + 0.5 * fbm2(x * 0.03 + mx, z * 0.03 + mz, 4));
  }
  for (const [c, r] of [[THANH_BD, 60]] as [[number, number], number][]) land = lerp(land, Math.min(land, 3.3), 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
  let h = lerp(-3, land, smoothstep(-3, 8, dd));
  h = lerp(h, -6, sea(x, z));
  for (const [ix, iz, r, ih] of DAO) {
    const d = Math.hypot(x - ix, z - iz);
    const k = smoothstep(r, r * 0.35, d + (fbm2(x * 0.04 + ix, z * 0.04, 3) - 0.5) * r * 0.5);
    h = Math.max(h, lerp(-6, ih * (0.7 + 0.5 * fbm2(x * 0.05, z * 0.05 + iz, 3)), k));
  }
  return clamp(h + (noise2(x * 0.3, z * 0.3) - 0.5) * 0.04, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  sand: new THREE.Color("#b3a479"),
  paddy: new THREE.Color("#7f9a47"),
  grass: new THREE.Color("#648a3a"),
  dry: new THREE.Color("#a09a5c"),
  forest: new THREE.Color("#33552b"),
  rock: new THREE.Color("#8d8a78"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.9) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.42, 0.66, fbm2(x * 0.03, z * 0.03, 3))).lerp(C.dry, smoothstep(0.62, 0.8, fbm2(x * 0.02 - 5, z * 0.02 + 1, 3)) * 0.4);
  if (h > 8) c.lerp(C.forest, smoothstep(8, 26, h) * 0.7);
  c.lerp(C.rock, smoothstep(0.35, 0.8, slope) * 0.6);
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(6, 0.5, h) * 0.8);
}
