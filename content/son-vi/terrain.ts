import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng trung du nơi các dòng sông lớn gặp nhau (CÁCH ĐIỆU, không phải bản đồ địa hình có tư liệu): một sông chính chảy
// từ tây sang đông, hai sông nhánh nhập vào; hai bên là các bậc thềm thấp rồi những đồi gò thoai thoải.
// Chỉ gợi ý ý "thềm sông + đồi trung du + vùng giao hội" mà nguồn nêu; không khẳng định hình dạng, vị trí các sông hay
// cảnh quan cổ. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -400, minZ: -400, sizeX: 800, sizeZ: 800, minH: -6, maxH: 90 };
/** Mực nước khi đầy / khi cạn (người xem kéo ở phân cảnh "cuoi-song"). */
export const WATER_HIGH = 0.55;
export const WATER_LOW = -1.4;

type Pt = [number, number];
type River = { pts: Pt[]; half: number };

/** Sông chính chảy về phía đông; hai nhánh nhập vào ở gần gốc toạ độ. */
export const MAIN: River = {
  pts: [[-420, 150], [-320, 118], [-220, 96], [-130, 66], [-60, 34], [-10, 16], [60, 0], [150, -12], [250, -30], [330, -66], [420, -92]],
  half: 22,
};
export const NORTH: River = { pts: [[-50, 420], [-42, 330], [-72, 230], [-62, 130], [-34, 62], [-10, 16]], half: 14 };
export const SOUTH: River = { pts: [[-110, -420], [-70, -310], [-30, -210], [20, -130], [70, -50], [100, -8], [150, -12]], half: 15 };
export const RIVERS = [MAIN, NORTH, SOUTH];

/** Gò đất ở khoảng giữa sông chính và sông nhánh phía bắc — chỗ đặt dấu mốc "Sơn Vi" (vị trí gợi ý). */
export const SONVI: Pt = [-118, 132];
/** Mỏm đá nhỏ ở chân đồi phía nam sông chính — chỗ gợi ý "mái đá" của phân cảnh "bep-lua". */
export const SHELTER: Pt = [-72, -85];
/** Bãi cuội trong lòng sông chính. */
export const BARS_X: [number, number] = [-290, -40];

function distSeg(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1));
  return Math.hypot(ax + dx * t - px, az + dz * t - pz);
}

/** Khoảng cách tới đường tim sông (m), thêm chút uốn lượn bằng nhiễu. */
export function riverDist(r: River, x: number, z: number) {
  let d = Infinity;
  for (let i = 0; i < r.pts.length - 1; i++) {
    const a = r.pts[i];
    const b = r.pts[i + 1];
    d = Math.min(d, distSeg(x, z, a[0], a[1], b[0], b[1]));
  }
  return d + (noise2(x * 0.02 + 5, z * 0.02) - 0.5) * 10;
}

/** Khoảng cách có dấu tới mép bờ gần nhất (âm = trong lòng sông). */
export function bankDist(x: number, z: number) {
  let d = Infinity;
  for (const r of RIVERS) d = Math.min(d, riverDist(r, x, z) - r.half);
  return d;
}

/** Mặt bằng bãi cuội trong lòng sông chính (0..1). */
export function barMask(x: number, z: number) {
  if (x < BARS_X[0] || x > BARS_X[1]) return 0;
  const dm = riverDist(MAIN, x, z) - MAIN.half;
  if (dm > -1 || dm < -17) return 0;
  // bãi kéo dài theo dòng chảy (sông chạy gần hướng đông–tây), bờ mềm
  const n = fbm2(x * 0.022 + 11, z * 0.075 - 3, 3);
  return smoothstep(0.42, 0.6, n) * smoothstep(BARS_X[0], BARS_X[0] + 25, x) * (1 - smoothstep(BARS_X[1] - 25, BARS_X[1], x));
}

export function height(x: number, z: number) {
  const dd = bankDist(x, z);
  // các bậc thềm: sát bờ thấp, xa hơn lên một bậc, rồi đồi gò
  let land = 2.3 + (fbm2(x * 0.02 + 3, z * 0.02 - 1, 3) - 0.5) * 1.2;
  land += 3.6 * smoothstep(55, 80, dd) + 4.4 * smoothstep(130, 165, dd);
  land += smoothstep(95, 280, dd) * Math.pow(fbm2(x * 0.011 + 8, z * 0.011 + 2, 4), 1.7) * 62;
  // gò thấp rải rác trên thềm
  land += smoothstep(25, 110, dd) * (fbm2(x * 0.035 - 4, z * 0.035 + 9, 3) - 0.45) * 5;
  // gò "Sơn Vi" và mỏm đá "mái đá"
  land += 14 * Math.exp(-(((x - SONVI[0]) ** 2 + (z - SONVI[1]) ** 2) / (2 * 42 * 42)));
  // quanh chỗ đặt bếp: bãi bằng; sau lưng là mỏm đá dựng đứng
  land = lerp(land, 5.5, 1 - smoothstep(34, 56, Math.hypot(x - SHELTER[0], z - SHELTER[1])));
  land += 26 * Math.exp(-(((x - SHELTER[0] + 40) ** 2 + (z - SHELTER[1] + 34) ** 2) / (2 * 22 * 22)));
  let h = lerp(-3.2, land, smoothstep(-3, 14, dd));
  const bar = barMask(x, z);
  if (bar > 0) h = lerp(h, -0.35, bar);
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5c4630"),
  sand: new THREE.Color("#b09a72"),
  gravel: new THREE.Color("#a29a88"),
  grass: new THREE.Color("#6f8c42"),
  dry: new THREE.Color("#8b8f4c"),
  forest: new THREE.Color("#33552b"),
  stone: new THREE.Color("#8a8272"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.5) c.copy(C.mud).lerp(C.sand, smoothstep(-1.8, 0.45, h));
  else {
    const patch = fbm2(x * 0.03 + 2, z * 0.03 - 6, 3);
    c.copy(C.grass).lerp(C.dry, smoothstep(0.42, 0.62, patch) * 0.7);
  }
  if (barMask(x, z) > 0.2 && h < 0.2) c.lerp(C.gravel, 0.7);
  if (h > 12) c.lerp(C.forest, smoothstep(12, 40, h) * 0.7);
  c.lerp(C.stone, smoothstep(0.32, 0.55, slope) * 0.65);
}
