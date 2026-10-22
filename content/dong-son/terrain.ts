import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, type HeightBounds } from "@/core/world/terrain";
import { FIELDS, FIELD_Y } from "./places";

// Đồng bằng bên ngã ba sông (CÁCH ĐIỆU, không phải bản đồ địa hình có tư liệu): ba dòng sông gặp nhau, sau đó thành một sông lớn chảy
// ra phía đông; thềm đất phía bắc ngã ba, ruộng thấp ven sông, xa hơn là đồi. Chỉ gợi ý ý "cư dân tập trung ở đồng bằng, ven các
// dòng sông, chỗ sông suối gặp nhau" mà nguồn nêu; không khẳng định hình dạng, vị trí hay cảnh quan cổ. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 80 };
/** Mực nước khi triều rút / triều lên (người xem kéo ở phân cảnh "ruong-nuoc"). */
export const WATER_LOW = -0.15;
export const WATER_HIGH = 1.7;

/** Sông lớn từ tây, rồi chảy ra đông sau ngã ba. */
export const MAIN: River = {
  pts: [[-420, 120], [-300, 95], [-210, 60], [-130, 10], [-60, -20], [30, -40], [120, -70], [220, -60], [320, -85], [420, -120]],
  half: 24,
};
export const NORTH: River = { pts: [[-60, 420], [-90, 330], [-70, 240], [-85, 150], [-70, 70], [-60, -20]], half: 16 };
export const SOUTH: River = { pts: [[-300, -420], [-230, -320], [-170, -220], [-110, -120], [-60, -20]], half: 16 };
export const RIVERS = [MAIN, NORTH, SOUTH];

export const { riverDist, bankDist } = createRivers(RIVERS);

/** Mặt bằng ruộng (0..1): hình chữ nhật mềm mép. */
export function fieldMask(x: number, z: number) {
  const f = (v: number, a: number, b: number) => smoothstep(a - 14, a + 2, v) * (1 - smoothstep(b - 2, b + 14, v));
  return f(x, FIELDS.x0, FIELDS.x1) * f(z, FIELDS.z0, FIELDS.z1);
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.3 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.1;
  land += 3 * smoothstep(55, 80, dd) + 3.5 * smoothstep(130, 165, dd);
  land += smoothstep(130, 320, dd) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.7) * 62;
  land += smoothstep(25, 110, dd) * (fbm2(x * 0.035 - 4, z * 0.035 + 9, 3) - 0.45) * 4;
  land = lerp(land, FIELD_Y, fieldMask(x, z));
  const h = lerp(-3.2, land, smoothstep(-3, 14, dd));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4630"),
  sand: new THREE.Color("#b09a72"),
  grass: new THREE.Color("#6f8c42"),
  dry: new THREE.Color("#8b8f4c"),
  forest: new THREE.Color("#33552b"),
  stone: new THREE.Color("#8a8272"),
  paddy: new THREE.Color("#7a9a3e"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.5) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.45, h));
  else {
    const patch = fbm2(x * 0.03 + 2, z * 0.03 - 6, 3);
    c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, patch) * 0.7);
  }
  if (h > 12) c.lerp(C.forest, smoothstep(12, 40, h) * 0.7);
  // mặt ruộng: xanh lúa, nhạt dần theo ô
  c.lerp(C.paddy, fieldMask(x, z) * 0.7 * smoothstep(FIELD_Y - 0.6, FIELD_Y + 0.1, h));
  c.lerp(C.stone, smoothstep(0.32, 0.55, slope) * 0.65);
}
