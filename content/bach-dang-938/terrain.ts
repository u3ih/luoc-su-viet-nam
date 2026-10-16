import * as THREE from "three";
import { smoothstep, lerp, clamp } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Cửa sông Bạch Đằng (cách điệu): sông uốn dọc trục z, mở ra biển ở z âm.

export const BOUNDS: HeightBounds = { minX: -320, minZ: -340, sizeX: 640, sizeZ: 560, minH: -12, maxH: 40 };
export const RIVER_BED = -5;
export const STAKE_ZONE = { z0: -40, z1: -8 };

export function riverCenter(z: number) {
  return 7 * Math.sin(z * 0.017 + 0.4) + 4 * Math.sin(z * 0.043 + 1.3);
}

export function riverHalfWidth(z: number) {
  return 20 + smoothstep(-40, -95, z) * 34 + (noise2(z * 0.05, 3.1) - 0.5) * 4;
}

export function height(x: number, z: number) {
  const d = Math.abs(x - riverCenter(z));
  const halfW = riverHalfWidth(z);
  const away = smoothstep(halfW, halfW + 70, d);
  // đồng bằng ven sông thấp, đồi xa dần
  const hills =
    2.2 +
    Math.pow(fbm2(x * 0.016 + 10, z * 0.016 - 4), 2) * 46 * (0.15 + 0.85 * away) +
    // gợn đất nhỏ: gò, rãnh — chỉ rõ trên sườn đồi, đồng bằng vẫn phẳng
    (fbm2(x * 0.11 - 3, z * 0.11 + 5, 3) - 0.5) * (0.5 + 2.2 * away);
  const bank = smoothstep(halfW - 2, halfW + 16, d);
  const bed = RIVER_BED + (noise2(x * 0.08, z * 0.08) - 0.5) * 0.6;
  const land = lerp(bed, hills, bank);
  const coast = smoothstep(-108, -66, z + (noise2(x * 0.03, 7.7) - 0.5) * 26);
  const sea = -8.5 + noise2(x * 0.02, z * 0.02) * 3;
  return clamp(lerp(sea, land, coast), BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4129"),
  sand: new THREE.Color("#b39566"),
  paddy: new THREE.Color("#7f9442"),
  paddyWet: new THREE.Color("#6f8a4a"),
  grassLow: new THREE.Color("#5f8a3a"),
  grassHigh: new THREE.Color("#3a6230"),
  forest: new THREE.Color("#2e5228"),
  dirt: new THREE.Color("#8a6a44"),
  rock: new THREE.Color("#7a6a56"),
  gold: new THREE.Color("#d4a85a"),
};
const tmp = new THREE.Color();

/** Giá trị 0..1 của ô ruộng chứa (x, z): < 0.35 ô ngập nước, > 0.7 lúa chín. */
export function paddyCell(x: number, z: number) {
  return noise2(Math.floor(x / 9) * 1.7, Math.floor(z / 7) * 2.3);
}

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.4) c.copy(C.mud).lerp(C.sand, smoothstep(-3, 0.4, h));
  else if (h < 3) c.copy(C.sand).lerp(C.paddy, smoothstep(0.4, 2.2, h));
  else if (h < 18) c.copy(C.grassLow).lerp(C.grassHigh, smoothstep(3, 18, h));
  else c.copy(C.grassHigh).lerp(C.rock, smoothstep(18, 32, h));
  // ô ruộng: ô vuông lệch, xen ô ngập nước và ô lúa chín
  if (h > 1.2 && h < 5) {
    const cell = paddyCell(x, z);
    // ruộng lùi khỏi mép sông một quãng (bờ sông là bãi cỏ/bùn, không cấy sát nước)
    const fromRiver = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
    const field = smoothstep(1.2, 1.8, h) * (1 - smoothstep(4, 5, h)) * smoothstep(8, 18, fromRiver);
    tmp.copy(cell < 0.35 ? C.paddyWet : C.paddy).multiplyScalar(0.88 + cell * 0.28);
    c.lerp(tmp, field * 0.85);
    // bờ ruộng sáng hơn
    const fx = Math.abs((x / 9) % 1);
    const fz = Math.abs((z / 7) % 1);
    if (fx < 0.08 || fz < 0.1) c.lerp(C.sand, field * 0.35);
  }
  // rừng thưa loang trên sườn
  if (h > 5) c.lerp(C.forest, smoothstep(0.55, 0.75, fbm2(x * 0.04, z * 0.04, 3)) * 0.6);
  // sườn dốc lộ đất, vách dốc lộ đá
  c.lerp(C.dirt, smoothstep(0.18, 0.35, slope) * 0.55);
  c.lerp(C.rock, smoothstep(0.35, 0.6, slope) * 0.7);
  // ánh vàng sơn mài trên đỉnh đồi
  c.lerp(C.gold, smoothstep(24, 34, h) * 0.4);
}
