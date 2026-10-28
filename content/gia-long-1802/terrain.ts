import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Dải đất ven biển từ Nam ra Bắc (CÁCH ĐIỆU, không phải bản đồ có tư liệu): biển ở phía đông; ở phía nam, đầm Thị Nại là một vịnh nhỏ ăn vào
// đất liền, Quy Nhơn nằm ở bờ tây đầm; ở giữa là Phú Xuân bên một con sông chảy từ núi ra biển (gợi ý sông Hương); ở phía bắc, Thăng Long
// bên sông lớn (gợi ý sông Hồng). Núi Trường Sơn ở phía tây. Chỉ gợi ý quan hệ vị trí mà các nguồn nêu; khoảng cách bị thu ngắn rất nhiều,
// hình dáng bờ biển, sông, đầm không theo bản đồ thật. +z là hướng bắc. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -8, maxH: 100 };
export const WATER = 0.3;

/** Sông ở Phú Xuân (diễn hoạ) — từ núi phía tây ra biển. */
export const SONG_HUONG: [number, number][] = [[-430, -40], [-300, -70], [-170, -40], [-40, -62], [90, -48], [200, -58], [330, -50]];
/** Sông lớn ở phía bắc, bên Thăng Long (diễn hoạ). */
export const SONG_HONG: [number, number][] = [[-430, 400], [-250, 372], [-120, 346], [-30, 318], [60, 278], [170, 245], [280, 228], [340, 220]];
const RIVERS: River[] = [{ pts: SONG_HUONG, half: 15 }, { pts: SONG_HONG, half: 22 }];
export const { riverDist, bankDist } = createRivers(RIVERS, 10);

/** Quy Nhơn: bờ tây đầm Thị Nại (phía nam). */
export const QUY_NHON: [number, number] = [20, -300];
/** Giữa đầm Thị Nại (mặt nước). */
export const DAM: [number, number] = [170, -300];
/** Cửa đầm ra biển — nơi thuỷ quân từ ngoài khơi tiến vào. */
export const CUA_DAM: [number, number] = [300, -250];
/** Phú Xuân: bờ bắc sông, cách mép nước một đoạn. */
export const PHU_XUAN: [number, number] = [-30, -10];
/** Thăng Long: bờ nam sông lớn. */
export const THANG_LONG: [number, number] = [-75, 292];
/** Đường tiến quân từ Phú Xuân ra Thăng Long. */
export const ROUTE: [number, number][] = [PHU_XUAN, [-34, 60], [-46, 120], [-28, 190], [-52, 245], [THANG_LONG[0], THANG_LONG[1] - 20]];
/** Phía bắc xa: hướng ải Nam Quan, nơi sứ nhà Thanh tới. */
export const NORTH: [number, number] = [-110, 435];

/** Biển ở phía đông, kèm đầm Thị Nại ăn vào đất liền: 0 = đất, 1 = biển. */
const sea = (x: number, z: number) => {
  const open = smoothstep(-35, 30, x - 285 - (noise2(x * 0.01 + 4, z * 0.012) - 0.5) * 80);
  const lagoon = 1 - smoothstep(0.78, 1, Math.hypot((x - DAM[0]) / 150, (z - DAM[1]) / 70 + (noise2(x * 0.03, z * 0.03) - 0.5) * 0.12));
  return Math.max(open, lagoon);
};

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.7 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  // núi Trường Sơn phía tây (cao dần về tây)
  land += smoothstep(-150, -350, x) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.4) * 70;
  // đồi thấp xen giữa Phú Xuân và Thăng Long, tránh đường tiến quân
  land += Math.pow(fbm2(x * 0.012 - 4, z * 0.012 + 6, 3), 2) * smoothstep(60, 140, Math.abs(x + 40)) * 26;
  // bãi bằng ở các điểm diễn hoạt cảnh
  for (const [c, r] of [[PHU_XUAN, 90], [THANG_LONG, 90], [QUY_NHON, 80]] as [[number, number], number][])
    land = lerp(land, 4, 1 - smoothstep(r * 0.55, r, Math.hypot(x - c[0], z - c[1])));
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
  // dải cát ven biển và ven đầm
  c.lerp(C.sand, smoothstep(-0.15, 0.05, sea(x - 14, z) - 0.04) * smoothstep(12, 0.5, h) * 0.8);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 45, h) * 0.78);
  c.lerp(C.rock, smoothstep(0.34, 0.58, slope) * 0.55);
}
