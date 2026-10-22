import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";
import { GRAVES, LAKE, LAKE_R, SITE, SITE_RISE } from "./places";

// Vùng trung du thấp bên sông và đầm hồ (CÁCH ĐIỆU, không phải bản đồ địa hình có tư liệu): một sông lớn chảy phía nam, một đầm nước
// ở phía đông, giữa là gò đất cao rộng; xa hơn về phía bắc là đồi. Chỉ gợi ý ý "đồi gò thấp, bằng phẳng hoặc cánh đồng cao ven
// đầm hồ, ven sông" mà nguồn nêu; không khẳng định hình dạng, vị trí hay cảnh quan cổ. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 80 };
/** Mực nước (m). */
export const WATER = 0.5;

export const MAIN: River = {
  pts: [[-420, -120], [-300, -138], [-180, -125], [-60, -148], [60, -160], [180, -140], [300, -152], [420, -130]],
  half: 22,
};
const rivers = createRivers([MAIN]);
export const riverBank = rivers.bankDist;

/** Khoảng cách tới tâm đầm (đầm hơi dẹt theo trục x). */
const lakeDist = (x: number, z: number) => Math.hypot((x - LAKE[0]) / 1.15, z - LAKE[1]);
/** Khoảng cách có dấu tới mép nước gần nhất (sông hoặc đầm). */
export const bankDist = (x: number, z: number) => Math.min(riverBank(x, z), lakeDist(x, z) - LAKE_R);

/** Mặt bằng gò làng (0..1). */
export const siteMask = (x: number, z: number) => 1 - smoothstep(55, 95, Math.hypot(x - SITE[0], z - SITE[1]));

export function height(x: number, z: number) {
  const dd = riverBank(x, z);
  let land = 2.3 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.2;
  land += 3 * smoothstep(55, 80, dd);
  land += smoothstep(150, 330, dd) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.7) * 62;
  land += smoothstep(25, 110, dd) * (fbm2(x * 0.035 - 4, z * 0.035 + 9, 3) - 0.45) * 5;
  land += SITE_RISE * siteMask(x, z);
  // gò nhỏ làm khu mộ
  land += 3 * Math.exp(-(((x - GRAVES[0]) ** 2 + (z - GRAVES[1]) ** 2) / (2 * 22 * 22)));
  let h = lerp(-3.2, land, smoothstep(-3, 14, dd));
  // lòng đầm
  h = lerp(h, -2.6, 1 - smoothstep(LAKE_R - 12, LAKE_R + 4, lakeDist(x, z)));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4630"),
  sand: new THREE.Color("#b09a72"),
  grass: new THREE.Color("#6f8c42"),
  dry: new THREE.Color("#8b8f4c"),
  forest: new THREE.Color("#33552b"),
  stone: new THREE.Color("#8a8272"),
  earth: new THREE.Color("#a58253"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.5) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.45, h));
  else {
    const patch = fbm2(x * 0.03 + 2, z * 0.03 - 6, 3);
    c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, patch) * 0.7);
  }
  if (h > 12) c.lerp(C.forest, smoothstep(12, 40, h) * 0.7);
  // mặt gò làng: đất nện, nhạt màu
  c.lerp(C.earth, siteMask(x, z) * 0.5);
  c.lerp(C.stone, smoothstep(0.32, 0.55, slope) * 0.65);
}
