import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";
import type { Wall } from "@/core/world/walls";

// Tây Đô (CÁCH ĐIỆU, thu nhỏ khoảng 1/3): đồng bằng giữa sông Mã (rộng, phía nam) và sông Bưởi (phía tây, đổ vào sông Mã), quanh là
// những khối núi đá vôi (An Tôn, Đốn Sơn…). Thành ở gốc toạ độ: mặt bằng gần vuông (thật ~870 × 880 m), bốn cửa ở giữa bốn cạnh,
// hào nước bao quanh. Chỉ gợi ý vị trí "giữa hai sông, tựa núi"; hình sông và núi không phải bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 110 };
export const WATER = 0.2;

/** Nửa cạnh thành (m, đã thu nhỏ) và góc xoay nhẹ của trục thành. */
export const HALF = 120;
const ROT = 0.08;
/** Góc (rad, theo khung riêng của thành) của bốn cửa: Đông, Bắc (Cửa Hậu), Tây, Nam (Cửa Tiền). */
export const GATE = { dong: 0, bac: Math.PI / 2, tay: Math.PI, nam: -Math.PI / 2 } as const;

/** Mặt bằng gần vuông, góc hơi tròn ("siêu elip"). */
const square = (half: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const n = 14;
  const r = half / Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), 1 / n);
  const x = c * r;
  const z = s * r;
  return [x * Math.cos(ROT) - z * Math.sin(ROT), x * Math.sin(ROT) + z * Math.cos(ROT)];
};

export const WALL: Wall = {
  at: square(HALF),
  base: 15,
  top: 8,
  height: 8,
  gates: Object.values(GATE).map((at) => ({ at, width: 14 })),
};

/** Điểm giữa cạnh có cửa, lùi ra ngoài `out` mét (âm = vào trong thành). */
export function gatePoint(at: number, out = 0): [number, number] {
  const [x, z] = WALL.at(at);
  const k = (HALF + out) / HALF;
  return [x * k, z * k];
}

/** Khoảng cách có dấu tới tim tường (dương = ngoài thành). */
export function wallDistance(x: number, z: number) {
  const lx = x * Math.cos(-ROT) - z * Math.sin(-ROT);
  const lz = x * Math.sin(-ROT) + z * Math.cos(-ROT);
  return Math.max(Math.abs(lx), Math.abs(lz)) - HALF;
}

/** Sông Mã phía nam, sông Bưởi phía tây đổ vào sông Mã ở góc tây nam. */
export const MA: [number, number][] = [[-430, -230], [-250, -250], [-60, -240], [120, -260], [280, -230], [430, -250]];
export const BUOI: [number, number][] = [[-330, 430], [-300, 260], [-260, 120], [-250, -40], [-235, -160], [-200, -245]];
const RIVERS: River[] = [
  { pts: MA, half: 34 },
  { pts: BUOI, half: 12 },
];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Núi đá vôi quanh thành: An Tôn (tây bắc, nơi lấy đá), Đốn Sơn (tây nam) và vài khối xa. */
export const AN_TON: [number, number] = [-185, 210];
export const DON_SON: [number, number] = [-175, -150];
const MOUNTS: [number, number, number, number][] = [
  [AN_TON[0], AN_TON[1], 70, 60],
  [DON_SON[0], DON_SON[1], 48, 44],
  [230, 230, 90, 75],
  [310, 30, 60, 50],
  [-330, 330, 80, 70],
  [120, 340, 55, 45],
];

/** Mỏ đá dưới chân An Tôn — nơi đoàn người khiêng đá về thành (diễn hoạ). */
export const QUARRY: [number, number] = [AN_TON[0] + 58, AN_TON[1] - 52];

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.4 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.0;
  for (const [mx, mz, r, hgt] of MOUNTS) {
    const d = Math.hypot(x - mx, z - mz) / r;
    if (d < 1.6) land += (1 - smoothstep(0.35, 1.25, d + (noise2(x * 0.05, z * 0.05) - 0.5) * 0.5)) * hgt * (0.7 + 0.5 * fbm2(x * 0.03 + mx, z * 0.03, 3));
  }
  // nền trong thành bằng phẳng
  const w = wallDistance(x, z);
  if (w < 0) land = lerp(land, 2.8, smoothstep(0, -10, w));
  // hào ngoài chân thành
  const moat = w - WALL.base * 0.5 - 6;
  if (moat > -2 && moat < 18) land = lerp(land, -1.6, smoothstep(-2, 1, moat) * (1 - smoothstep(13, 18, moat)));
  const h = lerp(-3.5, land, smoothstep(-4, 9, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4a32"),
  paddy: new THREE.Color("#829c48"),
  grass: new THREE.Color("#658a3a"),
  rock: new THREE.Color("#a59d8a"),
  forest: new THREE.Color("#33552b"),
  yard: new THREE.Color("#9a8a62"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.8) c.copy(C.mud).lerp(C.paddy, smoothstep(-1.2, 0.8, h));
  else c.copy(C.paddy).lerp(C.grass, smoothstep(0.45, 0.7, fbm2(x * 0.03, z * 0.03, 3)));
  if (wallDistance(x, z) < -8) c.lerp(C.yard, 0.35);
  if (h > 8) c.lerp(C.forest, smoothstep(8, 30, h) * 0.55);
  c.lerp(C.rock, smoothstep(0.28, 0.5, slope) * 0.8);
}
