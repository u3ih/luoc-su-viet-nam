import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng sông lớn có đồi hai bên (CÁCH ĐIỆU, không phải bản đồ có tư liệu): một con sông rộng chảy từ tây sang đông qua giữa bản đồ (Như Nguyệt);
// phía nam (z âm) là bờ nam nơi quân Lý dựng phòng tuyến, phía bắc (z dương) là bờ bắc nơi quân Tống đóng; xa hơn về phía bắc là một dải đồi
// (biên giới, có hai lối đi) và vùng đất bên kia với ba thành (Khâm, Liêm, Ung). Chỉ gợi ý ý "sông chắn ngang đường, đồi núi hai bên".
// 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 90 };
export const WATER = 0;

const MAIN: River = { pts: [[-430, 14], [-250, 34], [-80, 8], [100, 28], [260, 6], [430, 30]], half: 30 };
export const { riverDist, bankDist } = createRivers([MAIN], 10);

/** Đường tim sông (z) tại x. */
export function riverZ(x: number) {
  const p = MAIN.pts;
  for (let i = 0; i < p.length - 1; i++) if (x <= p[i + 1][0]) return lerp(p[i][1], p[i + 1][1], clamp((x - p[i][0]) / (p[i + 1][0] - p[i][0])));
  return p[p.length - 1][1];
}

/** Hai lối đi qua dải đồi biên giới (diễn hoạ), ba thành bên kia dải đồi, đền bên sông ở bờ nam, và trại quân Tống ở bờ bắc. */
export const PASS_W: [number, number] = [-180, 230];
export const PASS_E: [number, number] = [190, 230];
export const UNG: [number, number] = [-120, 330];
export const KHAM: [number, number] = [270, 335];
export const LIEM: [number, number] = [130, 350];
export const TEMPLE: [number, number] = [60, -70];
export const CAMP_N: [number, number] = [20, 110];
export const CAMP_S: [number, number] = [-20, -110];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.6 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // đồi thấp hai bên sông, cao dần khi ra xa
  land += smoothstep(90, 260, dd) * Math.pow(fbm2(x * 0.012 + 8, z * 0.012 + 2, 4), 1.5) * 50;
  // dải đồi biên giới ở z ≈ 230, có hai lối đi
  const gap = Math.min(smoothstep(0, 1, Math.abs(x - PASS_W[0]) / 55), smoothstep(0, 1, Math.abs(x - PASS_E[0]) / 55));
  land += Math.exp(-(((z - 235) / 38) ** 2)) * (34 + noise2(x * 0.03, z * 0.03) * 16) * lerp(0.1, 1, gap);
  // đồi đặt đền ở bờ nam
  land += 7 * Math.exp(-(((x - TEMPLE[0]) ** 2 + (z - TEMPLE[1]) ** 2) / (2 * 26 * 26)));
  const h = lerp(-4.6, land, smoothstep(-5, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#a79a72"),
  grass: new THREE.Color("#69883c"),
  dry: new THREE.Color("#8b8f4c"),
  forest: new THREE.Color("#2f4f2a"),
  stone: new THREE.Color("#8a8272"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.6) c.copy(C.mud).lerp(C.sand, smoothstep(-2, 0.5, h));
  else c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.6);
  if (h > 14) c.lerp(C.forest, smoothstep(14, 44, h) * 0.7);
  c.lerp(C.stone, smoothstep(0.32, 0.55, slope) * 0.6);
}
