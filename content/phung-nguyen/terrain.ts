import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { createRivers, type River } from "@/core/world/rivers";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";
import { MAN_BAC, MOUND, MOUND_RISE } from "./places";

// Vùng trung du bên sông (CÁCH ĐIỆU, không phải bản đồ địa hình có tư liệu): một sông lớn chảy từ tây sang đông, một sông nhánh
// nhập vào; bờ bắc có doi đất cao nổi lên như một cái nền làng; ở phía nam có doi đất khác được dải đồi vòng cung bao quanh.
// Chỉ gợi ý ý "cư dân sống trên doi đất cao gần sông" và "doi đất có núi bao quanh hình vòng cung" mà nguồn nêu về Mán Bạc;
// không khẳng định hình dạng, vị trí hay cảnh quan cổ. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 80 };
/** Mực nước (m). */
export const WATER = 0.5;

export const MAIN: River = {
  pts: [[-420, 40], [-320, 30], [-230, 10], [-140, -5], [-60, -10], [20, 5], [100, 30], [190, 40], [290, 20], [420, -10]],
  half: 20,
};
export const NORTH: River = { pts: [[-30, 420], [-20, 330], [-50, 230], [-40, 140], [-30, 70], [-22, 0]], half: 12 };
export const RIVERS = [MAIN, NORTH];

export const { riverDist, bankDist } = createRivers(RIVERS);

const wrap = (a: number) => Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));

/** Mặt bằng doi đất làng (0..1). */
export const moundMask = (x: number, z: number) => 1 - smoothstep(34, 62, Math.hypot(x - MOUND[0], z - MOUND[1]));

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  let land = 2.3 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.2;
  land += 3.2 * smoothstep(55, 80, dd) + 4 * smoothstep(130, 165, dd);
  land += smoothstep(95, 280, dd) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.7) * 60;
  land += smoothstep(25, 110, dd) * (fbm2(x * 0.035 - 4, z * 0.035 + 9, 3) - 0.45) * 5;
  // doi đất làng: mặt bằng nhô cao hơn đồng quanh vài mét
  land += MOUND_RISE * moundMask(x, z);
  // doi đất phía nam + dải đồi hình vòng cung, mở về phía sông (hướng +z)
  const dx = x - MAN_BAC[0];
  const dz = z - MAN_BAC[1];
  const r = Math.hypot(dx, dz);
  const arc = smoothstep(0.75, 1.55, wrap(Math.atan2(dz, dx) - Math.PI / 2));
  land = lerp(land, 3.6, 1 - smoothstep(70, 100, r));
  land += 30 * Math.exp(-(((r - 104) / 22) ** 2)) * arc * (0.75 + 0.5 * noise2(x * 0.03, z * 0.03));
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
  earth: new THREE.Color("#a07c4c"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.5) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.45, h));
  else {
    const patch = fbm2(x * 0.03 + 2, z * 0.03 - 6, 3);
    c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, patch) * 0.7);
  }
  if (h > 12) c.lerp(C.forest, smoothstep(12, 40, h) * 0.7);
  // mặt doi đất làng: đất nện, nhạt màu
  c.lerp(C.earth, moundMask(x, z) * 0.55);
  c.lerp(C.stone, smoothstep(0.32, 0.55, slope) * 0.65);
}
