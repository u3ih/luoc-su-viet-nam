import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";
import { LEDGE, PATH_FOOT } from "./places";

// Thung lũng giữa núi đá vôi (cách điệu, không theo tỉ lệ hay địa hình thật): đáy thung lũng thoải, những ngọn núi đá vôi
// dựng đứng (karst) bao quanh, sườn dốc trơ đá, đỉnh phủ rừng. Ngọn núi ở giữa có một mái đá mở ra phía nam, trước mái đá
// có thềm; ngọn núi phía tây có thêm một hang nhỏ. Suối nhỏ chảy ngang thung lũng phía nam.
// Tư liệu chỉ cho biết di chỉ là hang, mái đá gần suối nước ngọt trong địa hình núi đá vôi — mọi chi tiết còn lại là gợi ý.

export const BOUNDS: HeightBounds = { minX: -420, minZ: -340, sizeX: 840, sizeZ: 800, minH: -4, maxH: 150 };
export const WATER = 0.15;

/** Núi đá vôi: [tâm x, tâm z, bán kính chân, chiều cao]. Phần tử đầu là ngọn núi có mái đá chính, phần tử hai có hang nhỏ. */
export const TOWERS: [number, number, number, number][] = [
  [0, 82, 58, 64],
  [-175, 62, 48, 72],
  [175, 78, 50, 80],
  [-80, 190, 42, 66],
  [-235, 175, 50, 84],
  [90, 215, 54, 92],
  [-285, -20, 40, 56],
  [285, -10, 42, 62],
  [-10, 330, 80, 118],
  [-350, 240, 56, 90],
  [330, 215, 58, 96],
  [-235, -170, 34, 44],
  [240, -175, 38, 50],
  [-130, 300, 36, 60],
  [200, 305, 46, 84],
];

export { LEDGE, PATH_FOOT };

const tower = (x: number, z: number, [cx, cz, r, h]: [number, number, number, number]) => {
  const reach = r * (0.8 + 0.4 * noise2(x * 0.03 + cx * 0.1, z * 0.03 + cz * 0.1));
  const d = Math.hypot(x - cx, z - cz) / reach;
  // dốc đứng ở khoảng 0.55–1.0 bán kính; đỉnh gồ ghề như những mái vòm liền nhau
  const top = h * (0.62 + 0.7 * fbm2(x * 0.035 + cx, z * 0.035 - cz, 4));
  return top * (1 - smoothstep(0.55, 1.0, d));
};

export function streamCenter(x: number) {
  return -112 + 20 * Math.sin(x * 0.011 + 0.6) + 8 * Math.sin(x * 0.037);
}

export function height(x: number, z: number) {
  let h = 1.6 + (fbm2(x * 0.012 + 3, z * 0.012 - 1, 4) - 0.5) * 3.0;
  // gò thấp chân núi chính
  h += 9 * (1 - smoothstep(0, 1, Math.hypot(x, z - 60) / 120));
  let t = 0;
  for (const tw of TOWERS) t = Math.max(t, tower(x, z, tw));
  h += t;
  // lối mòn thoải từ chân núi lên thềm, rồi thềm phẳng cắt vào sườn đá
  const along = clamp((LEDGE.z - z) / (LEDGE.z - PATH_FOOT));
  const pathY = lerp(LEDGE.y, 2.4, smoothstep(0, 1, along));
  const wPath = (1 - smoothstep(3.5, 9, Math.abs(x - LEDGE.x))) * smoothstep(PATH_FOOT - 8, PATH_FOOT + 2, z) * (1 - smoothstep(LEDGE.z + 4, LEDGE.z + 9, z));
  h = lerp(h, pathY, wPath);
  const wLedge = 1 - smoothstep(6, 13, Math.hypot(x - LEDGE.x, (z - LEDGE.z) * 0.8));
  h = lerp(h, LEDGE.y, wLedge);
  // suối
  const ds = Math.abs(z - streamCenter(x));
  h = lerp(-1.4, h, smoothstep(5, 13, ds));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

/** Độ dốc xấp xỉ (m/m) quanh (x, z). */
export function slopeAt(x: number, z: number) {
  const e = 3;
  return Math.max(Math.abs(height(x + e, z) - height(x - e, z)), Math.abs(height(x, z + e) - height(x, z - e))) / (2 * e);
}

/** Từ phía nam tiến vào sườn núi dọc x: vị trí z đầu tiên mà mặt đất cao quá `y` — chỗ để áp cửa hang vào vách đá. */
export function faceZ(x: number, y: number, fromZ = LEDGE.z) {
  let z = fromZ;
  while (z < fromZ + 80 && height(x, z) < y) z += 0.25;
  return z;
}

const C = {
  mud: new THREE.Color("#5b4a34"),
  sand: new THREE.Color("#a4906a"),
  meadow: new THREE.Color("#7a9446"),
  forest: new THREE.Color("#2f5530"),
  rock: new THREE.Color("#b0aa9b"),
  rockDark: new THREE.Color("#6d695f"),
  moss: new THREE.Color("#4d6a38"),
  path: new THREE.Color("#a28d68"),
};
const tmp = new THREE.Color();

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.4) c.copy(C.mud).lerp(C.sand, smoothstep(-1.4, 0.4, h));
  else {
    c.copy(C.meadow).lerp(C.forest, smoothstep(2, 14, h) * 0.55 + fbm2(x * 0.04, z * 0.04, 3) * 0.25);
  }
  // sườn dốc: đá vôi xám, có vệt sẫm theo chiều thẳng đứng như vết nước chảy
  const streak = noise2(x * 0.55 + z * 0.2, z * 0.55 - x * 0.2) * 0.65 + noise2(x * 0.17, z * 0.17) * 0.35;
  tmp.copy(C.rock).lerp(C.rockDark, smoothstep(0.25, 0.8, streak));
  // rêu, cây bám trên vách đá thành từng mảng
  tmp.lerp(C.moss, smoothstep(0.55, 0.72, fbm2(x * 0.07 + 9, z * 0.07 - 4, 3)) * 0.6);
  c.lerp(tmp, smoothstep(0.1, 0.32, slope) * 0.95);
  // lối mòn và thềm trước mái đá: đất nện sáng màu
  const onPath = (1 - smoothstep(1.2, 3.4, Math.abs(x - LEDGE.x))) * smoothstep(PATH_FOOT, PATH_FOOT + 6, z) * (1 - smoothstep(LEDGE.z + 3, LEDGE.z + 8, z));
  const onLedge = 1 - smoothstep(5, 9, Math.hypot(x - LEDGE.x, (z - LEDGE.z) * 0.8));
  c.lerp(C.path, Math.max(onPath * 0.55, onLedge * 0.8));
}
