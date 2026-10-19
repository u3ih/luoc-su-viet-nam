import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Vùng núi đá vôi Bắc Sơn (CÁCH ĐIỆU, không phải bản đồ hay địa hình có tư liệu): những ngọn núi đá vôi dựng đứng xếp thành
// một vòng cung mở về phía nam, bên trong là thung lũng bằng phẳng có một con suối chảy ngang. Chỉ gợi ý ý "sơn khối đá vôi
// hình cung + thung lũng karst có sông suối" mà nguồn nêu; vị trí hang, cụm di tích, khoảng cách đều là gợi ý. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -440, minZ: -340, sizeX: 880, sizeZ: 820, minH: -4, maxH: 150 };
export const WATER = 0.15;

/** Tâm vòng cung đá vôi. Vòng cung nằm ở phía bắc (z lớn), mở về phía nam. */
export const ARC = { x: 0, z: 40 };
/** Bán kính vòng cung trong (m). */
export const ARC_R = 215;

type Tower = [number, number, number, number]; // [x, z, bán kính chân, chiều cao]
const fract = (v: number) => v - Math.floor(v);
const jit = (i: number, k: number) => fract(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453);

/** Ngọn núi có hang (ở giữa vòng cung, góc 90°). */
export const CAVE_TOWER: Tower = [0, ARC.z + ARC_R, 56, 88];
/** Thềm phẳng trước cửa hang: tâm (x, z) và độ cao nền (m). */
export const APRON = { x: 0, z: 204, y: 2.6 };

const TOWERS: Tower[] = [];
// vòng cung trong: chín ngọn, cách nhau 22,5°
for (let i = 0; i < 9; i++) {
  const a = (i * 22.5 * Math.PI) / 180;
  if (i === 4) {
    TOWERS.push(CAVE_TOWER);
    continue;
  }
  TOWERS.push([ARC.x + Math.cos(a) * ARC_R, ARC.z + Math.sin(a) * ARC_R, 44 + jit(i, 1) * 10, 58 + jit(i, 2) * 26]);
}
// vòng cung ngoài (phía bắc, làm nền xa): núi to và cao hơn
for (let i = 0; i < 7; i++) {
  const a = ((30 + i * 20) * Math.PI) / 180;
  const R = 330 + jit(i, 3) * 20;
  TOWERS.push([ARC.x + Math.cos(a) * R, ARC.z + Math.sin(a) * R, 62 + jit(i, 4) * 16, 92 + jit(i, 5) * 30]);
}
// vài hòn núi đá lẻ trong thung lũng
TOWERS.push([-125, 150, 17, 26], [128, 122, 19, 30]);

const tower = (x: number, z: number, [cx, cz, r, h]: Tower) => {
  const reach = r * (0.8 + 0.4 * noise2(x * 0.03 + cx * 0.1, z * 0.03 + cz * 0.1));
  const d = Math.hypot(x - cx, z - cz) / reach;
  // dốc đứng ở khoảng 0.55–1.0 bán kính; đỉnh gồ ghề như những mái vòm liền nhau
  const top = h * (0.62 + 0.7 * fbm2(x * 0.035 + cx, z * 0.035 - cz, 4));
  return top * (1 - smoothstep(0.55, 1.0, d));
};

/** Trục con suối chảy ngang thung lũng (z theo x). */
export function streamCenter(x: number) {
  return 82 + 14 * Math.sin(x * 0.012 + 0.6) + 6 * Math.sin(x * 0.04);
}

export function height(x: number, z: number) {
  let h = 2.0 + (fbm2(x * 0.012 + 3, z * 0.012 - 1, 4) - 0.5) * 3.0;
  let t = 0;
  for (const tw of TOWERS) t = Math.max(t, tower(x, z, tw));
  h += t;
  // thềm phẳng trước cửa hang
  h = lerp(h, APRON.y, 1 - smoothstep(14, 34, Math.hypot(x - APRON.x, (z - APRON.z) * 0.9)));
  // suối chảy giữa thung lũng, tắt dần ở hai đầu (chân núi đá vôi, như suối chui vào núi)
  const ds = Math.abs(z - streamCenter(x));
  h = lerp(h, lerp(-1.4, h, smoothstep(5, 13, ds)), 1 - smoothstep(140, 190, Math.abs(x)));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

/** Độ dốc xấp xỉ (m/m) quanh (x, z). */
export function slopeAt(x: number, z: number) {
  const e = 3;
  return Math.max(Math.abs(height(x + e, z) - height(x - e, z)), Math.abs(height(x, z + e) - height(x, z - e))) / (2 * e);
}

/** Từ phía nam tiến vào sườn núi dọc x: vị trí z đầu tiên mà mặt đất cao quá `y` — chỗ để áp cửa hang vào vách đá. */
export function faceZ(x: number, y: number, fromZ = APRON.z) {
  let z = fromZ;
  while (z < fromZ + 60 && height(x, z) < y) z += 0.25;
  return z;
}

const C = {
  mud: new THREE.Color("#5b4a34"),
  sand: new THREE.Color("#a4906a"),
  meadow: new THREE.Color("#72903f"),
  dry: new THREE.Color("#a09a55"),
  forest: new THREE.Color("#2f5530"),
  rock: new THREE.Color("#a6a194"),
  rockDark: new THREE.Color("#6c685d"),
  moss: new THREE.Color("#4d6a38"),
  floor: new THREE.Color("#a48f68"),
};
const tmp = new THREE.Color();

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.4) c.copy(C.mud).lerp(C.sand, smoothstep(-1.4, 0.4, h));
  else {
    c.copy(C.meadow).lerp(C.dry, smoothstep(0.45, 0.7, fbm2(x * 0.03 + 2, z * 0.03 - 6, 3)) * 0.6);
    c.lerp(C.forest, smoothstep(5, 18, h) * 0.55 + fbm2(x * 0.04, z * 0.04, 3) * 0.2);
  }
  // sườn dốc: đá vôi xám, có vệt sẫm theo chiều thẳng đứng như vết nước chảy; rêu bám thành mảng
  const streak = noise2(x * 0.55 + z * 0.2, z * 0.55 - x * 0.2) * 0.65 + noise2(x * 0.17, z * 0.17) * 0.35;
  tmp.copy(C.rock).lerp(C.rockDark, smoothstep(0.25, 0.8, streak));
  tmp.lerp(C.moss, smoothstep(0.55, 0.72, fbm2(x * 0.07 + 9, z * 0.07 - 4, 3)) * 0.6);
  c.lerp(tmp, smoothstep(0.1, 0.32, slope) * 0.95);
  // thềm trước cửa hang: đất nện sáng màu
  c.lerp(C.floor, (1 - smoothstep(6, 18, Math.hypot(x - APRON.x, (z - APRON.z) * 0.9))) * 0.7);
}
