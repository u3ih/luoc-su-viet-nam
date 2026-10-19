import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng núi Đọ (CÁCH ĐIỆU, không phải bản đồ): sông Chu chảy từ tây sang đông, sông Mã từ phía nam đổ vào ở phía đông
// (chỗ hợp lưu); núi Đọ nằm bên bờ sông, hai quả núi đá bazan thấp lân cận là Quan Yên (đông nam) và Nuông (tây).
// Khoảng cách giữa các núi bị rút ngắn nhiều so với thực tế (3 km, 3,5 km), độ cao núi Đọ (158 m) cũng hạ xuống để vừa khung hình.
// Đây không phải phục dựng cảnh quan thời đồ đá cũ.

export const BOUNDS: HeightBounds = { minX: -360, minZ: -300, sizeX: 720, sizeZ: 720, minH: -8, maxH: 70 };

export const NUI_DO = { x: 0, z: 95, h: 56, s: 80 };
export const QUAN_YEN = { x: 195, z: 150, h: 34, s: 46 };
export const NUONG = { x: -215, z: 130, h: 30, s: 44 };
/** Chỗ hợp lưu sông Mã vào sông Chu (x). */
export const CONFLUENCE_X = 275;

/** Trục sông Chu (z theo x). */
export function chuZ(x: number) {
  return -40 + 22 * Math.sin(x * 0.011 + 0.5) + 8 * Math.sin(x * 0.034 + 1.7);
}
/** Trục sông Mã (x theo z), chỉ có phía nam sông Chu (z lớn). */
export function maX(z: number) {
  return CONFLUENCE_X + 16 * Math.sin(z * 0.02 + 1) + 6 * Math.sin(z * 0.06);
}
const chuHalf = (x: number) => 11 + smoothstep(CONFLUENCE_X - 40, CONFLUENCE_X + 60, x) * 12;

const hill = (p: { x: number; z: number; h: number; s: number }, x: number, z: number) => {
  // hơi méo bằng nhiễu để không tròn đều
  const wob = 1 + (noise2(x * 0.02 + p.x, z * 0.02) - 0.5) * 0.35;
  return p.h * Math.exp(-(((x - p.x) ** 2 + (z - p.z) ** 2) / (p.s * p.s)) * wob);
};

export function height(x: number, z: number) {
  let h = 2.2 + (fbm2(x * 0.014 + 9, z * 0.014 + 1, 4) - 0.45) * 5;
  // dãy đồi thấp ở phía nam (z lớn) làm nền xa
  h += smoothstep(200, 400, z) * (6 + fbm2(x * 0.01 - 3, z * 0.01, 4) * 38);
  h += hill(NUI_DO, x, z) + hill(QUAN_YEN, x, z) + hill(NUONG, x, z);
  // sườn núi gồ ghề nhẹ (đá lộ thiên)
  const rough = Math.max(hill(NUI_DO, x, z), hill(QUAN_YEN, x, z), hill(NUONG, x, z));
  h += (fbm2(x * 0.07, z * 0.07, 3) - 0.5) * 4 * smoothstep(3, 14, rough);
  // sông Chu
  const dChu = Math.abs(z - chuZ(x));
  let river = smoothstep(chuHalf(x) - 2, chuHalf(x) + 8, dChu);
  // sông Mã (phía nam chỗ hợp lưu)
  const dMa = Math.abs(x - maX(z));
  const maHalf = 12 + 3 * Math.sin(z * 0.03);
  const south = smoothstep(chuZ(CONFLUENCE_X), chuZ(CONFLUENCE_X) + 30, z);
  river = Math.min(river, 1 - south + south * smoothstep(maHalf - 2, maHalf + 8, dMa));
  h = lerp(-3 + (noise2(x * 0.1, z * 0.1) - 0.5) * 0.5, h, river);
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4a34"),
  sand: new THREE.Color("#b9a176"),
  soil: new THREE.Color("#8a6a45"),
  grass: new THREE.Color("#6e8b3e"),
  dry: new THREE.Color("#a09050"),
  rock: new THREE.Color("#5f666a"),
  rockHi: new THREE.Color("#7b8083"),
  scree: new THREE.Color("#74695b"),
  mist: new THREE.Color("#b9b6a6"),
};

/** Đá bazan xanh xám lộ trên sườn núi; đồng bằng đất đỏ nâu loang cỏ khô. */
export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.3) c.copy(C.mud).lerp(C.sand, smoothstep(-3, 0.3, h));
  else if (h < 2.2) c.copy(C.sand).lerp(C.soil, smoothstep(0.3, 2.2, h));
  else {
    const patch = fbm2(x * 0.03 + 5, z * 0.03 - 4, 4);
    c.copy(C.soil).lerp(C.grass, smoothstep(0.35, 0.65, patch) * 0.8).lerp(C.dry, smoothstep(0.55, 0.8, fbm2(x * 0.05, z * 0.05, 3)) * 0.5);
  }
  // núi đá: càng cao càng nhiều đá bazan lộ ra
  const rock = Math.max(smoothstep(8, 30, h), smoothstep(0.3, 0.6, slope));
  const rockNear = Math.max(nearHill(x, z), 0);
  c.lerp(C.rock, rock * rockNear * 0.9);
  c.lerp(C.rockHi, smoothstep(0.55, 0.85, fbm2(x * 0.08 + 2, z * 0.08, 3)) * rock * rockNear * 0.5);
  c.lerp(C.scree, smoothstep(0.25, 0.5, slope) * 0.25);
  c.lerp(C.mist, smoothstep(40, 66, h) * 0.2);
}

/** 1 khi gần một trong ba quả núi bazan (để chỉ ở đó mới lộ đá xanh xám). */
function nearHill(x: number, z: number) {
  const d = (p: { x: number; z: number; s: number }) => 1 - smoothstep(p.s * 0.9, p.s * 1.6, Math.hypot(x - p.x, z - p.z));
  return Math.max(d(NUI_DO), d(QUAN_YEN), d(NUONG));
}

/** Bán kính (m) của vành sườn núi Đọ tại độ cao `h`: nghịch đảo của hill() (bỏ qua nhiễu méo). */
export function hillRadiusAt(p: { h: number; s: number }, h: number) {
  return p.s * Math.sqrt(Math.log(p.h / h));
}

/** Chiều cao núi Đọ (m) ở đỉnh. */
export function nuiDoTop() {
  return height(NUI_DO.x, NUI_DO.z);
}
